import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseconfig';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './NoteDetail.css';

const storage = getStorage();

function NoteDetail({ noteId }) {
  const [note, setNote] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState(null);
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState(false); // Track long press on note
  const [pressTimer, setPressTimer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the note details
        const noteRef = doc(db, 'notes', noteId);
        const noteSnap = await getDoc(noteRef);

        if (noteSnap.exists()) {
          setNote({ id: noteId, ...noteSnap.data() });
        } else {
          console.log('No such note!');
          setLoading(false);
          return;
        }

        // Fetch user details
        const userRef = doc(db, 'users', noteSnap.data().userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }

        // Fetch comments
        const commentsRef = collection(db, 'notes', noteId, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'desc'));
        onSnapshot(q, (snapshot) => {
          const commentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComments(commentsData);
        });
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [noteId]);

  // Long press for comment deletion
  const handleCommentLongPressStart = (commentId) => {
    setPressTimer(
      setTimeout(() => {
        setDeleteCommentConfirm(commentId);
      }, 1000)
    );
  };

  const handleCommentLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  // Long press for note deletion
  const handleNoteLongPressStart = () => {
    setPressTimer(
      setTimeout(() => {
        setDeleteNoteConfirm(true); // Show delete confirmation
      }, 1000)
    );
  };

  const handleNoteLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleDeleteNote = async () => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await deleteDoc(noteRef); // Delete the note document
      alert('Note deleted successfully!');
      // Optionally, navigate back to the list of notes or home page after deletion
    } catch (error) {
      console.log('Error deleting note:', error);
      alert('Failed to delete note.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId, 'comments', commentId));
      alert('Comment deleted successfully!');
      setDeleteCommentConfirm(null);
    } catch (error) {
      console.log('Error deleting comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim() && !selectedImage) {
      alert('Please enter a comment or upload an image');
      return;
    }

    let imageUrl = '';
    if (selectedImage) {
      try {
        const imageRef = ref(storage, `comments/${auth.currentUser.uid}/${Date.now()}_${selectedImage.name}`);
        const snapshot = await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.log('Error uploading image:', error);
        alert('Failed to upload the image.');
        return;
      }
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert('User data not found.');
        return;
      }

      const userData = userSnap.data();
      const commentData = {
        userId: auth.currentUser.uid,
        comment,
        imageUrl,
        userName: `${userData.firstName} ${userData.lastName}`,
        timestamp: Timestamp.now(),
      };

      const commentsRef = collection(db, 'notes', noteId, 'comments');
      await addDoc(commentsRef, commentData);

      setComment('');
      setSelectedImage(null);
    } catch (error) {
      console.log('Error posting comment:', error);
    }
  };

  const renderFilePreview = (fileUrl, fileType) => {
    const extensionMatch = fileUrl.split('?')[0].split('.').pop(); // Get the file extension before the query params
    const decodedUrl = decodeURIComponent(fileUrl.split('?')[0]); // Decode only the file path part
  
    return (
      <div className="file-preview">
        {['jpg', 'jpeg', 'png', 'gif'].includes(extensionMatch) ? (
          <img src={fileUrl} alt="Attached Image" />
        ) : ['mp4', 'webm', 'ogg'].includes(extensionMatch) ? (
          <video controls>
            <source src={fileUrl} type={`video/${extensionMatch}`} />
            Your browser does not support the video tag.
          </video>
        ) : ['pdf', 'ppt', 'pptx', 'docx'].includes(extensionMatch) ? (
          <p>{decodedUrl.split('/').pop()}</p>
        ) : (
          <p>{decodedUrl.split('/').pop()}</p>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="note-detail-container">
      <div
        className="note-header"
        onMouseDown={handleNoteLongPressStart}
        onMouseUp={handleNoteLongPressEnd}
        onMouseLeave={handleNoteLongPressEnd}
      >
        <div className="user-name">
          {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
        </div>
        <h2 className="note-title">{note.title}</h2>
        <div className="timestamp">
          {new Date(note.timestamp.seconds * 1000).toLocaleString()}
        </div>
      </div>

      <div className="note-content">
        <p>{note.description}</p>
        {note.fileUrls && note.fileUrls.length > 0 && (
          <div className="file-previews">
            {note.fileUrls.map((url, index) => {
              const fileType = url.split('.').pop(); // Determine file type from URL extension
              return renderFilePreview(url, fileType);
            })}
          </div>
        )}
      </div>

      {/* Show delete confirmation if long press was detected */}
      {deleteNoteConfirm && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this note?</p>
          <button onClick={handleDeleteNote}>Yes</button>
          <button onClick={() => setDeleteNoteConfirm(false)}>No</button>
        </div>
      )}

      <div className="comment-section">
        <h3>Comments</h3>
        <div className="comments-list">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="comment-item"
              onMouseDown={() => handleCommentLongPressStart(comment.id)}
              onMouseUp={handleCommentLongPressEnd}
              onMouseLeave={handleCommentLongPressEnd}
            >
              <div className="comment-user">
                {comment.userName} - {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
              </div>
              <div className="comment-text">{comment.comment}</div>
              {comment.imageUrl && (
                <div className="comment-image">
                  <img src={comment.imageUrl} alt="Comment Attachment" />
                </div>
              )}
            </div>
          ))}
        </div>

        {deleteCommentConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this comment?</p>
            <button onClick={() => handleDeleteComment(deleteCommentConfirm)}>Yes</button>
            <button onClick={() => setDeleteCommentConfirm(null)}>No</button>
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            required={!selectedImage}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
}

export default NoteDetail;
