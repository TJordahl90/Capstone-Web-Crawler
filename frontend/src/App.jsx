import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from  './components/Login';
import AccountHome from './components/AccountHome';

//import 'bootstrap/dist/css/bootstrap.min.css';  // imports bootstrap styles


function App() {
  return (
    <>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<AccountHome />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
