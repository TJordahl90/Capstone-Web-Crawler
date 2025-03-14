import React from "react";
import "./FindJobs.css";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { FaBriefcase, FaBookmark, FaUser } from "react-icons/fa";
import { useState } from "react";

const FindJobs = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidePanel = () => {
        setIsCollapsed(!isCollapsed);
    };
    return (
        <div className="findjobs-container">
            {/* Add SidePanel */}
            <div className={`side-panel ${isCollapsed ? "collapsed" : ""}`}>
                <div className="menu-item">
                    <FaBriefcase className="icon" />
                    <span>Jobs</span>
                </div>
                <div className="menu-item">
                    <FaBookmark className="icon" />
                    <span>Saved</span>
                </div>
                <div className="menu-divider-line"></div>
                <div className="menu-divider">Explore</div>
                <div className="menu-item">
                    <FaUser className="icon" />
                    <span>People</span>
                </div>
            </div>
            {/* Header Section */}
            <header className="header">
                <div className="hamburger-menu" onClick={toggleSidePanel}>
                    <FaBars size={24} />
                </div>
                <span className="web-name">Web name</span>

                <div className="search-bar input-group">
                    <span className="input-group-text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>
                    </span>
                    <input type="text" className="form-control search-input" style={{ maxWidth: "500px" }} placeholder="Jobs, people, area,..." />
                </div>
                <div className="user-info">
                    <FaUserCircle size={24} />
                    <span className="user-name">User Name</span>
                </div>
            </header>
            <div className="main-content">
            </div>
        </div>
    );
};

export default FindJobs;
