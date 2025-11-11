import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Offcanvas } from "react-bootstrap";
import { FaSearch, FaBriefcase, FaMapMarkerAlt, FaClock, FaCompass, FaFilter, FaMoneyBill, FaChevronLeft, FaChevronRight, FaBuilding, FaUserTie, FaLaptopHouse } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import GlobalMessage from './GlobalMessage.jsx';
import api from "../api.js";

const FindJobs = ({ jobPostTypeProp }) => {
    // Child prop state
    const [jobPostType, setJobPostType] = useState(jobPostTypeProp);

    // Job states
    const [allJobs, setAllJobs] = useState([]);
    const [searchedJobs, setSearchedJobs] = useState([]);
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    // Searching and filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ employmentType: [], experienceLevel: [], location: [], datePosted: [] });
    const [showCanvas, setShowCanvas] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);

    // Job detail states
    const [jobCount, setJobCount] = useState();
    const [showLogo, setShowLogo] = useState(true);
    const [hoveredJobId, setHoveredJobId] = useState(null);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Misc states
    const [showDetailsMobile, setShowDetailsMobile] = useState(false);
    const [showApplyConfirm, setShowApplyConfirm] = useState(false);
    const [alert, setAlert] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

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
        setAlert({ type: "", text: "" });

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
                    setAlert({ type: "error", text: "No matching jobs found. Try different search terms." });
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
                    setAlert({ type: "error", text: "No jobs found. Please try again later." });
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
                    setAlert({ type: "error", text: "No matched jobs found. Expand your account selections." });
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
                    setAlert({ type: "error", text: "No jobs saved. Bookmark a job to save for later." });
                }
            }
        }
        catch (err) {
            // console.error(err);
            setAlert({ type: "error", text: "Error retrieving job data." });
        }
        finally {
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
            // console.error(err);
            setAlert({ type: "error", text: "Error bookmarking job." });
        }
    };

    // helper function for the job posting application confirmation
    const handleApplyClick = () => {
        window.open(selectedJob.jobURL, '_blank', 'noopener,noreferrer');
        setShowApplyConfirm(true);
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
            // console.error(err);
            setAlert({ type: "error", text: "Error confirming the job application status." });
        }
        finally {
            setShowApplyConfirm(false);
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

    //---------------
    // Loading wheel
    if (loading) {
        return (
            <div style={{ height: "100vh", backgroundColor: "var(--background)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "var(--text)" }}>
                <Spinner
                    animation="border"
                    role="status"
                    style={{ width: "4rem", height: "4rem" }}
                />
                <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                    Loading jobs...
                </p>
            </div>
        );
    }

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
                        ? "rgba(71, 107, 141, 0.2)"
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
                                    fontSize: "1.1rem",
                                    color: isSelected
                                        ? "var(--accent1)"
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
                                        ? "var(--accent2)"
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
                                    backgroundColor:
                                        job.matchPercent > 60
                                            ? "var(--accent4)"
                                            : job.matchPercent > 30
                                                ? "var(--accent2)"
                                                : "var(--accent3)",
                                    color: "black",
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

            {/* Error message popup */}
            <GlobalMessage
                type={alert.type}
                message={alert.text}
                onClose={() => setAlert({ type: "", text: "" })}
            />

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
                                    <div className="d-flex flex-nowrap align-items-center" style={{ gap: "10px" }}>
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

                                        <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                            <div
                                                className="icon-btn"
                                                title="Browse all jobs"
                                                onClick={() => setJobPostType("all")}
                                            >
                                                <FaCompass size={20} />
                                            </div>

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
                            {/* {error && <div className="p-3 text-danger">{error}</div>} */}

                            {!loading && (
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
                    <Col md={9} className="p-0" style={{ height: "100%" }}>
                        {windowWidth <= 770 && (
                            <div className="d-flex align-items-center justify-content-between m-2">
                                <Button
                                    className="px-2 py-2"
                                    style={{
                                        backgroundColor: "var(--background)",
                                        color: "var(--text)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "8px",
                                    }}
                                    onClick={() => setShowDetailsMobile(false)}
                                >
                                    ← Back
                                </Button>
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
                                    backgroundColor: "var(--background)",
                                    paddingBottom: "3rem",
                                    paddingLeft: "5rem",
                                    paddingRight: "5rem",
                                }}
                            >
                                {/* Top Section */}
                                <div className={windowWidth <= 770 ? "p-3" : "pt-5 pb-4"}>
                                    <div className="d-flex justify-content-between align-items-start flex-nowrap gap-3">


                                        {/* Logo + Title + Company */}
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                style={{
                                                    width: "90px",
                                                    height: "90px",
                                                    backgroundColor: "var(--card)",
                                                    borderRadius: "16px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: "0 3px 10px var(--shadow1)",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {selectedJob.logoURL ? (
                                                    <img
                                                        src={selectedJob.logoURL}
                                                        alt={`${selectedJob.company} logo`}
                                                        style={{
                                                            width: "75px",
                                                            height: "75px",
                                                            objectFit: "contain",
                                                        }}
                                                    />
                                                ) : (
                                                    <FaBuilding size={40} color="var(--text)" />
                                                )}
                                            </div>

                                            <div>
                                                <h2
                                                    className="mb-1"
                                                    style={{
                                                        color: "var(--accent1)",
                                                        fontSize: "2rem",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {selectedJob.title}
                                                </h2>
                                                <h4
                                                    className="mb-0"
                                                    style={{
                                                        color: "var(--accent2)",
                                                        fontWeight: 600,
                                                        fontSize: "1.3rem",
                                                    }}
                                                >
                                                    {selectedJob.company}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="d-flex align-items-center gap-2 pt-4">
                                            <Button
                                                style={{
                                                    backgroundColor: "var(--accent1)",
                                                    color: "#FFFFFF",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                }}
                                                onClick={() =>
                                                    toggleSaveJob(selectedJob.id, selectedJob.is_saved)
                                                }
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = "var(--accent1)";
                                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                                    e.currentTarget.style.border = "1px solid var(--accent1)";
                                                }}

                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = "#FFFFFF";
                                                    e.currentTarget.style.backgroundColor = "var(--accent1)";
                                                }}
                                            >
                                                {selectedJob.is_saved ? "Unsave" : "Save"}
                                            </Button>

                                            <Button
                                                style={{
                                                    backgroundColor: "var(--accent1)",
                                                    color: "#FFFFFF",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                }}
                                                onClick={handleApplyClick}
                                                disabled={selectedJob.applied_status}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = "var(--accent1)";
                                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                                    e.currentTarget.style.border = "1px solid var(--accent1)";
                                                }}

                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = "#FFFFFF";
                                                    e.currentTarget.style.backgroundColor = "var(--accent1)";
                                                }}
                                            >
                                                {selectedJob.applied_status ? "Applied" : "Apply"}
                                            </Button>

                                            <Button
                                                style={{
                                                    backgroundColor: "var(--accent1)",
                                                    color: "#FFFFFF",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                }}
                                                onClick={() =>
                                                    navigate("/interview-chatbot", { state: { job: selectedJob } })
                                                }
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = "var(--accent1)";
                                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                                    e.currentTarget.style.border = "1px solid var(--accent1)";
                                                }}

                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = "#FFFFFF";
                                                    e.currentTarget.style.backgroundColor = "var(--accent1)";
                                                }}
                                            >
                                                Interview
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Did you apply prompt */}
                                {showApplyConfirm && !selectedJob.applied_status && (
                                    <div
                                        style={{
                                            marginBottom: "24px",
                                            color: "var(--text)",
                                            fontSize: "1.05rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span>Did you apply to this job? </span>
                                        <span
                                            onClick={handleConfirmApply}
                                            style={{
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                                marginLeft: "6px",
                                            }}
                                        >
                                            Yes
                                        </span>
                                        <span style={{ margin: "0 4px" }}>/</span>
                                        <span
                                            onClick={() => setShowApplyConfirm(false)}
                                            style={{
                                                cursor: "pointer",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            No
                                        </span>
                                    </div>
                                )}

                                {/* About this job */}
                                <div className="pt-4 pb-5">
                                    <h4 className="fw-bold mb-4" style={{ color: "var(--accent1)" }}>
                                        About This Job
                                    </h4>

                                    <div className="row mb-5" style={{ fontSize: "1.1rem", color: "var(--text)" }}>
                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaClock className="me-2" size={22} color="var(--text)" />
                                                <strong>Date Posted:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.datePosted || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaMoneyBill className="me-2" size={22} color="var(--text)" />
                                                <strong>Salary:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.salary || "Not Posted"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaMapMarkerAlt className="me-2" size={22} color="var(--text)" />
                                                <strong>Location:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.location || "Not Specified"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaBriefcase className="me-2" size={22} color="var(--text)" />
                                                <strong>Employment Type:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.employmentTypes?.[0]?.name || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaUserTie className="me-2" size={22} color="var(--text)" />
                                                <strong>Experience Level:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.experienceLevels?.[0]?.name || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <FaLaptopHouse className="me-2" size={22} color="var(--text)" />
                                                <strong>Work Model:</strong>
                                                <span style={{ marginLeft: "8px" }}>
                                                    {selectedJob.workModels?.[0]?.name || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr
                                        style={{
                                            borderColor: "var(--border)",
                                            opacity: 0.8,
                                            margin: "2rem 0",
                                        }}
                                    />

                                    {/* AI Summary */}
                                    {selectedJob.summary && (
                                        <div className="mb-5">
                                            <h4
                                                className="fw-bold mb-4"
                                                style={{ color: "var(--accent1)" }}
                                            >
                                                AI Summary
                                            </h4>
                                            <p
                                                style={{
                                                    color: "var(--text)",
                                                    fontSize: "1.05rem",
                                                    lineHeight: "1.8",
                                                    marginBottom: 0,
                                                }}
                                            >
                                                {selectedJob.summary}
                                            </p>
                                        </div>
                                    )}

                                    <hr
                                        style={{
                                            borderColor: "var(--border)",
                                            opacity: 0.8,
                                            margin: "2rem 0",
                                        }}
                                    />

                                    {/*  What They're Looking For */}
                                    <div className="mb-5">
                                        <h4
                                            className="fw-bold mb-4"
                                            style={{ color: "var(--accent1)", }}
                                        >
                                            What They’re Looking For
                                        </h4>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {[...(selectedJob.skills || []), ...(selectedJob.careers || [])]
                                                .slice(0, showAllSkills ? undefined : 10)
                                                .map((item, index) => (
                                                    <span
                                                        key={index}
                                                        style={{
                                                            backgroundColor: "var(--accent3)",
                                                            border: "1px solid var(--border)",
                                                            borderRadius: "8px",
                                                            padding: "6px 12px",
                                                            fontSize: "0.95rem",
                                                            color: "var(--text)",
                                                            fontWeight: 600,
                                                            transition: "all 0.25s ease",
                                                            cursor: "default",
                                                            boxShadow: "0 0 0 transparent",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                "0 0 10px var(--accent3)";
                                                            e.currentTarget.style.transform = "scale(1.06)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                "0 0 0 transparent";
                                                            e.currentTarget.style.transform = "scale(1)";
                                                        }}
                                                    >
                                                        {item.name || item}
                                                    </span>
                                                ))}
                                        </div>

                                        {((selectedJob.skills?.length || 0) +
                                            (selectedJob.careers?.length || 0)) > 15 && (
                                                <Button
                                                    variant="link"
                                                    onClick={() => setShowAllSkills((prev) => !prev)}
                                                    style={{
                                                        padding: 0,
                                                        marginTop: "4px",
                                                        color: "var(--accent1)",
                                                        textDecoration: "none",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {showAllSkills ? "See Less ▲" : "See More ▼"}
                                                </Button>
                                            )}
                                    </div>

                                    <hr
                                        style={{
                                            borderColor: "var(--border)",
                                            opacity: 0.8,
                                            margin: "2rem 0",
                                        }}
                                    />

                                    {/* Complete Description  */}
                                    <div>
                                        <h4
                                            className="fw-bold mb-4"
                                            style={{ color: "var(--accent1)" }}
                                        >
                                            Complete Description
                                        </h4>
                                        <p
                                            style={{
                                                color: "var(--text)",
                                                fontSize: "1.05rem",
                                                lineHeight: "1.8",
                                                marginBottom: 0,
                                            }}
                                        >
                                            {showFullDescription
                                                ? selectedJob.description
                                                : selectedJob.description?.slice(0, 600) + "..."}
                                        </p>
                                        {selectedJob.description &&
                                            selectedJob.description.length > 600 && (
                                                <Button
                                                    variant="link"
                                                    onClick={() =>
                                                        setShowFullDescription((prev) => !prev)
                                                    }
                                                    style={{
                                                        padding: 0,
                                                        marginTop: "8px",
                                                        color: "var(--accent1)",
                                                        textDecoration: "none",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {showFullDescription ? "See Less ▲" : "See More ▼"}
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-100 d-flex align-items-center justify-content-center text-white">
                                <div className="text-center">
                                    <FaBriefcase size={48} className="mb-3 text-secondary" />
                                    <p>No jobs were found.</p>
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
                    {["Full-Time", "Part-Time", "Internship", "Temporary", "Contract"].map((type) => (
                        <Form.Check
                            key={type}
                            type="checkbox"
                            label={type}
                            value={type}
                            checked={filters.employmentType.includes(type)}
                            onChange={() => toggleFilter("employmentType", type)}
                        />
                    ))}
                    <hr />

                    <h6 className="mb-2">Experience Level</h6>
                    {["Intern", "Entry", "Mid", "Senior", "Lead", "Management"].map((level) => (
                        <Form.Check
                            key={level}
                            type="checkbox"
                            label={level}
                            value={level}
                            checked={filters.experienceLevel.includes(level)}
                            onChange={() => toggleFilter("experienceLevel", level)}
                        />
                    ))}
                    <hr />

                    <h6 className="mb-2">Location</h6>
                    {["Remote", "On-site", "Hybrid"].map((location) => (
                        <Form.Check
                            key={location}
                            type="checkbox"
                            label={location}
                            value={location}
                            checked={filters.location.includes(location)}
                            onChange={() => toggleFilter("location", location)}
                        />
                    ))}
                    <hr />

                    {/* <h6 className="mb-2">Posted Date</h6>
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
                    /> */}
                </Offcanvas.Body>

                <div className="filters-actions"
                    style={{ background: "var(--shadow2)" }}>
                    <Button className="btn-outline-theme" onClick={clearAllFilters}>Clear</Button>
                    <Button className="btn-theme" onClick={handleFilterChange}>Apply</Button>
                </div>
            </Offcanvas>

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