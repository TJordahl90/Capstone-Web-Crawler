import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell} from "recharts";
import api from "../api.js";

const TrendAnalysis = () => {
  	const [topSkills, setTopSkills] = useState([]);
  	const [jobPositions, setJobPositions] = useState([]);
    const [workModels, setWorkModels] = useState([]);
    const [experienceLevels, setExperienceLevels] = useState([]);
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [err, setError] = useState("");

	useEffect(() => {
        const fetchJobStats = async() =>{
	
            try{
                const response = await api.get("/job_statistics/");
                //console.log(response.data);
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
        };     
        fetchJobStats();
    }, []);

	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

  	return (
  	  	<Container fluid className="p-4" style={{ color: 'white' }}>
            <Row>
                <Col md={8} className="mb-4">
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Highest In-Demand Skills</Card.Title>
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
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Work Model Distribution</Card.Title>
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
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Experience Level Distribution</Card.Title>
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
                    <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '1rem' }}>
                        <Card.Body>
                            <Card.Title as="h5" style={{ color: '#00ADB5' }}>Employment Type Distribution</Card.Title>
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
