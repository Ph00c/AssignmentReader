import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [responseData, setResponseData] = useState<any>(null)

  const handleSubmit = () => {
    if (!file) return
    console.log('Submitting file:', file.name)
    const form = new FormData()
    form.append('file', file)
    fetch('/api/upload', {
      method: 'POST',
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Response from backend:', data)
        setResponseData(data)
      })
      .catch((error) => {
        console.error('Error uploading file:', error)
        alert('Failed to upload file.')
      })
  }

  const  handleClear = async () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    const response = await fetch('/api/bello', { method: 'GET' })
    const data = await response.json()
    console.log('Response from backend:', data)
   
    
  }

  return (
    <div className="container">
      <h1>Assignment Reader</h1>
      <div className="upload-card">
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && <p className="file-name">{file.name}</p>}
        <div className="button-row">
          <button className="btn-submit" onClick={handleSubmit} disabled={!file}>
            Submit
          </button>
          <button className="btn-clear" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
      {responseData !== null && (
        <div className="response-box">
          <h2>Response</h2>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
