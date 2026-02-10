import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<div>Linglify MVP+</div>} />
      </Routes>
    </div>
  )
}

export default App
