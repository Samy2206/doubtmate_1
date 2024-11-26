import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Notes from './mainpage/Notes';
import Question from './mainpage/Question';
import Conference from './mainpage/Conference'
import StudyGroup from './mainpage/StudyGroup';
import Que from './mainpage/Que'
import './mainpage.css'

function Mainpage() {
  return (
    <>
      <Navbar />
      <div className="navCompo">
        <Routes>
          <Route index element={<Question/>} /> 
          <Route path='Question' element={<Question/>} /> 
          <Route path="Notes" element={<Notes />} />
          <Route path='StudyGroup' element={<StudyGroup/>}/>
          <Route path="conference" element={<Conference/>}/>
          <Route path="Que" element={<Que />} />
        </Routes>
      </div>
    </>
  );
}

export default Mainpage;
