import { Container, Form, Nav, Navbar as NavBar } from "react-bootstrap";

const Navbar = () => {
    return (
        <NavBar expand="lg" style={{ backgroundColor: "#3B0B24" }} className="px-3">
            <Container>
                <Nav className="me-auto d-flex align-items-center">
                    <NavBar.Brand href="/">
                        <img src="src/assets/logo.png" alt="Logo" className="logo" />
                    </NavBar.Brand>
                    {/*<Form className="d-flex ms-3">
                        <Form.Control type="text" placeholder="Search Jobs..." className="navbar-search" />
                    </Form> */}
                </Nav>
                <Nav className="ms-auto">
                    <Nav.Link href="/register" className="text-white">Register</Nav.Link>
                    <Nav.Link href="/login" className="text-white">Login</Nav.Link>
                </Nav>
            </Container>
        </NavBar>
    );
};

export default Navbar;
