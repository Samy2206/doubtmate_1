import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseconfig';
import { doc, getDoc, collection, getDocs, addDoc, orderBy } from 'firebase/firestore';
import './QuestionDetail.css';

function QuestionDetail({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Fetch user data from 'users' collection using userId from the question
        const userRef = doc(db, 'users', questionSnap.data().userId); // Querying 'users' collection
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data()); // Set the full user data
        }

        // Fetch comments for this question (if any), sorted by timestamp (most recent first)
        const commentsRef = collection(db, 'questions', questionId, 'comments');
        const commentsSnap = await getDocs(commentsRef);
        
        const commentsData = await Promise.all(
          commentsSnap.docs.map(async (doc) => {
            const commentData = doc.data();
            const commentUserRef = doc(db, 'users', commentData.userId); // Querying 'users' collection for comment users
            const commentUserSnap = await getDoc(commentUserRef);
            const userData = commentUserSnap.exists() ? commentUserSnap.data() : {};
            return { ...commentData, user: userData };
          })
        );

        // Sort the comments by timestamp, so the most recent is on top
        const sortedComments = commentsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setComments(sortedComments);
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
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
    setComments([commentData, ...comments]); // Adding the new comment at the top
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="question-detail-container">
      <div className="question-header">
        <div className="user-name">
          {/* Displaying the full name of the user */}
          {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
        </div> {/* User on top left */}
        <h2 className="question-title">{question.title}</h2> {/* Question title below username */}
        <div className="timestamp">
          {new Date(question.timestamp.seconds * 1000).toLocaleString()} {/* Correct timestamp */}
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

      <div className="comment-section">
        <h3>Comments</h3>
        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment-item">
              <div className="comment-user">
                {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Anonymous'} -{' '}
                {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
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
