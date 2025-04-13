import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas } from "react-bootstrap";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar, FaUserCircle } from "react-icons/fa";

import logo from "../assets/logo3.png";
import "./Navbar.css";

const Navbar = ({ setCollapsed, collapsed }) => {

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 620);
  const [show, setShow] = useState(false);

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 620;
      setIsMobileView(isNowMobile);

      // ✅ Always hide Offcanvas if not on mobile
      if (!isNowMobile) {
        setShow(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Call once on mount to ensure it's synced immediately
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []); // ✅ Use empty dependency to only run once on mount


  const handleClick = () => {
    if (isMobileView) {
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
          <FaBars className="hamburger-icon" onClick={handleClick} />
          <NavBar.Brand href="/suggested-jobs" className="navbar-logo-wrapper">
            <img src={logo} alt="website logo" className="navbar-logo" />
          </NavBar.Brand>
        </div>

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

        <Form className="navbar-search-container">
          <Form.Control
            type="text"
            placeholder="Search Jobs..."
            className="navbar-search"
          />
        </Form>

        <Nav className="d-flex align-items-center">
          <Nav.Link href="/account" className="p-2">
            <FaUserCircle className="navbar-icon" size={45} />
          </Nav.Link>
        </Nav>
      </Container>
    </NavBar>
  );
};

export default Navbar;