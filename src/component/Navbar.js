import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUsers, faSignOutAlt, faVideo, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from './firebaseconfig'; // Ensure correct path to your Firebase config file
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';

function Navbar() {
  const [profilePhoto, setProfilePhoto] = useState(''); // State to store profile photo URL
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid)); // Fetch user document from Firestore
          if (userDoc.exists()) {
            setProfilePhoto(userDoc.data().photoURL); // Set the profile photo URL from Firestore
          }
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
        }
      }
      setLoading(false); // Stop loading after fetching
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user); // Fetch profile photo when user is authenticated
      } else {
        setProfilePhoto(''); // Clear profile photo if user is logged out
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/'); // Redirect to the Login page
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/Mainpage/Question">Doubmate</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/Mainpage/Notes">
                <FontAwesomeIcon icon={faBook} /> Notes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Mainpage/studyGroup">
                <FontAwesomeIcon icon={faUsers} /> Study Group
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Mainpage/conference">
                <FontAwesomeIcon icon={faVideo} /> Conference
              </Link>
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
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span> // Show spinner while loading
              ) : profilePhoto ? (
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
