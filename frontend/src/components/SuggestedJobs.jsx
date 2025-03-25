import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";

const SuggestedJobs = () => {

    return (
        <Container className="py-5">
            <Card>
                <Card.Body>
                    <Card.Title>Suggested jobs</Card.Title>
                    <Card.Text>provide recommended jobs from match system</Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SuggestedJobs;
