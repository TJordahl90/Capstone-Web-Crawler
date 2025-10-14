import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell} from "recharts";
import api from "../api.js";

const TrendAnalysis = () => {
  	const [topSkills, setTopSkills] = useState([]);
  	const [jobPositions, setJobPositions] = useState([]);

	useEffect(() => {
	// Call your Django API here
		setTopSkills([
			{ name: 'Python', count: 189 },
			{ name: 'JavaScript', count: 156 },
			{ name: 'SQL', count: 140 },
			{ name: 'React', count: 121 },
			{ name: 'AWS', count: 110 },
			{ name: 'Java', count: 95 },
			{ name: 'C#', count: 88 },
		]);
		setJobPositions([
		    { name: 'Software Engineer', value: 480 },
		    { name: 'System Admin', value: 95 },
		    { name: 'Database Admin', value: 65 },
		    { name: 'IT', value: 40 },
		]);
  	}, []);

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  	return (
  	  	<Container fluid className="p-4" style={{ color: 'white' }}>
            <Row>
                <Col md={8} className="mb-4">
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Top In-Demand Skills</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topSkills} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}/>
                                    <Bar dataKey="count" fill="#00ADB5" name="Job Postings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-4">
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Open Job Position Distribution</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={jobPositions} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label>
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

        </Container>
  	);
};

export default TrendAnalysis;
