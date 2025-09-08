import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Nav, ListGroup, Card, Button, Badge, ProgressBar, Spinner, Offcanvas } from "react-bootstrap";
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaClock, FaStar, FaRegStar, FaFilter, FaMoneyBill } from "react-icons/fa";
import fugetec from "../assets/FugeTechnologies.jpg";
import texasIns from "../assets/TexasInstruments.jpg";
import lockheed from "../assets/LockheedMartin.jpg";
import api from "../api.js";

const FindJobs = () => {
    const [error, setError] = useState("");
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [searchedJobs, setSearchedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState("matched");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
	const [filters, setFilters] = useState({
		employmentType: [],
		experienceLevel: [],
		location: [],
		datePosted: []
	});

	// handle filter changes - not working yet
	const handleFilterChange = () => {
		const selected = {
			employmentType: [],
			experienceLevel: [],
			location: [],
			datePosted: []
		};

		document.querySelectorAll("input[type=checkbox]:checked").forEach((checkbox) => {
			const { name, value } = checkbox;
			if (selected[name]) {
				selected[name].push(value);
			}
		});

		setFilters(selected);
		setShowCanvas(false);
	}

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
        fetchJobsByTab(activeTab);
    }, [activeTab]);

    // Fetch jobs based on the active tab
    const fetchJobsByTab = async (tab) => {
        setLoading(true);
        setError("");

        try {
            let response;

            if (tab === "matched") {
                response = await api.get("/job_matching/");
                if (response.data && response.data.length > 0) {
                    setMatchedJobs(response.data);
                    setSelectedJob(response.data[0]);
                } else {
                    setMatchedJobs([]);
                    setSelectedJob(null);
                    setError("No matched jobs found. Expand your account skills/preferences selections.");
                }
            } else if (tab === "all") {
                response = await api.get("/all_jobs/");
                if (response.data && response.data.length > 0) {
                    setAllJobs(response.data);
                    setSelectedJob(response.data[0]);
                } else {
                    setAllJobs([]);
                    setSelectedJob(null);
                    setError("No jobs found. Please try again later.");
                }
            }
        } catch (err) {
            console.error(err);
            setError("Error retrieving job data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchSearchJobs = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(`/job_searching/?search=${searchTerm}`);
            if (response.data && response.data.length > 0) {
                setSearchedJobs(response.data);
                setSelectedJob(response.data[0]);
            } else {
                setSearchedJobs([]);
                setSelectedJob(null);
                setError("No matching jobs found. Try different search terms.");
            }
        } catch (err) {
            console.error(err);
            setError("Error retrieving job data.");
        } finally {
            setLoading(false);
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
                            <div className="me-3"
                                style={{
                                    border: "2px solid var(--border)",
                                    borderRadius: "8px",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "58px",
                                    height: "58px",
                                }}
                            >
                                <img
                                    src={logo}
                                    alt={`${job.company} logo`}
                                    className="company-logo"
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        objectFit: 'contain',
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
                    <small className="text-white">
                        <FaMapMarkerAlt size={12} className="me-1" />
                        <span>{job.location}</span>
                    </small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-white">
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
        <Container
            fluid
            className="Job container"
            style={{
                height: "100%",
                width: "100%",
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                zIndex: 5,
                color: "var(--text6)",
                padding: 0,
                margin: 0,
                maxWidth: "100%"
            }}
        >
            <Row className="m-0" style={{ height: "100%" }}>
                {/* Left sidebar */}
                <Col
                    md={3}
                    className="p-0 d-flex flex-column"
                    style={{
                        height: "100%",

                        color: "var(--text6)",
                        borderRight: "1px solid var(--border)"
                    }}
                >
                    <div className="p-3 border-bottom">
                        {/* <h1 className="h4 mb-3"
                            style={{
                                color: "var(--text6)",
                            }}>Find Jobs</h1> */}

                        {/* Search bar */}
                        <Form onSubmit={e => {
                            e.preventDefault();
                            fetchSearchJobs();
                            setActiveTab("search");
                        }}>
                            <Form.Group className="mb-3 position-relative" style={{ display: "flex", gap: "10px" }}>
                                <div className="position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}>
                                    <FaSearch className="text-muted" />
                                </div>
                                <Form.Control
                                    type="text"
                                    placeholder="Search jobs by title, company or location"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        paddingLeft: "30px",
                                        backgroundColor: "var(--searchbg)",
                                        color: "var(--searchtxt)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Button onClick={() => {setShowCanvas(true)}}>Filters</Button>
                            </Form.Group>
                        </Form>

                        {/* Tabs */}
                        <Nav
                            variant="tabs"
                            className="mb-2 justify-content-center"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                width: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                zIndex: 5,
                                borderBottom: "2px solid var(--border)",
                            }}
                        >
                            <Nav.Item style={{ flex: "1 1 33%", textAlign: "center" }}>
                                <Nav.Link
                                    active={activeTab === "matched"}
                                    onClick={() => setActiveTab("matched")}
                                    style={{
                                        width: "100%",
                                        color: activeTab === "matched" ? "var(--tabactive)" : "var(--tabstxt)",
                                        backgroundColor: activeTab === "matched" ? "var(--tabactivebg)" : "transparent",
                                        fontWeight: activeTab === "matched" ? "bold" : "normal",
                                        border: activeTab === "matched" ? "2px solid var(--border)" : "2px solid transparent",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    Matches
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item style={{ flex: "1 1 33%", textAlign: "center" }}>
                                <Nav.Link
                                    active={activeTab === "search"}
                                    onClick={() => setActiveTab("search")}
                                    style={{
                                        width: "100%",
                                        color: activeTab === "search" ? "var(--tabactive)" : "var(--tabstxt)",
                                        backgroundColor: activeTab === "search" ? "var(--tabactivebg)" : "transparent",
                                        fontWeight: activeTab === "search" ? "bold" : "normal",
                                        border: activeTab === "search" ? "2px solid var(--border)" : "2px solid transparent",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    Search
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item style={{ flex: "1 1 33%", textAlign: "center" }}>
                                <Nav.Link
                                    active={activeTab === "all"}
                                    onClick={() => setActiveTab("all")}
                                    style={{
                                        width: "100%",
                                        color: activeTab === "all" ? "var(--tabactive)" : "var(--tabstxt)",
                                        backgroundColor: activeTab === "all" ? "var(--tabactivebg)" : "transparent",
                                        fontWeight: activeTab === "all" ? "bold" : "normal",
                                        border: activeTab === "all" ? "2px solid var(--border)" : "2px solid transparent",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    View All
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    {/* Job listings */}
                    <div className="overflow-auto flex-grow-1">
                        {error && <div className="p-3 text-danger">{error}</div>}

                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : displayJobs.length === 0 ? (
                            <div className="p-3 text-white">No jobs found</div>
                        ) : (
                            <div className="job-list">
                                {displayJobs.map(job => renderJobItem(job))}
                            </div>
                        )}
                    </div>
                </Col>

                {/* Job Posting Details */}
                <Col
                    md={8}
                    className="p-0"
                    style={{
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        color: "var(--text6)"
                    }}
                >
                    {loading ? (
                        <div className="h-100 d-flex align-items-center justify-content-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : selectedJob ? (
                        <div
                            className="h-100 overflow-auto"
                            style={{

                                color: "var(--contenttxt)",
                            }}
                        >
                            <div
                                className="p-4 "
                                style={{

                                }}
                            >
                                {/* Header Section */}
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex">
                                        {getCompanyLogo(selectedJob.company) && (
                                            <div
                                                className="me-3"
                                                style={{
                                                    border: "2px solid var(--border)",
                                                    borderRadius: "8px",
                                                    padding: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "82px",
                                                    height: "82px",
                                                    backgroundColor: "var(--lbg)"
                                                }}
                                            >
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
                                            <h2 className="mb-1" style={{ color: "var(--text6)" }}>
                                                {selectedJob.title}
                                            </h2>
                                            <h5 className="text-white mb-2">{selectedJob.company}</h5>
                                            <div className="d-flex flex-column text-white">
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaMapMarkerAlt size={14} className="me-1" />
                                                    <span>{selectedJob.location}</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaClock size={14} className="me-1" />
                                                    <span>{selectedJob.datePosted || "N/A"}</span>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <FaMoneyBill size={14} className="me-1" />
                                                    <span>{selectedJob.salary || "Not Posted"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex">
                                        {/* implement saved jobs in backend*/}
                                        <Button
                                            style={{
                                                backgroundColor: "var(--savebtnbg)",
                                                color: "var(--savebtntxt)",
                                                border: "1px solid var(--savebtntxt)",
                                                transition: "all 0.3s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--savebtnhover)";
                                                e.currentTarget.style.color = "var(--savebtnhovertxt)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--savebtnbg)";
                                                e.currentTarget.style.color = "var(--savebtntxt)";
                                            }}
                                            className="me-2 d-flex align-items-center"
                                            onClick={(e) => toggleSaveJob(e)}
                                        >
                                            Save Job
                                        </Button>

                                        <Button
                                            style={{
                                                backgroundColor: "var(--applybtnbg)",
                                                color: "var(--applybtntxt)",
                                                border: "none",
                                                transition: "all 0.3s ease"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--applybtnhover)";
                                                e.currentTarget.style.color = "var(--applybtnhovertxt)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--applybtnbg)";
                                                e.currentTarget.style.color = "var(--applybtntxt)";
                                            }}
                                            as="a"
                                            href={selectedJob.jobURL}
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Description and Requirements Section */}
                            <div className="p-4">
                                <Card
                                    className="mb-4"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                                        backdropFilter: "blur(10px)",                // adds frosted-glass effect
                                        WebkitBackdropFilter: "blur(10px)",      
                                        color: "var(--text2)",
                                        border: "2px solid var(--cardborder2)",
                                        borderRadius: "12px"
                                    }}
                                >
                                    <Card.Body>
                                        <Card.Title>Job Description</Card.Title>
                                        <Card.Text>{selectedJob.description || "No description available."}</Card.Text>
                                    </Card.Body>
                                </Card>

                                <Card
                                    className="mb-4"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                                        backdropFilter: "blur(10px)",                // adds frosted-glass effect
                                        WebkitBackdropFilter: "blur(10px)",      
                                        color: "var(--text2)",
                                        border: "2px solid var(--cardborder2)",
                                        borderRadius: "12px"
                                    }}
                                >
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
                        <div className="h-100 d-flex align-items-center justify-content-center text-white">
                            <div className="text-center">
                                <FaBriefcase size={48} className="mb-3 text-secondary" />
                                <p>Select a job to view details</p>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>

			{/* Displays job filtering options */}
            <Offcanvas show={showCanvas} onHide={() => {setShowCanvas(false)}} placement="end">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Filters</Offcanvas.Title>
				</Offcanvas.Header>

				<Offcanvas.Body>
    				<h6 className="mb-2">Employment Type</h6>
    				<Form.Check type="checkbox" label="Full-Time" value="full-time" name="employmentType"/>
    				<Form.Check type="checkbox" label="Part-Time" value="part-time" name="employmentType"/>
    				<Form.Check type="checkbox" label="Internship" value="internship" name="employmentType"/>
    				<Form.Check type="checkbox" label="Contract" value="contract" name="employmentType"/>
    				<hr />

    				<h6 className="mb-2">Experience Level</h6>
    				<Form.Check type="checkbox" label="Entry Level" value="entry" name="experienceLevel"/>
    				<Form.Check type="checkbox" label="Mid Level" value="mid" name="experienceLevel"/>
    				<Form.Check type="checkbox" label="Senior Level" value="senior" name="experienceLevel"/>
    				<hr />

    				<h6 className="mb-2">Location</h6>
    				<Form.Check type="checkbox" label="Remote" value="remote" name="location"/>
    				<Form.Check type="checkbox" label="On-Site" value="on-site" name="location"/>
    				<Form.Check type="checkbox" label="Hybrid" value="hybrid" name="location"/>
    				<hr />

					<h6 className="mb-2">Posted Date</h6>
    				<Form.Check type="checkbox" label="Last 24 hours" value="24-hours" name="datePosted"/>
    				<Form.Check type="checkbox" label="Last 7 days" value="7-days" name="datePosted"/>
    				<Form.Check type="checkbox" label="Last 30 days" value="30-days" name="datePosted"/>

					<Button onClick={handleFilterChange}>Apply</Button>
				</Offcanvas.Body>
            </Offcanvas>

        </Container>
    );
};

export default FindJobs;