import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBriefcase, FaBookmark, FaChartBar, FaUser } from "react-icons/fa";
import logo from "../assets/logo3.png";
import logoClicked from "../assets/logo4.png";
import "./MobileNavBar.css";

const MobileNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clicked, setClicked] = useState(false);

    const handleLogoClick = () => {
        navigate("/suggested-jobs");
    };
    return (
        <div className="mobile-nav-bar">
            <button
                className={`nav-btn ${location.pathname === "/find-jobs" ? "active" : ""}`}
                onClick={() => navigate("/find-jobs")}
            >
                <FaBriefcase />
                <span>Jobs</span>
            </button>
            <button
                className={`nav-btn ${location.pathname === "/saved-jobs" ? "active" : ""}`}
                onClick={() => navigate("/saved-jobs")}
            >
                <FaBookmark />
                <span>Saved</span>
            </button>
            <button className="nav-logo-btn" onClick={handleLogoClick}>
                <img
                    src={location.pathname === "/suggested-jobs" ? logoClicked : logo}
                    alt="Logo"
                    className="nav-logo"
                />
            </button>
            <button
                className={`nav-btn ${location.pathname === "/suggested-jobs" ? "active" : ""}`}
                onClick={() => navigate("/suggested-jobs")}
            >
                <FaChartBar />
                <span>Trends</span>
            </button>

            <button
                className={`nav-btn ${location.pathname === "/account" ? "active" : ""}`}
                onClick={() => navigate("/account")}
            >
                <FaUser />
                <span>People</span>
            </button>
        </div>
    );
};

export default MobileNavBar;
