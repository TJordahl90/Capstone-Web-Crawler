import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas, Dropdown } from "react-bootstrap";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar, FaUserCircle, FaBell, FaRobot } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import logo from "../assets/logo3.png";

const Navbar = ({ setCollapsed, collapsed }) => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
    const [isSmallWidth, setIsSmallWidth] = useState(window.innerWidth > 480 && window.innerWidth <= 910);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Detect screen resize
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;

            setIsMobile(width <= 480);
            setIsSmallWidth(width > 480 && width <= 910);

        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await api.post("/logout/");
        }
        catch (err) {
            console.error(err);
        }
        localStorage.clear();
        navigate("/");
    };

    return (
        <NavBar
            className="nav-bar"
            style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                height: "60px",
                position: "sticky",
                top: 0,
                zIndex: 20,
            }}
        >
            <Container
                fluid
                style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "1.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        background: "linear-gradient(90deg, #00ADB5, #80D0C7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Northstar Jobs
                    </span>

                    {/* Logo */}
                    {!isMobile && (
                        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                            <img
                                src={logo}
                                alt="center logo"
                                style={{
                                    height: "50px",
                                    width: "auto",
                                    transition: "filter 0.3s ease"
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.filter =
                                        "brightness(0) saturate(100%) invert(46%) sepia(21%) saturate(1549%) hue-rotate(7deg) brightness(89%) contrast(85%)")
                                }
                                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                            />
                        </div>
                    )}
                </div>

                {/* Top Right */}
                <div className="navbar-right">
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <Dropdown align="end">
                                    <Dropdown.Toggle as="div" className="p-2 cursor-pointer">
                                        <FaUserCircle
                                            className="navbar-icon"
                                            size={45}
                                            style={{
                                                color: "var(--border)",
                                            }}
                                        />
                                    </Dropdown.Toggle>

                                    <div style={{ transform: "translateX(60px)" }}>
                                        <Dropdown.Menu
                                            style={{
                                                backgroundColor: "var(--editbg)",
                                                border: "2px solid var(--border)",
                                                color: "var(--edittxt)",
                                                transform: "none",
                                                minWidth: "125px",
                                                maxWidth: "125px",
                                                padding: "5px",
                                                paddingLeft: "5px",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <Dropdown.Item href="/account">Profile</Dropdown.Item>
                                            <Dropdown.Item href="/documents">Documents</Dropdown.Item>
                                            <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </div>
                                </Dropdown>
                                <span className="text-white ms-2">{user.username}</span>
                            </>
                        ) : (
                            <Nav.Link
                                href="/login"
                                style={{
                                    width: "auto",
                                    padding: "8px 20px",
                                    border: "2px solid var(--border)",
                                    backgroundColor: "transparent",
                                    color: "var(--text5)",
                                    transition: "all 0.3s ease",
                                    borderRadius: "0",
                                    height: "45px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "600",
                                    textDecoration: "none"
                                }}
                            >
                                Login
                            </Nav.Link>
                        )}
                    </div>
                </div>

            </Container>
        </NavBar>
    );
};

export default Navbar;
