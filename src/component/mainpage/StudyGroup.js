import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import GroupCard from './GroupCard';
import { db } from '../firebaseconfig'; // Adjust import based on your setup
import './StudyGroup.css';

function StudyGroup() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'studyGroups'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupData);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="study-group-container">
      <h1>Study Groups</h1>
      <button
        className="floating-btn"
        onClick={() => navigate('/Mainpage/SGroup')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <div className="cards-container">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

export default StudyGroup;
