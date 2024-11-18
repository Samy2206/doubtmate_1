import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom'; // Correct import for Router
import Navbar from './component/Navbar'; // Import Navbar
import LoginForm from './component/LoginForm';
import Mainpage from './component/Mainpage';
import Register from './component/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<LoginForm />} 
        />
        <Route 
          path="/Mainpage" 
          element={<Mainpage />} 
        />
        <Route
          path='/Register'
          element={<Register />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
