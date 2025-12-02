import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaClock, FaChartBar, FaRobot, FaUser } from "react-icons/fa";
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

    const cardBase = {
        backgroundColor: "var(--card)",
        border: `1px solid var(--accent1)`,
        borderLeft: `4px solid var(--accent1)`,
        borderRadius: "16px",
        color: "var(--text)",
        padding: "1.8rem",
        height: "100%",
        boxShadow: "0 4px 20px var(--shadow1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    };

    const linkStyle = {
        color: "var(--accent1)",
        fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
        display: "inline-block",
        marginTop: "1rem",
        transition: "color 0.3s ease",
    };

    const chipStyle = {
        backgroundColor: "var(--accent3)",
        padding: "4px 10px",
        borderRadius: "5px",
        color: "var(--text)",
        fontSize: "0.9rem",
        marginLeft: "8px",
        fontWeight: 600,
    };

    if (loading) {
        return (
            <div style={{ height: "100vh", backgroundColor: "var(--background)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "var(--text)" }}>
                <Spinner 
                    animation="border" 
                    role="status" 
                    style={{ width: "4rem", height: "4rem" }} 
                />
                <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    return (
        <Container fluid style={{ minHeight: "100vh", color: "var(--text)", padding: "3rem 3rem", overflowY: "auto" }}>
            <div style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "2.2rem" }}>Welcome back, <span style={{ color: "var(--accent1)" }}>{username}</span></h2>
                <p style={{ color: "var(--accent2)", fontSize: "1.1rem" }}>Here’s what’s happening in your job search world today.</p>
            </div>

            {/* Matched Job */}
            <h5 style={{ color: "var(--accent1)", marginBottom: "1rem", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.9rem" }}>Your Top Match</h5>
            <Row className="gy-4 mb-4">
                <Col xs={12}>
                    <Card style={cardBase}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.6rem", color: "var(--accent1)" }}>
                                <FaUser size={22} />
                                <h3 style={{ fontWeight: 600, margin: 0 }}>Top Matched Job</h3>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "var(--accent1)" }} />
                            {bestJob ? (
                                <>
                                    <h4 style={{ fontWeight: 600 }}>{bestJob.title}</h4>
                                    <p style={{ fontSize: "1.1rem" }}><strong>{bestJob.company}</strong></p>
                                    <p style={{ color: "var(--accent2)" }}>Match Strength:<span style={chipStyle}>{bestJobScore}%</span></p>
                                    <p style={{ marginTop: "0.5rem" }}>{bestJob.summary || "Learn more about this top opportunity that fits your skills and goals."}</p>
                                </>
                            ) : (
                                <>
                                    <h4 style={{ fontWeight: 600 }}>Expand your profile to view matched jobs</h4>
                                    <p style={{ color: "var(--accent2)" }}>Discover personalized job matches once you complete your account setup.</p>
                                </>
                            )}
                        </div>
                        <span style={linkStyle} onClick={() => navigate("/matched-jobs")}>View your matched jobs →</span>
                    </Card>
                </Col>
            </Row>

            {/* Market Trends + AI */}
            <h5 style={{ color: "var(--accent1)", marginBottom: "1rem", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.9rem" }}>Insights & Tools</h5>
            <Row className="g-4 mb-4 align-items-stretch">
                <Col md={6}>
                    <Card style={{ ...cardBase, height: "100%" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.6rem", color: "var(--accent1)" }}>
                                <FaChartBar size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>Job Market Trends</h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "var(--accent1)" }} />
                            <p><strong>Top Skill:</strong> <span style={chipStyle}>{topSkill || "N/A"}</span></p>
                            <p><strong>Top Career:</strong> <span style={chipStyle}>{topCareer || "N/A"}</span></p>
                            <p style={{ color: "var(--accent2)" }}>Explore job market analysis including top skill demands, fastest-growing careers, and other data-driven trends across the Dallas–Fort Worth area.</p>
                        </div>
                        <span style={linkStyle} onClick={() => navigate("/trend-analysis")}>See all trends →</span>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card style={{ ...cardBase, height: "100%" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.6rem", color: "var(--accent1)" }}>
                                <FaRobot size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>AI Mock Interview Assistant</h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "var(--accent1)" }} />
                            <p>
                                Prepare for real interviews with AI-generated questions customized to your profile or any job you’ve saved. 
                                Answer using text or voice, receive instant feedback, and review your overall performance summary.
                            </p>
                            <p style={{ color: "var(--accent2)" }}>Choose <strong>Profile</strong> or <strong>Saved Job</strong> on the interview page to begin your session.</p>
                        </div>
                        <span style={linkStyle} onClick={() => navigate("/interview-chatbot")}>Try it out →</span>
                    </Card>
                </Col>
            </Row>

            {/* Recent Job */}
            <h5 style={{ color: "var(--accent1)", marginBottom: "1rem", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "0.9rem" }}>Latest Job Added</h5>
            <Row className="gy-4 mb-4">
                <Col xs={12}>
                    <Card style={cardBase}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.6rem", color: "var(--accent1)" }}>
                                <FaClock size={20} />
                                <h4 style={{ fontWeight: 600, margin: 0 }}>Newest Opportunity</h4>
                            </div>
                            <hr style={{ opacity: 0.2, borderColor: "var(--accent1)" }} />
                            {recentJob ? (
                                <>
                                    <h5 style={{ fontWeight: 600 }}>{recentJob.title}</h5>
                                    <p style={{ fontSize: "1.1rem" }}><strong>{recentJob.company}</strong></p>
                                    <p style={{ color: "var(--accent2)" }}>Date Posted: {recentJob.datePosted || "recently"}</p>
                                    <p style={{ color: "var(--text)" }}>{recentJob.summary}</p>
                                </>
                            ) : (
                                <p style={{ color: "var(--accent2)" }}>Stay updated with the newest openings in your area.</p>
                            )}
                        </div>
                        <span style={linkStyle} onClick={() => navigate("/find-jobs")}>Browse new jobs →</span>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
