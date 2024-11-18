import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { auth, db, storage } from './firebaseconfig'; 
import { setDoc, doc } from 'firebase/firestore';

import './Register.css';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('Female');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('Student');
  const [profilePhoto, setProfilePhoto] = useState(null); // State for image
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]); // Get the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile photo if selected
      let photoURL = '';
      if (profilePhoto) {
        const photoRef = ref(storage, `profile/${user.uid}`); // Path to store the image
        await uploadBytes(photoRef, profilePhoto); // Upload the image
        photoURL = await getDownloadURL(photoRef); // Get the public URL
        console.log(photoURL)
      }

      // Add user data to Firestore with uid as the document ID
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        phoneNumber,
        birthday,
        gender,
        userType,
        photoURL, // Save the image URL in Firestore
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating user:', error.message);
      setErrorMessage(error.message); // Set the error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <section className="vh-100 gradient-custom">
      <div className="container py-5 h-100">
        <div className="row justify-content-center align-items-center h-100">
          <div className="col-12 col-lg-9 col-xl-7">
            <div className="card shadow-2-strong card-registration" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4 p-md-5">
                <h3 className="mb-4 pb-2 pb-md-0 mb-md-5">Registration Form</h3>
                <form onSubmit={handleSubmit}>
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input
                          type="text"
                          id="firstName"
                          className="form-control form-control-lg"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="firstName">First Name</label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="form-outline">
                        <input
                          type="text"
                          id="lastName"
                          className="form-control form-control-lg"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="lastName">Last Name</label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <input
                        type="date"
                        id="birthdayDate"
                        className="form-control form-control-lg"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        required
                      />
                      <label htmlFor="birthdayDate" className="form-label">Birthday</label>
                    </div>
                    <div className="col-md-6 mb-4">
                      <h6 className="mb-2 pb-1">Gender:</h6>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id="femaleGender"
                          value="Female"
                          checked={gender === 'Female'}
                          onChange={() => setGender('Female')}
                        />
                        <label className="form-check-label" htmlFor="femaleGender">Female</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="gender"
                          id="maleGender"
                          value="Male"
                          checked={gender === 'Male'}
                          onChange={() => setGender('Male')}
                        />
                        <label className="form-check-label" htmlFor="maleGender">Male</label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <input
                        type="text"
                        id="phoneNumber"
                        className="form-control form-control-lg"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
                    </div>
                    <div className="col-md-6 mb-4">
                      <input
                        type="email"
                        id="email"
                        className="form-control form-control-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label className="form-label" htmlFor="email">Email</label>
                    </div>
                  </div>
                  <div className="mb-4">
                    <input
                      type="password"
                      id="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="password">Password</label>
                  </div>
                  <div className="mb-4">
                    <select
                      className="form-select"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select User Type</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label className="form-label" htmlFor="profilePhoto">Upload Profile Photo</label>
                  </div>
                  <div className="d-flex justify-content-end pt-3">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg ms-2"
                      disabled={loading} // Disable the button while loading
                    >
                      {loading ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
