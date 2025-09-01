import React from "react";
import { Card } from "react-bootstrap";


const SavedJobs = () => {
    return (
        <div className="findjobs-container">
            <Card className="savedjobs-card">
                <Card.Body>
                    <Card.Title>Saved jobs</Card.Title>
                    <Card.Text>List of all saved jobs</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SavedJobs;
