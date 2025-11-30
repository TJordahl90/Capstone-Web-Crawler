import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import InputField from './InputField';
import GlobalMessage from './GlobalMessage.jsx';
import api from '../api.js';
import videobg from "../assets/background_video_1.mp4";
import logo from "../assets/logo3.png";

const AuthForm = ({ isLogin }) => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        email: '',
        confirmEmail: '',
    });

    useEffect(() => {
        api.get('/csrf/').catch(() =>
            setAlert({ type: "error", text: "Error retrieving necessary tokens." }),
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ type: "", text: "" });

        try {
            if (!isLogin) {
                const { password, confirmPassword, email, confirmEmail } = formData;
                const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

                if (!valid.test(password)) throw new Error("Password must be 8+ chars and include uppercase, lowercase, number, and special char.");
                if (password !== confirmPassword) throw new Error("Passwords do not match.");
                if (email !== confirmEmail) throw new Error("Emails do not match.");

                await api.post('/register/', formData);
                await api.post('/verification/', { email });

                setAlert({ type: "success", text: "Account created successfully! Check your email for verification." });
                setTimeout(() => navigate("/verification", { state: { email } }), 1000);
            }
            else {
                const response = await api.post('/login/', formData);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                setAlert({ type: "success", text: "Login successful!" });
                setTimeout(() => navigate(response.data.first_time_login ? "/account-setup" : "/dashboard"), 1000);
            }
        }
        catch (err) {
            const data = err.response?.data;
            let msg = "Something went wrong.";

            if (typeof data?.error === "string") {
                msg = data.error;
            }
            else if (typeof data?.error === "object") {
                msg = Object.entries(data.error)
                    .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
                    .join("\n");
            }
            setAlert({ type: "error", text: msg });
        }
        finally {
            setLoading(false);
        }
    };


    return (
        <div
            style={{
                position: "relative",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                backgroundColor: "#ffffffff",      // page background = white
            }}
        >
            {/* Alert Message */}
            <GlobalMessage
                type={alert.type}
                message={alert.text}
                onClose={() => setAlert({ type: "", text: "" })}
            />

            <Card
                style={{
                    backgroundColor: "transparent",
                    padding: 0,
                    width: "100%",
                    height: "100vh",
                    maxWidth: "100vw",
                    overflow: "hidden",
                    boxShadow: "none",
                    border: "none",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Row className="g-0" style={{ height: "100%" }}>
                    {/* LEFT PANEL = VIDEO (order changes when isLogin) */}
                    <Col
                        md={8}
                        style={{
                            padding: 0,
                            height: "100%",
                            order: isLogin ? 2 : 1, // ⬅️ move to right when login
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                // borderTopRightRadius: !isLogin ? "32px" : "0px",
                                // borderBottomRightRadius: !isLogin ? "32px" : "0px",
                                // borderTopLeftRadius: isLogin ? "32px" : "0px",
                                // borderBottomLeftRadius: isLogin ? "32px" : "0px",
                                overflow: "hidden", // clip video to rounded corners
                                animation: isLogin
                                    ? "slideFromRight 0.6s ease forwards"   // when logging in, video comes from right
                                    : "slideFromLeft 0.6s ease forwards",    // when registering, video comes from left
                            }}
                        >
                            {/* Video only on this panel */}
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            >
                                <source src={videobg} type="video/mp4" />
                            </video>

                            {/* Dark overlay + text */}
                            <div
                                className="d-flex align-items-center"
                                style={{
                                    position: "relative",
                                    justifyContent: !isLogin ? "center" : "start",
                                    zIndex: 1,
                                    height: "100%",
                                    padding: !isLogin ? "0rem 0rem 5rem 0em" : "2.5rem 2.2rem 3rem 5rem",
                                    color: "#ffffff",
                                    background: "translucent",
                                }}
                            >
                                <div classname="authform_title"
                                    style={{
                                        width: !isLogin ? "500px" : "700px"
                                    }}>
                                    <style>
                                        {`
                                            @keyframes fadeUp {
                                               from { opacity: 0; transform: translateY(10px); }
                                               to { opacity: 1; transform: translateY(0); }
                                           }

                                           @keyframes slideFromLeft {
                                              from { transform: translateX(-100%); opacity: 0; }
                                                to   { transform: translateX(0); opacity: 1; }
                                           }

                                            @keyframes slideFromRight {
                                                from { transform: translateX(100%); opacity: 0; }
                                               to   { transform: translateX(0); opacity: 1; }
                                                }
                                           `}
                                    </style>
                                    {/* Title first */}
                                    <div
                                        className="landing-logo-container"
                                        onClick={() => navigate("/")}
                                        style={{
                                            position: "absolute",
                                            top: "2vh",
                                            left: "2vw",
                                            width: "10vw",
                                            height: "14vh",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 20,
                                            cursor: "pointer",

                                        }}

                                    >
                                        <img
                                            src={logo}
                                            alt="website logo"
                                            className="landing-logo"
                                            style={{
                                                maxWidth: "100%",
                                                height: "100%",
                                                objectFit: "contain"
                                            }}
                                        />

                                    </div>
                                    <h2
                                        style={{
                                            fontSize: isLogin ? "4rem" : "5rem",
                                            fontWeight: 800,
                                            lineHeight: 1.2,
                                            marginBottom: "1rem",
                                            opacity: 0,
                                            animation: "fadeUp 1s ease forwards",
                                            animationDelay: "0.1s",    // appears immediately
                                        }}
                                    >
                                        {isLogin ? "Welcome Back" : "Create your Account"}
                                    </h2>

                                    {/* Paragraph appears later */}
                                    <p
                                        style={{
                                            fontSize: "1.2rem",
                                            lineHeight: 1.7,
                                            maxWidth: "360px",
                                            opacity: 0,
                                            animation: "fadeUp 1s ease forwards",
                                            animationDelay: "0.45s",   // delay so it comes after the title
                                        }}
                                    >
                                        {isLogin
                                            ? "Sign in to track your saved jobs, see your matches, and get interview help from Prep-Mate."
                                            : "Sign up to explore tech jobs, save opportunities, and get AI-powered interview prep tailored for you."}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </Col>

                    {/* RIGHT PANEL = FORM (order changes when isLogin) */}
                    <Col
                        md={4}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            // alignItems:'center',
                            backgroundColor: "#ffffff",
                            flexDirection: 'column',
                            padding: "0rem 2.7rem",
                            color: "#111111",
                            height: "100%",
                            "--text": "#111111",
                            order: isLogin ? 1 : 2, // move to left when login
                            //borderTopLeftRadius: isLogin ? "32px" : "0px",
                            //borderBottomLeftRadius: isLogin ? "32px" : "0px",
                            //borderTopRightRadius: !isLogin ? "32px" : "0px",
                            //borderBottomRightRadius: !isLogin ? "32px" : "0px",
                            animation: isLogin
                                ? "slideFromLeft 0.6s ease forwards"    // form comes from left on login
                                : "slideFromRight 0.6s ease forwards",  // comes from right on register
                        }}
                    >
                        <div className="d-flex justify-content-center align-items-center">
                            <h3
                                style={{
                                    fontSize: "2.5rem",
                                    fontWeight: 700,
                                    margin: 0,
                                    marginBottom: 20
                                }}
                            >
                                {isLogin ? "Sign In" : "Sign Up"}
                            </h3>

                        </div>

                        <Form onSubmit={handleSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}>
                            {/* REGISTER FIELDS */}
                            {!isLogin ? (
                                <>
                                    <Row className="gx-2">
                                        <Col xs={12} sm={6}>
                                            <InputField
                                                // label="First Name"
                                                placeholder="First name"
                                                value={formData.first_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, first_name: e.target.value })
                                                }
                                            />
                                        </Col>
                                        <Col xs={12} sm={6}>
                                            <InputField
                                                // label="Last Name"
                                                type="text"
                                                placeholder="Last name"
                                                value={formData.last_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, last_name: e.target.value })
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <div style={{ marginBottom: 0, paddingTop: -10 }}>
                                        <InputField
                                            // label="Username"
                                            type="text"
                                            placeholder="Choose a username"

                                            value={formData.username}
                                            onChange={(e) =>
                                                setFormData({ ...formData, username: e.target.value })
                                            }
                                        />
                                    </div>
                                    <InputField
                                        // label="Email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />

                                    <InputField
                                        // label="Confirm Email"
                                        type="email"
                                        placeholder="Confirm your email"
                                        value={formData.confirmEmail}
                                        onChange={(e) =>
                                            setFormData({ ...formData, confirmEmail: e.target.value })
                                        }
                                    />

                                    <InputField
                                        // label="Password"
                                        type="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                    {formData.password &&
                                        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
                                            formData.password
                                        ) && <small style={{ color: "red" }}>Must meet password requirements</small>}

                                    <InputField
                                        // label="Confirm Password"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                    />
                                </>
                            ) : (
                                <>
                                    <InputField
                                        //label="Username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                    />

                                    <InputField
                                        //label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />

                                    <div className="text-end mb-3">
                                        <Link
                                            to="/password-reset"
                                            style={{
                                                color: "#0b5ed7",
                                                textDecoration: "none",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                style={{
                                    backgroundColor: "#111111",
                                    width: "100%",
                                    fontSize: "1rem",
                                    padding: "10px 0",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "999px",
                                    fontWeight: "600",
                                    marginTop: "0.75rem",
                                    transition: "0.3s ease",
                                }}
                                onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                                onMouseLeave={(e) => (e.target.style.opacity = "1")}
                            >
                                {loading ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                    "Join us"
                                )}
                            </Button>

                            <div className="text-center mt-3" style={{ fontSize: "0.95rem" }}>
                                {isLogin ? (
                                    <p>
                                        Don’t have an account?{" "}
                                        <Link to="/register" style={{ color: "#0b5ed7", fontWeight: 600 }}>
                                            Sign up
                                        </Link>
                                    </p>
                                ) : (
                                    <p>
                                        Already a member?{" "}
                                        <Link to="/login" style={{ color: "#0b5ed7", fontWeight: 600 }}>
                                            Sign in here
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </Form>
                    </Col>

                </Row>
            </Card>
        </div>
    );
};

export default AuthForm;

{/*  <Button
                        onClick={() => navigate("/")}
                        style={{
                            backgroundColor: "transparent",
                            color: "var(--accent1)",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            marginBottom: "5px",
                            padding: 0,
                        }}
                    >
                        ← Back to Home
                    </Button>

                    <h2
                        className="text-center mb-1"
                        style={{
                            color: "var(--accent1)",
                            fontWeight: 700,
                            letterSpacing: "1px",
                        }}
                    >
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    <Form onSubmit={handleSubmit}>
                        {!isLogin ? (
                            <>
                                <InputField
                                    label="Username"
                                    type="text"
                                    placeholder="Enter a username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="Enter a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                {formData.password &&
                                    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(formData.password) && (
                                        <small style={{ color: "red" }}>Must meet password requirements</small>
                                    )}
                                <InputField
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <Row className="gx-2">
                                    <Col xs={12} sm={6}>
                                        <InputField
                                            label="First Name"
                                            type="text"
                                            placeholder="First name"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <InputField
                                            label="Last Name"
                                            type="text"
                                            placeholder="Last name"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                                <InputField
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <InputField
                                    label="Confirm Email"
                                    type="email"
                                    placeholder="Confirm your email"
                                    value={formData.confirmEmail}
                                    onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                                />
                            </>
                        ) : (
                            <>
                                <InputField
                                    label="Username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                                <InputField
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <div className="text-end mb-3">
                                    <Link
                                        to="/password-reset"
                                        style={{ color: "var(--accent1)", textDecoration: "none", fontSize: "0.9rem" }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: "var(--accent1)",
                                width: "100%",
                                fontSize: "1rem",
                                padding: "10px 0",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "600",
                                transition: "0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                        >
                            {loading ? (
                                <Spinner as="span" animation="border" size="sm" />
                            ) : (
                                isLogin ? "Login" : "Register"
                            )}
                        </Button>

                        <div className="text-center mt-2" style={{ color: "var(--text)" }}>
                            {isLogin ? (
                                <p style={{ fontSize: "0.95rem" }}>
                                    Don’t have an account?{" "}
                                    <Link to="/register" style={{ color: "var(--accent1)", fontWeight: 600 }}>
                                        Register
                                    </Link>
                                </p>
                            ) : (
                                <p style={{ fontSize: "0.95rem" }}>
                                    Already have an account?{" "}
                                    <Link to="/login" style={{ color: "var(--accent1)", fontWeight: 600 }}>
                                        Login
                                    </Link>
                                </p>
                            )}
                        </div>
                    </Form>*/}