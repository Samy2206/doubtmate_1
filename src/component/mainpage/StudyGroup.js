import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function StudyGroup() {
  const navigate = useNavigate(); // Define navigate properly

  return (
    <div>
      <h1>StudyGroup</h1>
      <button
        className="floating-btn"
        onClick={() => navigate('/Mainpage/SGroup')} // Correctly use navigate
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
}

export default StudyGroup;
