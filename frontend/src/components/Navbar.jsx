import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas, Dropdown } from "react-bootstrap";
import { FaBriefcase, FaUser, FaUserCircle, FaFileAlt, FaCog } from "react-icons/fa";
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
        borderBottom: "2px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 30px var(--shadow2)",
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
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              fontSize: "1.8rem",
              fontWeight: 600,
              letterSpacing: "0.5px",
              background: "var(--accent1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Northstar Jobs
          </span>


          {/* Logo */}
          {!isMobile && (
            <div style={{ position: "absolute", left: "49%", transform: "translateX(-50%)" }}>
              <img
                src={logo}
                alt="Northstar Jobs logo"
                tabIndex={0}
                onClick={() => navigate("/")}
                onKeyDown={(e) => e.key === "Enter" && navigate("/")}
                style={{
                  height: "65px",
                  width: "auto",
                  cursor: "pointer",
                  transition: "filter 0.3s ease",
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

        {/* Top right side - Login, avatar, username*/}
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
                        color: "var(--text)",
                      }}
                    />

                  </Dropdown.Toggle>
                  <div style={{ color: "var(--text)", display: "flex", justifyContent: "center", position: "relative" }}>
                    <Dropdown.Menu
                      style={{
                        backgroundColor: "var(--card)",
                        border: "2px solid var(--border)",
                        color: "var(--text)",
                        transform: "none",
                        minWidth: "125px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        marginTop: "5px",
                        //position: "absolute",
                        //left: "50%",
                        // transform: "translateX(-50%)",
                      }}
                    >
                      {/* Profile */}
                      <Dropdown.Item
                        onClick={() => navigate("/account")}
                        style={{
                          color: "var(--text)",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--hover)";
                          e.target.style.color = "var(--text)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text)";
                        }}
                      >
                        <FaUser size={14} /> Profile
                      </Dropdown.Item>

                      {/* Documents */}
                      <Dropdown.Item
                        onClick={() => navigate("/documents")}
                        style={{
                          color: "var(--text)",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--hover)";
                          e.target.style.color = "var(--text)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text)";
                        }}
                      >
                        <FaFileAlt size={14} /> Resume
                      </Dropdown.Item>

                      {/* Settings */}
                      <Dropdown.Item
                        onClick={() => navigate("/settings")}
                        style={{
                          color: "var(--text)",
                          fontWeight: "500",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--hover)";
                          e.target.style.color = "var(--text)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text)";
                        }}
                      >
                        <FaCog size={14} /> Settings
                      </Dropdown.Item>

                    </Dropdown.Menu>
                  </div>
                </Dropdown>
                <span style={{ color: "var(--accent1)", fontWeight: 600 }}>{user.username}</span>
              </>
            ) : (
              <Nav.Link
                href="/login"
                style={{
                  width: "auto",
                  padding: "8px 20px",
                  border: "2px solid var(--border)",
                  backgroundColor: "transparent",
                  color: "var(--text)",
                  transition: "all 0.3s ease",
                  borderRadius: "0",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  textDecoration: "none"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--background)";
                  e.target.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--text)";
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
