import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import FindJobs from "./components/FindJobs";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const location = useLocation();
  const hideNavMenus = ["/", "/login", "/register"];
  const showNavMenus = !hideNavMenus.includes(location.pathname);

  return (
    <>
      {/* {showNavMenus && <Navbar />} */}
      {showNavMenus && <SidePanel />}

      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthForm isLogin={true} />} />
          <Route path="/register" element={<AuthForm isLogin={false} />} />
          <Route path="/find-jobs" element={<FindJobs />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
