import React, { useState } from 'react';
import './SGroup.css';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, doc, getDoc, auth } from '../firebaseconfig'; // Firebase Firestore import
import { getDatabase, ref, set } from 'firebase/database'; // Import Realtime Database functions

function SGroup({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('public');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [role, setRole] = useState(''); // State to store the user's role

  const userId = user ? user.uid : auth.currentUser.uid; // Get current user's UID
  const dbRealtime = getDatabase(); // Get Realtime Database reference

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
        setRole(userData.role); // Get the user's role

        // Create a new study group document
        const timestamp = new Date().toISOString();
        const newStudyGroup = {
          title,
          topic,
          type,
          userId,
          username: userData.firstName + ' ' + userData.lastName,
          profileUrl: userData.photoURL,
          role: userData.role, // Include the role in the study group
          timestamp,
          password: type === 'private' ? password : null,
        };

        // Add the new study group to the Firestore studyGroups collection
        const docRef = await addDoc(collection(db, 'studyGroups'), newStudyGroup);

        // After storing data in Firestore, create a new branch in Realtime Database
        const realtimeDbRef = ref(dbRealtime, 'studyGroups/' + docRef.id); // Use the Firestore docID as the Realtime DB branch
        await set(realtimeDbRef, {
          title: title, // Store the title in Realtime Database
        });

        alert('Study Group Created! The unique ID is: ' + docRef.id); // Show the unique ID in the alert

        navigate('/Mainpage/studyGroup');
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
    <div className="sgroup-container">
      <div className="sgroup-content">
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
