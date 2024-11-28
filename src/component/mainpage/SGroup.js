import React, { useState } from 'react';
import './SGroup.css';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, doc, getDoc, auth } from '../firebaseconfig';  // Firebase Firestore import

function SGroup({user }) {
  const navigate=useNavigate()
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('public');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const userId = user ? user.uid : auth.currentUser.uid; // Get current user's UID

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    try {
      // Fetch user details using userId from users collection
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUsername(userData.firstName + ' ' + userData.lastName); // Combine first and last name
        setProfileUrl(userData.photoURL); // Get profile picture URL

        // Create a new study group document
        const timestamp = new Date().toISOString();
        const newStudyGroup = {
          title,
          topic,
          type,
          userId,
          username: userData.firstName + ' ' + userData.lastName,
          profileUrl: userData.photoURL,
          timestamp,
          password: type === 'private' ? password : null,
        };

        // Add the new study group to the Firestore studyGroups collection
        await addDoc(collection(db, 'studyGroups'), newStudyGroup);

        alert('Study Group Created!');
        navigate('/Mainpage/StugyGroup');
      } else {
        alert('User not found!');
      }
    } catch (error) {
      console.error('Error creating study group:', error);
      alert(`Error creating study group: ${error.message || error}`); // Display the error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sgroup-modal">
      <div className="modal-content">
        <h2>Create Study Group</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Study Group Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="topic">Topic Name</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="type">Study Group Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {type === 'private' && (
            <div>
              <label htmlFor="password">Password (for private group)</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SGroup;
