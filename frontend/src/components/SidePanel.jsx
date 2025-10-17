import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar, FaRobot, FaCog } from "react-icons/fa";
import { useTheme } from './ThemeContext';
import backgroundImage from "../assets/background4.png";

const SidePanel = ({ children, collapsed }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const { theme } = useTheme();
    return (
        <div
            className="Bottom Page"
            style={{
                display: "flex",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                zIndex: 1,
            }}
        >
            <div
                className="side-panel"
                style={{
                    width: collapsed ? "60px" : "200px",
                    height: "100%",
                    color: "var(--text2)",
                    position: "fixed",
                    left: 0,
                    transition: "transform 0.3s ease, width 0.3s ease",
                    borderRight: "1px solid var(--border)",
                    borderTop: "1px solid var(--border)",
                    display: window.innerWidth <= 910 ? "none" : "block",
                    zIndex: 10,
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
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "jobs" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "jobs" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "jobs" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}
                >
                    <FaBriefcase className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                Explore
                            </motion.span>
                        )}
                    </AnimatePresence>
                </a>
                <a
                    href="/matched-jobs"
                    onMouseEnter={() => setHoveredItem("matches")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "matches" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "matches" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "matches" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}
                >
                    <FaUser className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                For You
                            </motion.span>
                        )}
                    </AnimatePresence>
                </a>
                <a href="/saved-jobs"
                    onMouseEnter={() => setHoveredItem("saved")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "saved" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "saved" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "saved" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}>
                    <FaBookmark className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                Saved
                            </motion.span>
                        )}
                    </AnimatePresence>

                </a>
                {/*
                <div
                    style={{
                        height: "1px",
                        backgroundColor: "var(--border)",
                        width: collapsed ? "30px" : "180px",
                        margin: "10px auto",
                        transition: "width 0.3s ease"
                    }}
                ></div>
                */}
                <a href="/trend-analysis"
                    onMouseEnter={() => setHoveredItem("trends")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "trends" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "trends" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "trends" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}>
                    <FaChartBar className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                Trends
                            </motion.span>
                        )}
                    </AnimatePresence>

                </a>
                <a href="/interview-chatbot"
                    onMouseEnter={() => setHoveredItem("chatbot")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "chatbot" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "chatbot" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "chatbot" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}>
                    <FaRobot className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                PrepMate
                            </motion.span>
                        )}
                    </AnimatePresence>
                </a>

                <a href="/settings"
                    onMouseEnter={() => setHoveredItem("settings")}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "20px 10px 10px 20px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                        color: hoveredItem === "settings" ? "var(--textonhover2)" : "var(--text2)",
                        backgroundColor: hoveredItem === "settings" ? "var(--hover)" : "transparent",
                        borderRadius: hoveredItem === "settings" ? "5px" : "0",
                        maxWidth: "40vw",
                        minHeight: "54px",
                    }}>
                    <FaCog className="icon" />
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                key="label"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.2 } }} // Delay on enter
                                exit={{ opacity: 0, transition: { duration: 0 } }}    // Instant disappear on exit
                                className="ml-2"
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </a>
            </div>

            {/*/ the main area */}
            <div
                className="main-area"
                style={{
                    flexGrow: 1,
                    marginLeft: window.innerWidth <= 910 ? "0px" : (collapsed ? "60px" : "200px"),
                    display: "flex",
                    flexDirection: "column",
                    overflowX: "hidden",
                    width: window.innerWidth <= 910 ? "100vw" : (collapsed ? "calc(100vw - 60px)" : "calc(100vw - 200px)"),
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    borderTop: "1px solid var(--border)",
                    height: "calc(100vh - 60px)", // prev 100vh - 52px
                    
                }}
            >
                <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
            </div>

        </div>
    );
};

export default SidePanel;
