import React, { useState, useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { Button, Form, Card, Accordion, Container, Spinner, InputGroup, Alert, ProgressBar } from "react-bootstrap";
import { FaKeyboard, FaMicrophone, FaChevronRight } from "react-icons/fa";
import api from "../api";

const InterviewChatbot = () => {
	const [sessionStarted, setSessionStarted] = useState(false);
  	const [questions, setQuestions] = useState([]);
  	const [answers, setAnswers] = useState({});
	const [feedback, setFeedback] = useState({});
	const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
	const [currAnswer, setCurrAnswer] = useState("");
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
  	  	let url = "/ai_chatbot/"
  	  	if (job) {
  	  	  	url = `/ai_chatbot/?job_id=${job.id}`;
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
  	  	  	const response = await api.post("/ai_chatbot/", { question: question, answer: answer });
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
			// display finally summary page - need to implement
			alert("Interview complete!");
		}
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

	if (!sessionStarted) {
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

	if (questions.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 52px)' }}>
                <Spinner animation="border" variant="info" />
            </Container>
        );
    }

  	return (
  	  	<Container className="py-5" style={{ maxWidth: '700px' }}>
            <style>{`
                .accordion-button {
                    background-color: #222831 !important;
                    color: #e2e8f0 !important;
                    box-shadow: none !important;
                }
                .accordion-button::after {
                    filter: brightness(0) invert(1);
                }
                .accordion-body {
                    background-color: #222831 !important;
                    color: #e2e8f0 !important;
                }
            `}</style>

            <h2 className="text-center mb-2 text-white">{job ? `Mock Interview: ${job.title}` : 'General Interview Prep'}</h2>
            {/* <ProgressBar 
                now={((currQuestionIndex) / questions.length) * 100} 
                className="mb-4"
            /> */}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', color: '#e2e8f0', overflow: 'hidden' }}>
                <Card.Body className="p-4">
                    <Card.Title as="h5" className="mb-4">{currQuestion}</Card.Title>

                    {isAnswered ? (
                        <p><strong>Your Answer:</strong><br/><i>{answers[currQuestion]}</i></p>
                    ) : (
                        <Form onSubmit={handleAnswerSubmit}>
                            {inputType === 'text' ? (
                                <InputGroup className="mb-3">
                                    <Button variant="outline-secondary" onClick={() => setInputType('voice')}> <FaMicrophone /> </Button>
                                    <Form.Control as="textarea" rows={5} value={currAnswer} onChange={(e) => setCurrAnswer(e.target.value)} />
                                </InputGroup>
                            ) : (
                                <InputGroup className="mb-3">
                                    <Button variant="outline-secondary" onClick={() => setInputType('text')}> <FaKeyboard /> </Button>
                                    {!isSpeechRecognitionSupported ? (
                                        <div className="text-center p-3 border rounded text-white-50 w-100">Voice input is not supported in your browser.</div>
                                    ) : (
                                        <div className="d-flex flex-column align-items-center justify-content-center w-100 border rounded p-3">
                                            <div className="w-100 d-flex justify-content-between align-items-center mb-3">
                                                <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#9ca3af' }}>{formatTime(timer)}</span>
                                                <Button variant={isRecording ? "danger" : "primary"} onClick={handleToggleRecording}>
                                                    <FaMicrophone className="me-2" />
                                                    {isRecording ? "Stop" : "Record"}
                                                </Button>
                                            </div>
                                            <p className="text-white-50 w-100" style={{ minHeight: '50px' }}><i>{voiceTranscript || "Your transcribed answer will appear here..."}</i></p>
                                        </div>
                                    )}
                                </InputGroup>
                            )}

                            {inputType === 'text' ? (
                                <Button type="submit" disabled={loading}>Submit Answer</Button>
                            ) : (
                                <Button onClick={handleVoiceSubmit} disabled={loading || isRecording || !voiceTranscript.trim()}>Submit Voice Answer</Button>
                            )}
                        </Form>
                    )}
                </Card.Body>

                <Accordion activeKey={hasFeedback ? "0" : null} >
                    <Accordion.Item eventKey="0" style={{ border: 'none' }}>
                        <Accordion.Header disabled={!isAnswered}>
                            AI Feedback {loading && !hasFeedback && <Spinner size="sm" className="ms-2" />}
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="0">
                            <Accordion.Body>
                                {hasFeedback && (
                                    <>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{feedback[currQuestion]}</p>
                                        <Button variant="info" className="d-flex justify-content-end mt-3" onClick={handleNextQuestion}>
                                            {currQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"} <FaChevronRight />
                                        </Button>
                                    </>
                                )}
                            </Accordion.Body>
                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion>
            </Card>
        </Container>
  	);
};

export default InterviewChatbot;
