import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api.js";

const TrendAnalysis = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Call your Django API
    api.get("/job_statistics/") // adjust to your actual endpoint
      .then(res => {
        // Convert month into a readable string
        const formatted = res.data.map(item => ({
          ...item,
          month: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        }));
        setData(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <Card>
        <Card.Body>
          <Card.Title>Trend Analysis</Card.Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalJobs" fill="#8884d8" name="Job Openings" />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TrendAnalysis;
