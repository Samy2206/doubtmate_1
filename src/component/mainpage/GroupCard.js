import React, { useState } from 'react';
import './GroupCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons'; // Import lock icon
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, remove } from 'firebase/database';

function GroupCard({ group }) {
  const navigate = useNavigate();
  const [pressStart, setPressStart] = useState(null); // Track the press start time
  const [isSubmitting, setIsSubmitting] = useState(false); // To prevent multiple deletions

  const auth = getAuth();
  const firestore = getFirestore();

  const isTeacher = group.role === 'Teacher'; // Check if the user is a teacher
  const isPrivate = group.type === 'private'; // Check if the group is private

  const handleEnterGroup = () => {
    // Navigate to the GroupChat page with the Group ID (docRef ID) as a URL parameter
    navigate(`/Mainpage/GroupChat/${group.id}`);
  };

  // Handle long press
  const handleMouseDown = (e) => {
    setPressStart(Date.now());
  };

  const handleMouseUp = async () => {
    const pressDuration = Date.now() - pressStart;
    if (pressDuration > 800 && !isSubmitting) { // Detect long press (800ms threshold)
      await handleDeleteGroup();
    }
  };

  // Check if the user is allowed to delete the group
  const checkUserPermission = async () => {
    const groupRef = doc(firestore, 'studyGroups', group.id);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data();
      if (groupData.userId === auth.currentUser.uid || auth.currentUser.email === "admin@example.com") {
        return true; // If the user is the group owner or an admin
      }
    }
    return false;
  };

  const handleDeleteGroup = async () => {
    setIsSubmitting(true);

    const isAllowedToDelete = await checkUserPermission();
    if (isAllowedToDelete) {
        // Show confirmation alert
        const confirmed = window.confirm("Are you sure you want to delete this group?");
        if (confirmed) {
            try {
                // Delete from Firestore
                const groupRef = doc(firestore, 'studyGroups', group.id);
                await deleteDoc(groupRef);

                // Delete from Realtime Database
                const db = getDatabase();
                const groupDbRef = ref(db, `studyGroups/${group.id}`); // Path in Realtime Database
                await remove(groupDbRef);

                alert('Group and its associated data deleted successfully');
                // Optionally, navigate away from the page after deletion
                // navigate('/Mainpage');
            } catch (error) {
                console.error('Error deleting group:', error);
                alert('Error deleting group');
            }
        }
    } else {
        alert('You do not have permission to delete this group.');
    }

    setIsSubmitting(false);
};

  return (
    <div
      className={`group-card ${isTeacher ? 'teacher-card' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
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
