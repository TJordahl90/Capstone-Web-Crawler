import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, Modal, Badge, Alert } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import profile from "../assets/profile.png";
import InputField from './InputField';
import { jobList, skillList } from "../AccountOptions.js";
import "./Account.css";
import api from '../api.js';
import { useNavigate } from "react-router-dom";

const Account = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [editSummary, setEditSummary] = useState(false);
    const [editjobs, setEditjobs] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);

    const [tempjobs, setTempjobs] = useState([]);
    const [tempSkills, setTempSkills] = useState([]);

    const [accountData, setaccountData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        summary: "",
        jobs: [],
        skills: [],
        school: "",
        degree: "",
        major: "",
        graduationDate: "",
        gpa: "",
        company: "",
        position: "",
        companyLocation: "",
        startDate: "",
        responsibilities: "",
    });

    useEffect(() => {
        if (editjobs) {
            setTempjobs(accountData.jobs);
        }
    }, [editjobs, accountData.jobs]);

    useEffect(() => {
        if (editSkills) {
            setTempSkills(accountData.skills);
        }
    }, [editSkills, accountData.skills]);

    const toggleBadge = (item, type) => {
        if (type == "job") {
            if (tempjobs.includes(item)) {
                setTempjobs(tempjobs.filter((selectedJob) => selectedJob !== item));
            }
            else {
                setTempjobs([...tempjobs, item]);
            }
        }
        else if (type == "skill") {
            if (tempSkills.includes(item)) {
                setTempSkills(tempSkills.filter((skill) => skill !== item));
            }
            else {
                setTempSkills([...tempSkills, item]);
            }
        }
    };

    const handlePersonalInfo = async (e) => {
        e.preventDefault();
        const data = {
            user: {
                first_name: accountData.firstName,
                last_name: accountData.lastName,
                email: accountData.email,
            },
            account: {
                // accountImage: accountData.accountImage,
                // resume: accountData.resume,
                location: accountData.location,
            }

        };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditPersonalInfo(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }

    const handleSummary = async (e) => {
        e.preventDefault();
        const data = { account: { summary: accountData.summary } };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditSummary(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }

    const handlejobs = async (e) => {
        e.preventDefault();
        const data = { jobPreferences: tempjobs };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
            setaccountData({ ...accountData, jobs: tempjobs });
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditjobs(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }

    const handleSkills = async (e) => {
        e.preventDefault();
        const data = { skills: tempSkills };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
            setaccountData({ ...accountData, skills: tempSkills });
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditSkills(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }

    const handleEducation = async (e) => {
        e.preventDefault();
        const data = {
            education: {
                educationLevel: "accountData.educationLevel",
                institution: accountData.school,
                degree: accountData.degree,
                major: accountData.major,
                minor: accountData.minor,
                graduationDate: accountData.graduationDate,
                gpa: accountData.gpa,
            }
        };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditEducation(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }

    const handleExperience = async (e) => {
        e.preventDefault();
        const data = {
            experience: {
                company: accountData.company,
                title: accountData.position,
                location: accountData.location,
                startDate: accountData.startDate,
                description: accountData.responsibilities,
            }
        };

        try {
            await api.patch("/account/", data);
            setMessage("Account successfully updated!");
        }
        catch (err) {
            setError("Error updating account.");
            console.log(err);
        }

        setEditExperience(false);
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }


    return (
        <>


            <Container className="account-container">
                <div className="back-btn-container pb-3">
                    <button onClick={() => navigate("/find-jobs")} className="back-btn">
                        ← Back to Jobs
                    </button>
                </div>
                {/* Alert Messages */}
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Personal Information */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Img src={profile} className="account-image mb-3" style={{ width: "50px", height: "50px" }} alt="Profile Image" />
                        <Card.Title>
                            {(accountData.firstName || accountData.lastName)
                                ? `${accountData.firstName} ${accountData.lastName}`
                                : "Please enter your name."
                            }
                        </Card.Title>
                        <Card.Text>
                            {(accountData.email)
                                ? `${accountData.email}`
                                : "Please enter your email."
                            }
                            <br />
                            {(accountData.location)
                                ? `${accountData.location}`
                                : "Please enter your location."
                            }
                        </Card.Text>
                        {/* <Card.Link>Resume</Card.Link> */}
                        <Card.Link onClick={() => setEditPersonalInfo(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Personal Info */}
                {editPersonalInfo && (
                    <Modal show={editPersonalInfo} onHide={() => setEditPersonalInfo(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Personal Info</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handlePersonalInfo}>
                                <InputField label="First Name" type="text" value={accountData.firstName}
                                    onChange={(e) => setaccountData({ ...accountData, firstName: e.target.value })}
                                    placeholder="Enter your first name..."
                                />
                                <InputField label="Last Name" type="text" value={accountData.lastName}
                                    onChange={(e) => setaccountData({ ...accountData, lastName: e.target.value })}
                                    placeholder="Enter your last name..."
                                />
                                <InputField label="Email" type="email" value={accountData.email}
                                    onChange={(e) => setaccountData({ ...accountData, email: e.target.value })}
                                    placeholder="Enter your email..."
                                />
                                <InputField label="Location" type="text" value={accountData.location}
                                    onChange={(e) => setaccountData({ ...accountData, location: e.target.value })}
                                    placeholder="Enter your City, State..."
                                />
                                <Button type="submit">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Summary */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Title>Summary</Card.Title>
                        <Card.Text>
                            {(accountData.summary)
                                ? `${accountData.summary}`
                                : "No summary yet."
                            }
                        </Card.Text>
                        <Card.Link onClick={() => setEditSummary(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Summary */}
                {editSummary && (
                    <Modal show={editSummary} onHide={() => setEditSummary(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Profile Summary</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSummary}>
                                <InputField label="Summary" type="text" value={accountData.summary}
                                    onChange={(e) => setaccountData({ ...accountData, summary: e.target.value })}
                                    placeholder="Enter 2-3 sentences about yourself..."
                                />
                                <Button type="submit">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Display Job Selections */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Title>Your Job Preferences</Card.Title>
                        <Card.Text>
                            {accountData.jobs.length > 0 ? (
                                accountData.jobs.map((job, index) => (
                                    <Badge key={index} className="badge-selected">
                                        {job}
                                    </Badge>
                                ))
                            ) : (
                                "No job selections yet"
                            )}
                        </Card.Text>
                        <Card.Link onClick={() => setEditjobs(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Job Selections Modal */}
                {editjobs && (
                    <Modal show={editjobs} onHide={() => setEditjobs(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Job Preferences</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handlejobs}>
                                <Container>
                                    {jobList.map((job, index) => (
                                        <Badge className={tempjobs.includes(job) ? "badge-selected" : "badge-unselected"} key={index} onClick={() => toggleBadge(job, "job")}>
                                            {job}
                                        </Badge>
                                    ))}
                                </Container>
                                <Button type="submit" className="mt-3">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Display Skill Selections */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Title>Your Skills</Card.Title>
                        <Card.Text>
                            {accountData.skills.length > 0 ? (
                                accountData.skills.map((skill, index) => (
                                    <Badge key={index} className="badge-selected">
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                "No skills yet"
                            )}
                        </Card.Text>
                        <Card.Link onClick={() => setEditSkills(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Skill Selections */}
                {editSkills && (
                    <Modal show={editSkills} onHide={() => setEditSkills(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Skills</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSkills}>
                                <Container>
                                    {skillList.map((skill, index) => (
                                        <Badge className={tempSkills.includes(skill) ? "badge-selected" : "badge-unselected"} key={index} onClick={() => toggleBadge(skill, "skill")}>
                                            {skill}
                                        </Badge>
                                    ))}
                                </Container>
                                <Button type="submit" className="mt-3">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Education */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Title>Education</Card.Title>
                        <Card.Text>
                            {(accountData.school)
                                ? `${accountData.school}`
                                : "School not selected."
                            }
                            <br />
                            {(accountData.degree)
                                ? `${accountData.degree}`
                                : "Degree not selected."
                            }
                            <br />
                            {(accountData.major)
                                ? `${accountData.major}`
                                : "Major not selected."
                            }
                            <br />
                            {(accountData.graduationDate)
                                ? `${accountData.graduationDate}`
                                : "Graduation date not selected."
                            }
                            <br />
                            {(accountData.gpa)
                                ? `${accountData.gpa}`
                                : "GPA not selected."
                            }
                        </Card.Text>
                        <Card.Link onClick={() => setEditEducation(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Education */}
                {editEducation && (
                    <Modal show={editEducation} onHide={() => setEditEducation(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Education</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleEducation}>
                                <InputField label="School" type="text" value={accountData.school}
                                    onChange={(e) => setaccountData({ ...accountData, school: e.target.value })}
                                    placeholder="Enter your school name..."
                                />
                                <InputField label="Degree Type" type="text" value={accountData.degree}
                                    onChange={(e) => setaccountData({ ...accountData, degree: e.target.value })}
                                    placeholder="Enter your degree type..."
                                />
                                <InputField label="Major/Field of Study" type="text" value={accountData.major}
                                    onChange={(e) => setaccountData({ ...accountData, major: e.target.value })}
                                    placeholder="Enter your major..."
                                />
                                <InputField label="Graduation Date" type="date" value={accountData.graduationDate}
                                    onChange={(e) => setaccountData({ ...accountData, graduationDate: e.target.value })}
                                    placeholder="Enter your graduation date: Month, Year..."
                                />
                                <InputField label="Cumulative GPA" type="text" value={accountData.gpa}
                                    onChange={(e) => setaccountData({ ...accountData, gpa: e.target.value })}
                                    placeholder="Enter your GPA..."
                                />
                                <Button type="submit">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Experience */}
                <Card className="mb-4">
                    <Card.Body className="text-start">
                        <Card.Title>Work Experience</Card.Title>
                        <Card.Text>
                            {(accountData.company)
                                ? `${accountData.company}`
                                : "Company not selected."
                            }
                            <br />
                            {(accountData.position)
                                ? `${accountData.position}`
                                : "Work position not selected."
                            }
                            <br />
                            {(accountData.companyLocation)
                                ? `${accountData.companyLocation}`
                                : "Company location not selected."
                            }
                            <br />
                            {(accountData.startDate)
                                ? `${accountData.startDate}`
                                : "Start date not selected."
                            }
                            <br />
                            {(accountData.responsibilities)
                                ? `${accountData.responsibilities}`
                                : "Work responsibilities not selected."
                            }
                        </Card.Text>
                        <Card.Link onClick={() => setEditExperience(true)}>
                            <FaPencilAlt className="account-icon" />
                        </Card.Link>
                    </Card.Body>
                </Card>

                {/* Edit Experience */}
                {editExperience && (
                    <Modal show={editExperience} onHide={() => setEditExperience(false)}>
                        <Modal.Header closeButton><Modal.Title>Edit Work Experience</Modal.Title></Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleExperience}>
                                <InputField label="Company" type="text" value={accountData.company}
                                    onChange={(e) => setaccountData({ ...accountData, company: e.target.value })}
                                    placeholder="Enter your company name..."
                                />
                                <InputField label="Job Position/Title" type="text" value={accountData.position}
                                    onChange={(e) => setaccountData({ ...accountData, position: e.target.value })}
                                    placeholder="Enter your work position/title..."
                                />
                                <InputField label="Company Location" type="text" value={accountData.companyLocation}
                                    onChange={(e) => setaccountData({ ...accountData, companyLocation: e.target.value })}
                                    placeholder="Enter your company location..."
                                />
                                <InputField label="Start Date" type="date" value={accountData.startDate}
                                    onChange={(e) => setaccountData({ ...accountData, startDate: e.target.value })}
                                    placeholder="Enter your start date: Month, Year..."
                                />
                                <InputField label="Work Responsibilities" type="text" value={accountData.responsibilities}
                                    onChange={(e) => setaccountData({ ...accountData, responsibilities: e.target.value })}
                                    placeholder="Enter your work responsibilities..."
                                />
                                <Button type="submit">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                )}


                {/* Possibly add a projects section */}
                {/* Possibly add a relevant courses section */}
                {/* Possibly add a language section */}

            </Container>
        </>
    );
};

export default Account;