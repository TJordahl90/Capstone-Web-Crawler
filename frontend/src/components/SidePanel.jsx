import React, { useState, useEffect } from "react";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar } from "react-icons/fa";
import "./SidePanel.css";


const SidePanel = ({ children }) => {

    return (
        <div className="sidepanel-container">
            <div className="side-panel">
                <a href="/find-jobs" className="menu-item">
                    <FaBriefcase className="icon" />
                    <span>Jobs</span>
                </a>
                <a href="/saved-jobs" className="menu-item">
                    <FaBookmark className="icon" />
                    <span>Saved</span>
                </a>
                <div className="menu-divider-line"></div>
                <a href="/#" className="menu-item">
                    <FaChartBar className="icon" />
                    <span>Trends</span>
                </a>
                <a href="/#" className="menu-item">
                    <FaUser className="icon" />
                    <span>People</span>
                </a>
            </div>
            <div className="content-wrapper">
                {children}
            </div>
        </div>
    );
};

export default SidePanel;