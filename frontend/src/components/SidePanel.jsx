import React, { useState, useEffect } from "react";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar } from "react-icons/fa";
import "./SidePanel.css";


const SidePanel = ({ children }) => {

    return (
        <div className="sidepanel-container">
            <div className="side-panel">
                <div className="menu-item">
                    <FaBriefcase className="icon" />
                    <span>Jobs</span>
                </div>
                <div className="menu-item">
                    <FaBookmark className="icon" />
                    <span>Saved</span>
                </div>
                <div className="menu-divider-line"></div>
                <div className="menu-item">
                    <FaChartBar className="icon" />
                    <span>Trends</span>
                </div>
                <div className="menu-item">
                    <FaUser className="icon" />
                    <span>People</span>
                </div>
            </div>
            <div className="content-wrapper">
                {children}
            </div>
        </div>
    );
};

export default SidePanel;