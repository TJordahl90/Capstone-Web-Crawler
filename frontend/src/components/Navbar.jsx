import { Container, Form, Nav, Navbar as NavBar } from "react-bootstrap";

const Navbar = () => {
    return (
        <NavBar expand="lg" className="navbar-custom fixed-top">
            <Container fluid>
                <Nav className="me-auto">
                    <Form>
                        <Form.Control type="text" placeholder="Search Jobs..." className="navbar-search" />
                    </Form>
                </Nav>
            </Container>
        </NavBar>
    );
};

export default Navbar;
