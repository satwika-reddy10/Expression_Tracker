import React, { useState, useEffect } from 'react';

function AdminApp() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/sessions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSessionClick = async (sessionId) => {
    setSelectedSession(sessionId);
    try {
      const response = await fetch(`http://localhost:5000/analyze/${sessionId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Received analysis data:", data); // Add this line for debugging
      setAnalysisData(data);
    } catch (error) {
      console.error('Error analyzing session:', error);
    }
  };

  const renderBarChart = () => {
    if (!analysisData || !analysisData.overallAnalysis) return null;

    const emotions = analysisData.overallAnalysis.emotions;
    const maxValue = Math.max(...Object.values(emotions).map(v => parseFloat(v)));

    return (
      <div style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}>
        <h3>Overall Emotion Analysis</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(emotions).map(([emotion, value]) => (
            <div key={emotion} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100px', textAlign: 'right', marginRight: '10px' }}>{emotion}</div>
              <div style={{ flex: 1, backgroundColor: '#f0f0f0', height: '20px' }}>
                <div
                  style={{
                    width: `${(parseFloat(value) / maxValue) * 100}%`,
                    backgroundColor: '#0088FE',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                >
                  {parseFloat(value).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', marginRight: '20px' }}>
          <h3>Sessions</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {sessions.map((session) => (
              <li 
                key={session} 
                onClick={() => handleSessionClick(session)}
                style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ddd', marginBottom: '5px' }}
              >
                {session}
              </li>
            ))}
          </ul>
        </div>
        {selectedSession && analysisData && (
          <div style={{ width: '70%' }}>
            <h3>Analysis for Session: {selectedSession}</h3>
            {renderBarChart()}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {analysisData.imageAnalyses.map((analysis, index) => (
                <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
                  <img 
                    src={`http://localhost:5000/uploads/webcam_images/${selectedSession}/${analysis.imagePath}`} 
                    alt={`Webcam ${index}`} 
                    style={{ width: '200px', height: 'auto' }}
                  />
                  <div>
                    {Object.entries(analysis.emotions).map(([emotion, value]) => (
                      <p key={emotion}>{emotion}: {parseFloat(value).toFixed(2)}%</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminApp;