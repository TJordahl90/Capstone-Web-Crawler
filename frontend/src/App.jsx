import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import FindJobs from "./components/FindJobs";
import Account from "./components/Account";
import SavedJobs from "./components/SavedJobs";
import Verification from "./components/Verification";
import MobileNavBar from "./components/MobileNavBar";
import PasswordReset from "./components/PasswordReset";
import Documents from "./components/Documents";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
	const location = useLocation();
	const hideNavMenus = ["/", "/login", "/register", "/verification", "/password-reset"];
	const showNavMenus = !hideNavMenus.includes(location.pathname);

	const [collapsed, setCollapsed] = useState(false);
	const [isSmallWidth, setIsSmallWidth] = useState(
		window.innerWidth > 480 && window.innerWidth <= 770
	);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			setIsMobile(width <= 480);
			setIsSmallWidth(width > 480 && width <= 770);
			setCollapsed(width < 1000);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<>
			{showNavMenus ? (
				<>
					<Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
					<SidePanel collapsed={collapsed}>
						<Routes>
							<Route path="/find-jobs" element={<FindJobs />} />
							<Route path="/saved-jobs" element={<SavedJobs />} />
							<Route path="/account" element={<Account />} />
							<Route path="/documents" element={<Documents />} />
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
				</Routes>
			)}
		</>
	);

}

export default App;
