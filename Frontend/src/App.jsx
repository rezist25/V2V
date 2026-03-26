import { useState } from 'react'
import { GoogleGenerativeAI as GoogleGenAI } from "@google/generative-ai"
import './App.css'

function App() {
  // Access the API key from environment variables
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
    }
  }

  // Helper to convert file to Base64
  const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeVideo = async () => {
    if (!videoFile) return;
    
    setIsAnalyzing(true)
    setAiInsights(null)

    try {
      // 1. Prepare the video data
      const videoPart = await fileToGenerativePart(videoFile);

      // 2. Prepare the prompt
      const prompt = `
        This is a video that needs to be perfectly recreated. Analyze the video and provide the exact timing, 
        transition names, effect details, and any presets applied (like color grading). 
        I need this data to make a same-to-same version of this video.

        Return the result STRICTLY as a JSON array of objects with the following keys:
        "time" (e.g., "00:05"), "type" (cut, transition, effect, or preset), and "label" (detailed name).
      `;

      // 3. Initialize the AI with the requested Gemini 3 Flash Preview model
      const ai = new GoogleGenAI(API_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

      // Prepare the contents array as per your requested structure
      const contents = [
        videoPart,
        { text: prompt }
      ];

      const result = await model.generateContent(contents);
      const response = await result.response;
      const textResponse = await response.text();
      
      // Extract and parse the JSON response
      const jsonString = textResponse.replace(/```json|```/g, '').trim();
      const insights = JSON.parse(jsonString);

      setAiInsights(insights);
    } catch (error) {
      console.error("Error analyzing video:", error);
      alert("AI Analysis failed. See console for details.");
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">V2V Editor</div>
        <nav>
          <button>New Project</button>
          <button>Export</button>
        </nav>
      </header>

      <main className="main-content">
        {!videoFile ? (
          <div className="upload-container">
            <div className="upload-card">
              <h2>Start Your Project</h2>
              <p>Upload a video to begin AI analysis</p>
              <label className="file-upload-btn">
                Choose File
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden-input"
                  onChange={handleFileUpload} 
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="workspace">
            <div className="video-area">
              {/* The video wrapper helps isolate the layout context */}
              <div className="video-wrapper">
                <video className="video-player" controls src={videoUrl}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <div className="sidebar">
              <h3>AI Assistant</h3>
              <div className="sidebar-content">
                {!aiInsights && !isAnalyzing && (
                  <>
                    <p className="status" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Ready to analyze video structure, transitions, and effects.
                    </p>
                    <button className="action-btn" onClick={analyzeVideo}>Analyze Video (AI)</button>
                  </>
                )}
                
                {isAnalyzing && (
                  <div className="result-placeholder">
                    <div className="spinner">✨</div>
                    <p>Agent is watching video...</p>
                  </div>
                )}

                {aiInsights && (
                  <div className="insights-list" style={{ marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Analysis Results:</h4>
                    {aiInsights.map((insight, index) => (
                      <div key={index} style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '10px', 
                        marginBottom: '8px', 
                        borderRadius: '4px',
                        borderLeft: `3px solid ${insight.type === 'transition' ? '#aa3bff' : '#646cff'}`
                      }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>{insight.time}</span>
                        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{insight.label}</span>
                      </div>
                    ))}
                    <button className="action-btn" style={{ marginTop: '20px', background: '#2a2a2a' }}>Apply All Suggestions</button>
                  </div>
                )}
              </div>
            </div>

            <div className="timeline-area">
              <div className="timeline-header">
                <span>00:00</span>
                <span>00:15</span>
                <span>00:30</span>
              </div>
              <div className="track-container">
                <div className="track video-track">Video Track</div>
                <div className="track audio-track">Audio Track</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
