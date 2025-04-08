import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, Modal, Badge } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import profile from "../assets/profile.png";
import InputField from './InputField';
import { jobList, skillList } from "../AccountOptions.js";
import "./Account.css";

const Account = () => {
    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [editSummary, setEditSummary] = useState(false);
    const [editjobs, setEditjobs] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);

    const [tempjobs, setTempjobs] = useState([]);
    const [tempSkills, setTempSkills] = useState([]);

    const [formData, setFormData] = useState({
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
            setTempjobs(formData.jobs);
        }
    }, [editjobs, formData.jobs]);

    useEffect(() => {
        if (editSkills) {
            setTempSkills(formData.skills);
        }
    }, [editSkills, formData.skills]);
    
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
        setEditPersonalInfo(false);
        // send data to backend
    }

    const handleSummary = async (e) => {
        e.preventDefault();
        setEditSummary(false);
        // send data to backend
    }

    const handlejobs = async (e) => {
        e.preventDefault();
        setFormData({ ...formData, jobs: tempjobs });
        setEditjobs(false);
        // send data to backend
    }

    const handleSkills = async (e) => {
        e.preventDefault();
        setFormData({ ...formData, skills: tempSkills });
        setEditSkills(false);
        // send data to backend
    }

    const handleEducation = async (e) => {
        e.preventDefault();
        setEditEducation(false);
        // send data to backend
    }

    const handleExperience = async (e) => {
        e.preventDefault();
        setEditExperience(false);
        // send data to backend
    }


    return (
        <Container className="account-container py-4">

            {/* Personal Information */}
            <Card className="mb-4">
                <Card.Body className="text-start">
                    <Card.Img src={profile} className="account-image mb-3" style={{ width: "50px", height: "50px" }} alt="Profile Image" />
                    <Card.Title>
                        {(formData.firstName || formData.lastName)
                            ? `${formData.firstName} ${formData.lastName}`
                            : "Please enter your name."
                        }
                    </Card.Title>
                    <Card.Text>
                        {(formData.email)
                            ? `${formData.email}`
                            : "Please enter your email."
                        }
                        <br />
                        {(formData.location)
                            ? `${formData.location}`
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
                            <InputField label="First Name" type="text" value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Enter your first name..."
                            />
                            <InputField label="Last Name" type="text" value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Enter your last name..."
                            />
                            <InputField label="Email" type="email" value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter your email..."
                            />
                            <InputField label="Location" type="text" value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                        {(formData.summary)
                            ? `${formData.summary}`
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
                            <InputField label="Summary" type="text" value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
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
                        {formData.jobs.length > 0 ? (
                            formData.jobs.map((job, index) => (
                                <Badge className="badge-selected">
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
                        {formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                                <Badge className="badge-selected">
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
                        {(formData.school)
                            ? `${formData.school}`
                            : "School not selected."
                        }
                        <br />
                        {(formData.degree)
                            ? `${formData.degree}`
                            : "Degree not selected."
                        }
                        <br />
                        {(formData.major)
                            ? `${formData.major}`
                            : "Major not selected."
                        }
                        <br />
                        {(formData.graduationDate)
                            ? `${formData.graduationDate}`
                            : "Graduation date not selected."
                        }
                        <br />
                        {(formData.gpa)
                            ? `${formData.gpa}`
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
                            <InputField label="School" type="text" value={formData.school}
                                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                placeholder="Enter your school name..."
                            />
                            <InputField label="Degree Type" type="text" value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                placeholder="Enter your degree type..."
                            />
                            <InputField label="Major/Field of Study" type="text" value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                placeholder="Enter your major..."
                            />
                            <InputField label="Graduation Date" type="text" value={formData.graduationDate}
                                onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                                placeholder="Enter your graduation date: Month, Year..."
                            />
                            <InputField label="Cumulative GPA" type="text" value={formData.gpa}
                                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
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
                        {(formData.company)
                            ? `${formData.company}`
                            : "Company not selected."
                        }
                        <br />
                        {(formData.position)
                            ? `${formData.position}`
                            : "Work position not selected."
                        }
                        <br />
                        {(formData.companyLocation)
                            ? `${formData.companyLocation}`
                            : "Company location not selected."
                        }
                        <br />
                        {(formData.startDate)
                            ? `${formData.startDate}`
                            : "Start date not selected."
                        }
                        <br />
                        {(formData.responsibilities)
                            ? `${formData.responsibilities}`
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
                            <InputField label="Company" type="text" value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Enter your company name..."
                            />
                            <InputField label="Job Position/Title" type="text" value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                placeholder="Enter your work position/title..."
                            />
                            <InputField label="Company Location" type="text" value={formData.companyLocation}
                                onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                                placeholder="Enter your company location..."
                            />
                            <InputField label="Start Date" type="text" value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                placeholder="Enter your start date: Month, Year..."
                            />
                            <InputField label="Work Responsibilities" type="text" value={formData.responsibilities}
                                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
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
    );
};

export default Account;