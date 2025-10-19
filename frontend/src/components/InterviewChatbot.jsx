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
	const [error, setError] = useState('');
  	const [screenWidth, setScreenWidth] = useState(window.innerWidth);

	const timerRef = useRef(null);
	const recognitionRef = useRef(null);

  	const location = useLocation();
  	const job = location.state?.job;

	const currQuestion = questions[currQuestionIndex];
    const isAnswered = answers[currQuestion];
    const hasFeedback = feedback[currQuestion];
	const isSpeechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  	const getAIQuestions = async () => {
  	  	setLoading(true);
		setError("");

  	  	let url = "/chatbot_interview/"
  	  	if (job) {
  	  	  	url = `/chatbot_interview/?job_id=${job.id}`;
  	  	}
  	  	try {
  	  	  	const response = await api.get(url);
			console.log(response.data.message);
			setQuestions(response.data.message || []);
			setSessionStarted(true);
  	  	}
  	  	catch (err) {
  	  	  	console.error(err.response?.data?.error || "Failed to get questions. Please try again later.");
			setError(err.response?.data?.error || "Failed to get questions. Please try again later.")
  	  	}
  	  	finally {
  	  	  	setLoading(false);
  	  	}
	};

  	const getAIFeedback = async (question, answer) => {
  	  	setLoading(true);
		setError("");

  	  	try {
  	  	  	const response = await api.post("/chatbot_interview/", { question: question, answer: answer });
			console.log(response.data.message);
			setFeedback(prev => ({...prev, [question]: response.data.message}))
		}
  	  	catch (err) {
  	  	  	console.error(err.response?.data?.error || "Failed to get feedback. Please try again later.");
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
			console.log(response.data);
			setSummaryGrade(response.data[0]);
            setSummaryAnalysis(response.data[1]);
            setSummaryHired(response.data[2]);
		}
  	  	catch (err) {
  	  	  	console.error(err.response?.data?.error || "Failed to get feedback. Please try again later.");
			setError(err.response?.data?.error || "Failed to get feedback. Please try again later.")
  	  	}
  	  	finally {
  	  	  	setLoading(false);
  	  	}
  	};

	const handleAnswerSubmit = (e) => {
		e.preventDefault();
		const currentQuestion = questions[currQuestionIndex];
		setAnswers(prev => ({...prev, [currentQuestion]: currAnswer}));
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
        
        recognition.onend = () => {
            setIsRecording(false);
        };

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
        setAnswers(prev => ({...prev, [currentQuestion]: voiceTranscript}));
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

    // This will display the instruction page
	if (!sessionStarted && !sessionEnded) {
		return (
			<Container className="d-flex justify-content-center align-items-center text-center text-white" style={{ height: 'calc(100vh - 52px)' }}>
                <div>
                    <h1>{job ? `Mock Interview for ${job.title}` : 'General Interview Prep'}</h1>
                    <p className="lead text-white-50 mt-3" style={{ maxWidth: '600px', margin: 'auto' }}>
    					Welcome to your AI-powered interview practice session. This tool is designed to help you refine your answers and build confidence. Here's how it works:
    				</p>

    				<div className="d-flex justify-content-center gap-5 mt-5 text-start">
    				    <div>
    				        <h5 style={{ color: '#00ADB5' }}>1. Answer the Question</h5>
    				        <p className="text-white-50">You'll be presented with three questions one at a time. Take a moment to structure your thoughts and provide a complete answer by typing or using the voice recording feature.</p>
    				    </div>
    				    <div>
    				        <h5 style={{ color: '#00ADB5' }}>2. Get Instant Feedback</h5>
    				        <p className="text-white-50">Once you submit your answer, our AI coach will provide immediate, structured feedback on your response, highlighting your strengths and areas for improvement.</p>
    				    </div>
    				    <div>
    				        <h5 style={{ color: '#00ADB5' }}>3. Proceed and Improve</h5>
    				        <p className="text-white-50">Review the feedback, then click "Next Question" to continue. Use what you've learned to make your next answer even better.</p>
    				    </div>
    				</div>
                    <Button variant="info" size="lg" onClick={getAIQuestions} disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Begin Interview"}
                    </Button>
                </div>
            </Container>
		)
	}

    // This will display the overall summary page
    if (sessionStarted && sessionEnded) {
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <p>grade: {summaryGrade}</p>
                        <p>analysis: {summaryAnalysis}</p>
                        <p>hired: {summaryHired}</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // This will display an error message about the chat limit
    if (!sessionStarted && sessionEnded) {
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <p>reached your limit of questions today. try again tommorow</p>
                        <p>view results from todays mock interview [link]</p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

	if (questions.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 52px)' }}>
                <Spinner animation="border" variant="info" />
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ maxWidth: '1000px' }}>
            <style>{`
                .btn-outline-secondary:hover {
                    color: #fff;
                    background-color: var(--hover2, #4a5568);
                }
            `}</style>

            {/* Header & Progress Section */}
            <Row>
                <Col>
                    <div className="text-center text-white mb-4">
                        <h2 className="mb-2" style={{ color: 'var(--text2)' }}>{job ? `Mock Interview: ${job.title}` : 'General Interview Prep'}</h2>
                        <p className="lead" style={{ color: 'var(--text6)', fontSize: '1.1rem' }}>
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
                    <div style={{ backgroundColor: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text2)' }}>
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
                        <div style={{ backgroundColor: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text2)' }}>
                            <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text2)' }}>Your Answer</h5>
                            <p style={{ color: 'var(--title)', fontSize: '1.1rem', margin: 0 }}>
                                <i>{answers[currQuestion]}</i>
                            </p>
                        </div>
                    </Col>
                </Row>
            ) : (
                <Row className="mb-4">
                    <Col>
                        <div style={{ backgroundColor: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text2)' }}>
                            {/* Input Toggle Button */}
                            <Row className="mb-3" style={{ alignItems: 'center' }}>
                                <Col>
                                    <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text2)', margin: 0 }}>
                                        Provide Your Answer
                                    </h5>
                                </Col>
                                <Col xs="auto">
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={toggleInputType} 
                                        style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text2)', borderColor: 'var(--border)' }}
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
                                    <Form.Control 
                                        as="textarea" 
                                        rows={5} 
                                        value={currAnswer} 
                                        onChange={(e) => setCurrAnswer(e.target.value)} 
                                        placeholder="Type your answer here..."
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--searchbg)', color: 'var(--searchtxt)' }}
                                    />
                                    <Button 
                                        variant="outline-secondary" 
                                        type="submit" 
                                        disabled={loading} 
                                        className="mt-3" 
                                        style={{ display: 'flex', color: 'var(--text2)', borderColor: 'var(--border)' }}
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
                                            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--title)' }}>{formatTime(timer)}</span>
                                            <Button 
                                                variant="outline-secondary"
                                                onClick={handleToggleRecording}
                                                style={isRecording ?
                                                    { fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text2)', borderColor: 'var(--border)', backgroundColor: 'var(--border)'}:
                                                    { fontSize: '0.9rem', display: 'flex', alignItems: 'center', color: 'var(--text2)', borderColor: 'var(--border)' }
                                                }
                                            >
                                                <FaMicrophone className="me-2" />
                                                {isRecording ? "Stop" : "Record"}
                                            </Button>
                                        </div>
                                        <p className="w-100" style={{ minHeight: '50px', color: 'var(--title, gray)' }}>
                                            <i>{voiceTranscript || "Your transcribed answer will appear here..."}</i>
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={handleVoiceSubmit} 
                                        disabled={loading || isRecording || !voiceTranscript.trim()} 
                                        className="mt-3"
                                        style={{ display: 'flex', alignItems: 'center', color: 'var(--text2)', borderColor: 'var(--border)' }}
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
                        <div style={{ backgroundColor: 'var(--bg3)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '0.375rem', color: 'var(--text2)' }}>
                            <h5 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text2)' }}>AI Feedback</h5>
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
        </Container>
    );
};

export default InterviewChatbot;
