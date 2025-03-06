import { Container, Form, Nav, Navbar as NavBar } from "react-bootstrap";

const Navbar = () => {
  return (
    <NavBar expand="lg" className="bg-dark px-3"> 
      <Container>
        <Nav className="me-auto d-flex align-items-center">
          <NavBar.Brand href="/" className="d-flex align-items-center">
            <img 
              src="src/assets/logo.png"
              alt="Site Logo"
              style={{ width: "50px", height: "50px", borderRadius: "10px" , objectFit: "cover" }} 
            />
          </NavBar.Brand>
          <Form className="d-flex ms-3">
            <Form.Control 
              type="text" 
              placeholder="Search Jobs..." 
              className="me-2"
              style={{ width: "250px", height: "50px", borderRadius: "20px" }}
            />
          </Form>
        </Nav>

        <Nav className="ms-auto">
          <Nav.Link href="/register" className="text-white">Register</Nav.Link>
          <Nav.Link href="/login" className="text-white">Login</Nav.Link>
        </Nav>
      </Container>
    </NavBar>
  );
}

export default Navbar;
