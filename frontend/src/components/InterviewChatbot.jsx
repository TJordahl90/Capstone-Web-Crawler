import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";
import api from "../api";

const InterviewChatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    // { sender: "ai", text: "Hello! Please drag or paste your resume PDF here, or type a question to get started." }
  ]);
  const [loading, setLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(true); 
  const chatEndRef = useRef(null);

  // useEffect(() => {
  //   const checkAI = async () => {
  //     try {
  //       await axios.post("http://localhost:5002/chat", { message: "ping" });
  //       setAiOnline(true);
  //     } catch {
  //       setAiOnline(false);
  //       setMessages([
  //         { sender: "ai", text: "AI is currently offline. Please try again later." }
  //       ]);
  //     }
  //   };
  //   checkAI();
  // }, []);

  // const handleSend = async () => {
  //   if (!input.trim() || !aiOnline) return;

  //   const newMessages = [...messages, { sender: "user", text: input }];
  //   setMessages(newMessages);
  //   setInput("");
  //   setLoading(true);

  //   try {
  //     const res = await axios.post("http://localhost:5002/chat", {
  //       message: input,
  //     });

  //     setMessages([
  //       ...newMessages,
  //       { sender: "ai", text: res.data.reply || "No response" },
  //     ]);
  //   } catch (error) {
  //     console.error("❌ Chat error:", error);
  //     setMessages([
  //       ...newMessages,
  //       { sender: "ai", text: "⚠️ Something went wrong, please try again." },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // ✅ PDF handler
  // const handlePdfFile = async (file) => {
  //   if (!aiOnline) return;

  //   if (!file || file.type !== "application/pdf") {
  //     setMessages((prev) => [
  //       ...prev,
  //       { sender: "ai", text: "⚠️ Please upload a valid PDF file." },
  //     ]);
  //     return;
  //   }

  //   setMessages((prev) => [
  //     ...prev,
  //     { sender: "user", text: `📄 Uploaded resume: ${file.name}` },
  //     { sender: "ai", text: "Reading your resume..." } // ✅ show status
  //   ]);
  //   setLoading(true);

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const res = await axios.post("http://localhost:5002/upload-pdf", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setMessages((prev) => [
  //       ...prev.slice(0, -1),
  //       { sender: "ai", text: res.data.reply || "No response" },
  //     ]);
  //   } catch (err) {
  //     console.error("❌ PDF Upload error:", err);
  //     setMessages((prev) => [
  //       ...prev,
  //       { sender: "ai", text: "⚠️ Failed to process PDF." },
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // auto-scroll
  // useEffect(() => {
  //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, loading]);

  useEffect(() => {
    const getInterviewQuestion = async () => {
      try {
          const response = await api.get("/ai_chatbot/");
          const aiMessage = response.data.message || "No question received, please try again later.";
          setMessages((prev) => [...prev, { sender: "ai", text: aiMessage }]);
          //console.log(response);
      }
      catch (err) {
          console.error(err.response?.data?.message || "Server Error");
      }
    }
    getInterviewQuestion();
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
        const response = await api.post("/ai_chatbot/", { message: userInput });
        const aiMessage = response.data.message || "No response, please try again later.";
        // console.log(response);
        setMessages((prev) => [...prev, { sender: "ai", text: aiMessage }]);
    }
    catch (err) {
        console.error(err.response?.data?.message || "Server Error");
    }
  }


  return (
    <div
      className="prepmate-container"
      style={{
        height: "calc(100vh - 52px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "20px",
        overflowY: "auto",
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
          minHeight: "calc(100vh - 52px)", // ✅ full screen min
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
            // onDragOver={(e) => e.preventDefault()}
            // onDrop={(e) => {
            //   e.preventDefault();
            //   const file = e.dataTransfer.files[0];
            //   if (file) handlePdfFile(file);
            // }}
            // onPaste={(e) => {
            //   const file = e.clipboardData.files[0];
            //   if (file) handlePdfFile(file);
            // }}
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
              // onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                borderRadius: "24px",
                padding: "12px 16px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "white",
              }}
              disabled={!aiOnline} // ✅ disable if offline
            />
            <Button
              // onClick={handleSend}
              onClick={handleSubmit}
              // disabled={!aiOnline}
              style={{
                borderRadius: "24px",
                padding: "0 25px",
                backgroundColor: aiOnline
                  ? "rgba(0, 173, 181, 0.6)"
                  : "gray",
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
