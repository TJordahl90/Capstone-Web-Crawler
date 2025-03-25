import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";

const SavedJobs = () => {

    return (
        <Container className="py-5">
            <Card>
                <Card.Body>
                    <Card.Title>Saved jobs</Card.Title>
                    <Card.Text>list of all saved jobs</Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SavedJobs;
