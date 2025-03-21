import React, { useState, useEffect } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { FaBriefcase, FaBookmark, FaUser } from "react-icons/fa";
import { Container } from "react-bootstrap";
import "./SidePanel.css";


const SidePanel = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isWingPanelOpen, setIsWingPanelOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 620);

    // Detect screen resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 620) {
                setIsMobileView(false);
                setIsWingPanelOpen(false); 
            } else {
                setIsMobileView(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Toggle side panel for desktop OR WingPanel for mobile
    const togglePanel = () => {
        if (isMobileView) {
            setIsWingPanelOpen(!isWingPanelOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    // Close WingPanel when clicking BigMac
    const closeWingPanel = () => {
        setIsWingPanelOpen(false);
    };

    return (
        <div className="sidepanel-container">
            {/* Side Panel (Visible when screen width > 620px) */}
            {!isMobileView && (
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
            )}

            {/* WingPanel (Appears when screen width <= 620px) */}
            {isMobileView && (
                <div className={`wing-panel ${isWingPanelOpen ? "active" : ""}`}>
                    {/* Wing Header - Contains only BigMac and Web Name */}
                    <div className="wing-header">
                        <div className="bigmac-menu" onClick={closeWingPanel}>
                            <FaBars size={24} />
                        </div>
                        <span className="web-name">Web Name</span>
                    </div>

                    {/* Menu Items - Jobs, Saved, People */}
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
            )}

            {/* Header Section */}
            <div className="header">
                {/* Left Side: Hamburger + Web Name */}
                <div className="header-left">
                    <div className="hamburger-menu" onClick={togglePanel}>
                        <FaBars size={24} />
                    </div>
                    <span className="web-name">Web Name</span>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;