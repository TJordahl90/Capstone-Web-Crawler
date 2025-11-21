import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaBriefcase, FaBookmark, FaUser, FaChartBar, FaCommentAlt, FaSignOutAlt } from "react-icons/fa";
import { FaThLarge } from "react-icons/fa";
import { useTheme } from "./ThemeContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Modal, Button } from "react-bootstrap";

const SidePanel = ({ children, user, handleLogout }) => {
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const location = useLocation();
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userEffective = user ?? (storedUser ? JSON.parse(storedUser) : null);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutInternal = async (e) => {
        e?.preventDefault();          // ok to keep
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
        { icon: <FaCommentAlt />, href: "/interview-chatbot", key: "chatbot", label: "Interview Chatbot" },
        { icon: <FaChartBar />, href: "/trend-analysis", key: "trends", label: "Job Trends" },

    ].concat(
        userEffective ? [{ icon: <FaSignOutAlt />, key: "logout", label: "Log Out", onClick: handleLogoutInternal }] : []
    );

    const currentPath = location.pathname; // need to implement - highlight button on current page

    return (

        <div className="NorthstarJob"
            style={{
                display: "flex",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                height: "100vh",
                backgroundColor: "var(--background)"
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
                    borderRight: "2px solid var(--border)"
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
                                onClick={() => setShowLogoutConfirm(true)}   // <— change here
                                style={{
                                    color: hovered === item.key ? "var(--accent1)" : "var(--text)",
                                    backgroundColor: hovered === item.key ? "var(--hover)" : "transparent",
                                    borderRadius: "10px",
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
                                    color: hovered === item.key ? "var(--accent1)" : "var(--text)",
                                    backgroundColor: hovered === item.key ? "var(--hover)" : "transparent",
                                    borderRadius: "10px",
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
                                backgroundColor: "var(--card)",
                                color: "var(--text)",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                zIndex: 99999,
                                boxShadow: "0 2px 8px var(--shadow2)",
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
                <Modal
                    show={showLogoutConfirm}
                    onHide={() => setShowLogoutConfirm(false)}
                    centered
                >
                    <Modal.Header
                        closeButton
                        style={{
                            backgroundColor: "var(--card)",
                            color: "var(--text)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <Modal.Title>Log out?</Modal.Title>
                    </Modal.Header>

                    <Modal.Body
                        style={{
                            backgroundColor: "var(--card)",
                            color: "var(--text)",
                        }}
                    >
                        Are you sure you want to log out?
                    </Modal.Body>

                    <Modal.Footer
                        style={{
                            backgroundColor: "var(--card)",
                            borderTop: "1px solid var(--border)",
                        }}
                    >
                        <Button
                            variant="secondary"
                            onClick={() => setShowLogoutConfirm(false)}
                            style={{
                                backgroundColor: "transparent",
                                color: "var(--text)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                setShowLogoutConfirm(false);
                                await handleLogoutInternal();
                            }}
                            style={{
                                backgroundColor: "var(--accent1)",
                                color: "#fff",
                                border: "none",
                                fontWeight: 600,
                            }}
                        >
                            Log Out
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </div>
    );
};

export default SidePanel;
