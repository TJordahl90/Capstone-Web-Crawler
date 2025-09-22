import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas, Dropdown } from "react-bootstrap";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar, FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import logo from "../assets/logo3.png";
// import "./Navbar.css";

const Navbar = ({ setCollapsed, collapsed }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallWidth, setIsSmallWidth] = useState(
    window.innerWidth > 480 && window.innerWidth <= 910
  );
  const [show, setShow] = useState(false);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [hoveredItem, setHoveredItem] = useState(null);
  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsMobile(width <= 480);
      setIsSmallWidth(width > 480 && width <= 910);

      // Always hide Offcanvas if not in small screen mode
      if (!(width <= 910)) {
        setShow(false);
      }
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

  const handleClick = () => {
    if (isSmallWidth) {
      setShow(true);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    // Top Nav bar container
    <NavBar
      className="nav-bar"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        margin: 0,
        padding: 0,
        border: "none",
        boxShadow: "none",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        zIndex: 10,
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

          {/* Hamburger button */}
          {!isMobile && (
            <FaBars
              onClick={handleClick}
              style={{
                height: "35px",
                width: "auto",
                cursor: "pointer",
                color: "var(--hambuger)",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--hamhover)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--hambuger)")}
            />
          )}
          <span
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              paddingLeft: "15px",
              color: "#00ADB5",
            }}
          >
            Northstar
          </span>
          {/* Logo  */}
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

        {/*Wing Pannel */}
        {!isMobile && (
          <Offcanvas show={show} onHide={() => setShow(false)}
            className="navbar-canvas-container"
            style={{
              width: "220px",
              backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
              backdropFilter: "blur(10px)",                // adds frosted-glass effect
              WebkitBackdropFilter: "blur(10px)",
            }}>
            <Offcanvas.Body
              className="wingpannel"
              style={{
                color: "var(--text2)",
                height: "100%",
                padding: "0rem 0",
                paddingTop: 3,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }}
              >
                {/* Big mac button */}
                <FaBars
                  onClick={handleClose}
                  style={{
                    height: "35px",
                    width: "auto",
                    cursor: "pointer",
                    color: "var(--hambuger)",
                    transition: "color 0.3s ease",
                    paddingLeft: "15px"

                  }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--hamhover)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--hambuge)")}
                />
                {/*Logo button */}
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    paddingLeft: "15px",
                    paddingTop: "7px",
                    color: "#00ADB5",
                  }}
                >
                  Northstar
                </span>
              </div>

              {/* All other button */}
              <a
                href="/find-jobs"
                onMouseEnter={() => setHoveredItem("explore")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px 10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  color: hoveredItem === "explore" ? "var(--textonhover2)" : "var(--text2)",
                  backgroundColor: hoveredItem === "explore" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "explore" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaBriefcase className="icon" />
                <span>Explore</span>
              </a>

              <a
                href="/saved-jobs"
                onMouseEnter={() => setHoveredItem("foryou")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px 10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  color: hoveredItem === "foryou" ? "var(--textonhover2)" : "var(--text2)",
                  backgroundColor: hoveredItem === "foryou" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "foryou" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaBookmark className="icon" />
                <span>For You</span>
              </a>

              <a
                href="/saved-jobs"
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
                  backgroundColor: hoveredItem === "saved" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "saved" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaBookmark className="icon" />
                <span>Saved</span>
              </a>

              <a
                href="/#"
                onMouseEnter={() => setHoveredItem("trend")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px 10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  color: hoveredItem === "trend" ? "var(--textonhover2)" : "var(--text2)",
                  backgroundColor: hoveredItem === "trend" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "trend" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaChartBar className="icon" />
                <span>Trend</span>
              </a>

              <a
                href="/#"
                onMouseEnter={() => setHoveredItem("prepmate")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px 10px 20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s ease",
                  color: hoveredItem === "prepmate" ? "var(--textonhover2)" : "var(--text2)",
                  backgroundColor: hoveredItem === "prepmate" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "prepmate" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaUser className="icon" />
                <span>PrepMate</span>
              </a>

            </Offcanvas.Body>
          </Offcanvas>
        )}

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
                      <Dropdown.Item
                        href="/account"
                        style={{
                          color: "var(--text5)",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--edithover)";
                          e.target.style.color = "var(--edittxt)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text5)";
                        }}
                      >
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        href="/documents"
                        style={{
                          color: "var(--text5)",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--edithover)";
                          e.target.style.color = "var(--edittxt)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text5)";
                        }}
                      >
                        Documents
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={handleLogout}
                        style={{
                          color: "var(--text5)",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "var(--edithover)";
                          e.target.style.color = "var(--edittxt)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--text5)";
                        }}
                      >
                        Log Out
                      </Dropdown.Item>
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--hover4)";
                  e.target.style.color = "var(--textonhover5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--text5)";
                }}
              >
                Login
              </Nav.Link>

            )}
          </div>
        </div>

      </Container>
    </NavBar >
  );
};

export default Navbar;