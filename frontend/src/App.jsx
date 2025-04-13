import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import FindJobs from "./components/FindJobs";
import Account from "./components/Account";
import SuggestedJobs from "./components/SuggestedJobs";
import SavedJobs from "./components/SavedJobs";
import Verification from "./components/Verification";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
	const location = useLocation();
	const hideNavMenus = ["/", "/login", "/register", "/verification"];
	const showNavMenus = !hideNavMenus.includes(location.pathname);

	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 620);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 620);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			{showNavMenus ? (
				<>
					<Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
					{!isMobile ? (
						<SidePanel collapsed={collapsed}>
							<Routes>
								<Route path="/find-jobs" element={<FindJobs />} />
								<Route path="/account" element={<Account />} />
								<Route path="/suggested-jobs" element={<SuggestedJobs />} />
								<Route path="/saved-jobs" element={<SavedJobs />} />
							</Routes>
						</SidePanel>
					) : (
						// On mobile, just render the page directly without SidePanel
						<Routes>
							<Route path="/find-jobs" element={<FindJobs />} />
							<Route path="/account" element={<Account />} />
							<Route path="/suggested-jobs" element={<SuggestedJobs />} />
							<Route path="/saved-jobs" element={<SavedJobs />} />
						</Routes>
					)}
				</>
			) : (
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/login" element={<AuthForm isLogin={true} />} />
					<Route path="/register" element={<AuthForm isLogin={false} />} />
					<Route path="/verification" element={<Verification />} />
				</Routes>
			)}
		</>
	);
}

export default App;
