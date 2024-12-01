import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebaseconfig';
import { collection, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './Note.css';

function Note() {
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
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => {
      return {
        name: file.name,
        type: file.type,
        preview: URL.createObjectURL(file),
      };
    });
    setFilePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Debugging log to check values before submission
    console.log('Form Values:', {
      title,
      description,
      subject,
      userId
    });
  
    if (!title || !description || !subject || !userId) {
      alert('Please fill all the fields and ensure you are logged in');
      setLoading(false);
      return;
    }
  
    const noteRef = collection(db, 'notes');
    const noteData = {
      title,
      description,
      subject,
      userId,
      timestamp: Timestamp.fromDate(new Date()),
      fileUrls: [], // Initialize an empty array for storing file URLs
    };
  
    try {
      const docRef = await addDoc(noteRef, noteData);
  
      if (files) {
        const uploadedUrls = [];
        for (let file of files) {
          const fileRef = ref(storage, `Notes/${docRef.id}/${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);
  
          uploadTask.on(
            'state_changed',
            null,
            (error) => console.error('File upload error:', error),
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                uploadedUrls.push(url);
                // When all files are uploaded, update Firestore with the URLs
                if (uploadedUrls.length === files.length) {
                  updateDoc(docRef, { fileUrls: uploadedUrls });
                }
              });
            }
          );
        }
      }
  
      // Reset form after submission
      setTitle('');
      setDescription('');
      setSubject('');
      setFiles(null);
      setFilePreviews([]);
  
      alert('Note submitted successfully');
      navigate('/Mainpage/Notes');
    } catch (error) {
      console.error('Error submitting note:', error);
      alert('Error submitting note');
    }
  
    setLoading(false);
  };
  

  return (
    <div className="container">
      <h1>Share a Note</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title of the Note</label>
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
          <label htmlFor="files">Upload Files (Optional)</label>
          <input
            type="file"
            id="files"
            accept="image/*,video/*,.pdf,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={handleFileChange}
          />
          {filePreviews.length > 0 && (
            <div className="file-previews">
              {filePreviews.map((file, index) => (
                <div key={index} className="file-preview-item">
                  {file.type.startsWith('image') && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="file-preview-image"
                    />
                  )}
                  {file.type.startsWith('video') && (
                    <video
                      controls
                      src={file.preview}
                      className="file-preview-video"
                    />
                  )}
                  {file.type === 'application/pdf' && (
                    <a href={file.preview} target="_blank" rel="noopener noreferrer">
                      View PDF: {file.name}
                    </a>
                  )}
                  {(file.type === 'application/vnd.ms-powerpoint' ||
                    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') && (
                    <a href={file.preview} target="_blank" rel="noopener noreferrer">
                      View PPT: {file.name}
                    </a>
                  )}
                  {(file.type === 'application/msword' ||
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                    <a href={file.preview} target="_blank" rel="noopener noreferrer">
                      View Word Document: {file.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit Note'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Note;
