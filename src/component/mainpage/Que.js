import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebaseconfig';
import { collection, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './Que.css';

function Que() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [files, setFiles] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]); // Store image previews
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

    setFiles(imageFiles);

    // Generate previews for images only
    const previews = imageFiles.map(file => ({
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    setFilePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!title || !description || !subject || !userId) {
      alert('Please fill all the fields and ensure you are logged in');
      setLoading(false);
      return;
    }

    const questionRef = collection(db, 'questions');
    const questionData = {
      title,
      description,
      subject,
      userId,
      timestamp: Timestamp.fromDate(new Date()),
      fileUrls: [],
    };

    try {
      const docRef = await addDoc(questionRef, questionData);

      if (files) {
        const uploadedUrls = [];
        for (let file of files) {
          const fileRef = ref(storage, `Question/${docRef.id}/${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on(
            'state_changed',
            null,
            (error) => console.error('File upload error:', error),
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                uploadedUrls.push(url);
                if (uploadedUrls.length === files.length) {
                  updateDoc(docRef, { fileUrls: uploadedUrls });
                }
              });
            }
          );
        }
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSubject('');
      setFiles(null);
      setFilePreviews([]);

      alert('Question submitted successfully');
      navigate('/Mainpage/Question');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting question');
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Ask a Question</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title of the Question</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Select Subject</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">--Select a Subject--</option>
            <option value="Python">Python</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data Structure">Data Structure</option>
            <option value="DBMS">DBMS</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group file-upload">
          <label htmlFor="files">Upload Image (Optional)</label>
          <input
            type="file"
            id="files"
            accept="image/*" // Only image files can be selected
            multiple
            onChange={handleFileChange}
          />
          {filePreviews.length > 0 && (
            <div className="file-previews">
              {filePreviews.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="file-preview-image"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit Question'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Que;
