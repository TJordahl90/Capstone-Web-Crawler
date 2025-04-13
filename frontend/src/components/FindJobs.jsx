import React from "react";
import { Container, Card } from "react-bootstrap";
import "./FindJobs.css";

const FindJobs = () => {
    return (
        <div className="findjobs-container">
            <Card className="findjobs-card">
                <Card.Body>
                    <Card.Title>Find Jobs</Card.Title>
                    <Card.Text>List of all available jobs</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FindJobs;
