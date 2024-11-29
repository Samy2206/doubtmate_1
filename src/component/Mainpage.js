import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Notes from './mainpage/Notes';
import Question from './mainpage/Question';
import Conference from './mainpage/Conference';
import StudyGroup from './mainpage/StudyGroup';
import Que from './mainpage/Que';
import './mainpage.css';
import Note from './mainpage/Note';
import SGroup from './mainpage/SGroup';
import GroupVerify from './mainpage/GroupVerify';

function Mainpage() {
  return (
    <>
      <Navbar />
      <div className="navCompo">
        <Routes>
          <Route index element={<Question />} />
          <Route path="Question" element={<Question />} />
          <Route path="Notes" element={<Notes />} />
          <Route path="studyGroup" element={<StudyGroup />} />
          <Route path="conference" element={<Conference />} />
          <Route path="Que" element={<Que />} />
          <Route path="Note" element={<Note />} />
          <Route path="SGroup" element={<SGroup />} />
          {/* Updated route for GroupChat with groupId as a URL parameter */}
          <Route path="GroupChat/:groupId" element={<GroupVerify />} />
        </Routes>
      </div>
    </>
  );
}

export default Mainpage;
