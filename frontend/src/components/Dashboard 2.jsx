import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaClock, FaChartBar, FaRobot } from "react-icons/fa";
import api from "../api.js";

const Dashboard = () => {
    const navigate = useNavigate();
    const [bestJob, setBestJob] = useState(null);
    const [bestJobScore, setBestJobScore] = useState(null);
    const [recentJob, setRecentJob] = useState(null);
    const [topCareer, setTopCareer] = useState("");
    const [topSkill, setTopSkill] = useState("");
    const [username, setUsername] = useState("User");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;
        if (userData?.username) setUsername(userData.username);

        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/");
                setBestJob(response.data.topJob?.job || null);
                setBestJobScore(response.data.topJob?.score || null);
                setRecentJob(response.data.newestJob || null);
                setTopCareer(response.data.topCareer?.career || null);
                setTopSkill(response.data.topSkill?.skillName || null);
            } catch (err) {
                console.error("Dashboard fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    //
    // need to adjust colors to theme context

    const cardBase = {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(92, 201, 245, 0.25)",
        borderLeft: "4px solid rgba(92, 201, 245, 0.6)",
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#cfd9e0",
        padding: "1.8rem",
        height: "100%",
        boxShadow: "0 4px 25px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    };

    const linkStyle = {
        color: "#5cc9f5",
        fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
        display: "inline-block",
        marginTop: "1rem",
        transition: "color 0.3s ease",
    };

    const chipStyle = {
        backgroundColor: "rgba(92, 201, 245, 0.15)",
        padding: "4px 10px",
        borderRadius: "20px",
        color: "#5cc9f5",
        fontSize: "0.9rem",
        marginLeft: "8px",
        fontWeight: 600,
    };

    // Fullscreen loading spinner
    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: "#0b1119",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <Spinner
                    animation="border"
                    role="status"
                    style={{ width: "4rem", height: "4rem", color: "#5cc9f5" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p style={{ color: "#5cc9f5", marginTop: "1rem", fontSize: "1.1rem" }}>
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    return (
        <Container
            fluid
            style={{
                backgroundColor: "#0b1119",
                minHeight: "100vh",
                color: "#e6edf3",
                padding: "3rem 2.5rem",
                overflowY: "auto",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "2.2rem", color: "#ffffff" }}>
                    Welcome back, <span style={{ color: "#5cc9f5" }}>{username}</span>
                </h2>
                <p style={{ color: "#b0bac4", fontSize: "1.1rem" }}>
                    Here’s what’s happening in your job search world today.
                </p>
            </div>

            {/* Matched Job */}
            <h5
                style={{
                    color: "#5cc9f5",
                    marginBottom: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                }}
            >
                Your Top Match
            </h5>

            <Row className="gy-4 mb-4">
                <Col xs={12}>
                    <Card style={cardBase}>
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "0.6rem",
                                    color: "#5cc9f5",
                                }}
                            >
                                <FaBriefcase size={22} />
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Top Matched Job</h3>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "#5cc9f5" }} />
                            {bestJob ? (
                                <>
                                    <h4 style={{ fontWeight: 600, color: "#fff" }}>{bestJob.title}</h4>
                                    <p style={{ fontSize: "1.1rem", color: "#d5dee8" }}>
                                        <strong>{bestJob.company}</strong>
                                    </p>
                                    <p style={{ color: "#b0bac4" }}>
                                        Match Strength:
                                        <span style={chipStyle}>{bestJobScore}%</span>
                                    </p>
                                    <p style={{ marginTop: "0.5rem" }}>
                                        {bestJob.summary ||
                                            "Learn more about this top opportunity that fits your skills and goals."}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h4 style={{ color: "#fff", fontWeight: 600 }}>
                                        Expand your profile to view matched jobs
                                    </h4>
                                    <p style={{ color: "#b0bac4" }}>
                                        Discover personalized job matches once you complete your
                                        account setup.
                                    </p>
                                </>
                            )}
                        </div>
                        <span
                            style={linkStyle}
                            onClick={() => navigate("/matched-jobs")}
                        >
                            View your matched jobs →
                        </span>
                    </Card>
                </Col>
            </Row>

            {/* Market Trends + AI */}
            <h5
                style={{
                    color: "#5cc9f5",
                    marginBottom: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                }}
            >
                Insights & Tools
            </h5>

            <Row className="g-4 mb-4 align-items-stretch">
                <Col md={6}>
                    <Card style={{ ...cardBase, height: "100%" }}>
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "0.6rem",
                                    color: "#5cc9f5",
                                }}
                            >
                                <FaChartBar size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>Job Market Trends</h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "#5cc9f5" }} />
                            <p style={{ color: "#cfd9e0" }}>
                                <strong>Top Skill:</strong>{" "}
                                <span style={chipStyle}>{topSkill || "N/A"}</span>
                            </p>
                            <p style={{ color: "#cfd9e0" }}>
                                <strong>Top Career:</strong>{" "}
                                <span style={chipStyle}>{topCareer || "N/A"}</span>
                            </p>
                            <p style={{ color: "#b0bac4" }}>
                                Explore the top skill demands and fastest-growing careers across
                                the Dallas–Fort Worth job market.
                            </p>
                        </div>
                        <span
                            style={linkStyle}
                            onClick={() => navigate("/trend-analysis")}
                        >
                            See all trends →
                        </span>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card style={{ ...cardBase, height: "100%" }}>
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "0.6rem",
                                    color: "#5cc9f5",
                                }}
                            >
                                <FaRobot size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>
                                    AI Mock Interview Assistant
                                </h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "#5cc9f5" }} />
                            <p style={{ color: "#cfd9e0" }}>
                                Practice for your next interview with AI-generated questions,
                                tailored to your preferred roles and skills.
                            </p>
                            <p style={{ color: "#b0bac4" }}>
                                Visit any job posting and click{" "}
                                <strong>"Interview"</strong> to start your personalized mock
                                interview session.
                            </p>
                        </div>
                        <span
                            style={linkStyle}
                            onClick={() => navigate("/find-jobs")}
                        >
                            Try it out →
                        </span>
                    </Card>
                </Col>
            </Row>

            {/* Recent Job */}
            <h5
                style={{
                    color: "#5cc9f5",
                    marginBottom: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                }}
            >
                Latest Job Added
            </h5>

            <Row className="gy-4 mb-4">
                <Col xs={12}>
                    <Card style={cardBase}>
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "0.6rem",
                                    color: "#5cc9f5",
                                }}
                            >
                                <FaClock size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>
                                    Newest Opportunity
                                </h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "#5cc9f5" }} />
                            {recentJob ? (
                                <>
                                    <h5 style={{ fontWeight: 600, color: "#fff" }}>
                                        {recentJob.title}
                                    </h5>
                                    <p style={{ color: "#b0bac4" }}>
                                        <strong>{recentJob.company}</strong> —{" "}
                                        {recentJob.datePosted || "recently"}
                                    </p>
                                    <p style={{ color: "#cfd9e0" }}>{recentJob.summary}</p>
                                </>
                            ) : (
                                <p style={{ color: "#b0bac4" }}>
                                    Stay updated with the newest openings in your area.
                                </p>
                            )}
                        </div>
                        <span
                            style={linkStyle}
                            onClick={() => navigate("/find-jobs")}
                        >
                            Browse new jobs →
                        </span>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
