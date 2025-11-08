import React, { useEffect, useState } from "react";
import { Container, Col, Row, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

const Dashboard = () => {
    const navigate = useNavigate();

    const [bestJob, setBestJob] = useState(null);
    const [bestJobScore, setBestJobScore] = useState(null);
    const [recentJob, setRecentJob] = useState(null);
    const [topCareer, setTopCareer] = useState("");
    const [topSkill, setTopSkill] = useState("");
    const [username, setUsername] = useState("User");

    useEffect(() => {
        // Retrieve username from local storage
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser);
        if (userData?.username) 
			setUsername(userData.username);

        // Fetch dashboard data
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
            }
        };
        fetchDashboardData();
    }, []);

    // Base glassmorphic card style
    const cardBase = {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "16px",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1.5rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
        textDecoration: "none",
    };

    // White glow hover
    const cardHover = {
        boxShadow: "0 0 25px rgba(255, 255, 255, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        transform: "translateY(-4px)",
    };

    const cardWithGlow = (isHovered) => ({
        ...cardBase,
        ...(isHovered ? cardHover : {}),
    });

    // Reusable hoverable card component
    const GlowCard = ({ children, to }) => {
        const [hovered, setHovered] = useState(false);

        return (
            <Card
                style={cardWithGlow(hovered)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => navigate(to)}
            >
                {children}
            </Card>
        );
    };

    return (
        <Container className="p-4 text-white">
            <div className="mb-4">
                <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>
                    Welcome back, {username}!
                </h2>
                <p className="lead" style={{ color: "var(--text3)" }}>
                    Here’s what’s happening in your job search world today.
                </p>
            </div>

            <Row className="gy-4">
                <Col md={6}>
                    <GlowCard to="/matched-jobs">
                        {bestJob ? (
                            <div style={{ color: "var(--text3)" }}>
                                <h4 style={{ color: "var(--text2)", fontWeight: 600 }}>
                                    {bestJob.title}
                                </h4>
                                <p style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
                                    <strong>{bestJob.company}</strong>
                                </p>
                                <hr style={{ opacity: 0.3 }} />
                                <h6 style={{ color: "var(--text2)", fontWeight: 500 }}>
                                    Match Strength: {bestJobScore}%
                                </h6>
                                <p style={{ marginTop: "0.5rem" }}>
                                    {bestJob.summary?.slice(0, 150)}...
                                </p>
                            </div>
                        ) : (
                            <p style={{ color: "var(--text3)" }}>
                                Expand your profile to view matched jobs.
                            </p>
                        )}
                    </GlowCard>
                </Col>

                <Col md={6}>
                    <GlowCard to="/find-jobs">
                        {recentJob ? (
                            <div style={{ color: "var(--text3)" }}>
                                <h4 style={{ color: "var(--text2)", fontWeight: 600 }}>
                                    {recentJob.title}
                                </h4>
                                <p style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
                                    <strong>{recentJob.company}</strong>
                                </p>
                                <hr style={{ opacity: 0.3 }} />
                                <h6 style={{ color: "var(--text2)", fontWeight: 500 }}>
                                    Added on {recentJob.datePosted || "recently"}
                                </h6>
                                <p style={{ marginTop: "0.5rem" }}>
                                    {recentJob.summary?.slice(0, 150)}...
                                </p>
                            </div>
                        ) : (
                            <p style={{ color: "var(--text3)" }}>
                                Loading the latest opportunities...
                            </p>
                        )}
                    </GlowCard>
                </Col>
            </Row>

            <Row className="gy-4 mt-1">
                <Col md={6}>
                    <GlowCard to="/trend-analysis">
                        <div style={{ color: "var(--text3)" }}>
                            <h4 style={{ color: "var(--text2)", fontWeight: 600 }}>
                                Dallas-Fort Worth Job Market
                            </h4>
                            <hr style={{ opacity: 0.3 }} />
                            <h6 style={{ color: "var(--text2)", fontWeight: 500 }}>
                                Top Skill:{" "}
                                <span style={{ color: "#fff" }}>
                                    {topSkill || "..."}
                                </span>
                            </h6>
                            <h6 style={{ color: "var(--text2)", fontWeight: 500 }}>
                                Top Career:{" "}
                                <span style={{ color: "#fff" }}>
                                    {topCareer || "..."}
                                </span>
                            </h6>
                            <p style={{ marginTop: "0.5rem" }}>
                                Discover what’s trending across the DFW job market this week.
                            </p>
                        </div>
                    </GlowCard>
                </Col>

                <Col md={6}>
                    <GlowCard to="/find-jobs">
                        <div style={{ color: "var(--text3)" }}>
                            <h4 style={{ color: "var(--text2)", fontWeight: 600 }}>
                                AI Mock Interview
                            </h4>
                            <hr style={{ opacity: 0.3 }} />
                            <p style={{ marginBottom: "0.75rem" }}>
                                Get personalized mock interview questions, job insights,
                                and confidence boosts before your next opportunity.
                            </p>
                            <p>
                                Go to any job posting and click the{" "}
                                <strong>Interview</strong> button to get started.
                            </p>
                        </div>
                    </GlowCard>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
