import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthForm from "./components/AuthForm";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles

function App() {
  return (
    <>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthForm isLogin={true} />} />
          <Route path="/register" element={<AuthForm isLogin={false} />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
