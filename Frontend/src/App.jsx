import { useState } from 'react'
import './App.css'

function App() {
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
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
                <p className="status">Ready to analyze video structure...</p>
                <button className="action-btn">Analyze Video (AI)</button>
                <div className="result-placeholder">Analysis results will appear here</div>
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
