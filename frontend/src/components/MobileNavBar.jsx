import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar, FaRobot, FaCog } from "react-icons/fa";
import logo from "../assets/logo3.png";
import logoClicked from "../assets/logo3.png";
//import "./MobileNavBar.css";

const MobileNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clicked, setClicked] = useState(false);

    const handleLogoClick = () => {
        navigate("/");
    };
    return (
        <div
            className="mobile-nav-bar"
            style={{
                position: "fixed",
                bottom: 0,
                width: "100%",
                height: "65px",
                backgroundColor: "var(--bg3)",
                borderTop: "5px solid var(--border)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                zIndex: 999
            }}
        >
            <button
                onClick={() => navigate("/find-jobs")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/find-jobs" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaBriefcase style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>Explore</span>
            </button>
            <button
                onClick={() => navigate("/matched-jobs")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/matched-jobs" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaUser style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>For You</span>
            </button>

            <button
                onClick={() => navigate("/saved-jobs")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/saved-jobs" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaBookmark style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>Saved</span>
            </button>

            <button
                onClick={() => navigate("/trend-analysis")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/trend-analysis" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaChartBar style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>Trends</span>
            </button>

            <button
                onClick={() => navigate("/interview-chatbot")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/interview-chatbot" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaRobot style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>PrepMate</span>
            </button>

            <button
                onClick={() => navigate("/settings")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "/settings" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaCog style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>Settings</span>
            </button>

        </div>
    );
};

export default MobileNavBar;
