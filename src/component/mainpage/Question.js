import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; // import Firestore config
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Firebase Auth
import { useNavigate } from 'react-router-dom';
import QuestionDetail from './QuestionDetail';
import './Question.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Question() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(''); // State to store the user's role

  useEffect(() => {
    // Fetch user role
    const fetchRole = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role); // Set the user's role
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchRole();
  }, []);

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

      // Extract unique subjects from questions
      const uniqueSubjects = Array.from(new Set(questionsData.map(q => q.subject)));
      setSubjects(['All', ...uniqueSubjects]); // Add "All" to include all questions

      setFilteredQuestions(questionsData);
      setLoading(false); // Once data is fetched, stop loading
    }, (error) => {
      console.log('Error fetching questions:', error);
      setLoading(false);
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Filter questions based on the selected subject
  useEffect(() => {
    if (selectedSubject === 'All') {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter((q) => q.subject === selectedSubject));
    }
  }, [selectedSubject, questions]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="question-container">
      <div className="sidebar">
        <h3>Filter by Subject</h3>
        <ul>
          {subjects.map((subject) => (
            <li
              key={subject}
              className={selectedSubject === subject ? 'active' : ''}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </li>
          ))}
        </ul>
      </div>
      <div className="main-content">
        {/* Conditionally render the Add button only for students */}
        {role === 'Student' && (
          <button
            className="floating-btn"
            onClick={() => navigate('/Mainpage/Que')}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
        <h1>{selectedSubject === 'All' ? 'All Questions' : `${selectedSubject} Questions`}</h1>
        {filteredQuestions.length === 0 ? (
          <p>No questions available</p>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionDetail key={question.id} questionId={question.id} />
          ))
        )}
      </div>
    </div>
  );
}

export default Question;
