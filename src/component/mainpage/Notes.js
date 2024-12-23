import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; // Firestore config
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import NoteDetail from './NoteDetail'; // Component to render each note's details
import './Notes.css'; // Updated styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');  // State for search query
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotes(notesData);

        // Extract unique subjects
        const uniqueSubjects = Array.from(new Set(notesData.map((note) => note.subject)));
        setSubjects(['All', ...uniqueSubjects]);

        setFilteredNotes(notesData);
        setLoading(false);
      },
      (error) => {
        console.log('Error fetching notes:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter notes by subject and search query
  useEffect(() => {
    let filtered = notes;

    if (selectedSubject !== 'All') {
      filtered = filtered.filter((note) => note.subject === selectedSubject);
    }

    if (searchQuery) {
      filtered = filtered.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  }, [selectedSubject, notes, searchQuery]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="notes-container">
      <div className="main-content">
        <button className="floating-btn" onClick={() => navigate('/Mainpage/Note')}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <h1>{selectedSubject === 'All' ? 'All Notes' : `${selectedSubject} Notes`}</h1>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Search by title or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-dropdown"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {filteredNotes.length === 0 ? (
          <p>No notes available</p>
        ) : (
          filteredNotes.map((note) => <NoteDetail key={note.id} noteId={note.id} />)
        )}
      </div>
    </div>
  );
}

export default Notes;
