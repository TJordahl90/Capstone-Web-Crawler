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
    window.innerWidth > 480 && window.innerWidth <= 770
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
      setIsSmallWidth(width > 480 && width <= 770);

      // Always hide Offcanvas if not in small screen mode
      if (!(width <= 770)) {
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
        backgroundColor: "var(--bg6)",
        margin: 0,
        padding: 0,
        border: "none",
        boxShadow: "none",
        borderTop: "1px solid var(--border)",
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

          {/* Logo  */}
          {!isMobile && (
            <NavBar.Brand href="/find-jobs" style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logo}
                alt="website logo"
                style={{
                  height: "60px",
                  width: "auto",
                  paddingLeft: "1px",
                  transition: "filter 0.3s ease"
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.filter =
                  "brightness(0) saturate(100%) invert(46%) sepia(21%) saturate(1549%) hue-rotate(7deg) brightness(89%) contrast(85%)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
              />
            </NavBar.Brand>
          )}
        </div>

        {/*Wing Pannel */}
        {!isMobile && (
          <Offcanvas show={show} onHide={() => setShow(false)}
            className="navbar-canvas-container"
            style={{
              width: "200px"
            }}>
            <Offcanvas.Body
              className="wingpannel"
              style={{
                backgroundColor: "var(--bg3)",
                color: "var(--text2)",
                height: "100%",
                padding: "1rem 0"
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
                  onMouseEnter={(e) => (e.target.style.color = "var(--hambuger)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--hamhover)")}
                />
                {/*Logo button */}
                <NavBar.Brand href="/find-jobs" style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={logo}
                    alt="website logo"
                    style={{
                      height: "60px",
                      width: "auto",
                      paddingLeft: "1px",
                      transition: "filter 0.3s ease"
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.filter =
                      "brightness(0) saturate(100%) invert(46%) sepia(21%) saturate(1549%) hue-rotate(7deg) brightness(89%) contrast(85%)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                  />
                </NavBar.Brand>
              </div>

              {/* All other button */}
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
                  backgroundColor: hoveredItem === "jobs" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "jobs" ? "5px" : "0",
                  maxWidth: "40vw",
                }}
              >
                <FaBriefcase className="icon" />
                {<span>Jobs</span>}
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
                  backgroundColor: hoveredItem === "saved" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "saved" ? "5px" : "0",
                  maxWidth: "40vw",
                }}>
                <FaBookmark className="icon" />
                {<span>Saved</span>}
              </a>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--text)",
                  width: "180px",
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
                  backgroundColor: hoveredItem === "trends" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "trends" ? "5px" : "0",
                  maxWidth: "40vw",
                }}>
                <FaChartBar className="icon" />
                {<span>Trends</span>}
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
                  backgroundColor: hoveredItem === "people" ? "var(--hover2)" : "transparent",
                  borderRadius: hoveredItem === "people" ? "5px" : "0",
                  maxWidth: "40vw",
                }}>
                <FaUser className="icon" />
                {<span>People</span>}
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
                    <FaUserCircle className="navbar-icon" size={45} />
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      backgroundColor: "var(--editbg)",
                      border: "2px solid var(--border)",
                      color: "var(--edittxt)",
                      transform: "none",
                      minWidth: "125px",
                      maxWidth: "125px",
                      padding: "5px",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <Dropdown.Item
                      href="/account"
                      style={{
                        color: "var(--text2)",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "var(--edithover)";
                        e.target.style.color = "var(--edittxt)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "var(--edittxt)";
                      }}
                    >
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      href="/documents"
                      style={{
                        color: "var(--text2)",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "var(--hover)";
                        e.target.style.color = "var(--text)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "var(--text2)";
                      }}
                    >
                      Documents
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={handleLogout}
                      style={{
                        color: "var(--text2)",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "var(--edithover)";
                        e.target.style.color = "var(--edittxt)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "var(--edittxt)";
                      }}
                    >
                      Log Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <span className="text-gray ms-2">{user.username}</span>
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
    </NavBar>
  );
};

export default Navbar;