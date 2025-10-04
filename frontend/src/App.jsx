import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import AccountSetup from "./components/AccountSetup";
import FindJobs from "./components/FindJobs";
import Account from "./components/Account";
import Verification from "./components/Verification";
import MobileNavBar from "./components/MobileNavBar";
import PasswordReset from "./components/PasswordReset";
import Documents from "./components/Documents";
import TrendAnalysis from "./components/TrendAnalysis";
import InterviewChatbot from "./components/InterviewChatbot";
import backgroundImage from "./assets/background4.png";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
	const location = useLocation();
	const hideNavMenus = ["/", "/login", "/register", "/verification", "/password-reset", "/account-setup"];
	const showNavMenus = !hideNavMenus.includes(location.pathname);

	const [collapsed, setCollapsed] = useState(false);
	const [isSmallWidth, setIsSmallWidth] = useState(
		window.innerWidth > 480 && window.innerWidth <= 910
	);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			setIsMobile(width <= 480);
			setIsSmallWidth(width > 480 && width <= 910);
			setCollapsed(width < 1000);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div
			style={{
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				minHeight: "100vh",
				width: "100%",
				position: "relative",
			}}
		>
			{showNavMenus ? (
				<>
					<Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
					<SidePanel collapsed={collapsed}>
						<Routes>
							<Route path="/find-jobs" element={<FindJobs jobPostTypeProp="all" />} />
							<Route path="/matched-jobs" element={<FindJobs jobPostTypeProp="matched" />} />
							<Route path="/saved-jobs" element={<FindJobs jobPostTypeProp="saved" />} />
							<Route path="/account" element={<Account />} />
							<Route path="/documents" element={<Documents />} />
							<Route path="/trend-analysis" element={<TrendAnalysis />} />
							<Route path="/interview-chatbot" element={<InterviewChatbot />} />
						</Routes>
						{isMobile && <MobileNavBar />}
					</SidePanel>
				</>
			) : (
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<AuthForm isLogin={true} />} />
					<Route path="/register" element={<AuthForm isLogin={false} />} />
					<Route path="/verification" element={<Verification />} />
					<Route path="/password-reset" element={<PasswordReset />} />
					<Route path="/account-setup" element={<AccountSetup />} />
				</Routes>
			)}
		</div>
	);

}

export default App;
