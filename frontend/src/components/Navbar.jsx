import React, { useState, useEffect } from "react";
import { Container, Form, Nav, Navbar as NavBar, Offcanvas } from "react-bootstrap";
import { FaBriefcase, FaBookmark, FaUser, FaBars, FaChartBar, FaUserCircle } from "react-icons/fa";

import logo from "../assets/logo.webp";
import "./Navbar.css";

const Navbar = () => {
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 620);
    const [show, setShow] = useState(false);

    // Detect screen resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 620) {
                setIsMobileView(false);
            } else {
                setIsMobileView(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <NavBar expand="lg" className="custom-navbar">
            <Container fluid className="navbar-container">
                {isMobileView && (
                    <>
                    <FaBars className="hamburger-icon" onClick={handleShow}/>
                    <Offcanvas show={show} onHide={handleClose} className="navbar-canvas-container">
                        <Offcanvas.Body className="navbar-canvas">
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
                    </>
                )}

                <NavBar.Brand href="/suggested-jobs" className="d-flex align-items-center">
                    <img src={logo} alt="website logo" className="navbar-logo" />
                </NavBar.Brand>
                
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