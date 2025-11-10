import React, { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { Button, Form, Card, Accordion, Container, Spinner, InputGroup, Alert, ProgressBar, Row, Col } from "react-bootstrap";
import { FaKeyboard, FaMicrophone, FaChevronRight } from "react-icons/fa";
import api from "../api";

const InterviewChatbot = () => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [currAnswer, setCurrAnswer] = useState("");
  const [summaryGrade, setSummaryGrade] = useState('');
  const [summaryAnalysis, setSummaryAnalysis] = useState("");
  const [summaryHired, setSummaryHired] = useState(false);
  const [inputType, setInputType] = useState("text");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [error, setError] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [limitReached, setLimitReached] = useState(
    () => sessionStorage.getItem('chatLimitReached') === 'true'
  );

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const location = useLocation();
  const job = location.state?.job;

  const currQuestion = questions[currQuestionIndex];
  const isAnswered = answers[currQuestion];
  const hasFeedback = feedback[currQuestion];
  const isSpeechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const getAIQuestions = async () => {
    setPageLoad(true);
    setError("");

    try {
      const response = await api.get(`/chatbot_interview/?job_id=${job.id}`);
      setQuestions(response.data.message || []);
			setPageLoad(false);
      setSessionStarted(true);
    }
    catch (err) {
      if (err.response && err.response.status === 429) {
        sessionStorage.setItem('chatLimitReached', 'true');
        setLimitReached(true);
				setPageLoad(false);
      }
      else {
        setError(err.response?.data?.error || "Failed to get questions. Please try again later.");
      }
    }
  };

  const getAIFeedback = async (question, answer) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/chatbot_interview/", { question: question, answer: answer });
      setFeedback(prev => ({ ...prev, [question]: response.data.message }))
    }
    catch (err) {
      setError(err.response?.data?.error || "Failed to get feedback. Please try again later.")
    }
    finally {
      setLoading(false);
    }
  };

  const getInterviewSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/chatbot_summary/");
      setSummaryGrade(response.data[0]);
      setSummaryAnalysis(response.data[1]);
      setSummaryHired(response.data[2]);
    }
    catch (err) {
      setError(err.response?.data?.error || "Failed to get feedback. Please try again later.")
    }
    finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const currentQuestion = questions[currQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion]: currAnswer }));
    getAIFeedback(currentQuestion, currAnswer);
  };

  const handleNextQuestion = () => {
    if (currQuestionIndex < questions.length - 1) {
      setCurrQuestionIndex(prevIndex => prevIndex + 1);
      setCurrAnswer("");
    }
    else {
      getInterviewSummary();
      setSessionEnded(true);
      sessionStorage.setItem('chatLimitReached', 'true');
    }
  };

  const toggleInputType = () => {
    setInputType(prev => (prev === 'text' ? 'voice' : 'text'));
  };

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setVoiceTranscript(prev => prev + event.results[i][0].transcript);
        }
        else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.onend = () => { setIsRecording(false) };
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    }
    else {
      setVoiceTranscript("");
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleVoiceSubmit = () => {
    const currentQuestion = questions[currQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion]: voiceTranscript }));
    getAIFeedback(currentQuestion, voiceTranscript);
    setVoiceTranscript("");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
	
	const cardBase = {
    backgroundColor: "var(--card)",
    border: `1px solid var(--accent1)`,
    borderLeft: `4px solid var(--accent1)`,
    borderRadius: "16px",
    color: "var(--text)",
    padding: "1.8rem",
    height: "100%",
    boxShadow: "0 4px 20px var(--shadow1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  // This will display the overall summary page
  if (sessionEnded) {
    return (
      <Container className="py-5" style={{ maxWidth: '1200px' }}>
        <Card style={cardBase}>
            <h3 style={{ fontSize: '2.0rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center', marginBottom: '1.5rem' }}>Your Mock Interview Report</h3>
            <Row className="mb-4 text-center">
              <Col md={6} className="mb-3 mb-md-0">
                <h6 style={{ color: 'var(--title)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Overall Grade</h6>
                <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--accent2)', margin: 0, lineHeight: 1.2 }}>{summaryGrade}</p>
              </Col>
              <Col md={6}>
                <h6 style={{ color: 'var(--title)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Are you Hired?</h6>
                <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--accent2)', margin: 0, textTransform: 'capitalize', lineHeight: 1.2 }}>{summaryHired}</p>
              </Col>
            </Row>

            <hr style={{ borderColor: 'var(--border' }} />
            <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginTop: '1.5rem', marginBottom: "1.5rem" }}>AI Analysis</h5>
            <p style={{ fontSize: '1.1rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{summaryAnalysis}</p>
        </Card>
      </Container>
    );
  }

  // This will display an error message about the chat limit
  if (limitReached) {
    return (
      <Container className="py-5" style={{ maxWidth: '1200px' }}>
        <Card style={cardBase}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.5rem' }}>Daily Limit Reached</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
                You have reached your limit of 4 questions per day. Please try again tomorrow.
              </p>
            </div>
        </Card>
      </Container>
    );
  }
	
	if (pageLoad) {
		return (
			<div style={{ height: "100vh", backgroundColor: "var(--background)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "var(--text)" }}>
					<Spinner 
						animation="border" 
						role="status" 
						style={{ width: "4rem", height: "4rem" }} 
					/>
					<p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
						Loading your interview...
					</p>
			</div>
		);
	}

  // This will display the instruction page
	if (!sessionStarted) {
	  return (
	    <Container className="d-flex justify-content-center text-center" style={{ color: "var(--text)", height: 'calc(100vh - 52px)', paddingTop: "8rem", maxWidth: "1200px" }}>
	      <div style={{ width: "100%" }}>
	        <h1 style={{ marginBottom: "1.5rem" }}>
	            {job && <>Mock Interview for: <span style={{ color: "var(--accent1)", fontWeight: 600 }}>{job.title}</span></>}
	        </h1>
	
	        <p className="lead" style={{ color: "var(--text)", maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: "1.6" }}>
	            Welcome to your AI-powered interview practice session. This tool is designed to help you refine your answers and build confidence. Here's how it works:
	        </p>
	
	        <div className="d-flex justify-content-center text-start flex-wrap" style={{ gap: "2rem", marginBottom: "3rem" }}>
            	<div className="col-md-4 d-flex flex-column" style={{ flex: "1 1 30%", minWidth: "250px", textAlign: "center", alignItems: "center" }}>
            	    <h5 style={{ color: "var(--accent2)", fontWeight: "600", marginBottom: "0.75rem" }}>1. Answer the Question</h5>
            	    <p style={{ color: "var(--text)", lineHeight: "1.6", fontSize: "0.95rem", margin: 0, maxWidth: "300px" }}>
            	        You'll be presented with four questions one at a time. Take a moment to structure your thoughts and provide a complete answer by typing or using the voice feature.
            	    </p>
            	</div>
							
              <div className="col-md-4 d-flex flex-column" style={{ flex: "1 1 30%", minWidth: "250px", textAlign: "center", alignItems: "center" }}>
                  <h5 style={{ color: "var(--accent2)", fontWeight: "600", marginBottom: "0.75rem" }}>2. Get Instant Feedback</h5>
                  <p style={{ color: "var(--text)", lineHeight: "1.6", fontSize: "0.95rem", margin: 0, maxWidth: "300px" }}>
                      Once you submit your answer, our AI coach will provide immediate, structured feedback on your response, highlighting your strengths and areas for improvement.
                  </p>
              </div>
							
              <div className="col-md-4 d-flex flex-column" style={{ flex: "1 1 30%", minWidth: "250px", textAlign: "center", alignItems: "center" }}>
                  <h5 style={{ color: "var(--accent2)", fontWeight: "600", marginBottom: "0.75rem" }}>3. Get Your AI Evaluation</h5>
                  <p style={{ color: "var(--text)", lineHeight: "1.6", fontSize: "0.95rem", margin: 0, maxWidth: "300px" }}>
                      Once you’ve finished all questions, the AI grades your overall performance, giving you a final score, detailed analysis, and a simulated hiring decision.
                  </p>
              </div>
							
          </div>
	        <Button 
      	    variant="outline-secondary"
						size="lg" onClick={() => {setPageLoad(true); getAIQuestions(); }} disabled={loading} 
						style={{ marginTop: "1rem", padding: "10px 30px", fontWeight: "600", letterSpacing: "0.5" }}
					>
	            Begin Interview
	        </Button>
	      </div>
	    </Container>
	  )
	}

  if (questions.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 52px)', color: "var(--text)" }}>
        <Spinner animation="border" variant="info" />
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
			<Card style={cardBase}>
      	{/* Header & Progress Section */}
      	<Row>
      	  <Col>
      	    <div className="text-center mb-4">
      	      <h2 className="mb-2" style={{ color: "var(--accent1)", fontWeight: 600 }}>{job.title}</h2>
      	      <p className="lead" style={{ color: 'var(--text)', fontSize: '1.1rem' }}>
      	        Question {currQuestionIndex + 1} of {questions.length}
      	      </p>
      	      <ProgressBar
      	        now={((currQuestionIndex + 1) / questions.length) * 100}
      	        variant="info"
      	        style={{ height: '8px' }}
      	      />
      	    </div>
      	  </Col>
      	</Row>
		
      	{error && <Alert variant="danger">{error}</Alert>}
		
      	{/* Question Section */}
      	<Row className="mb-4">
      	  <Col>
      	    <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text)' }}>
      	      <p className="lead" style={{ fontSize: '1.25rem', margin: 0 }}>
      	        {currQuestion}
      	      </p>
      	    </div>
      	  </Col>
      	</Row>
		
      	{/* Answer Section */}
      	{isAnswered ? (
      	  <Row className="mb-4">
      	    <Col>
      	      <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text)' }}>
      	        <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>Your Answer</h5>
      	        <p style={{ color: 'var(--accent1)', fontSize: '1.1rem', margin: 0 }}>
      	          <i>{answers[currQuestion]}</i>
      	        </p>
      	      </div>
      	    </Col>	
      	  </Row>
      	) : (
      	  <Row className="mb-4">
      	    <Col>
      	      <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text)' }}>
      	        {/* Input Toggle Button */}
      	        <Row className="mb-3" style={{ alignItems: 'center' }}>
      	          <Col>
      	            <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
      	              Provide Your Answer
      	            </h5>
      	          </Col>
      	          <Col xs="auto">
      	            <Button
      	              variant="outline-secondary"
      	              size="sm"
      	              onClick={toggleInputType}
      	              style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text)', borderColor: 'var(--border)' }}
      	              disabled={!isSpeechRecognitionSupported}
      	            >
      	              {inputType === 'text' ?
      	                <><FaMicrophone className="me-2" /> Use Voice</> :
      	                <><FaKeyboard className="me-2" /> Use Text</>
      	              }
      	            </Button>
      	          </Col>
      	        </Row>
										
      	        {/* Text Input */}
      	        {inputType === 'text' && (
      	          <Form onSubmit={handleAnswerSubmit}>
      	            <style>{`
						       		.answer-input::placeholder { 
						       		 color: var(--text); 
						       		 opacity: 1;
										    }
										    .answer-input::-webkit-input-placeholder { 
										        color: var(--text); 
										        opacity: 1;
										    }
										    .answer-input::-moz-placeholder { 
										        color: var(--text); 
										        opacity: 1;
										    }
										    .answer-input:-ms-input-placeholder { 
										        color: var(--text); 
										    }
										`}</style>
	
      	            <Form.Control
      	              as="textarea"
      	              rows={5}
      	              value={currAnswer}
      	              onChange={(e) => setCurrAnswer(e.target.value)}
      	              placeholder="Type your answer here..."
      	              className="answer-input"
      	              style={{
      	                borderColor: "var(--border)",
      	                backgroundColor: "var(--background)",
      	                color: "var(--text)"
      	              }}
      	            />
	
      	            <Button
      	              variant="outline-secondary"
      	              type="submit"
      	              disabled={loading}
      	              className="mt-3"
      	              style={{ display: 'flex', color: 'var(--text)', borderColor: 'var(--border)' }}
      	            >
      	              Submit Answer
      	            </Button>
      	          </Form>
      	        )}
	
      	        {/* Voice Input */}
      	        {inputType === 'voice' && (
      	          <>
      	            <div
      	              className="d-flex flex-column align-items-center justify-content-center w-100"
      	              style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '0.375rem' }}
      	            >
      	              <div className="w-100 d-flex justify-content-between align-items-center mb-3">
      	                <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent1)' }}>{formatTime(timer)}</span>
      	                <Button
      	                  variant="outline-secondary"
      	                  onClick={handleToggleRecording}
      	                  style={isRecording ?
      	                    { fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--background)' } :
      	                    { fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text)', borderColor: 'var(--border)' }
      	                  }
      	                >
      	                  <FaMicrophone className="me-2" />
      	                  {isRecording ? "Stop" : "Record"}
      	                </Button>
      	              </div>
      	              <p className="w-100" style={{ minHeight: '50px', color: 'var(--text)' }}>
      	                <i>{voiceTranscript || "Your transcribed answer will appear here..."}</i>
      	              </p>
      	            </div>
      	            <Button
      	              variant="outline-secondary"
      	              onClick={handleVoiceSubmit}
      	              disabled={loading || isRecording || !voiceTranscript.trim()}
      	              className="mt-3"
      	              style={{ display: 'flex', alignItems: 'center', color: 'var(--text)', borderColor: 'var(--border)' }}
      	            >
      	              Submit Answer
      	            </Button>
      	          </>
      	        )}
      	      </div>
      	    </Col>
      	  </Row>
      	)}
	
      	{/* Feedback Section */}
      	{isAnswered && (
      	  <Row className="mb-4">
      	    <Col>
      	      <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text)' }}>
      	        <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent2)' }}>AI Feedback</h5>
      	        {loading && !hasFeedback ? (
      	          <div className="text-center p-3">
      	            <Spinner animation="border" variant="info" className="me-2" />
      	            <span className="lead">Analyzing your answer...</span>
      	          </div>
      	        ) : (
      	          <>
      	            <p style={{ whiteSpace: 'pre-wrap' }}>{feedback[currQuestion]}</p>
      	            <hr style={{ borderColor: 'var(--border)' }} />
      	            <div className="d-flex justify-content-end">
      	              <Button variant="info" onClick={handleNextQuestion}>
      	                {currQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"}
      	                <FaChevronRight className="ms-2" />
      	              </Button>
      	            </div>
      	          </>
      	        )}
      	      </div>
      	    </Col>
      	  </Row>
      	)}
			</Card>
    </Container>
  );
};

export default InterviewChatbot;
