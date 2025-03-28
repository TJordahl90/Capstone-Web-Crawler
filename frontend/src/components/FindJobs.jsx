import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import "./FindJobs.css";

const FindJobs = () => {

    return (
        <Container className="py-5">
            <Card>
                <Card.Body>
                    <Card.Title>Find Jobs</Card.Title>
                    <Card.Text>List of all available jobs</Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FindJobs;
