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

    const COLORS = [
      '#1B6CA8',
      '#2185D5',
      '#4ECDC4',
      '#FFD369',
      '#FF8C42',
      '#FF6B6B',
      '#A86BD5',
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
  	  	<Container fluid style={{ minHeight: "100vh", color: "var(--text)", padding: "3rem 2.5rem", overflowY: "auto" }}>
            <Row>
                <Col md={8} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600 }}>Highest In-Demand Skills</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topSkills} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 500 }}
                                        axisLine={{ stroke: 'var(--border)' }} 
                                    />
                                    <YAxis 
                                        tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 500 }}
                                        axisLine={{ stroke: 'var(--border)' }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--shadow2)' }}
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--accent1)', color: 'var(--text)' }}
                                        labelStyle={{ color: 'var(--accent1)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--accent1)" name="Job Postings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600 }}>Open Job Position Distribution</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={jobPositions} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {jobPositions.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row>
                {/* For Work Distribution */}
                <Col md={4} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600 }}>Work Model Distribution</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={workModels} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {workModels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* For Expereinece Levels */}
                <Col md={4} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600 }}>Experience Level Distribution</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={experienceLevels} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {experienceLevels.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* For Employment Types */}
                <Col md={4} className="mb-4">
                    <Card style={cardBase}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: 'var(--accent2)', fontSize: "1.5rem", fontWeight: 600 }}>Employment Type Distribution</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={employmentTypes} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="count" nameKey="name" label>
                                        {employmentTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
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
