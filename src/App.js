import React, { useEffect, useState } from 'react';
import './App.css';
import User from "./component/user";
import Mechanic from "./component/mechanic";
import Home from "./component/home";
import Cars, { VehicleDetails } from "./component/car";
import Customer from "./component/cust";
import History from "./component/history";
import About from "./component/about";
import Feedback from "./component/feedback";
import { ThemeContext } from './component/layout';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/') {
    return null;
  }

  const fallbackRoutes = {
    '/mechanic': '/',
    '/home': '/mechanic',
    '/cars': '/home',
    '/history': '/home',
    '/about': '/home',
    '/feedback': '/home',
    '/customer': '/',
  };
  const historyIndex = window.history.state?.idx;
  const canGoBack =
    (typeof historyIndex === 'number' && historyIndex > 0) ||
    Boolean(fallbackRoutes[location.pathname]);

  const handleBack = () => {
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
      className="back-button"
    >
      <span aria-hidden="true">←</span> Back
    </button>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const routerBasename = process.env.PUBLIC_URL.replace(/^https?:\/\/[^/]+/, '');

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', darkMode);
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme: () => setDarkMode((current) => !current) }}>
      <BrowserRouter basename={routerBasename}>
        <BackButton />
        <Routes>
          <Route path="/" element={<User />} />
          <Route path="/mechanic" element={<Mechanic />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:vehicleId" element={<VehicleDetails />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/customer" element={<Customer />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;
