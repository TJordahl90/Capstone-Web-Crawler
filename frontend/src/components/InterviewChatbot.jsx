import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import axios from "axios";

const InterviewChatbot = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const handleSend = async () => {
        if (!input.trim()) return;

        console.log("📤 Sending to AI server:", input); // ✅ Log before request

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");

        try {
            const res = await axios.post("http://localhost:5002/chat", {
                message: input,
            });

            console.log("✅ Got AI response:", res.data); // ✅ Log response

            setMessages([
                ...newMessages,
                { sender: "ai", text: res.data.reply || "No response" },
            ]);
        } catch (error) {
            console.error("❌ Chat error:", error); // ✅ Log error
        }
    };

    return (
        <div className="p-4">
            <Card>
                <Card.Body>
                    <Card.Title>AI Interview Chatbot</Card.Title>

                    <div
                        style={{
                            height: "300px",
                            overflowY: "auto",
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "5px",
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ marginBottom: "10px" }}>
                                <strong>
                                    {msg.sender === "user" ? "You" : "AI"}:
                                </strong>{" "}
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <Form.Control
                        type="text"
                        placeholder="Ask something..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button onClick={handleSend} className="mt-2">
                        Send
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
};

export default InterviewChatbot;
