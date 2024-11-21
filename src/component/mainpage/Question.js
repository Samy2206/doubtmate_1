import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; // import Firestore config
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import QuestionDetail from './QuestionDetail';
import './Question.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Question() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const questionsRef = collection(db, 'questions');
    
    // Query to fetch and order questions by timestamp in descending order
    const q = query(questionsRef, orderBy('timestamp', 'desc'));

    // Real-time listener for changes to the questions collection
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setQuestions(questionsData);
      setLoading(false); // Once data is fetched, stop loading
    }, (error) => {
      console.log('Error fetching questions:', error);
      setLoading(false);
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();

  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button
        className="floating-btn"
        onClick={() => navigate('/Mainpage/Que')}  // Navigate to the "Que" page
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <h1>All Questions</h1>
      {questions.length === 0 ? (
        <p>No questions available</p>
      ) : (
        questions.map((question) => (
          <QuestionDetail key={question.id} questionId={question.id} />
        ))
      )}
    </div>
  );
}

export default Question;
