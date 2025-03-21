import { Container, Form, Nav, Navbar as NavBar} from "react-bootstrap";
import { FaBars, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
    return (
        <NavBar expand="lg" className="custom-navbar">
            <Container fluid>
                <NavBar.Collapse className="justify-content-between w-100">
                    <Form className="d-flex mx-auto navbar-search-container">
                        <Form.Control 
                            type="text" 
                            placeholder="Search Jobs..." 
                            className="navbar-search"
                        />
                    </Form>
                    <Nav className="ms-auto">
                        <Nav.Link href="/account">
                            <FaUserCircle className="icon" size={28}/>
                        </Nav.Link>
                    </Nav>
                </NavBar.Collapse>
            </Container>
        </NavBar>
    );
};

export default Navbar;
