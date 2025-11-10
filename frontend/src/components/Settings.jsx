import React, { useEffect, useState } from 'react';
import { Container, Row, Button, Modal, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "./ThemeContext";
import api from '../api.js';

const Settings = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [emailPreference, setEmailPreference] = useState(false);
    const [draftEmailPref, setDraftEmailPref] = useState(false);

     // Theme
    const { currentTheme, switchTheme } = useTheme();

    useEffect(() => {
        const getEmailPreference = async () => {
            try{
                const emailPref = await api.get('/get_email_preference/');
                const pref = emailPref.data.emailPreference;
                const boolPref = pref === true || pref === "true" || pref === "True";
                setEmailPreference(boolPref);
                setDraftEmailPref(boolPref);
            }catch (error){
                console.error("Failed to fetch email preferences:", error)
            }
        }
        getEmailPreference();
    }, []);

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete("/delete_user/");
            localStorage.clear();
            navigate("/");
        } 
        catch (err) {
            console.error(err.response?.data?.error || "Error deleting account.");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try{
            const payload ={
                emailPreference: draftEmailPref,
            }

            await api.post("/update_email_preference/", payload);

            setEmailPreference(draftEmailPref);
        }
        catch (error){
            console.error("Failed to save settings:", error);
            setDraftEmailPref(emailPreference);
        }
    }
    return (
        <Container className="mt-5 text-center">
            <h2 className="mb-4"
            style ={{color:"var(--text)"}}>Settings</h2>

            {/* Display / Theme Section */}
                <div
                    className="text-start p-4 mb-4"
                    style={{
                        color: "var(--text)",
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

                <div
                    className="text-start p-4 mb-4"
                    style={{
                      color: "var(--text)",
                      backgroundColor: "var(--card)",
                      borderRadius: "12px",
                      border: `1px solid var(--accent1)`,
                      borderLeft: `4px solid var(--accent1)`
                    }}
                >         
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 style={{ fontWeight: 600, fontSize: "1.5rem" }}>Email Notifications</h5>
                
                      {/* Switch to toggle email preference */}
                      <Form.Check
                        type="switch"
                        id="email-pref-switch"
                        label={draftEmailPref ? "Enabled" : "Disabled"}
                        checked={draftEmailPref}
                        disabled={loading} // prevent toggle until loaded
                        onChange={(e) => setDraftEmailPref(e.target.checked)}
                        style={{ fontWeight: 600 }}
                      />
                    </div>
                </div>
        <div className="d-flex flex-column align-items-center" style={{ gap: '10px', marginTop: '20px' }}>
            <Button
                variant="primary"
                onClick={handleSave}
                disabled={draftEmailPref === emailPreference}
            >
                Save
            </Button>
            
            <Row className="justify-content-center">
                <Button variant="outline-danger" style={{maxWidth: '200px'}} onClick={() => setShowModal(true)}>
                    Delete Account
                </Button>
            </Row>
            </div>


            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Account Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to permanently delete your account? All of your data will be lost.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Yes, Delete My Account"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Settings;