import React, { useState, useEffect, useCallback } from "react";
import { Container, Button, Form, Modal, Badge, Alert, Col, Row, Image } from "react-bootstrap";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import profile from "../assets/profile.png";
import InputField from './InputField';
import api from '../api.js';

const Account = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [editPersonalInfo, setEditPersonalInfo] = useState(false);
    const [editPreferences, setEditPreferences] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editEducation, setEditEducation] = useState(false);
    const [editExperience, setEditExperience] = useState(false);
    const [tempPreferencesText, setTempPreferencesText] = useState('');
    const [tempSkillsText, setTempSkillsText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEducation, setCurrentEducation] = useState(null);
    const [currentExperience, setCurrentExperience] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [accountData, setAccountData] = useState({
        firstName: "", lastName: "", headline: "", hometown: "",
        preferences: [], skills: [], education: [], experience: []
    });

    // fetches account data
    const fetchAccountData = useCallback(async () => {
        try {
            const response = await api.get("/account/");
            const { user, account } = response.data;
            setAccountData({
                firstName: user.first_name || "", lastName: user.last_name || "",
                headline: account.headline || "", hometown: account.hometown || "",
                skills: account.skills || [], preferences: account.preferences || [],
                education: account.education || [], experience: account.experience || [],
            });
            setHasUnsavedChanges(false);
        } catch (err) {
            setError("Error retrieving account.");
        }
    }, []);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    // helper functions for skills/preferences 
    const cleanName = (value) => value.name || value;

    useEffect(() => {
        if (editPreferences) setTempPreferencesText(accountData.preferences.map(cleanName).join(", "));
    }, [editPreferences, accountData.preferences]);

    useEffect(() => {
        if (editSkills) setTempSkillsText(accountData.skills.map(cleanName).join(", "));
    }, [editSkills, accountData.skills]);

    // saves all changes to account data
    const handleSaveAllChanges = async () => {
        const cleanData = (items) => items.map(({ id, ...rest }) => (typeof id === 'number' ? { id, ...rest } : rest));
        
        const payload = {
            user: {
                first_name: accountData.firstName,
                last_name: accountData.lastName,
            },
            account: {
                headline: accountData.headline,
                hometown: accountData.hometown,
            },
            skills: accountData.skills.map(cleanName),
            preferences: accountData.preferences.map(cleanName),
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
    
    // helper functions for personal, preferences, and skills local states
    const handlePersonalInfo = (e) => {
        e.preventDefault();
        setEditPersonalInfo(false);
        setHasUnsavedChanges(true);
    };

    const handlePreferences = (e) => {
        e.preventDefault();
        const preferencesArray = tempPreferencesText.split(',').map(item => ({ name: item.trim() })).filter(p => p.name);
        setAccountData(prev => ({...prev, preferences: preferencesArray }));
        setEditPreferences(false);
        setHasUnsavedChanges(true);
    };

    const handleSkills = (e) => {
        e.preventDefault();
        const skillsArray = tempSkillsText.split(',').map(item => ({ name: item.trim() })).filter(s => s.name);
        setAccountData(prev => ({...prev, skills: skillsArray }));
        setEditSkills(false);
        setHasUnsavedChanges(true);
    };

    // helper functions for education local states
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

    // helper function for experience local states
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
    

    return (
        <>
            <Container className="py-4" style={{ minHeight: "100vh" }}>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>

                        {/* Error Messages */}
                        {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
                        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                        {/* Personal Data Section */}
                        <div className="text-start p-4 mb-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <Image src={profile} roundedCircle alt="Profile" style={{ width: "80px", height: "80px", border: "2px solid var(--text)" }}/>
                                    <h2 className="mt-3" style={{ color: "#05e3ed" }}>{`${accountData.firstName} ${accountData.lastName}`}</h2>
                                    <p className="lead" style={{ color: "var(--text3)" }}>{accountData.headline}</p>
                                    <p className="lead" style={{ color: "var(--text3)" }}>{accountData.hometown}</p>
                                </div>
                                <FaPencilAlt onClick={() => setEditPersonalInfo(true)} style={{ cursor: "pointer", fontSize: "1.25rem", color: "var(--pen)" }}/>
                            </div>
                        </div>

                        <div className="p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                            
                            {/* Job Preferences Section */}
                            <Row className="py-4 border-bottom">
                                <Col xs={12} md={3}>
                                    <h5 style={{ color: "var(--text3)" }}>Job Preferences</h5>
                                </Col>
                                <Col xs={12} md={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ color: "var(--text3)" }}>
                                            {accountData.preferences.length > 0 ? accountData.preferences.map((p, i) => (
                                                <Badge key={i} className="me-2 mb-2 p-2" bg="secondary">{cleanName(p)}</Badge>
                                            )) : "No job preferences yet."}
                                        </div>
                                        <FaPencilAlt onClick={() => setEditPreferences(true)} style={{ cursor: "pointer", fontSize: "1.25rem", color: "var(--pen)", flexShrink: 0, marginLeft: '1rem' }}/>
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Skills Section */} 
                            <Row className="py-4 border-bottom">
                                <Col xs={12} md={3}>
                                    <h5 style={{ color: "var(--text3)" }}>Skills</h5>
                                </Col>
                                <Col xs={12} md={9}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div style={{ color: "var(--text3)" }}>
                                            {accountData.skills.length > 0 ? accountData.skills.map((s, i) => (
                                                <Badge key={i} className="me-2 mb-2 p-2" bg="secondary">{cleanName(s)}</Badge>
                                            )) : "No skills yet."}
                                        </div>
                                        <FaPencilAlt onClick={() => setEditSkills(true)} style={{ cursor: "pointer", fontSize: "1.25rem", color: "var(--pen)" }}/>
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Education Section */}
                            <Row className="py-4 border-bottom">
                                <Col xs={12} md={3}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 style={{ color: "var(--text3)" }}>Education</h5>
                                        <FaPlus onClick={handleAddEducation} style={{ cursor: "pointer", color: "var(--pen)", fontSize: '1.25rem' }} />
                                    </div>
                                </Col>
                                <Col xs={12} md={9} className="mt-3 mt-md-0">
                                    {accountData.education.map(edu => (
                                        <div key={edu.id} className="d-flex justify-content-between align-items-start mb-3">
                                            <div style={{ color: "var(--text3)" }}>
                                                <strong>{edu.institution}</strong><br />
                                                {edu.degree}, {edu.major}<br />
                                                <small>Graduated: {edu.graduationDate} | GPA: {edu.gpa}</small>
                                            </div>
                                            <div>
                                                <FaTrash onClick={() => handleDeleteEducation(edu.id)} className="me-3" style={{ cursor: "pointer", fontSize: "1.25rem", color: "#dc3545" }}/>
                                                <FaPencilAlt onClick={() => handleEditEducation(edu)} style={{ cursor: "pointer", fontSize: "1.25rem", color: "var(--pen)" }}/>
                                            </div>
                                        </div>
                                    ))}
                                    {accountData.education.length === 0 && <p style={{ color: "var(--text3)" }}>No education information provided.</p>}
                                </Col>
                            </Row>

                            {/* Experience Section */}
                            <Row className="py-4">
                               <Col xs={12} md={3}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 style={{ color: "var(--text3)" }}>Experience</h5>
                                        <FaPlus onClick={handleAddExperience} style={{ cursor: "pointer", color: "var(--pen)", fontSize: '1.25rem' }} />
                                    </div>
                               </Col>
                                <Col xs={12} md={9} className="mt-3 mt-md-0">
                                    {accountData.experience.map(exp => (
                                        <div key={exp.id} className="d-flex justify-content-between align-items-start mb-3">
                                            <div style={{ color: "var(--text3)" }}>
                                                <strong>{exp.title}</strong> at {exp.company}<br />
                                                <small>{exp.startDate} to {exp.endDate || 'Present'}</small><br/>
                                                <p className="mt-2 mb-0">{exp.description}</p>
                                            </div>
                                            <div>
                                                <FaTrash onClick={() => handleDeleteExperience(exp.id)} className="me-3" style={{ cursor: "pointer", fontSize: "1.25rem", color: "#dc3545" }}/>
                                                <FaPencilAlt onClick={() => handleEditExperience(exp)} style={{ cursor: "pointer", fontSize: "1.25rem", color: "var(--pen)" }}/>
                                            </div>
                                        </div>
                                    ))}
                                    {accountData.experience.length === 0 && <p style={{ color: "var(--text3)" }}>No work experience provided.</p>}
                                </Col>
                            </Row>
                        </div>

                        {hasUnsavedChanges && (
                            <div className="mt-4 p-3 text-end" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                                <Button variant="secondary" className="me-2" onClick={fetchAccountData}>Discard Changes</Button>
                                <Button variant="primary" onClick={handleSaveAllChanges}>Save All Changes</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Modals for editing data */}
            {editPersonalInfo && <Modal show={editPersonalInfo} onHide={() => setEditPersonalInfo(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Personal Info</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePersonalInfo}>
                        <InputField label="First Name" value={accountData.firstName} onChange={(e) => setAccountData({...accountData, firstName: e.target.value})} />
                        <InputField label="Last Name" value={accountData.lastName} onChange={(e) => setAccountData({...accountData, lastName: e.target.value})} />
                        <InputField label="Headline" value={accountData.headline} onChange={(e) => setAccountData({...accountData, headline: e.target.value})} />
                        <InputField label="Hometown" value={accountData.hometown} onChange={(e) => setAccountData({...accountData, hometown: e.target.value})} />
                        <Button type="submit" className="mt-3">Done</Button>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editPreferences && <Modal show={editPreferences} onHide={() => setEditPreferences(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Job Preferences</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePreferences}>
                        <InputField label="Job Preferences" type="text" value={tempPreferencesText} onChange={(e) => setTempPreferencesText(e.target.value)} placeholder="e.g. Part-Time, Software Engineer"/>
                        <small className="text-muted">Enter preferences as comma-separated values.</small>
                        <div><Button type="submit" className="mt-3">Done</Button></div>
                    </Form>
                </Modal.Body>
            </Modal>}

            {editSkills && <Modal show={editSkills} onHide={() => setEditSkills(false)}>
                <Modal.Header closeButton><Modal.Title style={{ color: "#05e3ed" }}>Edit Skills</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSkills}>
                        <InputField label="Skills" type="text" value={tempSkillsText} onChange={(e) => setTempSkillsText(e.target.value)} placeholder="e.g. Python, JavaScript, SQL" />
                        <small className="text-muted">Enter skills as comma-separated values.</small>
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