import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import LoginForm from './component/LoginForm';
import Mainpage from './component/Mainpage';
import Register from './component/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Mainpage/*" element={<Mainpage />} /> {/* Use * for nested routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
