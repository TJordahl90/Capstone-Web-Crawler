import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button, Form, Card } from "react-bootstrap";
import api from "../api";

const InterviewChatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const location = useLocation();
  const job = location.state?.job;
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  // auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const getInterviewQuestion = async () => {
      setLoading(true);
      let url = "/ai_chatbot/"
      if (job) {
        url = `/ai_chatbot/?job_id=${job.id}`;
      }

      try {
        const response = await api.get(url);
        const aiMessage = response.data.message || "No question received, please try again later.";
        setMessages((prev) => [...prev, { sender: "ai", text: aiMessage }]);
        console.log(response);
      }
      catch (err) {
        console.error(err.response?.data?.message || "Server Error");
      }
      finally {
        setLoading(false);
      }
    }
    getInterviewQuestion();
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const prevQuestion = messages.slice().reverse().find(m => m.sender === 'ai')?.text;
    const userMessage = { sender: "user", text: input }
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai_chatbot/", { question: prevQuestion, response: userMessage.text });
      const aiMessage = response.data.message || "No response, please try again later.";
      console.log(response);
      setMessages((prev) => [...prev, { sender: "ai", text: aiMessage }]);
    }
    catch (err) {
      console.error(err.response?.data?.message || "Server Error");
    }
    finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div
      className="prepmate-container"
      style={{
        height: "calc(100vh - 52px)",
        display: "flex",
        justifyContent: "center",
         alignItems: "flex-start",
        overflow: "hidden",
        padding: screenWidth <= 480 ? "10px 10px 70px 10px" : "20px",

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
          width: "100%",
          height: "100%",
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
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
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

          {/* Input + Send */}
          <div style={{ display: "flex", gap: "10px" }}>
            <style>
              {`
               .prepmate-container input::placeholder {
                 color: white;
                 opacity: 0.8;
               }
              `}
            </style>

            <Form.Control
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              style={{
                borderRadius: "24px",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "white",
              }}
            />
            <Button
              onClick={handleSubmit}
              style={{
                borderRadius: "24px",
                padding: "0 25px",
                backgroundColor:
                  "rgba(0, 173, 181, 0.6)",
                // : "gray",
                border: "1px solid #00ADB5",
                fontWeight: "bold",
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
