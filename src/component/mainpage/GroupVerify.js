import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig'; // Firebase import
import './GroupVerify.css';
import GroupChat from './GroupChat';
import Que from './Que';

function GroupVerify() {
  const { groupId } = useParams(); // Get the groupId from the URL
  const navigate = useNavigate(); // Hook to navigate to other pages
  const [group, setGroup] = useState(null);
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const docRef = doc(db, 'studyGroups', groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const groupData = docSnap.data();
          setGroup(groupData);
          setIsPrivate(groupData.type === 'private'); // Set whether the group is private or public
          
          // For public groups, set isPasswordCorrect to true automatically
          if (groupData.type !== 'private') {
            setIsPasswordCorrect(true);
          }
        } else {
          setError('Group not found.');
        }
      } catch (error) {
        setError('Error fetching group details.');
        console.error('Error fetching group details:', error);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchGroupData();
  }, [groupId]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (password === group.password) {
      setIsPasswordCorrect(true);
    } else {
      setError('Incorrect password.');
      setTimeout(() => {
        navigate('/Mainpage/studyGroup'); // Redirect to StudyGroup after showing error
      }, 2000); // Redirect after 2 seconds
    }
  };

  if (loading) {
    return <div>Loading group details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="group-chat-container">
      <div className="header">
        <div className="profile-container">
          <img
            src={group.profileUrl}
            alt="Profile"
            className="profile-photo"
          />
          <p className="username">{group.username}</p>
        </div>
        <div className="timestamp">
          <p>{new Date(group.timestamp).toLocaleDateString()} at {new Date(group.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>

      <h1 className="group-title-verify">{group.title}</h1> {/* Title in the header */}

      {isPrivate && !isPasswordCorrect && (
        <div className="password-form">
          <h2>This is a private group. Please enter the password:</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {isPasswordCorrect && (
        <>
          <GroupChat groupId={groupId} />
        </>
      )}
    </div>
  );
}

export default GroupVerify;
