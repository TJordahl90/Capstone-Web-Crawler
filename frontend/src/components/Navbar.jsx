import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas, Dropdown } from "react-bootstrap";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar, FaUserCircle, FaBell } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import logo from "../assets/logo3.png";
import "./Navbar.css";

const Navbar = ({ setCollapsed, collapsed }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isSmallWidth, setIsSmallWidth] = useState(
    window.innerWidth > 480 && window.innerWidth <= 770
  );
  const [show, setShow] = useState(false);
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

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
    <NavBar expand="lg" className="custom-navbar">
      <Container fluid className="navbar-container">
        <div className="navbar-left">
          {!isMobile && (
            <FaBars className="hamburger-icon" onClick={handleClick} />
          )}
          {!isMobile && (
            <NavBar.Brand href="/find-jobs" className="navbar-logo-wrapper">
              <img src={logo} alt="website logo" className="navbar-logo" />
            </NavBar.Brand>
          )}
        </div>
        {!isMobile && (
          <Offcanvas show={show} onHide={() => setShow(false)} className="navbar-canvas-container" placement="start">
            <Offcanvas.Body className="navbar-canvas">
              <div className="offcanvas-header-bar">
                <FaBars className="hamburger-icon bigmac" onClick={handleClose} />
                <img src={logo} alt="logo inside offcanvas" className="navbar-logo" />
              </div>
              <div className="menu-divider-line"></div>

              <a href="/find-jobs" className="menu-item">
                <FaBriefcase className="icon" />
                <span>Jobs</span>
              </a>
              <a href="/saved-jobs" className="menu-item">
                <FaBookmark className="icon" />
                <span>Saved</span>
              </a>
              <div className="menu-divider-line"></div>
              <a href="/#" className="menu-item">
                <FaChartBar className="icon" />
                <span>Trends</span>
              </a>
              <a href="/#" className="menu-item">
                <FaUser className="icon" />
                <span>People</span>
              </a>
            </Offcanvas.Body>
          </Offcanvas>
        )}

        <div className="navbar-right">
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="p-2 cursor-pointer">
                    <FaUserCircle className="navbar-icon" size={45} />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-custom align-left">
                    <Dropdown.Item href="/account">Edit Profile</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <span className="text-gray ms-2">{user.username}</span>
              </>
            ) : (
              <Nav.Link href="/login" className="loginpg-btn">Login</Nav.Link>
            )}
          </div>


        </div>

      </Container>
    </NavBar>
  );
};

export default Navbar;