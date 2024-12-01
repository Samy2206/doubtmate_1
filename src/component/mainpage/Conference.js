import React, { useState } from 'react';
import './Conference.css';

const Conference = () => {
  const [inputMeetingId, setInputMeetingId] = useState('');

  // Function to open Google Meet landing page
  const handleHostMeet = () => {
    window.open('https://meet.google.com/', '_blank');  // Opens the Google Meet landing page
  };

  // Function to join a Google Meet with a provided meeting ID
  const handleJoinMeet = () => {
    if (inputMeetingId) {
      const meetLink = `https://meet.google.com/${inputMeetingId}`;
      window.open(meetLink, '_blank');  // Open the provided Google Meet link
    } else {
      alert("Please enter a valid meeting ID.");
    }
  };

  return (
    <div className="conference-container">
      <h2 className="conference-title">Host or Join a Google Meet</h2>

      {/* Button to host a Google Meet */}
      <button className="host-button" onClick={handleHostMeet}>Host Meet</button>

      <div className="join-container">
        <h3 className="join-title">Join a Google Meet</h3>
        <input
          className="meeting-id-input"
          type="text"
          value={inputMeetingId}
          onChange={(e) => setInputMeetingId(e.target.value)}
          placeholder="Enter meeting ID"
        />
        <button className="join-button" onClick={handleJoinMeet}>Join Meet</button>
      </div>
    </div>
  );
};

export default Conference;
