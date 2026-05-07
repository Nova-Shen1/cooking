import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EditPage from './pages/EditPage'
import DetailPage from './pages/DetailPage'
import ProfilePage from './pages/ProfilePage'
import { AppProvider } from './contexts/AppContext'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/recipe/:id" element={<DetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
