import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../api.js";

const TrendAnalysis = () => {
  	const [topSkills, setTopSkills] = useState([]);
  	const [jobPositions, setJobPositions] = useState([]);
    const [workModels, setWorkModels] = useState([]);
    const [experienceLevels, setExperienceLevels] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setError] = useState("");

	useEffect(() => {
        const fetchJobStats = async() =>{
            try{
                const response = await api.get("/job_statistics/");
                setTopSkills(response.data.topSkills);
                setJobPositions(response.data.topCareerAreas);
                setWorkModels(response.data.topWorkModels);
                setExperienceLevels(response.data.topExperienceLevels);
                setEmploymentTypes(response.data.topEmploymentTypes);

            }
            catch (err) {
                console.error("Error details:", err);
                setError(err.response?.data?.error || "Failed to get job data");
            }
            finally {
                setLoading(false);
            }
        };     
        fetchJobStats();
    }, []);
    
    const maxLen = window.innerWidth < 768 ? 7 : 12;
    const truncateLabel = (label, maxLen) => {
        if (!label) return "";
        return label.length > maxLen ? label.substring(0, maxLen) + "…" : label;
    };

    const COLORS = [
      '#1B6CA8',
      '#FF6B6B',
      '#4ECDC4',
      '#FFD369',
      '#FF8C42',
      '#A86BD5',
      '#2185D5',
    ];

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
    
    if (loading) {
        return (
            <div style={{ height: "100vh", backgroundColor: "var(--background)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "var(--text)" }}>
                <Spinner 
                    animation="border" 
                    role="status" 
                    style={{ width: "4rem", height: "4rem" }} 
                />
                <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                    Loading trends...
                </p>
            </div>
        );
    }

  	return (
  	  	<Container fluid style={{ minHeight: "100vh", color: "var(--text)", padding: "3rem 3rem", overflowY: "auto" }}>
            <Row>
                {/* In demand skills */}
                <Col xs={12} lg={8} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>Highest In-Demand Skills</Card.Title>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={topSkills} margin={{ top: 20, right: 20, left: -10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis 
                                        dataKey="name"
                                        tick={(props) => {
                                            const { x, y, payload } = props;
                                            return (
                                                <text x={x} y={y + 10} textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={500}>
                                                    {truncateLabel(payload.value, maxLen)}
                                                </text>
                                            );
                                        }}
                                        interval={0}
                                        height={30}
                                        axisLine={{ stroke: 'var(--border)' }}
                                    />
                                    <YAxis 
                                        tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 500 }}
                                        axisLine={{ stroke: 'var(--border)' }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--shadow2)' }}
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--text)' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--accent1)" name="Job Postings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Job position distribution */}
                <Col lg={4} xs={12} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>Job Distributions</Card.Title>

                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={jobPositions} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {jobPositions.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--text)' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row>
                {/* For Work Distribution */}
                <Col lg={4} xs={12} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>Work Model Distribution</Card.Title>
                            
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={workModels} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {workModels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--text)' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* For Experience Levels */}
                <Col lg={4} xs={12} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>Experience Level Distribution</Card.Title>

                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={experienceLevels} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {experienceLevels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--text)' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* For Employment Types */}
                <Col lg={4} xs={12} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>Employment Type Distribution</Card.Title>

                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={employmentTypes} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {employmentTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--text)' }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
  	);
};

export default TrendAnalysis;
