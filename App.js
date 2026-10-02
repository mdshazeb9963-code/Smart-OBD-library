import './App.css';
import User from "./component/user";
import Mechanic from "./component/mechanic";
import Home from "./component/home";
import Cars from "./component/car";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackRoutes = {
    '/mechanic': '/',
    '/home': '/mechanic',
    '/cars': '/home',
  };
  const canGoBack = location.pathname !== '/';

  const handleBack = () => {
    const historyIndex = window.history.state?.idx;
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackRoutes[location.pathname] || '/');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={!canGoBack}
      aria-label="Go back"
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 1000,
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: canGoBack ? '#6c757d' : '#adb5bd',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: canGoBack ? 'pointer' : 'not-allowed',
      }}
    >
      ← Back
    </button>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BackButton />
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/mechanic" element={<Mechanic />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
