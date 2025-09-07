import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, Modal, Badge, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import profile from "../assets/profile.png";
import InputField from './InputField';
import api from '../api.js';
//import "./Account.css";

const Account = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [editSummary, setEditSummary] = useState(false);
    const [editPreferences, setEditPreferences] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);

    const [tempPreferencesText, setTempPreferencesText] = useState('');
    const [tempSkillsText, setTempSkillsText] = useState('');

    const [accountData, setaccountData] = useState({
        firstName: "",
        lastName: "",
        resume: null,
        headline: "",
        hometown: "",
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
            resume: account.resume || null,
            headline: account.headline || "",
            hometown: account.hometown || "",
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
            const preferencesStr = accountData.preferences
                .map(p => cleanName(p.name || p))
                .join(", ");
            setTempPreferencesText(preferencesStr);
        }
    }, [editPreferences, accountData.preferences]);

    useEffect(() => {
        if (editSkills) {
            const skillsStr = accountData.skills
                .map(s => cleanName(s.name || s))
                .join(", ");
            setTempSkillsText(skillsStr);
        }
    }, [editSkills, accountData.skills]);

    const handlePersonalInfo = (e) => {
        e.preventDefault();
        const data = {
            user: {
                first_name: accountData.firstName,
                last_name: accountData.lastName,
            },
            account: {
                resume: accountData.resume,
                headline: accountData.headline,
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
        const preferencesArray = tempPreferencesText
            .split(',')
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 0);

        const data = { preferences: preferencesArray };
        handleSubmit(data);
        setEditPreferences(false);
    }

    const handleSkills = (e) => {
        e.preventDefault();
        const skillsArray = tempSkillsText
            .split(',')
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 0);

        const data = { skills: skillsArray };
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

    const cleanName = (value) => {
        try {
            if (typeof value === "string" && value.includes("{")) {
                const parsed = JSON.parse(value.replace(/'/g, '"'));
                return parsed.name || value;
            }
            return value;
        } catch {
            return value;
        }
    };

    return (
        <>
            <Container
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    minHeight: "100vh",
                    padding: "20px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <div
                    style={{
                        overflowY: "auto"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            paddingBottom: "1rem" // equivalent to Bootstrap's pb-3
                        }}
                    >
                        <button
                            onClick={() => navigate("/find-jobs")}
                            style={{
                                backgroundColor: "rgba(0, 173, 181, 0.3)", // translucent teal
                                color: "var(--badgetxt)",
                                border: "2px solid var(--border)",
                                borderRadius: "8px",
                                padding: "8px 16px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                backdropFilter: "blur(6px)",
                                WebkitBackdropFilter: "blur(6px)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#00ADB5";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(0, 173, 181, 0.3)";
                                e.currentTarget.style.color = "var(--badgetxt)";
                            }}
                        >
                            ← Back to Jobs
                        </button>

                    </div>

                    {/* Alert Messages */}
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Personal Information */}
                    <Card
                        className="mb-4"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                            WebkitBackdropFilter: "blur(10px)",
                            color: "var(--text3)",
                            border: "2px solid var(--border)",
                            borderRadius: "12px"
                        }}
                    >
                        <Card.Body className="text-start">
                            <Card.Img
                                src={profile}
                                className="account-image"
                                alt="Profile Image"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid var(--text)",
                                    marginBottom: "1rem"
                                }}
                            />
                            <Card.Title  style={{ color: "#05e3ed" }}>
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
                                {(accountData.hometown)
                                    ? `${accountData.hometown}`
                                    : "Please enter your location."
                                }
                                <br />
                                {/* <Card.Link>Resume</Card.Link> */}
                            </Card.Text>
                            <Card.Link onClick={() => setEditPersonalInfo(true)}>
                                <FaPencilAlt
                                    className="account-icon"
                                    style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        cursor: "pointer",
                                        fontSize: "1.25rem",
                                        color: "var(--pen)",
                                    }}
                                />

                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Personal Info */}
                    {editPersonalInfo && (
                        <Modal show={editPersonalInfo} onHide={() => setEditPersonalInfo(false)}>
                            <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Personal Info</Modal.Title></Modal.Header>
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
                                    <InputField label="Location" type="text" value={accountData.hometown}
                                        onChange={(e) => setaccountData({ ...accountData, hometown: e.target.value })}
                                        placeholder="Enter your City, State..."
                                    />
                                    <Button
                                        type="submit"
                                        style={{
                                            backgroundColor: isHovered ? "var(--hover3)" : "var(--button3)",
                                            border: "none",
                                            color: "var(--submittxt)",
                                            padding: "10px 20px",
                                            marginTop: "10px",
                                            borderRadius: "8px",
                                            fontWeight: "bold"
                                        }}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}


                    {/* Display Job Preference Selections */}
                    <Card
                        className="mb-4"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                            WebkitBackdropFilter: "blur(10px)",
                            color: "var(--text3)",
                            border: "2px solid var(--border)",
                            borderRadius: "12px"
                        }}
                    >
                        <Card.Body className="text-start">
                            <Card.Title  style={{ color: "#05e3ed" }}>Your Job Preferences</Card.Title>
                            <Card.Text>
                                {accountData.preferences.length > 0 ? (
                                    accountData.preferences.map((preference, index) => (
                                        <Badge
                                            key={index}
                                            className=""
                                            style={{
                                                margin: "5px",
                                                cursor: "pointer",
                                                fontSize: "1rem",
                                                color: "var(--badgetxt)",
                                                backgroundColor: "var(--badgebg)",
                                            }}
                                        >
                                            {cleanName(preference.name || preference)}
                                        </Badge>
                                    ))
                                ) : (
                                    "No job preferences yet"
                                )}
                            </Card.Text>
                            <Card.Link onClick={() => setEditPreferences(true)}>
                                <FaPencilAlt
                                    className="account-icon"
                                    style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        cursor: "pointer",
                                        fontSize: "1.25rem",
                                        color: "var(--pen)",
                                    }}
                                />
                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Job Preference Selections */}
                    {editPreferences && (
                        <Modal show={editPreferences} onHide={() => setEditPreferences(false)}>
                            <Modal.Header closeButton><Modal.Title  style={{ color: "#05e3ed" }}>Edit Job Preferences</Modal.Title></Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handlePreferences}>
                                    <InputField label="Job Preferences" type="text" value={tempPreferencesText}
                                        onChange={(e) => setTempPreferencesText(e.target.value)}
                                        placeholder="e.g. Part-Time, Software Engineer, Data Analyst"
                                    />
                                    <small className="text-muted">
                                        Enter preferences as comma-separated values (e.g. Part-Time, Software Engineer, Data Analyst)
                                    </small>
                                    <div className="mt-3">
                                        <Button
                                            type="submit"
                                            style={{
                                                backgroundColor: isHovered ? "var(--hover3)" : "var(--button3)",
                                                border: "none",
                                                color: "var(--submittxt)",
                                                padding: "10px 20px",
                                                marginTop: "10px",
                                                borderRadius: "8px",
                                                fontWeight: "bold"
                                            }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}

                    {/* Display Skill Selections */}
                    <Card
                        className="mb-4"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                            WebkitBackdropFilter: "blur(10px)",
                            color: "var(--text3)",
                            border: "2px solid var(--border)",
                            borderRadius: "12px"
                        }}
                    >
                        <Card.Body className="text-start">
                            <Card.Title style={{ color: "#05e3ed" }}>Your Skills</Card.Title>
                            <Card.Text>
                                {accountData.skills.length > 0 ? (
                                    accountData.skills.map((skill, index) => (
                                        <Badge
                                            key={index}
                                            className="badge-selected"
                                            style={{
                                                margin: "5px",
                                                cursor: "pointer",
                                                fontSize: "1rem",
                                                color: "var(--badgetxt)",
                                                backgroundColor: "var(--badgebg)",
                                            }}
                                        >
                                            {cleanName(skill.name || skill)}
                                        </Badge>
                                    ))
                                ) : (
                                    "No skills yet"
                                )}
                            </Card.Text>
                            <Card.Link onClick={() => setEditSkills(true)}>
                                <FaPencilAlt
                                    className="account-icon"
                                    style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        cursor: "pointer",
                                        fontSize: "1.25rem",
                                        color: "var(--pen)",
                                    }}
                                />
                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Skill Selections */}
                    {editSkills && (
                        <Modal show={editSkills} onHide={() => setEditSkills(false)}>
                            <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Skills</Modal.Title></Modal.Header>
                            <Modal.Body>
                                <Form onSubmit={handleSkills}>
                                    <InputField label="Skills" type="text" value={tempSkillsText}
                                        onChange={(e) => setTempSkillsText(e.target.value)}
                                        placeholder="e.g. Python, JavaScript, SQL, OOP"
                                    />
                                    <small className="text-muted">
                                        Enter preferences as comma-separated values (e.g. Python, JavaScript, SQL, OOP)
                                    </small>
                                    <div className="mt-3">
                                        <Button
                                            type="submit"
                                            style={{
                                                backgroundColor: isHovered ? "var(--hover3)" : "var(--button3)",
                                                border: "none",
                                                color: "var(--submittxt)",
                                                padding: "10px 20px",
                                                marginTop: "10px",
                                                borderRadius: "8px",
                                                fontWeight: "bold"
                                            }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}

                    {/* Education */}
                    <Card
                        className="mb-4"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                            WebkitBackdropFilter: "blur(10px)",
                            color: "var(--text3)",
                            border: "2px solid var(--border)",
                            borderRadius: "12px"
                        }}
                    >
                        <Card.Body className="text-start">
                            <Card.Title style={{ color: "#05e3ed" }}>Education</Card.Title>
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
                                <FaPencilAlt
                                    className="account-icon"
                                    style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        cursor: "pointer",
                                        fontSize: "1.25rem",
                                        color: "var(--pen)",
                                    }}
                                />
                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Education */}
                    {editEducation && (
                        <Modal show={editEducation} onHide={() => setEditEducation(false)}>
                            <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Education</Modal.Title></Modal.Header>
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
                                    <Button
                                        type="submit"
                                        style={{
                                            backgroundColor: isHovered ? "var(--hover3)" : "var(--button3)",
                                            border: "none",
                                            color: "var(--submittxt)",
                                            padding: "10px 20px",
                                            marginTop: "10px",
                                            borderRadius: "8px",
                                            fontWeight: "bold"
                                        }}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}

                    {/* Experience */}
                    <Card
                        className="mb-4"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // more translucent
                            backdropFilter: "blur(10px)",                // adds frosted-glass effect
                            WebkitBackdropFilter: "blur(10px)",
                            color: "var(--text3)",
                            border: "2px solid var(--border)",
                            borderRadius: "12px"
                        }}
                    >
                        <Card.Body className="text-start">
                            <Card.Title style={{ color: "#05e3ed" }}>Work Experience</Card.Title>
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
                                <FaPencilAlt
                                    className="account-icon"
                                    style={{
                                        position: "absolute",
                                        top: "15px",
                                        right: "15px",
                                        cursor: "pointer",
                                        fontSize: "1.25rem",
                                        color: "var(--pen)",
                                    }}
                                />
                            </Card.Link>
                        </Card.Body>
                    </Card>

                    {/* Edit Experience */}
                    {editExperience && (
                        <Modal show={editExperience} onHide={() => setEditExperience(false)}>
                            <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Work Experience</Modal.Title></Modal.Header>
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
                                    <Button
                                        type="submit"
                                        style={{
                                            backgroundColor: isHovered ? "var(--hover3)" : "var(--button3)",
                                            border: "none",
                                            color: "var(--submittxt)",
                                            padding: "10px 20px",
                                            marginTop: "10px",
                                            borderRadius: "8px",
                                            fontWeight: "bold"
                                        }}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        Submit
                                    </Button>
                                </Form>
                            </Modal.Body>
                        </Modal>
                    )}
                </div>
            </Container>
        </>
    );
};

export default Account;