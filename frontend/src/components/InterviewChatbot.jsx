import React, { useState, useRef, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

const InterviewChatbot = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false); // ✅ typing indicator state
    const chatEndRef = useRef(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true); // ✅ show indicator

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
            setLoading(false); // ✅ hide indicator
        }
    };

    // auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
                height: "calc(100vh - 80px)", // ✅ fit inside viewport minus nav height
                width: "100%",
                boxSizing: "border-box",     // ✅ ensures padding doesn’t add overflow
                background: "transparent",
                overflow: "hidden",          // ✅ prevent white line
            }}
        >
            <div
                style={{
                    width: "80%",
                    maxWidth: "900px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "20px",
                    boxShadow: "0 0 25px rgba(0,0,0,0.3)",
                    color: "white",
                }}
            >
                <h3
                    className="text-center mb-4"
                    style={{ color: "#00ADB5", fontWeight: "bold" }}
                >
                     AI Interview Chatbot
                </h3>

                {/* Chat window */}
                <div
                    style={{
                        height: "400px",
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
                                display: "flex",
                                justifyContent: "flex-start",
                                marginBottom: "12px",
                            }}
                        >
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
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input + button */}
                <div style={{ display: "flex", gap: "10px" }}>
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
                            transition: "0.3s ease",
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
            </div>
        </div>
    );
};

export default InterviewChatbot;
