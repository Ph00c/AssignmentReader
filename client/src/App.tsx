import { useState, useRef } from 'react'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }
  return pages.join('\n')
}

type Status = 'pending' | 'processing' | 'done' | 'error'

interface FileResult {
  fileName: string
  status: Status
  error?: string
}

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<FileResult[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)
    setResults(files.map(f => ({ fileName: f.name, status: 'processing' })))

    try {
      const texts = await Promise.all(files.map(extractPdfText))
      const combined = texts
        .map((text, i) => `=== ${files[i].name} ===\n${text}`)
        .join('\n\n')

      const res = await fetch('/api/Excel', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: combined,
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ParsedSyllabi.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      setResults(files.map(f => ({ fileName: f.name, status: 'done' })))
    } catch (err) {
      setResults(files.map(f => ({ fileName: f.name, status: 'error', error: String(err) })))
    }
    setLoading(false)
  }

  const handleClear = () => {
    setFiles([])
    setResults([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="container">
      <h1>Assignment Reader</h1>
      <div className="upload-card">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={i} className="file-name">{f.name}</li>
            ))}
          </ul>
        )}
        <div className="button-row">
          <button className="btn-submit" onClick={handleSubmit} disabled={files.length === 0 || loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
          <button className="btn-clear" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="response-box">
          <h2>Results</h2>
          {results.map((r, i) => (
            <p key={i} className={`result-${r.status}`}>
              {r.fileName}: {
                r.status === 'pending' ? 'Waiting...' :
                r.status === 'processing' ? 'Processing...' :
                r.status === 'done' ? 'Downloaded' :
                `Failed — ${r.error}`
              }
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
