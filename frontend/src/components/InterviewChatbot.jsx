import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";

const InterviewChatbot = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5002/chat", {
                message: input,
            });

            setMessages([
                ...newMessages,
                { sender: "ai", text: res.data.reply || "No response" },
            ]);
        } catch (error) {
            console.error("❌ Chat error:", error);
            setMessages([
                ...newMessages,
                { sender: "ai", text: "⚠️ Something went wrong, please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    return (
        <div
            className="prepmate-container"
            style={{
                height: "calc(100vh - 52px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
            }}
        >
            <Card
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    boxShadow: "0 0 25px rgba(0,0,0,0.3)",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Card.Body style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <Card.Title
                        className="text-center mb-4"
                        style={{ color: "#00ADB5", fontWeight: "bold" }}
                    >
                        AI Interview Chatbot
                    </Card.Title>

                    {/* Chat window */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "15px",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "16px",
                            marginBottom: "15px",
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        msg.sender === "user" ? "flex-end" : "flex-start",
                                    marginBottom: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "70%",
                                        padding: "12px 16px",
                                        borderRadius: "18px",
                                        backgroundColor:
                                            msg.sender === "user"
                                                ? "rgba(0, 173, 181, 0.8)"
                                                : "rgba(255, 255, 255, 0.1)",
                                        color: "white",
                                        whiteSpace: "pre-wrap",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div
                                style={{
                                    padding: "10px 15px",
                                    borderRadius: "18px",
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    fontStyle: "italic",
                                    color: "#ccc",
                                }}
                            >
                                AI is typing...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input + Send button */}
                    <div style={{ display: "flex", gap: "10px" }}><style>
                        {`
                         .prepmate-container input::placeholder {
                           color: white;
                        opacity: 0.8; /* make it slightly dimmer than typed text */
                        }
                      `}
                    </style>

                        <Form.Control
                            type="text"
                            placeholder="Ask something..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            style={{
                                borderRadius: "24px",
                                padding: "12px 16px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: "white",
                            }}
                        />
                        <Button
                            onClick={handleSend}
                            style={{
                                borderRadius: "24px",
                                padding: "0 25px",
                                backgroundColor: "rgba(0, 173, 181, 0.6)",
                                border: "1px solid #00ADB5",
                                fontWeight: "bold",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#00ADB5";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "rgba(0, 173, 181, 0.6)";
                            }}
                        >
                            Send
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>

    );
};

export default InterviewChatbot;
