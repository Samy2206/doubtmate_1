import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faBook, faUsers, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig'; // Ensure correct path to your Firebase config file
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function Navbar() {
  const [profilePhoto, setProfilePhoto] = useState(''); // State to store profile photo URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          // Fetch user document from Firestore using uid
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setProfilePhoto(userDoc.data().photoURL); // Set the profile photo URL from Firestore
          }
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
        }
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to the Login page
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Doubmate</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="#">
                <FontAwesomeIcon icon={faQuestionCircle} /> Questions
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <FontAwesomeIcon icon={faBook} /> Notes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <FontAwesomeIcon icon={faUsers} /> Study Group
              </a>
            </li>
          </ul>
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto} // Use the profile photo URL from Firestore
                  alt="Profile"
                  className="rounded-circle"
                  height="30"
                  width="30"
                />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} /> // Default icon if no profile photo
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><a className="dropdown-item" href="#"><FontAwesomeIcon icon={faUserCircle} /> Profile</a></li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
