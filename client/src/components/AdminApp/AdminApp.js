import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./AdminApp.css";

function AdminApp() {
  const [sessions, setSessions] = useState([]);
  const [sessionDates, setSessionDates] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://localhost:5000/sessions");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSessions(data.sessions);
      setSessionDates(data.sessionDates || {});
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleSessionClick = async (sessionId) => {
    setSelectedSession(sessionId);
    try {
      const response = await fetch(
        `http://localhost:5000/analyze/${sessionId}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          setAnalysisData({
            imageAnalyses: [],
            overallAnalysis: { emotions: {} },
          });
        } else {
          throw new Error("Network response was not ok");
        }
      }
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error("Error analyzing session:", error);
    }
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setAnalysisData(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderTable = () => {
    if (!analysisData || analysisData.imageAnalyses.length === 0) return null;

    return (
      <div className="table-container">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Webcam Capture</th>
              <th>Game Screenshot</th>
              <th>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.imageAnalyses.map((analysis, index) => (
              <tr key={index}>
                <td>
                  <img
                    src={`http://localhost:5000/uploads/webcam_images/${selectedSession}/${analysis.imagePath}`}
                    alt={`Webcam ${index}`}
                    className="webcam-image"
                    loading="lazy"
                  />
                </td>
                <td>
                  <img
                    src={`http://localhost:5000/uploads/screenshots/${selectedSession}/${analysis.imagePath}`}
                    alt={`Game Screenshot ${index}`}
                    className="screenshot-image"
                    loading="lazy"
                  />
                </td>
                <td className="analysis-data">
                  <h4>Emotion Analysis:</h4>
                  {Object.entries(analysis.emotions).map(([emotion, value]) => (
                    <div key={emotion} className="emotion-item">
                      <span>{emotion}:</span>
                      <span>{parseFloat(value).toFixed(2)}%</span>
                    </div>
                  ))}
                  <div className="dominant-emotion">
                    <strong>Dominant Emotion: </strong>
                    <span>{analysis.dominantEmotion}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPieChart = () => {
    if (
      !analysisData ||
      !analysisData.overallAnalysis ||
      Object.keys(analysisData.overallAnalysis.emotions).length === 0
    )
      return null;

    const emotions = analysisData.overallAnalysis.emotions;
    const emotionLabelsWithEmojis = {
      happy: "😊 Happy",
      sad: "😢 Sad",
      angry: "😠 Angry",
      surprised: "😮 Surprised",
      fearful: "😨 Fearful",
      neutral: "😐 Neutral",
      disgust: "🤢 Disgust",
      fear: "😨 Fear",
      surprise: "😯 Surprise",
    };

    const data = {
      labels: Object.keys(emotions).map(
        (emotion) => emotionLabelsWithEmojis[emotion] || emotion
      ),
      datasets: [
        {
          data: Object.values(emotions).map((v) => parseFloat(v)),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#C9CBCF",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: true,
        },
      },
    };

    return (
      <div className="pie-chart-container">
        <Pie data={data} options={options} />
      </div>
    );
  };

  const renderSessionsList = () => (
    <div className="sessions-list-container">
      <h3>Local Sessions</h3>
      <div className="sessions-list">
        {sessions.length > 0 ? (
          <ul>
            {sessions.map((session) => (
              <li
                key={session}
                onClick={() => handleSessionClick(session)}
                className="session-item"
              >
                <div>{session}</div>
                {sessionDates[session] && (
                  <div>Created: {formatDate(sessionDates[session])}</div>
                )}
              </li>
            ))}
          </ul>
        ) : null}{" "}
        {/* Do not display anything if sessions array is empty */}
      </div>
    </div>
  );

  return (
    <div className="admin-app-container">
      <h2>Emotion Analysis Dashboard</h2>
      <div className="content-container">
        {selectedSession ? (
          <>
            {renderPieChart()}
            {renderTable()}
            <button
              onClick={handleBackToSessions}
              className="back-to-sessions-btn"
            >
              ← Back to Sessions
            </button>
          </>
        ) : (
          renderSessionsList()
        )}
      </div>
    </div>
  );
}

export default AdminApp;
