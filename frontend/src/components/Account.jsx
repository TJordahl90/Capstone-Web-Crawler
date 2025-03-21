import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";

const Account = () => {

    return (
        <Container className="py-5">
            <Card>
                <Card.Body>
                    {/* <Card.Img></Card.Img> */}
                    <Card.Title>Username</Card.Title>
                    <Card.Text>School Name / company</Card.Text>
                    <Button>Edit</Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Account;