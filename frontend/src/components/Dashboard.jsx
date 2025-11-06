import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import api from "../api.js";

const Dashboard = () => {

  	return (
  	  	<Card>
            <p>dashboard that displays a welcome message, couple of the top matched jobs, a couple of the most recent jobs, top skill of the week, message the tells user to try interview chatbot</p>
        </Card>
  	);
};

export default Dashboard;
