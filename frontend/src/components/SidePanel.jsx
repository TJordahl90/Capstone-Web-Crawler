import React from "react";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar } from "react-icons/fa";
import "./SidePanel.css";
import { useTheme } from './ThemeContext';


const SidePanel = ({ children, collapsed }) => {
    const { theme } = useTheme();
    return (
        <div className="sidepanel-container">
            <div className={`side-panel ${collapsed ? "collapsed" : ""}`}>
                <a href="/find-jobs" className="menu-item">
                    <FaBriefcase className="icon" />
                    {!collapsed && <span>Jobs</span>}
                </a>
                <a href="/saved-jobs" className="menu-item">
                    <FaBookmark className="icon" />
                    {!collapsed && <span>Saved</span>}
                </a>
                <div className="menu-divider-line"></div>
                <a href="/#" className="menu-item">
                    <FaChartBar className="icon" />
                    {!collapsed && <span>Trends</span>}
                </a>
                <a href="/#" className="menu-item">
                    <FaUser className="icon" />
                    {!collapsed && <span>People</span>}
                </a>
            </div>
            <div className="content-wrapper">
                {children}
            </div>
        </div>
    );
};

export default SidePanel;
