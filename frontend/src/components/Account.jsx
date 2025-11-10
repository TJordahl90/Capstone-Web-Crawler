import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Form, Modal, Badge, Alert, Col, Row, Image, Dropdown } from "react-bootstrap";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import profile from "../assets/profile.png";
import InputField from './InputField';
import api from '../api.js';
import { useTheme } from "./ThemeContext";

const Account = () => {
    // Displays messages to user
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Shows & hides the editing modals
    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [editPreferences, setEditPreferences] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editCareers, setEditCareers] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);

    // Keyword options that are directly from database
    const [skillKeywordList, setSkillKeywordList] = useState([]);
    const [careerKeywordList, setCareerKeywordList] = useState([]);
    const [expLevelKeywordList, setExpLevelKeywordList] = useState([]);
    const [employTypeKeywordList, setEmployTypeKeywordList] = useState([]);
    const [workModelKeywordList, setWorkModelKeywordList] = useState([]);

    // Selected options for preferences, skills, careers
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCareers, setSelectedCareers] = useState([]);
    const [selectedExpLevels, setSelectedExpLevels] = useState([]);
    const [selectedEmployTypes, setSelectedEmployTypes] = useState([]);
    const [selectedWorkModels, setSelectedWorkModels] = useState([]);

    // Selected options for education/experience
    const [currentEducation, setCurrentEducation] = useState(null);
    const [currentExperience, setCurrentExperience] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Misc. states
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Data that will be saved
    const [accountData, setAccountData] = useState({
        firstName: "",
        lastName: "",
        headline: "",
        hometown: "",
        careers: [],
        skills: [],
        experienceLevels: [],
        employmentTypes: [],
        workModels: [],
        education: [],
        experience: []
    });

    // Theme
    const { currentTheme, switchTheme } = useTheme();

    // -------------------------------------------------------------
    // fetch all the keywords from database to limit user selections
    useEffect(() => {
        const fetchDatabaseKeywords = async () => {
            try {
                const response = await api.get("/keywords/");
                const { skills, careers, employmentTypes, experienceLevels, workModels } = response.data;
                setSkillKeywordList(skills);
                setCareerKeywordList(careers);
                setExpLevelKeywordList(experienceLevels);
                setEmployTypeKeywordList(employmentTypes);
                setWorkModelKeywordList(workModels)
            } catch (err) {
                setError("Error retrieving account keywords.");
            }
        };
        fetchDatabaseKeywords();
    }, [])

    // ----------------------------
    // fetches all the account data
    const fetchAccountData = useCallback(async () => {
        try {
            const response = await api.get("/account/");
            const { user, account } = response.data;
            setAccountData({
                firstName: user.first_name || "",
                lastName: user.last_name || "",
                headline: account.headline || "",
                hometown: account.hometown || "",
                careers: account.careers || [],
                skills: account.skills || [],
                experienceLevels: account.experienceLevels || [],
                employmentTypes: account.employmentTypes || [],
                workModels: account.workModels || [],
                education: account.education || [],
                experience: account.experience || [],
            });
            setHasUnsavedChanges(false);
        } catch (err) {
            setError("Error retrieving account.");
        }
    }, []);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    //----------------------------------
    // saves all changes to account data
    const handleSaveAllChanges = async () => {
        const cleanData = (items) => items.map(({ id, ...rest }) => (typeof id === 'number' ? { id, ...rest } : rest));

        const payload = {
            name: {
                first_name: accountData.firstName,
                last_name: accountData.lastName,
            },
            personal: {
                headline: accountData.headline,
                hometown: accountData.hometown,
            },
            skills: accountData.skills,
            careers: accountData.careers,
            employmentTypes: accountData.employmentTypes,
            experienceLevels: accountData.experienceLevels,
            workModels: accountData.workModels,
            education: cleanData(accountData.education),
            experience: cleanData(accountData.experience),
        };

        try {
            await api.patch("/account/", payload);
            setMessage("Account updated successfully!");
            fetchAccountData(); // Refresh data from server
        } catch (err) {
            setError("Failed to save changes.");
        }
    };

    // -----------------------------------------------------
    // helper functions for preferences, skills, and careers
    const skillsFiltered = skillKeywordList.filter(
        (skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedSkills.includes(skill)
    );

    const careersFiltered = careerKeywordList.filter(
        (career) => career.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedCareers.includes(career)
    );

    const addKeyword = (keyword, type) => {
        if (type === "skill") setSelectedSkills((prev) => [...prev, keyword]);
        if (type === "career") setSelectedCareers((prev) => [...prev, keyword]);
        setSearchQuery("");
    };

    const removeKeyword = (keyword, type) => {
        if (type === "skill") setSelectedSkills((prev) => prev.filter((s) => s !== keyword));
        if (type === "career") setSelectedCareers((prev) => prev.filter((c) => c !== keyword));
    };

    const togglePreference = (item, selectedList, setSelectedList) => {
        if (selectedList.includes(item)) {
            setSelectedList(selectedList.filter(i => i !== item));
        } else {
            setSelectedList([...selectedList, item]);
        }
    };

    //------------------------------------------------------------
    // needed to check the preference boxes of existing selections
    useEffect(() => {
        if (editPreferences) {
            setSelectedExpLevels(accountData.experienceLevels || []);
            setSelectedEmployTypes(accountData.employmentTypes || []);
            setSelectedWorkModels(accountData.workModels || []);
        }
    }, [editPreferences, accountData]);

    // ----------------------------------------------------------
    // helper functions for handling preferences, skills, careers
    const handlePersonalInfo = (e) => {
        e.preventDefault();
        setEditPersonalInfo(false);
        setHasUnsavedChanges(true);
    };

    const handlePreferences = (e) => {
        e.preventDefault();
        setAccountData(prev => ({ ...prev, experienceLevels: selectedExpLevels, employmentTypes: selectedEmployTypes, workModels: selectedWorkModels }));
        setEditPreferences(false);
        setHasUnsavedChanges(true);
    };

    const handleSkills = (e) => {
        e.preventDefault();
        setAccountData(prev => ({ ...prev, skills: selectedSkills }));
        setEditSkills(false);
        setHasUnsavedChanges(true);
    };

    const handleCareers = (e) => {
        e.preventDefault();
        setAccountData(prev => ({ ...prev, careers: selectedCareers }));
        setEditCareers(false);
        setHasUnsavedChanges(true);
    };

    // ----------------------------------------------------------
    // helper functions for handling experiences and educations
    const handleAddEducation = () => {
        setIsEditing(false);
        setCurrentEducation({ institution: "", degree: "", major: "", minor: "", graduationDate: "", gpa: "" });
        setEditEducation(true);
    };

    const handleEditEducation = (edu) => {
        setIsEditing(true);
        setCurrentEducation({ ...edu });
        setEditEducation(true);
    };

    const handleDeleteEducation = (id) => {
        if (window.confirm("Delete this education entry?")) {
            setAccountData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
            setHasUnsavedChanges(true);
        }
    };

    const handleEducationSubmit = (e) => {
        e.preventDefault();
        setAccountData(prev => {
            const updatedList = isEditing
                ? prev.education.map(edu => edu.id === currentEducation.id ? currentEducation : edu)
                : [...prev.education, { ...currentEducation, id: `temp_${Date.now()}` }];
            return { ...prev, education: updatedList };
        });
        setEditEducation(false);
        setHasUnsavedChanges(true);
    };

    const handleAddExperience = () => {
        setIsEditing(false);
        setCurrentExperience({ company: "", title: "", startDate: "", endDate: "", description: "" });
        setEditExperience(true);
    };

    const handleEditExperience = (exp) => {
        setIsEditing(true);
        setCurrentExperience({ ...exp });
        setEditExperience(true);
    };

    const handleDeleteExperience = (id) => {
        if (window.confirm("Delete this experience entry?")) {
            setAccountData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
            setHasUnsavedChanges(true);
        }
    };

    const handleExperienceSubmit = (e) => {
        e.preventDefault();
        setAccountData(prev => {
            const updatedList = isEditing
                ? prev.experience.map(exp => exp.id === currentExperience.id ? currentExperience : exp)
                : [...prev.experience, { ...currentExperience, id: `temp_${Date.now()}` }];
            return { ...prev, experience: updatedList };
        });
        setEditExperience(false);
        setHasUnsavedChanges(true);
    };

    const headerStyle = {
        fontWeight: 600,
        fontSize: "1.5rem",
    }

    const chipStyle = {
        backgroundColor: "var(--accent3)",
        padding: "5px 10px",
        borderRadius: "5px",
        color: "var(--text)",
        fontSize: "1.1rem",
        fontWeight: 600,
    };

    const iconStyle = {
        cursor: "pointer",
        fontSize: "1.25rem",
        color: "var(--text)",
        flexShrink: 0,
        marginLeft: '1rem',
    }

    return (
        <>
            <Container fluid className="py-4" style={{ minHeight: "100vh", color: "var(--text)" }}>
                <Row className="justify-content-center">
                    <Col md={10} lg={9}>

                        {/* Error Messages */}
                        {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
                        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                        {/* Personal Data Section */}
                        <div className="text-start p-4 mb-4" style={{ backgroundColor: "var(--card)", borderRadius: "12px", border: `1px solid var(--accent1)`, borderLeft: `4px solid var(--accent1)` }}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <Image src={profile} roundedCircle alt="Profile" style={{ width: "80px", height: "80px", border: "2px solid var(--text)" }} />
                                    <h2 className="mt-3" style={{ color: "var(--accent1)", fontWeight: 600, fontSize: "2.2rem" }}>{`${accountData.firstName} ${accountData.lastName}`}</h2>
                                    <p className="lead">{accountData.headline}</p>
                                    <p className="lead">{accountData.hometown}</p>
                                </div>
                                <FaPencilAlt onClick={() => setEditPersonalInfo(true)} style={iconStyle} />
                            </div>
                        </div>

                        {/* Display / Theme Section */}
                        <div
                            className="text-start p-4 mb-4"
                            style={{
                                backgroundColor: "var(--card)",
                                borderRadius: "12px",
                                border: `1px solid var(--accent1)`,
                                borderLeft: `4px solid var(--accent1)`
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 style={{ fontWeight: 600, fontSize: "1.5rem" }}>Display</h5>

                                {/* Toggle style: switch OR two buttons — pick one */}

                                {/* (1) Switch style */}
                                <Form.Check
                                    type="switch"
                                    id="theme-switch"
                                    label={currentTheme === "dark" ? "Dark Mode" : "Light Mode"}
                                    checked={currentTheme === "dark"}
                                    onChange={(e) => switchTheme(e.target.checked ? "dark" : "light")}
                                    style={{ fontWeight: 600 }}
                                />

                                {/* (2) Or Buttons style (comment the switch above if you prefer this) */}
                                {false && (
                                    <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor: currentTheme === "light" ? "var(--accent1)" : "transparent",
                                                color: currentTheme === "light" ? "var(--text)" : "var(--text)",
                                                border: "1px solid var(--accent1)"
                                            }}
                                            onClick={() => switchTheme("light")}
                                        >
                                            Light
                                        </Button>
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor: currentTheme === "dark" ? "var(--accent1)" : "transparent",
                                                color: currentTheme === "dark" ? "var(--text)" : "var(--text)",
                                                border: "1px solid var(--accent1)"
                                            }}
                                            onClick={() => switchTheme("dark")}
                                        >
                                            Dark
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="p-4" style={{ backgroundColor: "var(--card)", borderRadius: "12px", border: `1px solid var(--accent1)`, borderLeft: `4px solid var(--accent1)` }}>

                            {/* Preferences (experience level, employment type, work models) */}
                            <Row className="py-4">
                                <Col xs={12} md={3}>
                                    <h5 style={headerStyle}>Job Preferences</h5>
                                </Col>
                                <Col xs={12} md={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {accountData.experienceLevels.length > 0 && accountData.experienceLevels.map((exp) => (
                                                <span style={chipStyle}>{exp}</span>
                                            ))}
                                            {accountData.employmentTypes.length > 0 && accountData.employmentTypes.map((emp) => (
                                                <span style={chipStyle}>{emp}</span>
                                            ))}
                                            {accountData.workModels.length > 0 && accountData.workModels.map((work) => (
                                                <span style={chipStyle}>{work}</span>
                                            ))}
                                            {accountData.experienceLevels.length === 0 &&
                                                accountData.employmentTypes.length === 0 &&
                                                accountData.workModels.length === 0 && (
                                                    <span>No preferences selected yet.</span>
                                                )}
                                        </div>
                                        <FaPencilAlt style={iconStyle} onClick={() => { setEditPreferences(true); }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr />


                            {/* Careers Section */}
                            <Row className="py-4">
                                <Col xs={12} md={3}>
                                    <h5 style={headerStyle}>Career Fields</h5>
                                </Col>
                                <Col xs={12} md={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {accountData.careers.length > 0 ? accountData.careers.map((career) => (
                                                <span style={chipStyle}>{career}</span>
                                            )) : "No career fields selected yet."}
                                        </div>
                                        <FaPencilAlt
                                            style={iconStyle}
                                            onClick={() => {
                                                setSelectedCareers(accountData.careers);
                                                setEditCareers(true);
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <hr />

                            {/* Skills Section */}
                            <Row className="py-4">
                                <Col xs={12} md={3}>
                                    <h5 style={headerStyle}>Technical Skills</h5>
                                </Col>
                                <Col xs={12} md={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {accountData.skills.length > 0 ? accountData.skills.map((skill) => (
                                                <span style={chipStyle}>{skill}</span>
                                            )) : "No skills selected yet."}
                                        </div>
                                        <FaPencilAlt
                                            style={iconStyle}
                                            onClick={() => {
                                                setSelectedSkills(accountData.skills);
                                                setEditSkills(true);
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <hr />

                            {/* Education Section */}
                            <Row className="py-4">
                                <Col xs={12} md={3}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 style={headerStyle}>Education</h5>
                                        <FaPlus onClick={handleAddEducation} style={iconStyle} />
                                    </div>
                                </Col>
                                <Col xs={12} md={9} className="mt-3 mt-md-0">
                                    {accountData.education.map(edu => (
                                        <div key={edu.id} className="d-flex justify-content-between align-items-start mb-3">
                                            <div style={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                                <strong>{edu.institution}</strong><br />
                                                {edu.degree}, {edu.major}<br />
                                                <small>Graduated: {edu.graduationDate} | GPA: {edu.gpa}</small>
                                            </div>
                                            <div>
                                                <FaTrash onClick={() => handleDeleteEducation(edu.id)} className="me-3" style={iconStyle} />
                                                <FaPencilAlt onClick={() => handleEditEducation(edu)} style={iconStyle} />
                                            </div>
                                        </div>
                                    ))}
                                    {accountData.education.length === 0 && <p style={{ color: "var(--text3)" }}>No education information provided.</p>}
                                </Col>
                            </Row>
                            <hr />

                            {/* Experience Section */}
                            <Row className="py-4">
                                <Col xs={12} md={3}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 style={headerStyle}>Experience</h5>
                                        <FaPlus onClick={handleAddExperience} style={iconStyle} />
                                    </div>
                                </Col>
                                <Col xs={12} md={9} className="mt-3 mt-md-0">
                                    {accountData.experience.map(exp => (
                                        <div key={exp.id} className="d-flex justify-content-between align-items-start mb-3">
                                            <div style={{ fontWeight: 500, fontSize: "1.2rem" }}>
                                                <strong>{exp.title}</strong> at {exp.company}<br />
                                                <small>{exp.startDate} to {exp.endDate || 'Present'}</small><br />
                                                <p className="mt-2 mb-0">{exp.description}</p>
                                            </div>
                                            <div>
                                                <FaTrash onClick={() => handleDeleteExperience(exp.id)} className="me-3" style={iconStyle} />
                                                <FaPencilAlt onClick={() => handleEditExperience(exp)} style={iconStyle} />
                                            </div>
                                        </div>
                                    ))}
                                    {accountData.experience.length === 0 && <p style={{ color: "var(--text3)" }}>No work experience provided.</p>}
                                </Col>
                            </Row>
                        </div>

                        {hasUnsavedChanges && (
                            <div className="mt-4 p-3 text-end" style={{ display: "inline-block", }}>
                                <Button style={{ backgroundColor: "var(--accent1)", border: "none" }} className="me-2" onClick={fetchAccountData}>Discard Changes</Button>
                                <Button style={{ backgroundColor: "var(--accent1)", border: "none" }} onClick={handleSaveAllChanges}>Save All Changes</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* ----------------------------------------------------------------------------- */}
            {/* The modals below are for editing user selections */}
            {/* ----------------------------------------------------------------------------- */}
            {editPersonalInfo && <Modal show={editPersonalInfo} onHide={() => setEditPersonalInfo(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Personal Info</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePersonalInfo}>
                        <InputField label="First Name" value={accountData.firstName} onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })} />
                        <InputField label="Last Name" value={accountData.lastName} onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })} />
                        <InputField label="Headline" value={accountData.headline} onChange={(e) => setAccountData({ ...accountData, headline: e.target.value })} />
                        <InputField label="Hometown" value={accountData.hometown} onChange={(e) => setAccountData({ ...accountData, hometown: e.target.value })} />
                        <Button type="submit" className="mt-3">Done</Button>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editPreferences && <Modal show={editPreferences} onHide={() => setEditPreferences(false)}>
                <Modal.Header closeButton><Modal.Title>Edit Job Preferences</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePreferences}>
                        <h6>Experience Level</h6>
                        {expLevelKeywordList.map((exp) => (
                            <Form.Check
                                key={exp} type="checkbox" label={exp} checked={selectedExpLevels.includes(exp)}
                                onChange={() => { togglePreference(exp, selectedExpLevels, setSelectedExpLevels) }}
                                className="mb-1"
                            />
                        ))}
                        <h6>Employment Type</h6>
                        {employTypeKeywordList.map((emp) => (
                            <Form.Check
                                key={emp} type="checkbox" label={emp} checked={selectedEmployTypes.includes(emp)}
                                onChange={() => { togglePreference(emp, selectedEmployTypes, setSelectedEmployTypes) }}
                                className="mb-1"
                            />
                        ))}
                        <h6>Work Model</h6>
                        {workModelKeywordList.map((work) => (
                            <Form.Check
                                key={work} type="checkbox" label={work} checked={selectedWorkModels.includes(work)}
                                onChange={() => { togglePreference(work, selectedWorkModels, setSelectedWorkModels) }}
                                className="mb-1"
                            />
                        ))}
                        <div><Button type="submit" className="mt-3">Done</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editSkills && <Modal show={editSkills} onHide={() => setEditSkills(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Skills</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSkills}>
                        <div style={{ position: "relative" }}>
                            <InputField label="Search skills..." type="search" value={searchQuery} required={false} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Python" />

                            {searchQuery && skillsFiltered.length > 0 && (
                                <Dropdown.Menu show style={{ position: "absolute", top: "100%", width: "100%", maxHeight: "150px", overflowY: "auto" }}>
                                    {skillsFiltered.map((skill) => (
                                        <Dropdown.Item key={skill} onClick={() => addKeyword(skill, "skill")}>{skill}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            )}
                        </div>

                        <div className="mt-3" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {selectedSkills.map((skill) => (
                                <Badge key={skill} bg="primary" style={{ cursor: "pointer" }} onClick={() => removeKeyword(skill, "skill")}>
                                    {skill} ×
                                </Badge>
                            ))}
                        </div>

                        <div><Button type="submit" className="mt-3">Done</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editCareers && <Modal show={editCareers} onHide={() => setEditCareers(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Career Fields</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCareers}>
                        <div style={{ position: "relative" }}>
                            <InputField label="Search careers..." type="search" value={searchQuery} required={false} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Software Engineering" />

                            {searchQuery && careersFiltered.length > 0 && (
                                <Dropdown.Menu show style={{ position: "absolute", top: "100%", width: "100%", maxHeight: "150px", overflowY: "auto" }}>
                                    {careersFiltered.map((career) => (
                                        <Dropdown.Item key={career} onClick={() => addKeyword(career, "career")}>{career}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            )}
                        </div>

                        <div className="mt-3" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {selectedCareers.map((career) => (
                                <Badge key={career} bg="primary" style={{ cursor: "pointer" }} onClick={() => removeKeyword(career, "career")}>
                                    {career} ×
                                </Badge>
                            ))}
                        </div>

                        <div><Button type="submit" className="mt-3">Done</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editEducation && currentEducation && <Modal show={editEducation} onHide={() => setEditEducation(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>{isEditing ? 'Edit' : 'Add'} Education</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEducationSubmit}>
                        <InputField label="Institution" value={currentEducation.institution} onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })} />
                        <InputField label="Degree" value={currentEducation.degree} onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })} />
                        <InputField label="Major" value={currentEducation.major} onChange={(e) => setCurrentEducation({ ...currentEducation, major: e.target.value })} />
                        <InputField label="Minor" value={currentEducation.minor || ""} required={false} onChange={(e) => setCurrentEducation({ ...currentEducation, minor: e.target.value })} />
                        <InputField label="Graduation Date" type="date" value={currentEducation.graduationDate} onChange={(e) => setCurrentEducation({ ...currentEducation, graduationDate: e.target.value })} />
                        <InputField label="GPA" value={currentEducation.gpa} onChange={(e) => setCurrentEducation({ ...currentEducation, gpa: e.target.value })} />
                        <Button type="submit" className="mt-3">Done</Button>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editExperience && currentExperience && <Modal show={editExperience} onHide={() => setEditExperience(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>{isEditing ? 'Edit' : 'Add'} Experience</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleExperienceSubmit}>
                        <InputField label="Company" value={currentExperience.company} onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })} />
                        <InputField label="Title" value={currentExperience.title} onChange={(e) => setCurrentExperience({ ...currentExperience, title: e.target.value })} />
                        <InputField label="Start Date" type="date" value={currentExperience.startDate} onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })} />
                        <InputField label="End Date" type="date" value={currentExperience.endDate} onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })} />
                        <InputField as="textarea" rows={3} label="Description" value={currentExperience.description} onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })} />
                        <Button type="submit" className="mt-3">Done</Button>
                    </Form>
                </Modal.Body>
            </Modal>}
        </>
    );
};

export default Account;