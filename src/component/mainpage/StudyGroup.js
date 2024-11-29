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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter groups based on the exact case-sensitive match of group ID
  const filteredGroups = groups.filter((group) =>
    group.id.includes(searchTerm)
  );

  return (
    <div className="study-group-container">
      {/* Search bar in the top-right corner */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by Group ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {/* Floating button to create a new group */}
      <button
        className="floating-btn"
        onClick={() => navigate('/Mainpage/SGroup')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* Cards container for displaying groups */}
      <div className="cards-container">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

export default StudyGroup;
