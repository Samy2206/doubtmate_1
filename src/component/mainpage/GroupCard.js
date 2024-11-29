import React from 'react';
import './GroupCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons'; // Import lock icon
import { useNavigate } from 'react-router-dom';

function GroupCard({ group }) {
  const navigate = useNavigate();
  const isTeacher = group.role === 'Teacher'; // Check if the user is a teacher
  const isPrivate = group.type === 'private'; // Check if the group is private

  const handleEnterGroup = () => {
    // Navigate to the GroupChat page with the Group ID (docRef ID) as a URL parameter
    navigate(`/Mainpage/GroupChat/${group.id}`);
  };

  return (
    <div
      className={`group-card ${isTeacher ? 'teacher-card' : ''}`} // Add class for teacher card
    >
      {isPrivate && (
        <div className="lock-icon">
          <FontAwesomeIcon icon={faLock} />
        </div>
      )}
      <div className="profile-photo-container">
        <img
          src={group.profileUrl}
          alt="Profile"
          className="profile-photo"
        />
      </div>
      <h3 className="group-name">{group.username}</h3>
      <p className="group-doc-id">Group ID: {group.id}</p> {/* Show DocRef ID */}
      <p className="group-date">
        Created on: {new Date(group.timestamp).toLocaleDateString()} at {new Date(group.timestamp).toLocaleTimeString()}
      </p>
      <h4 className="group-title">{group.title}</h4>
      <p className="group-topic">{group.topic}</p>
      <button className="enter-btn" onClick={handleEnterGroup}>Enter</button>
    </div>
  );
}

export default GroupCard;
