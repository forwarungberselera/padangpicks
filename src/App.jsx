import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import SiteIntroModal from './components/SiteIntroModal';
import Home from './pages/Home';
import Hotel from './pages/Hotel';
import Lifestyle from './pages/Lifestyle';
import Admin from './pages/Admin';
import Account from './pages/Account';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <SiteIntroModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
