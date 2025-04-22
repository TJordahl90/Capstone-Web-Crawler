import React, { useState } from "react";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar } from "react-icons/fa";
// import "./SidePanel.css";
import { useTheme } from './ThemeContext';


const SidePanel = ({ children, collapsed }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const { theme } = useTheme();
    return (
        <div
            className="Bottom Page"
            style={{
                display: "flex",
                backgroundColor: "var(--bg2)",
            }}
        >
            <div
                className="side-panel"
                style={{
                    width: collapsed ? "60px" : "200px",
                    height: "100vh",
                    color: "var(--text2)",
                    position: "fixed",
                    left: 0,
                    transition: "transform 0.3s ease, width 0.3s ease",
                    borderRight: "1px solid var(--border)",
                    borderTop: "1px solid var(--border)",
                    backgroundColor: "var(--bg3)",
                    display: window.innerWidth <= 770 ? "none" : "block",
                }}
            >
                <a
                    href="/find-jobs"
                    onMouseEnter={() => setHoveredItem("jobs")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "jobs" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "jobs" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "jobs" ? "5px" : "0",
                        maxWidth: "40vw",
                    }}
                >
                    <FaBriefcase className="icon" />
                    {!collapsed && <span>Jobs</span>}
                </a>
                <a href="/saved-jobs"
                    onMouseEnter={() => setHoveredItem("saved")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "saved" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "saved" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "saved" ? "5px" : "0",
                        maxWidth: "40vw",
                    }}>
                    <FaBookmark className="icon" />
                    {!collapsed && <span>Saved</span>}
                </a>
                <div
                    style={{
                        height: "1px",
                        backgroundColor: "var(--text)",
                        width: collapsed ? "30px" : "180px",
                        margin: "10px auto",
                        transition: "width 0.3s ease"
                    }}
                ></div>
                <a href="/#"
                    onMouseEnter={() => setHoveredItem("trends")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "trends" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "trends" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "trends" ? "5px" : "0",
                        maxWidth: "40vw",
                    }}>
                    <FaChartBar className="icon" />
                    {!collapsed && <span>Trends</span>}
                </a>
                <a href="/#"
                    onMouseEnter={() => setHoveredItem("people")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "people" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "people" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "people" ? "5px" : "0",
                        maxWidth: "40vw",
                    }}>
                    <FaUser className="icon" />
                    {!collapsed && <span>People</span>}
                </a>
            </div>

            {/*/ the main area */}
            <div
                className="main-area"
                style={{
                    flexGrow: 1,
                    marginLeft: window.innerWidth <= 770 ? "0px" : (collapsed ? "60px" : "200px"),
                    display: "flex",
                    flexDirection: "column",
                    overflowX: "hidden",
                    width: window.innerWidth <= 770 ? "100vw" : (collapsed ? "calc(100vw - 60px)" : "calc(100vw - 200px)"),
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    borderTop: "1px solid var(--border)",
                    background: "var(--bg2)",
                    height: "calc(100vh - 81px)",
                }}
            >
                <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
            </div>

        </div>
    );
};

export default SidePanel;
