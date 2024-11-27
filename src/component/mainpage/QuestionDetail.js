import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseconfig';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './QuestionDetail.css';

const storage = getStorage();

function QuestionDetail({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteQuestionConfirm, setDeleteQuestionConfirm] = useState(false);
  const [deleteAnswerConfirm, setDeleteAnswerConfirm] = useState(null); // Track which answer to delete
  const [pressTimer, setPressTimer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionRef = doc(db, 'questions', questionId);
        const questionSnap = await getDoc(questionRef);

        if (questionSnap.exists()) {
          setQuestion({ id: questionId, ...questionSnap.data() });
        } else {
          console.log('No such question!');
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', questionSnap.data().userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }

        const answersRef = collection(db, 'questions', questionId, 'answers');
        const q = query(answersRef, orderBy('timestamp', 'desc'));
        onSnapshot(q, (snapshot) => {
          const answersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedAnswers = answersData.sort((a, b) => {
            const isTeacherA = a.role === 'Teacher' ? 1 : 0;
            const isTeacherB = b.role === 'Teacher' ? 1 : 0;
            if (isTeacherA !== isTeacherB) return isTeacherB - isTeacherA;
            return b.timestamp.seconds - a.timestamp.seconds;
          });

          setAnswers(sortedAnswers);
        });
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questionId]);

  const handleQuestionLongPressStart = () => {
    if (auth.currentUser.uid === question.userId) {
      setPressTimer(
        setTimeout(() => {
          setDeleteQuestionConfirm(true);
        }, 1000)
      );
    }
  };

  const handleQuestionLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleAnswerLongPressStart = (answerId) => {
    setPressTimer(
      setTimeout(() => {
        setDeleteAnswerConfirm(answerId);
      }, 1000)
    );
  };

  const handleAnswerLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleDeleteQuestion = async () => {
    try {
      await deleteDoc(doc(db, 'questions', question.id));
      alert('Question deleted successfully!');
      setDeleteQuestionConfirm(false);
    } catch (error) {
      console.log('Error deleting question:', error);
      alert('Failed to delete question.');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId, 'answers', answerId));
      alert('Answer deleted successfully!');
      setDeleteAnswerConfirm(null);
    } catch (error) {
      console.log('Error deleting answer:', error);
      alert('Failed to delete answer.');
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim() && !selectedImage) {
      alert('Please enter an answer or upload an image');
      return;
    }

    let imageUrl = '';
    if (selectedImage) {
      try {
        const imageRef = ref(storage, `answers/${auth.currentUser.uid}/${Date.now()}_${selectedImage.name}`);
        const snapshot = await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.log('Error uploading image:', error);
        alert('Failed to upload the image.');
        return;
      }
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('User data not found.');
        return;
      }

      const userData = userSnap.data();
      const answerData = {
        userId: auth.currentUser.uid,
        answer,
        imageUrl,
        userName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role || 'User',
        timestamp: Timestamp.now(),
      };

      const answersRef = collection(db, 'questions', questionId, 'answers');
      await addDoc(answersRef, answerData);

      setAnswer('');
      setSelectedImage(null);
    } catch (error) {
      console.log('Error posting answer:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="question-detail-container">
      <div
        className="question-header"
        onMouseDown={handleQuestionLongPressStart}
        onMouseUp={handleQuestionLongPressEnd}
        onMouseLeave={handleQuestionLongPressEnd}
      >
        <div className="user-name">
          {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
        </div>
        <h2 className="question-title">{question.title}</h2>
        <div className="timestamp">
          {new Date(question.timestamp.seconds * 1000).toLocaleString()}
        </div>
      </div>

      <div className="question-content">
        <p>{question.description}</p>
        {question.fileUrls && question.fileUrls.length > 0 && (
          <div className="file-previews">
            {question.fileUrls.map((url, index) => (
              <img key={index} src={url} alt={`File ${index}`} className="file-preview-image" />
            ))}
          </div>
        )}
      </div>

      {deleteQuestionConfirm && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this question?</p>
          <button onClick={handleDeleteQuestion}>Yes</button>
          <button onClick={() => setDeleteQuestionConfirm(false)}>No</button>
        </div>
      )}

      <div className="comment-section">
        <h3>Answers</h3>
        <div className="comments-list">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`comment-item ${answer.role === 'Teacher' ? 'teacher-answer' : ''}`}
              onMouseDown={() => handleAnswerLongPressStart(answer.id)}
              onMouseUp={handleAnswerLongPressEnd}
              onMouseLeave={handleAnswerLongPressEnd}
            >
              <div className="comment-user">
                {answer.userName} - {new Date(answer.timestamp.seconds * 1000).toLocaleString()}
              </div>
              <div className="comment-text">{answer.answer}</div>
              {answer.imageUrl && (
                <div className="answer-image">
                  <img src={answer.imageUrl} alt="Answer Attachment" />
                </div>
              )}
            </div>
          ))}
        </div>

        {deleteAnswerConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this answer?</p>
            <button onClick={() => handleDeleteAnswer(deleteAnswerConfirm)}>Yes</button>
            <button onClick={() => setDeleteAnswerConfirm(null)}>No</button>
          </div>
        )}

        <form onSubmit={handleAnswerSubmit} className="comment-form">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Add an answer..."
            required={!selectedImage}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
          <button type="submit">Post Answer</button>
        </form>
      </div>
    </div>
  );
}

export default QuestionDetail;
