import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore import
import './GroupChat.css';

function GroupChat({ groupId }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [pressStart, setPressStart] = useState(null); // Track the press start time
  const auth = getAuth();
  const user = auth.currentUser;
  const dbRealtime = getDatabase();
  const storage = getStorage();
  const firestore = getFirestore(); // Firestore instance

  // Fetch user's data using their UID from Firestore
  const getUserData = async (uid) => {
    const userRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data(); // Return the user's data including 'role'
    } else {
      console.log("No such user!");
      return null;
    }
  };

  // Fetch messages from Realtime Database and include Firebase message ID
  useEffect(() => {
    const messagesRef = ref(dbRealtime, `studyGroups/${groupId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedMessages = Object.keys(data).map(key => ({
          id: key, // Include the Firebase-generated key
          ...data[key]
        }));
        setMessages(fetchedMessages);
      }
    });

    return () => {
      unsubscribe(); // Clean up listener on unmount
    };
  }, [groupId]);

  // Check if the user can delete the message
  const canDeleteMessage = async (messageUid) => {
    if (messageUid === user.uid) return true; // User can delete their own message

    const studyGroupRef = doc(firestore, 'studyGroups', groupId);
    const studyGroupSnap = await getDoc(studyGroupRef);
    if (studyGroupSnap.exists() && studyGroupSnap.data().userId === user.uid) {
      return true; // If the user is the owner of the study group, they can delete any message
    }
    return false;
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId) => {
    const isAllowedToDelete = await canDeleteMessage(messages.find(msg => msg.id === messageId).uid);
    if (isAllowedToDelete) {
      const confirmed = window.confirm("Are you sure you want to delete this message?");
      if (confirmed) {
        const messageRef = ref(dbRealtime, `studyGroups/${groupId}/messages/${messageId}`);
        remove(messageRef).then(() => {
          console.log('Message deleted successfully');
        }).catch((error) => {
          console.error('Error deleting message:', error);
        });
      }
    } else {
      alert('You do not have permission to delete this message.');
    }
  };

  const handleMouseDown = (e, id) => {
    setPressStart(Date.now());
  };

  const handleMouseUp = async (e, id) => {
    const pressDuration = Date.now() - pressStart;
    if (pressDuration > 800) { // Detect long press (800ms threshold)
      await handleDeleteMessage(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      // Get user data (firstName, lastName, email, role, profile photo)
      const userData = await getUserData(user.uid);
      if (!userData) return;

      const newMessage = {
        username: `${userData.firstName} ${userData.lastName}`,
        profileUrl: userData.photoURL,
        uid: user.uid,
        role: userData.role, // Include the user's role
        message,
        timestamp: new Date().toISOString(),
        fileUrl: file ? '' : null,
      };

      if (file) {
        const fileRef = storageRef(storage, `chatImages/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('File upload failed', error);
            setIsSubmitting(false);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              newMessage.fileUrl = downloadURL;
              saveMessageToDB(newMessage);
            });
          }
        );
      } else {
        saveMessageToDB(newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
    }
  };

  const saveMessageToDB = (newMessage) => {
    const messagesRef = ref(dbRealtime, `studyGroups/${groupId}/messages`);
    push(messagesRef, newMessage).then(() => {
      setMessage('');
      setFile(null);
      setIsSubmitting(false);
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="group-chat">
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id} // Use the Firebase key here
            className={`message ${msg.uid === user.uid ? 'right' : 'left'}`}
            onMouseDown={(e) => handleMouseDown(e, msg.id)} // Pass message ID instead of index
            onMouseUp={(e) => handleMouseUp(e, msg.id)} // Pass message ID instead of index
          >
            <div className="message-user">
              <img src={msg.profileUrl} alt={msg.username} className="user-profile" />
              <span
                style={{
                  color: msg.role === 'Teacher' ? 'blue' : 'black',
                }}
              >
                {msg.username}
              </span>
            </div>
            <div className="message-content">
              <p>{msg.message}</p>
              {msg.fileUrl && <img src={msg.fileUrl} alt="Uploaded" className="message-image" />}
            </div>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} disabled={isSubmitting} autoFocus/>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default GroupChat;
