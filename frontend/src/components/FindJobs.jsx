import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Nav, ListGroup, Card, Button, Badge, ProgressBar, Spinner, Offcanvas, Modal } from "react-bootstrap";
import { FaBookmark, FaRegBookmark, FaPaperPlane, FaComments, FaSearch, FaRobot, FaBriefcase, FaMapMarkerAlt, FaClock, FaCompass, FaFilter, FaMoneyBill, FaChevronLeft, FaChevronRight, FaBuilding } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import api from "../api.js";

const FindJobs = ({ jobPostTypeProp }) => {
    const [jobPostType, setJobPostType] = useState(jobPostTypeProp);
    const [error, setError] = useState("");
    const [allJobs, setAllJobs] = useState([]);
    const [searchedJobs, setSearchedJobs] = useState([]);
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const [filters, setFilters] = useState({ employmentType: [], experienceLevel: [], location: [], datePosted: [] });
    const [showLogo, setShowLogo] = useState(true);
    const [showDetailsMobile, setShowDetailsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [jobCount, setJobCount] = useState();
    const [hoveredJobId, setHoveredJobId] = useState(null);

    const jobListContainerRef = useRef(null);
    const navigate = useNavigate();

    // helper functions below for job filtering system
    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const handleFilterChange = async () => {
        setShowCanvas(false);
        setJobPostType("all");
        await fetchJobPostings("all");
    };

    const clearAllFilters = () => {
        setFilters({
            employmentType: [],
            experienceLevel: [],
            location: [],
            datePosted: [],
        })
    };

    // calls fetchJobPosting function when page is loaded
    useEffect(() => {
        fetchJobPostings();
    }, [jobPostType, currentPage]);

    // function to retrieve job postings depending on JobPostType variable
    const fetchJobPostings = async (type = jobPostType) => {
        setLoading(true);
        setError("");
        try {
            let response;
            if (type === "search") {
                response = await api.post(`/job_searching/?search=${searchTerm}`, {
                    filters: filters || {},
                    page: currentPage,
                });

                const jobs = response.data.jobs;
                const count = response.data.count;

                if (jobs && jobs.length > 0) {
                    setSearchedJobs(jobs);
                    setSelectedJob(jobs[0]);
                    setJobCount(count);
                    setHasNextPage(currentPage * 15 < count);
                    setHasPrevPage(currentPage > 1);
                } else {
                    setSearchedJobs([]);
                    setSelectedJob(null);
                    setError("No matching jobs found. Try different search terms.");
                    setHasNextPage(false);
                    setHasPrevPage(false);
                }
            }
            else if (type === "all") {
                response = await api.post("/all_jobs/", { "filters": filters || {}, "page": currentPage });
                const jobs = response.data.jobs;
                const count = response.data.count;

                if (jobs && jobs.length > 0) {
                    setAllJobs(jobs);
                    setSelectedJob(jobs[0]);
                    setJobCount(count);
                    setHasNextPage(currentPage * 15 < count);
                    setHasPrevPage(currentPage > 1);
                } else {
                    setAllJobs([]);
                    setSelectedJob(null);
                    setError("No jobs found. Please try again later.");
                    setHasNextPage(false);
                    setHasPrevPage(false);
                }
            }
            else if (type === "matched") {
                response = await api.get("/job_matching/");
                if (response.data && response.data.length > 0) {
                    setMatchedJobs(response.data);
                    setSelectedJob(response.data[0]);
                } else {
                    setMatchedJobs([]);
                    setSelectedJob(null);
                    setError("No matched jobs found. Expand your account skills/preferences selections.");
                }
            }
            else if (type === "saved") {
                response = await api.get("/bookmark_jobs/");
                if (response.data && response.data.length > 0) {
                    setSavedJobs(response.data);
                    setSelectedJob(response.data[0]);
                } else {
                    setSavedJobs([]);
                    setSelectedJob(null);
                    setError("No jobs saved. Bookmark a job to save for later.");
                }
            }
        }
        catch (err) {
            console.error(err);
            setError("Error retrieving job data.");
        } finally {
            setLoading(false);
        }
    };

    // helper function for bookmarking job
    const toggleSaveJob = async (jobId, isJobSaved) => {
        try {
            if (isJobSaved) {
                await api.delete(`/bookmark_jobs/${jobId}/`);
            }
            else {
                await api.post(`/bookmark_jobs/${jobId}/`);
            }

            const updateJobsArray = (jobs) => {
                const updatedJobs = jobs.map(job => {
                    if (job.id === jobId) return { ...job, is_saved: !isJobSaved };
                    else return job;
                });
                return updatedJobs;
            };

            if (jobPostType === "saved") {
                const updatedSavedJobs = savedJobs.filter(job => job.id !== jobId);
                setSavedJobs(updatedSavedJobs);

                if (selectedJob && selectedJob.id === jobId) {
                    setSelectedJob(updatedSavedJobs.length > 0 ? updatedSavedJobs[0] : null);
                }
            }
            else {
                if (jobPostType === "all") setAllJobs(updateJobsArray(allJobs));
                if (jobPostType === "search") setSearchedJobs(updateJobsArray(searchedJobs));
                if (jobPostType === "matched") setMatchedJobs(updateJobsArray(matchedJobs));

                if (selectedJob && selectedJob.id === jobId) {
                    setSelectedJob(prev => ({ ...prev, is_saved: !isJobSaved }));
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    };

    // helper function for the job posting application confirmation
    const handleApplyClick = () => {
        window.open(selectedJob.jobURL, '_blank', 'noopener,noreferrer');
        setShowModal(true);
    }

    // Sets the job posting to "applied to" when button clicked
    const handleConfirmApply = async () => {
        if (!selectedJob) return;

        try {
            await api.post(`/application_status/${selectedJob.id}/`)

            const updateJobsArray = (jobs) => {
                const updatedJobs = jobs.map(job => {
                    if (job.id === selectedJob.id) return { ...job, applied_status: true, is_saved: true };
                    else return job;
                });
                return updatedJobs;
            };

            if (jobPostType === "all") setAllJobs(updateJobsArray(allJobs));
            if (jobPostType === "search") setSearchedJobs(updateJobsArray(searchedJobs));
            if (jobPostType === "matched") setMatchedJobs(updateJobsArray(matchedJobs));
            if (jobPostType === "saved") setSavedJobs(updateJobsArray(savedJobs));
            setSelectedJob(prev => ({ ...prev, applied_status: true, is_saved: true }));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setShowModal(false);
        }
    }

    // Determines which jobs to display
    const getJobs = () => {
        if (jobPostType === "search") {
            return searchedJobs;
        } else if (jobPostType === "all") {
            return allJobs;
        } else if (jobPostType === "matched") {
            return matchedJobs;
        } else if (jobPostType === "saved") {
            return savedJobs;
        }
        else {
            return [];
        }
    };

    const displayJobs = getJobs();
    // hidden job logo when width screen is small 

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            if (jobListContainerRef.current) {
                const width = jobListContainerRef.current.offsetWidth;
                setShowLogo(width >= 297); // Hide logo if sidebar width < 200
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (jobListContainerRef.current) {
            resizeObserver.observe(jobListContainerRef.current);
        }

        // Initial check
        handleResize();

        return () => {
            if (jobListContainerRef.current) {
                resizeObserver.disconnect();
            }
        };
    }, []);


    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    
    //-----------------------------------------------------
    // Renders each of the job listings in the left sidebar
    const renderJobItem = (job) => {
        const isSelected = selectedJob?.id === job.id;
        const isHovered = hoveredJobId === job.id;
    
        const date = new Date(job.datePosted);
        const safeDate = date > new Date() ? new Date() : date;
        const timeAgo = formatDistanceToNow(safeDate, { addSuffix: true });
    
        return (
            <div
                key={job.id}
                className="border-bottom p-3 job-list-item"
                onClick={() => {
                    setSelectedJob(job);
                    if (windowWidth <= 770) setShowDetailsMobile(true);
                }}
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
                style={{
                    cursor: "pointer",
                    width: "100%",
                    backgroundColor: isSelected
                        ? "rgba(33, 133, 213, 0.2)"
                        : isHovered
                        ? "rgba(255, 255, 255, 0.08)"
                        : "transparent",
                    borderLeft: isSelected
                        ? "3px solid var(--accent1)"
                        : "3px solid transparent",
                    boxShadow: isHovered
                        ? "0 0 8px rgba(33,133,213,0.3)"
                        : "none",
                    transition: "background-color 0.25s ease, border 0.25s ease, box-shadow 0.25s ease",
                }}
            >
                <motion.div
                    layout
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="d-flex flex-column gap-2"
                >
                    {/* Logo + Title + Company */}
                    <div className="d-flex align-items-start gap-2">
                        {showLogo && (
                            <motion.div
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                }}
                            >
                                {job.logoURL ? (
                                    <img
                                        src={job.logoURL}
                                        alt={`${job.company} logo`}
                                        onError={(e) => (e.target.style.display = "none")}
                                        style={{
                                            width: "75%",
                                            height: "75%",
                                            objectFit: "contain",
                                            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4))",
                                        }}
                                    />
                                ) : (
                                    <FaBuilding size={26} color="var(--text)" />
                                )}
                            </motion.div>
                        )}

                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <motion.h5
                                className="mb-1"
                                style={{
                                    fontSize: "1rem",
                                    color: isSelected
                                        ? "var(--accent2)"
                                        : "var(--text)",
                                    fontWeight: 600,
                                    transition: "color 0.25s ease",
                                }}
                            >
                                {job.title}
                            </motion.h5>
                            
                            <motion.p
                                style={{
                                    fontSize: "0.9rem",
                                    color: isSelected
                                        ? "var(--accent1)"
                                        : "var(--text)",
                                    margin: 0,
                                }}
                            >
                                {job.company}
                            </motion.p>
                        </div>
                    </div>
                            
                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mt-1" style={{ rowGap: "10px" }}>
                            {job.skills.slice(0, 3).map((skill, index) => (
                                <motion.div
                                    key={index}
                                    style={{ display: "inline-flex" }}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08, duration: 0.25 }}
                                >
                                    <span
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                                            border: "1px solid var(--border)",
                                            color: "var(--text)",
                                            fontSize: "0.8rem",
                                            borderRadius: "4px",
                                            padding: "4px 10px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {skill.name || skill}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
    
                    {/* Time + Match */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <small style={{ color: "var(--text)", fontSize: "0.85rem" }}>
                            {timeAgo || "Recently posted"}
                        </small>
                
                        {jobPostType === "matched" && (
                            <span
                                style={{
                                    backgroundColor: "var(--accent3)",
                                    color: "var(--text)",
                                    fontSize: "0.8rem",
                                    borderRadius: "4px",
                                    padding: "4px 10px",
                                    fontWeight: 600,
                                }}
                            >
                                {job.matchPercent}% Match
                            </span>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    //--------------------------------------------------------------------------
    // The entire jobs page including the job list and the job detailed sections
    return (
        <Container
            fluid
            className="Job container"
            style={{
                height: "100%",
                width: "100%",
                flex: 1,
                zIndex: 5,
                color: "var(--text)",
                padding: 0,
                margin: 0,
                maxWidth: "100%"
            }}
        >
            <Row className="m-0" style={{ height: "100%" }}>
                {/* Left sidebar */}
                {(windowWidth > 770 || !showDetailsMobile) && (
                    <Col
                        md={3}
                        className="p-0 d-flex flex-column"
                        ref={jobListContainerRef}
                        style={{
                            height: "100%",
                            color: "var(--text)",
                            borderRight: "2px solid var(--border)"
                        }}
                    >
                        {/* Search bar and buttons - only displays when jobPostType is all or search */}
                        {(jobPostType === "all" || jobPostType === "search") && (
                            <div
                                className="p-2"
                                style={{ borderBottom: "2px solid var(--border)" }}
                            >

                                <Form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setJobPostType("search");
                                        fetchJobPostings("search");
                                        //clearAllFilters();
                                    }}
                                >
                                    {/* Top Section: Search bar + Icons */}
                                    <div className="d-flex flex-nowrap align-items-center" style={{ gap: "10px"  }}>
                                        {/* Search input */}
                                        <div className="position-relative flex-grow-1">
                                            <div
                                                className="position-absolute"
                                                style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
                                            >
                                                <FaSearch style={{ color: "#3A4750" }} />
                                            </div>
                                                                        
                                            <style>{`
                                                .search-input::placeholder { color: #303841; opacity: 1; }
                                                .search-input::-webkit-input-placeholder { color: #303841; opacity: 1; }
                                                .search-input::-moz-placeholder { color: #303841; opacity: 1; }
                                                .search-input:-ms-input-placeholder { color: #303841; }
                                                .icon-btn {
                                                    background-color: var(--background);
                                                    color: var(--text);
                                                    border: 1px solid var(--text);
                                                    border-radius: 8px;
                                                    padding: 8px 14px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    cursor: pointer;
                                                    transition: all 0.3s ease;
                                                }
                                                .icon-btn:hover {
                                                    background-color: var(--text);
                                                    color: var(--background);
                                                }
                                            `}</style>
                                            
                                            <Form.Control
                                                type="text"
                                                className="search-input"
                                                placeholder="Search jobs by title, company or location"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{
                                                    paddingLeft: "30px",
                                                    backgroundColor: "#F5F7FB",
                                                    color: "#303841",
                                                    border: "2px solid var(--border)",
                                                    borderRadius: "8px",
                                                    height: "42px",
                                                }}
                                            />
                                        </div>
                                          
                                        {/* Icon Buttons */}
                                        <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                            {/* Browse (FaCompass) */}
                                            <div
                                                className="icon-btn"
                                                title="Browse all jobs"
                                                onClick={() => setJobPostType("all")}
                                            >
                                                <FaCompass size={20} />
                                            </div>
                                                
                                            {/* Filters (FaFilter) */}
                                            <div
                                                className="icon-btn"
                                                title="Filters"
                                                onClick={() => setShowCanvas(true)}
                                            >
                                                <FaFilter size={20} />
                                            </div>
                                        </div>
                                    </div>
                                      
                                    {/* Total Jobs */}
                                    {/* <div className="mt-3">
                                        <p
                                            style={{
                                                fontSize: "1rem",
                                                fontWeight: 500,
                                                color: "var(--text)",
                                                opacity: 0.9,
                                            }}
                                        >
                                          Showing <span style={{ color: "var(--accent1)", fontWeight: 600 }}>120</span> total jobs from <span style={{ color: "var(--accent1)", fontWeight: 600 }}>25</span> different companies
                                        </p>
                                    </div> */}

                                </Form>
                            </div>
                        )}

                        {/* Job Posting listings */}
                        <div className="overflow-auto flex-grow-1 auto-hide-scroll">
                            {error && <div className="p-3 text-danger">{error}</div>}

                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center py-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : displayJobs.length === 0 ? (
                                <div className="p-3 var(--text)">No jobs found</div>
                            ) : (
                                <div className="job-list">
                                    {displayJobs.map(job => renderJobItem(job))}
                                </div>
                            )}
                            <div className="d-flex justify-content-center align-items-center p-1 gap-1">
                                {!loading && hasPrevPage && (
                                    <Button variant="primary" onClick={() => setCurrentPage(prev => prev - 1)} style={{ color: "var(--accent1)", background: "none", border: "none" }}>
                                        <FaChevronLeft />
                                    </Button>
                                )}
                                {!loading && jobCount > 0 && (
                                    <span>Page {currentPage}</span>
                                )}
                                {!loading && hasNextPage && (
                                    <Button variant="primary" onClick={() => setCurrentPage(prev => prev + 1)} style={{ color: "var(--accent1)", background: "none", border: "none" }}>
                                        <FaChevronRight />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Col>
                )}
                {/* Job Posting Details */}
                {(windowWidth > 770 || showDetailsMobile) && (
                    <Col
                        md={9}
                        className="p-0"
                        style={{
                            height: "100%",
                        }}
                    >
                        {/* Back button only on mobile */}
                        {windowWidth <= 770 && (
                            <div className="d-flex align-items-center justify-content-between m-2">
                                <Button
                                    className=" px-2 py-2"
                                    style={{
                                        backgroundColor: "var(--background)",
                                        color: "var(--text)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "8px",
                                        backdropFilter: "blur(6px)",
                                        WebkitBackdropFilter: "blur(6px)",
                                    }}
                                    onClick={() => setShowDetailsMobile(false)}
                                >
                                    ← Back
                                </Button>
                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>

                                    {/* Save */}
                                    <Button
                                        variant="link"
                                        style={{
                                            color: "var(--text)",
                                            transition: "all 0.3s ease",
                                            marginLeft: "8px",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onClick={() => toggleSaveJob(selectedJob.id, selectedJob.is_saved)}
                                    >
                                        {selectedJob.is_saved ? <FaBookmark size={18} /> : <FaRegBookmark size={26} />}
                                    </Button>

                                    {/* Apply */}
                                    <Button
                                        variant="link"
                                        style={{
                                            color: "var(--text)",
                                            transition: "all 0.3s ease",
                                            marginLeft: "8px",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onClick={handleApplyClick}
                                        disabled={selectedJob.applied_status}
                                    >
                                        <FaPaperPlane size={26} />
                                    </Button>

                                    {/* Interview Prep */}
                                    <Button
                                        variant="link"
                                        style={{
                                            color: "var(--text)",
                                            transition: "all 0.3s ease",
                                            marginLeft: "8px",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "var(--text)";
                                        }}
                                        onClick={() => { navigate("/interview-chatbot", { state: { job: selectedJob } }) }}
                                    >
                                        <FaRobot size={26} />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="h-100 d-flex align-items-center justify-content-center">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : selectedJob ? (
                            <div
                                className="h-100 overflow-auto auto-hide-scroll"
                                style={{

                                    color: "var(--text)",
                                }}
                            >
                                <div
                                    className={windowWidth <= 770 ? "pt-0 ps-2 pe-2 pb-2" : "pt-4 ps-4 pe-4 pb-2"}
                                    style={{}}
                                >

                                    {/* Header Section */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex">
                                            <div>
                                                <div
                                                    className="d-flex align-items-start gap-2"
                                                    style={{ width: "100%" }}
                                                >
                                                    {selectedJob.logoURL && (
                                                        <div
                                                            className="me-3"
                                                            style={{
                                                                // border: "2px solid var(--border)",
                                                                borderRadius: "1px",
                                                                padding: "6px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                width: "70px",
                                                                height: "70px",
                                                                backgroundColor: "var(--background)",

                                                                flexShrink: 0,
                                                                boxShadow: "1.95px 1.95px 2.6px rgba(0, 0, 0, 0.32)",
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedJob.logoURL}
                                                                alt={`${selectedJob.company} logo`}
                                                                style={{
                                                                    width: '70px',
                                                                    height: '70px',
                                                                    objectFit: 'contain'

                                                                }}
                                                            />
                                                        </div>

                                                    )}
                                                    <div className="job-title-company">
                                                        <h2
                                                            className="mb-0"
                                                            style={{ color: "var(--accent1)", lineHeight: "1.2" }}
                                                        >
                                                            {selectedJob.title}
                                                        </h2>
                                                        <h5
                                                            className="mt-1 mb-2"
                                                            style={{ color: "var(--accent3)", lineHeight: "1.2" }}
                                                        >
                                                            {selectedJob.company}
                                                        </h5>
                                                    </div>

                                                </div>
                                                <div className="pt-3"
                                                    style={{ color: "var(--text)" }}>
                                                    <div className="d-flex flex-column ">
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
                                        </div>
                                        {windowWidth > 770 && (
                                            <div className="d-flex">
                                                <Button
                                                    style={{
                                                        backgroundColor: "var(--background)",
                                                        color: "var(--text)",
                                                        border: "1px solid var(--background)",
                                                        transition: "all 0.3s ease"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--hover)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--background)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    className="me-2 d-flex align-items-center"
                                                    onClick={() => toggleSaveJob(selectedJob.id, selectedJob.is_saved)}
                                                >
                                                    {selectedJob.is_saved ? "Unsave" : "Save"}

                                                </Button>

                                                <Button
                                                    style={{
                                                        backgroundColor: "var(--background)",
                                                        color: "var(--text)",
                                                        border: "1px solid var(--background)",
                                                        transition: "all 0.3s ease"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--hover)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--background)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    onClick={handleApplyClick}
                                                    disabled={selectedJob.applied_status}
                                                >
                                                    {selectedJob.applied_status ? "Applied" : "Apply"}
                                                </Button>

                                                <Button
                                                    style={{
                                                        backgroundColor: "var(--background)",
                                                        color: "var(--text)",
                                                        border: "1px solid var(--background)",
                                                        transition: "all 0.3s ease",
                                                        marginLeft: "8px",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--hover)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "var(--background)";
                                                        e.currentTarget.style.color = "var(--text)";
                                                    }}
                                                    onClick={() => { navigate("/interview-chatbot", { state: { job: selectedJob } }) }}
                                                >
                                                    Interview
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description and Requirements Section */}
                                <div
                                    className={windowWidth <= 770 ? "p-2" : "pt-2 pe-4 ps-4 pb-4"}
                                    style={{}}
                                >
                                    <Card
                                        className="mb-4"
                                        style={{
                                            backgroundColor: "var(--background)", // more translucent
                                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                                            WebkitBackdropFilter: "blur(10px)",
                                            color: "var(--accent5)",
                                            border: "3px solid var(--hover)",
                                            borderRadius: "12px",
                                            //boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.48)",

                                        }}
                                    >
                                        <Card.Body>
                                            {/* Job Description */}
                                            <section className="mb-4">
                                                <h5 className="fw-bold mb-2">Job Description</h5>
                                                <p style={{ color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                                                    {selectedJob.description}
                                                </p>
                                            </section>

                                            {/* AI Summary */}
                                            <section className="mb-4">
                                                <h5 className="fw-bold mb-2">AI Summary</h5>
                                                <p style={{ color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                                                    {selectedJob.summary}
                                                </p>
                                            </section>

                                            {/* Keywords Sections */}
                                            {[
                                                { title: "Skills", key: "skills" },
                                                { title: "Careers", key: "careers" },
                                                { title: "Degrees", key: "degrees" },
                                                { title: "Experience Level", key: "experienceLevels" },
                                                { title: "Employment Type", key: "employmentTypes" },
                                                { title: "Work Models", key: "workModels" },
                                            ].map(({ title, key }) => (
                                                selectedJob[key] && selectedJob[key].length > 0 && (
                                                    <section className="mb-4" key={key}>
                                                        <h5 className="fw-bold mb-2">{title}</h5>
                                                        <ul className="ps-3" style={{ color: "var(--text)", marginBottom: 0 }}>
                                                            {selectedJob[key].map(item => (
                                                                <li key={item.id}>{item.name}</li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                )
                                            ))}

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
                )}
            </Row>

            {/* Displays job filtering options */}
            {/* Themed Filters Offcanvas */}
            <Offcanvas
                show={showCanvas}
                onHide={() => setShowCanvas(false)}
                placement="end"
                className="filters-canvas"
                style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
            >
                {/* Inline styles to keep it self-contained */}
                <style>{`
      /* Panel background */
    .filters-canvas .offcanvas {
      background-color: var(--background);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-left: 1px solid var(--border);
      color: var(--text);
    }

    /* Header */
    .filters-canvas .offcanvas-header {
    background-color: var(--shadow2);
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    .filters-canvas .offcanvas-title {
      color: var(--text);
      font-weight: 700;
    }

    /* Labels */
    .filters-canvas .form-check-label {
      color: var(--text);
    }

    /* Checkboxes */
    .filters-canvas .form-check-input {
      background-color: transparent;
      border: 2px solid var(--border);
      border-radius: 4px;
      width: 1.2em;
      height: 1.2em;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filters-canvas .form-check-input:checked {
      background-color: var(--background);
      border-color: var(--border);
      box-shadow: 0 0 6px var(--shadow1);
    }

    .filters-canvas hr {
      border-top: 1px solid var(--border);
      opacity: 1;
    }

    /* Sticky footer buttons */
    .filters-canvas .filters-actions {
      position: sticky;
      bottom: 0;
      background: rgba(20,20,20,0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-top: 1px solid var(--border);
      padding: 12px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .filters-canvas .btn-theme {
      background-color: var(--background);
      color: var(--text);
      border: none;
      transition: all 0.3s ease;
    }
    .filters-canvas .btn-theme:hover {
      background-color: var(--background);
      color: var(--text);
    }

    .filters-canvas .btn-outline-theme {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      transition: all 0.3s ease;
    }
    .filters-canvas .btn-outline-theme:hover {
      background-color: var(--background);
      color: var(--text);
    }
  `}</style>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Filters</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body>
                    <h6 className="mb-2">Employment Type</h6>
                    <Form.Check type="checkbox" label="Full-Time" value="Full-Time"
                        checked={filters.employmentType.includes("Full-Time")}
                        onChange={() => toggleFilter("employmentType", "Full-Time")}
                    />
                    <Form.Check type="checkbox" label="Part-Time" value="Part-Time"
                        checked={filters.employmentType.includes("Part-Time")}
                        onChange={() => toggleFilter("employmentType", "Part-Time")}
                    />
                    <hr />

                    <h6 className="mb-2">Experience Level</h6>
                    <Form.Check type="checkbox" label="Internship" value="Intern"
                        checked={filters.experienceLevel.includes("Intern")}
                        onChange={() => toggleFilter("experienceLevel", "Intern")}
                    />
                    <Form.Check type="checkbox" label="Entry Level" value="Entry"
                        checked={filters.experienceLevel.includes("Entry")}
                        onChange={() => toggleFilter("experienceLevel", "Entry")}
                    />
                    <Form.Check type="checkbox" label="Mid Level" value="Mid"
                        checked={filters.experienceLevel.includes("Mid")}
                        onChange={() => toggleFilter("experienceLevel", "Mid")}
                    />
                    <Form.Check type="checkbox" label="Senior Level" value="Senior"
                        checked={filters.experienceLevel.includes("Senior")}
                        onChange={() => toggleFilter("experienceLevel", "Senior")}
                    />
                    <Form.Check type="checkbox" label="Lead" value="Lead"
                        checked={filters.experienceLevel.includes("Lead")}
                        onChange={() => toggleFilter("experienceLevel", "Lead")}
                    />
                    <Form.Check type="checkbox" label="Management" value="Management"
                        checked={filters.experienceLevel.includes("Management")}
                        onChange={() => toggleFilter("experienceLevel", "Management")}
                    />
                    <hr />

                    <h6 className="mb-2">Location</h6>
                    <Form.Check type="checkbox" label="Remote" value="Remote"
                        checked={filters.location.includes("Remote")}
                        onChange={() => toggleFilter("location", "Remote")}
                    />
                    <Form.Check type="checkbox" label="On-site" value="On-site"
                        checked={filters.location.includes("On-site")}
                        onChange={() => toggleFilter("location", "On-site")}
                    />
                    <Form.Check type="checkbox" label="Hybrid" value="Hybrid"
                        checked={filters.location.includes("Hybrid")}
                        onChange={() => toggleFilter("location", "Hybrid")}
                    />
                    <hr />

                    <h6 className="mb-2">Posted Date</h6>
                    <Form.Check type="checkbox" label="Last 24 hours" value="24-hours"
                        checked={filters.datePosted.includes("24-hours")}
                        onChange={() => toggleFilter("datePosted", "24-hours")}
                    />
                    <Form.Check type="checkbox" label="Last 7 days" value="7-days"
                        checked={filters.datePosted.includes("7-days")}
                        onChange={() => toggleFilter("datePosted", "7-days")}
                    />
                    <Form.Check type="checkbox" label="Last 30 days" value="30-days"
                        checked={filters.datePosted.includes("30-days")}
                        onChange={() => toggleFilter("datePosted", "30-days")}
                    />
                </Offcanvas.Body>

                <div className="filters-actions"
                    style={{ background: "var(--shadow2)" }}>
                    <Button className="btn-outline-theme" onClick={clearAllFilters}>Clear</Button>
                    <Button className="btn-theme" onClick={handleFilterChange}>Apply</Button>
                </div>
            </Offcanvas>

            {/* Pop-up that asks user if they applied to job */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Modal.Header
                    closeButton
                    style={{
                        backgroundColor: "var(--card)",
                        color: "var(--text)",
                        borderBottom: "1px solid var(--border)"
                    }}
                >
                    <Modal.Title style={{ fontWeight: 600 }}>Did you apply?</Modal.Title>
                </Modal.Header>

                <Modal.Body
                    style={{
                        backgroundColor: "var(--card)",
                        color: "var(--text)",
                        padding: "24px",
                        textAlign: "center",
                    }}
                >
                    <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
                        Please confirm your application status.
                    </p>

                    <div className="d-flex justify-content-center gap-3">

                        {/* NO BUTTON */}
                        <Button
                            onClick={() => setShowModal(false)}
                            style={{
                                backgroundColor: "transparent",
                                border: "2px solid var(--accent3)",
                                color: "var(--accent3)",
                                padding: "8px 18px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                transition: "0.25s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "var(--accent3)";
                                e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.color = "var(--accent3)";
                            }}
                        >
                            No
                        </Button>

                        {/* YES BUTTON */}
                        <Button
                            onClick={handleConfirmApply}
                            style={{
                                backgroundColor: "var(--accent1)",
                                border: "none",
                                color: "#fff",
                                padding: "8px 18px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                transition: "0.25s",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "var(--accent2)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "var(--accent1)";
                            }}
                        >
                            Yes
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>



            <style>{`
  /* Reusable auto-hide scrollbar */
  .auto-hide-scroll {
     scrollbar-gutter: stable; 
    overscroll-behavior: contain;

    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  .auto-hide-scroll:hover {  
    scrollbar-color: rgba(255,255,255,0.28) transparent;
  }
  .auto-hide-scroll::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .auto-hide-scroll::-webkit-scrollbar-track {
    background: transparent; 
  }
  .auto-hide-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.22); 
    border-radius: 4px;
  }
  .auto-hide-scroll:hover::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.34); 
  }
`}</style>

        </Container>
    );
};

export default FindJobs;