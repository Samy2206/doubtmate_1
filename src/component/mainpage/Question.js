import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './Question.css';
import QuestionDetail from './QuestionDetail';

function Question() {
  const navigate = useNavigate();

  return (
    <>
      <div className="fab"onClick={() => {navigate('/Mainpage/Que');}}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      <h1>Welcome to the Question Component</h1>
    </>
  );
}

export default Question;
