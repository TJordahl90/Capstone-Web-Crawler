import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SidePanel from "./components/SidePanel";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
import FindJobs from "./components/FindJobs";
import Account from "./components/Account";
import SuggestedJobs from "./components/SuggestedJobs";
import SavedJobs from "./components/SavedJobs";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  	const location = useLocation();
  	const hideNavMenus = ["/", "/login", "/register"];
  	const showNavMenus = !hideNavMenus.includes(location.pathname);

  	return (
  	  	<>
  	    	{showNavMenus ? (
				<>
					<Navbar />
					<SidePanel>
						<Routes>
							<Route path="/find-jobs" element={<FindJobs />} />
							<Route path="/account" element={<Account />} />
							<Route path="/suggested-jobs" element={<SuggestedJobs />} />
							<Route path="/saved-jobs" element={<SavedJobs />} />
						</Routes>
					</SidePanel>
				</>
  	    	) : (
  	      		<Routes>
  	      		  	<Route path="/" element={<LandingPage />} />
  	      		  	<Route path="/login" element={<AuthForm isLogin={true} />} />
  	      		  	<Route path="/register" element={<AuthForm isLogin={false} />} />
  	      		</Routes>
  	    	)}

  	  	</>
  	);
}

export default App;
