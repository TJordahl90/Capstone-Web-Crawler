import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar, FaUserCircle, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import { FaThLarge } from "react-icons/fa";
import { useTheme } from "./ThemeContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

const SidePanel = ({ children, user, handleLogout }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const location = useLocation();
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userEffective = user ?? (storedUser ? JSON.parse(storedUser) : null);
     const navigate = useNavigate();

    const handleLogoutInternal = async (e) => {
        e?.preventDefault();
        try {
            await api.post("/logout/");
        } catch (err) {
            console.error(err);
        }
        localStorage.clear();
        navigate("/");
    };
    const navItems = [
        { icon: <FaThLarge />, href: "/dashboard", key: "dashboard", label: "Dashboard" },
        { icon: <FaBriefcase />, href: "/find-jobs", key: "jobs", label: "Explore Jobs" },
        { icon: <FaUser />, href: "/matched-jobs", key: "matches", label: "Matched Jobs" },
        { icon: <FaBookmark />, href: "/saved-jobs", key: "saved", label: "Saved Jobs" },
        { icon: <FaChartBar />, href: "/trend-analysis", key: "trends", label: "Job Trends" },

    ].concat(
        userEffective
            ? [
                { icon: <FaUserCircle />, href: "/account", key: "account", label: "Profile" },
                { icon: <FaFileAlt />, href: "/documents", key: "documents", label: "Documents" },
                { icon: <FaSignOutAlt />, key: "logout",      label: "Log Out", onClick: handleLogoutInternal },
            ]
            : []
    );

    const currentPath = location.pathname; // need to implement - highlight button on current page

    return (
        <div
            style={{
                display: "flex",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRight: "2px solid rgba(255, 255, 255, 0.15)",
                height: "100vh",
            }}
        >
            {/* Sidepanel */}
            <div
                style={{
                    width: "80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingTop: "20px",
                    gap: "18px",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    borderRight: "2px solid rgba(255, 255, 255, 0.15)"
                }}
            >
                {navItems.map((item) => (
                    <div
                        key={item.key}
                        style={{ position: "relative" }}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                                top: rect.top + rect.height / 2,
                                left: rect.right + 10,
                            });
                            setHovered(item.key);
                        }}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {item.key === "logout" ? (
                            <motion.div
                                whileHover={{ scale: 1.15 }}
                                onClick={item.onClick}
                                style={{
                                    color: hovered === item.key ? "var(--textonhover2)" : "var(--text2)",
                                    backgroundColor: hovered === item.key ? "rgba(255, 255, 255, 0.25)" : "transparent",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    transition: "all 0.25s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <motion.div style={{ fontSize: "1.40rem" }}>{item.icon}</motion.div>
                            </motion.div>
                        ) : (
                            <motion.a
                                href={item.href}
                                whileHover={{ scale: 1.15 }}
                                style={{
                                    color: hovered === item.key ? "var(--textonhover2)" : "var(--text2)",
                                    backgroundColor: hovered === item.key ? "rgba(255, 255, 255, 0.25)" : "transparent",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    transition: "all 0.25s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <motion.div style={{ fontSize: "1.40rem" }}>{item.icon}</motion.div>
                            </motion.a>
                        )}

                    </div>
                ))}
            </div>

            {/* Display link label */}
            {createPortal(
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            key={hovered}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: "fixed",
                                top: tooltipPos.top,
                                left: tooltipPos.left,
                                transform: "translateY(-50%)",
                                backgroundColor: "rgba(10, 10, 10, 0.95)",
                                color: "white",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                zIndex: 99999,
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            {navItems.find((item) => item.key === hovered)?.label}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Main Content */}
            <div
                style={{
                    flexGrow: 1,
                    marginLeft: "80px",
                    padding: "0px",
                    overflowY: "auto",
                    width: "calc(100vw - 80px)",
                    height: "calc(100vh - 60px)",
                    boxSizing: "border-box",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default SidePanel;
