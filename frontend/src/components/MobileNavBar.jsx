import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBriefcase, FaBookmark, FaChartBar, FaUser } from "react-icons/fa";
import logo from "../assets/logo3.png";
import logoClicked from "../assets/logo4.png";
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
                <span>Jobs</span>
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
                onClick={handleLogoClick}
                style={{
                    position: "relative",
                    top: "-20px",
                    background: "var(--lbg)",
                    border: "5px solid var(--border)",
                    borderRadius: "50%",
                    width: "70px",
                    height: "70px",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <img
                    src={location.pathname === "/find-jobs" ? logoClicked : logo}
                    alt="Logo"
                    style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain"
                    }}
                />
            </button>

            <button
                onClick={() => navigate("")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaChartBar style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>Trends</span>
            </button>
            <button
                onClick={() => navigate("")}
                style={{
                    background: "none",
                    border: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "12px",
                    color: location.pathname === "" ? "var(--hover2)" : "var(--text2)"
                }}
            >
                <FaUser style={{ fontSize: "20px", marginBottom: "2px" }} />
                <span>People</span>
            </button>

        </div>
    );
};

export default MobileNavBar;
