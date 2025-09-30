import React, { useState, useEffect } from "react";
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
  	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
  	const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  	const location = useLocation();
  	const job = location.state?.job;

	const currQuestion = questions[currQuestionIndex];
    const isAnswered = answers[currQuestion];
    const hasFeedback = feedback[currQuestion];

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
            <ProgressBar 
                now={((currQuestionIndex) / questions.length) * 100} 
                className="mb-4"
            />
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', color: '#e2e8f0', overflow: 'hidden' }}>
                <Card.Body className="p-4">
                    <Card.Title as="h5" className="mb-4">{currQuestion}</Card.Title>

                    {isAnswered ? (
                        <p><strong>Your Answer:</strong><br/><i>{answers[currQuestion]}</i></p>
                    ) : (
                        <Form onSubmit={handleAnswerSubmit}>
                            <InputGroup className="mb-3">
                            	{inputType === 'text' ? (
									<>
                            		    <Button variant="outline-secondary" onClick={() => setInputType(inputType === 'voice')}>
                            		        <FaMicrophone />
                            		    </Button>

                            		        <Form.Control 
                            		            as="textarea" 
                            		            rows={5} 
                            		            placeholder="Type your answer here..."
                            		            value={currAnswer}
                            		            onChange={(e) => setCurrAnswer(e.target.value)}
                            		        />
										</>
                            	) : (
                            	    <>
                            	        
                            	        <div className="d-flex align-items-center justify-content-between w-100 border rounded p-3">
											<Button variant="outline-secondary" onClick={() => setInputType('text')}>
                            	            	<FaKeyboard />
                            	        	</Button>
											{/* need to implement this */}
                                            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#9ca3af' }}>
                                                00:00
                                            </span>
                                            <Button variant="outline-secondary" onClick={() => {}}>
                                                <FaMicrophone />
                                            </Button>
                                        </div>
                            	    </>
                            	)}
                            </InputGroup>
                            <Button type="submit" disabled={loading}>Submit Answer</Button>
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
