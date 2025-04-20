import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Nav, ListGroup, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaClock, FaStar, FaRegStar, FaFilter } from "react-icons/fa";
import fugetec from "../assets/FugeTechnologies.jpg";
import texasIns from "../assets/TexasInstruments.jpg";
import lockheed from "../assets/LockheedMartin.jpg";
import api from "../api.js";
import "./FindJobs.css";

const FindJobs = () => {
    const [error, setError] = useState("");
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [searchedJobs, setSearchedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState("matched");
    const [searchTerm, setSearchTerm] = useState("");

    // Get company logo
    const getCompanyLogo = (companyName) => {
        if (!companyName) return null;
        
        const name = companyName.toLowerCase();
        if (name.includes("fuge") || name.includes("fugetec")) {
            return fugetec;
        } else if (name.includes("texas") || name.includes("texas instruments")) {
            return texasIns;
        } else if (name.includes("lockheed") || name.includes("lockheed martin")) {
            return lockheed;
        }
        return null;
    };

    useEffect(() => {
        // Fetch matched jobs
        const fetchMatchedJobs = async () => {
            try {
                const response = await api.get("/job_matching/");
                console.log(response.data); // for testing
                if (response.data && response.data.length > 0) {
                    setMatchedJobs(response.data);
                    setSelectedJob(response.data[0]);
                } 
                else {
                //   setError("No matched jobs found. Expand your account skills/preferences selections.");
                }
            } 
            catch (err) {
                console.error(err);
                setError("Error retrieving job data.");
            }
        };
      
        // Fetch all jobs
        const fetchAllJobs = async () => {
            try {
                const response = await api.get("/all_jobs/");
                if (response.data && response.data.length > 0) {
                    setAllJobs(response.data);
                } else {
                    setError("No jobs found. Please try again later.");
                }
            } 
            catch (err) {
                console.error(err);
                setError("Error retrieving job data.");
            }
        };
      
        fetchMatchedJobs();
        fetchAllJobs();
    }, []);

    const fetchSearchJobs = async () => {
        try {
            const response = await api.get(`/job_searching/?search=${searchTerm}`);
            if (response.data && response.data.length > 0) {
                    setSearchedJobs(response.data);
            } else {
                setError("No jobs found. Please try again later.");
            }
        } 
        catch (err) {
              console.error(err);
              setError("Error retrieving job data.");
        }
    };

    const toggleSaveJob = (e) => {
        // implement save jobs in backend
    };

    // Determines which jobs to display
    const getJobs = () => {
        if (activeTab === "matched") {
            return matchedJobs;
        } else if (activeTab === "search") {
            return searchedJobs;
        } else {
            return allJobs;
        }
    };

    const displayJobs = getJobs();
    
    // Renders each of the job listings in the left sidebar
    const renderJobItem = (job) => {
        const logo = getCompanyLogo(job.company);
        
        return (
            <div 
                key={job.id}
                className={`border-bottom p-3 job-list-item`}
                onClick={() => setSelectedJob(job)}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex">
                        {logo && (
                            <div className="me-3">
                                <img 
                                    src={logo} 
                                    alt={`${job.company} logo`} 
                                    className="company-logo"
                                    style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}
                        <div>
                            <h5 className="mb-1">{job.title}</h5>
                            <p className="mb-1">{job.company}</p>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                        <FaMapMarkerAlt size={12} className="me-1" />
                        <span>{job.location}</span>
                    </small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                        <FaClock size={10} className="me-1" />
                        <span>{job.datePosted || "N/A"}</span>
                    </small>
                    {activeTab === "matched" && (
                        <Badge>{job.matchPercent}%</Badge>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Container fluid className="p-0 h-100">
            <Row className="m-0 h-100">
                
                {/* Left sidebar */}
                <Col md={4} className="p-0 border-end bg-white h-100 d-flex flex-column">
                    <div className="p-3 border-bottom">
                        <h1 className="h4 mb-3">Find Jobs</h1>

                        {/* Search bar */}
                        <Form onSubmit={e => {
                            e.preventDefault(); 
                            fetchSearchJobs();
                            setActiveTab("search");
                        }}>
                            <Form.Group className="mb-3 position-relative">
                                <div className="position-absolute" style={{ left: "10px", top: "12px" }}>
                                    <FaSearch className="text-muted" />
                                </div>
                                <Form.Control
                                    type="text"
                                    placeholder="Search jobs by title, company or location"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: "30px" }}
                                />
                            </Form.Group>
                        </Form>

                        {/* Tabs */}
                        <Nav variant="tabs" className="mb-2">
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === "matched"} 
                                    onClick={() => setActiveTab("matched")}
                                >
                                    Matches
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === "search"} 
                                    onClick={() => setActiveTab("search")}
                                >
                                    Search
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === "all"} 
                                    onClick={() => setActiveTab("all")}
                                >
                                    View All
                                </Nav.Link>
                            </Nav.Item>
                      </Nav>
                    </div>

                    {/* Job listings */}
                    <div className="overflow-auto flex-grow-1">
                        {error && <div className="p-3 text-danger">{error}</div>}

                        {displayJobs.length === 0 ? (
                            <div className="p-3 text-muted">No jobs found</div>
                        ) : (
                            <div className="job-list">
                                {displayJobs.map(job => renderJobItem(job))}
                            </div>
                        )}
                    </div>
                </Col>
                  
                {/* Job Posting Details */}
                <Col md={8} className="p-0 bg-white h-100">
                    {selectedJob ? (
                        <div className="h-100 overflow-auto">
                            <div className="p-4 border-bottom">

                                {/* Header Section */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex">
                                        {getCompanyLogo(selectedJob.company) && (
                                            <div className="me-3">
                                                <img 
                                                    src={getCompanyLogo(selectedJob.company)} 
                                                    alt={`${selectedJob.company} logo`} 
                                                    style={{ 
                                                        width: '70px', 
                                                        height: '70px', 
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="mb-1">{selectedJob.title}</h2>
                                            <h5 className="text-muted mb-2">{selectedJob.company}</h5>
                                            <div className="d-flex flex-column text-muted">
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaMapMarkerAlt size={14} className="me-1" />
                                                    <span>{selectedJob.location}</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaClock size={14} className="me-1" />
                                                    <span>{selectedJob.datePosted || "N/A"}</span>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <FaBriefcase size={14} className="me-1" />
                                                    <span>{"N/A"}</span> {/* need to implement job type in backend */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex">
                                        {/* implement saved jobs in backend*/}
                                        <Button 
                                            variant="outline-secondary"
                                            className="me-2 d-flex align-items-center"
                                            onClick={(e) => toggleSaveJob(e)}
                                        >
                                            Save Job
                                        </Button>
                                        <Button variant="primary" as="a" href={selectedJob.jobURL}>
                                            Apply Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                          
                            {/* Description and Requirements Section */}
                            <div className="p-4">
                                <Card className="mb-4">
                                    <Card.Body>
                                        <Card.Title>Job Description</Card.Title>
                                        <Card.Text>{selectedJob.description || "No description available."}</Card.Text>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-4">
                                    <Card.Body>
                                        <Card.Title>Requirements</Card.Title>
                                            {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                                                <ul className="ps-3">
                                                    {selectedJob.requirements.map(r => (
                                                        <li key={r.id}>{r.name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <Card.Text>No specific requirements listed.</Card.Text>
                                            )}
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                          <div className="text-center">
                            <FaBriefcase size={48} className="mb-3 text-secondary" />
                            <p>Select a job to view details</p>
                          </div>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};


export default FindJobs;