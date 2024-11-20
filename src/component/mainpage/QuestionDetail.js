import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseconfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc ,addDoc} from 'firebase/firestore';
import './QuestionDetail.css';

function QuestionDetail({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch question data
      const questionRef = doc(db, 'questions', questionId);
      const questionSnap = await getDoc(questionRef);

      if (questionSnap.exists()) {
        setQuestion(questionSnap.data());
      } else {
        console.log('No such question!');
        setLoading(false);
        return;
      }

      // Fetch user data (from 'profile' collection) using userId from the question
      const userRef = doc(db, 'profile', questionSnap.data().userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser(userSnap.data());
      }

      // Fetch comments for this question (if any)
      const commentsRef = collection(db, 'questions', questionId, 'comments');
      const commentsSnap = await getDocs(commentsRef);
      const commentsData = commentsSnap.docs.map(doc => doc.data());
      setComments(commentsData);

      setLoading(false);
    };

    fetchData();
  }, [questionId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const commentData = {
      userId: auth.currentUser.uid,
      comment,
      timestamp: new Date(),
    };

    const commentsRef = collection(db, 'questions', questionId, 'comments');
    await addDoc(commentsRef, commentData);
    
    setComment('');
    setComments([...comments, commentData]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="question-detail-container">
      <div className="question-header">
        <h2>{question.title}</h2>
        <div className="timestamp">
          {new Date(question.timestamp.seconds * 1000).toLocaleString()}
        </div>
      </div>

      <div className="question-content">
        <p>{question.description}</p>
        {question.fileUrls && question.fileUrls.length > 0 && (
          <div className="file-previews">
            {question.fileUrls.map((url, index) => (
              <img key={index} src={url} alt={`Question File ${index}`} className="file-preview-image" />
            ))}
          </div>
        )}
      </div>

      <div className="question-user">
        <div className="user-name">{user ? user.name : 'Unknown User'}</div>
      </div>

      <div className="comment-section">
        <h3>Comments</h3>
        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment-item">
              <div className="comment-user">
                {user ? user.name : 'Anonymous'} - {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
              </div>
              <div className="comment-text">{comment.comment}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
}

export default QuestionDetail;
