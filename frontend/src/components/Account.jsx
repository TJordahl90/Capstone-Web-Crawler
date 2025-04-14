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
    const [editPreferences, setEditPreferences] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);

    const [tempPreferences, setTempPreferences] = useState([]);
    const [tempSkills, setTempSkills] = useState([]);

    const [accountData, setaccountData] = useState({
        firstName: "",
        lastName: "",
        photo: null,
        resume: null,
        headline: "",
        pronouns: "",
        hometown: "",
        summary: "",
        preferences: [],
        skills: [],
        grade: "",
        institution: "",
        degree: "",
        major: "",
        minor: "",
        graduationDate: "",
        gpa: "",
        company: "",
        title: "",
        location: "",
        startDate: "",
        description: "",
    });

    const populateAccountData = (user, account, skills, preferences, education, experience) => {
        education = education || {};
        experience = experience || {};

        setaccountData({
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            photo: account.photo || null,
            resume: account.resume || null,
            headline: account.headline || "",
            pronouns: account.pronouns || "",
            hometown: account.hometown || "",
            summary: account.summary || "",
            skills: skills || [],
            preferences: preferences || [],
            grade: education.grade || "",
            institution: education.institution || "",
            degree: education.degree || "",
            major: education.major || "",
            minor: education.minor || "",
            graduationDate: education.graduationDate || "",
            gpa: education.gpa || "",
            company: experience.company || "",
            title: experience.title || "",
            location: experience.location || "",
            startDate: experience.startDate || "",
            description: experience.description || "",
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Store locally saved data to accountData
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedAccount = localStorage.getItem("account");
        const storedSkills = localStorage.getItem("skills");
        const storedPreferences = localStorage.getItem("preferences");
        const storedEducation = localStorage.getItem("education");
        const storedExperience = localStorage.getItem("experience");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            const account = JSON.parse(storedAccount);
            const skills = JSON.parse(storedSkills);
            const preferences = JSON.parse(storedPreferences);
            const education = JSON.parse(storedEducation);
            const experience = JSON.parse(storedExperience);
            populateAccountData(user, account, skills, preferences, education, experience);
        }
    }, []);

    useEffect(() => {
        if (editPreferences) {
            setTempPreferences(accountData.preferences);
        }
    }, [editPreferences, accountData.preferences]);

    useEffect(() => {
        if (editSkills) {
            setTempSkills(accountData.skills);
        }
    }, [editSkills, accountData.skills]);

    const toggleBadge = (item, type) => {
        if (type === "preference") {
            if (tempPreferences.includes(item)) {
                setTempPreferences(tempPreferences.filter((preference) => preference !== item));
            }
            else {
                setTempPreferences([...tempPreferences, item]);
            }
        }
        else if (type === "skill") {
            if (tempSkills.includes(item)) {
                setTempSkills(tempSkills.filter((skill) => skill !== item));
            }
            else {
                setTempSkills([...tempSkills, item]);
            }
        }
    };

    const handlePersonalInfo = (e) => {
        e.preventDefault();
        const data = {
            user: {
                first_name: accountData.firstName,
                last_name: accountData.lastName,
            },
            account: {
                photo: accountData.photo,
                resume: accountData.resume,
                headline: accountData.headline,
                pronouns: accountData.pronouns,
                hometown: accountData.hometown,
            },
        };
        handleSubmit(data);
        setEditPersonalInfo(false);
    }

    const handleSummary = (e) => {
        e.preventDefault();
        const data = { account: { summary: accountData.summary } };
        handleSubmit(data);
        setEditSummary(false);
    }

    const handlePreferences = (e) => {
        e.preventDefault();
        const data = { preferences: tempPreferences };
        handleSubmit(data);
        setEditPreferences(false);
    }

    const handleSkills = (e) => {
        e.preventDefault();
        const data = { skills: tempSkills };
        handleSubmit(data);
        setEditSkills(false);
    }

    const handleEducation = (e) => {
        e.preventDefault();
        const data = {
            education: {
                grade: accountData.grade,
                institution: accountData.institution,
                degree: accountData.degree,
                major: accountData.major,
                minor: accountData.minor,
                graduationDate: accountData.graduationDate,
                gpa: accountData.gpa,
            }
        };
        handleSubmit(data);
        setEditEducation(false);
    }

    const handleExperience = (e) => {
        e.preventDefault();
        const data = {
            experience: {
                company: accountData.company,
                title: accountData.title,
                location: accountData.location,
                startDate: accountData.startDate,
                description: accountData.description,
            }
        };
        handleSubmit(data);
        setEditExperience(false);
    }

    const handleSubmit = async (data) => {
        try {
            const response = await api.patch("/account/", data);
            setMessage("Account successfully updated!");

            const { skills, preferences, education, experience, ...otherAccountData } = response.data.account;
            localStorage.clear();
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("account", JSON.stringify(otherAccountData));
            localStorage.setItem("skills", JSON.stringify(skills));
            localStorage.setItem("preferences", JSON.stringify(preferences));
            localStorage.setItem("education", JSON.stringify(education));
            localStorage.setItem("experience", JSON.stringify(experience));
            populateAccountData(response.data.user, otherAccountData, skills, preferences, education, experience);
        }
        catch (err) {
            setError("Error updating account.");
            console.error(err);
        }

        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    }


    return (
        <>
            <Container className="account-container">
                <div className="account-content">
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
                                {(accountData.headline)
                                    ? `${accountData.headline}`
                                    : "Please enter your headline."
                                }
                                <br />
                                {(accountData.pronouns)
                                    ? `${accountData.pronouns}`
                                    : "Please enter your pronouns."
                                }
                                <br />
                                {(accountData.hometown)
                                    ? `${accountData.hometown}`
                                    : "Please enter your location."
                                }
                                <br />
                                {/* <Card.Link>Resume</Card.Link> */}
                            </Card.Text>
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
                                    <InputField label="Headline" type="text" value={accountData.headline}
                                        onChange={(e) => setaccountData({ ...accountData, headline: e.target.value })}
                                        placeholder="Enter your headline..."
                                    />
                                    <InputField label="Pronouns" type="text" value={accountData.pronouns}
                                        onChange={(e) => setaccountData({ ...accountData, pronouns: e.target.value })}
                                        placeholder="Enter your pronouns..."
                                    />
                                    <InputField label="Location" type="text" value={accountData.hometown}
                                        onChange={(e) => setaccountData({ ...accountData, hometown: e.target.value })}
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

                    {/* Display Job Preference Selections */}
                    <Card className="mb-4">
                        <Card.Body className="text-start">
                            <Card.Title>Your Job Preferences</Card.Title>
                            <Card.Text>
                                {accountData.preferences.length > 0 ? (
                                    accountData.preferences.map((preference, index) => (
                                        <Badge key={index} className="badge-selected">
                                            {preference.name}
                                        </Badge>
                                    ))
                                ) : (
                                    "No job preferences yet"
                                )}
                            </Card.Text>
                            <Card.Link onClick={() => setEditPreferences(true)}>
                                <FaPencilAlt className="account-icon" />
                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Job Preference Selections */}
                    {editPreferences && (
                        <Modal show={editPreferences} onHide={() => setEditPreferences(false)}>
                            <Modal.Header closeButton><Modal.Title>Edit Job Preferences</Modal.Title></Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handlePreferences}>
                                    <Container>
                                        {jobList.map((preference, index) => (
                                            <Badge className={tempPreferences.includes(preference) ? "badge-selected" : "badge-unselected"} key={index} onClick={() => toggleBadge(preference, "preference")}>
                                                {preference}
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
                                            {skill.name}
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
                                {(accountData.grade)
                                    ? `${accountData.grade}`
                                    : "Class not selected."
                                }
                                <br />
                                {(accountData.institution)
                                    ? `${accountData.institution}`
                                    : "Institution not selected."
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
                                {(accountData.minor)
                                    ? `${accountData.minor}`
                                    : "Minor not selected."
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
                                    <InputField label="Class" type="text" value={accountData.grade}
                                        onChange={(e) => setaccountData({ ...accountData, grade: e.target.value })}
                                        placeholder="Enter your class (senior, freshman, etc)..."
                                    />
                                    <InputField label="Institution" type="text" value={accountData.institution}
                                        onChange={(e) => setaccountData({ ...accountData, institution: e.target.value })}
                                        placeholder="Enter your institution name..."
                                    />
                                    <InputField label="Degree Type" type="text" value={accountData.degree}
                                        onChange={(e) => setaccountData({ ...accountData, degree: e.target.value })}
                                        placeholder="Enter your degree type..."
                                    />
                                    <InputField label="Major Field of Study" type="text" value={accountData.major}
                                        onChange={(e) => setaccountData({ ...accountData, major: e.target.value })}
                                        placeholder="Enter your major..."
                                    />
                                    <InputField label="Minor Field of Study" type="text" value={accountData.minor}
                                        onChange={(e) => setaccountData({ ...accountData, minor: e.target.value })}
                                        placeholder="Enter your minor..."
                                    />
                                    <InputField label="Graduation Date" type="date" value={accountData.graduationDate}
                                        onChange={(e) => setaccountData({ ...accountData, graduationDate: e.target.value })}
                                        placeholder="Enter your graduation date..."
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
                                {(accountData.title)
                                    ? `${accountData.title}`
                                    : "Work title not selected."
                                }
                                <br />
                                {(accountData.location)
                                    ? `${accountData.location}`
                                    : "Company location not selected."
                                }
                                <br />
                                {(accountData.startDate)
                                    ? `${accountData.startDate}`
                                    : "Start date not selected."
                                }
                                <br />
                                {(accountData.description)
                                    ? `${accountData.description}`
                                    : "Work description not selected."
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
                                    <InputField label="Job title/Title" type="text" value={accountData.title}
                                        onChange={(e) => setaccountData({ ...accountData, title: e.target.value })}
                                        placeholder="Enter your work title/title..."
                                    />
                                    <InputField label="Company Location" type="text" value={accountData.location}
                                        onChange={(e) => setaccountData({ ...accountData, location: e.target.value })}
                                        placeholder="Enter your company location..."
                                    />
                                    <InputField label="Start Date" type="date" value={accountData.startDate}
                                        onChange={(e) => setaccountData({ ...accountData, startDate: e.target.value })}
                                        placeholder="Enter your start date: Month, Year..."
                                    />
                                    <InputField label="Work description" type="text" value={accountData.description}
                                        onChange={(e) => setaccountData({ ...accountData, description: e.target.value })}
                                        placeholder="Enter your work description..."
                                    />
                                    <Button type="submit">Submit</Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}


                    {/* Possibly add a projects section */}
                    {/* Possibly add a relevant courses section */}
                    {/* Possibly add a language section */}
                </div>
            </Container>
        </>
    );
};

export default Account;