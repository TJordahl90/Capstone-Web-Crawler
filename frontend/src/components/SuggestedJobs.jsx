import React from "react";
import { Card } from "react-bootstrap";
import "./FindJobs.css";

const SuggestedJobs = () => {
    return (
        <div className="suggestedjobs-container">
            <Card className="suggestedjobs-card">
                <Card.Body>
                    <Card.Title>Suggested jobs</Card.Title>
                    <Card.Text>provide recommended jobs from match system</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SuggestedJobs;
