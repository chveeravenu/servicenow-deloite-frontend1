import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Premium from './pages/Premium';
import Dashboard from './pages/Dashboard';
import './App.css';
import { userService } from './services/userService';

function Trackers() {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let websiteSeconds = 0;
    const websiteTimer = setInterval(() => {
      if (document.hidden) return;
      websiteSeconds += 1;
      if (websiteSeconds % 60 === 0) {
        userService.updateWebsiteUsage({ minutesSpent: 1 }).catch(() => { });
      }
    }, 1000);

    return () => clearInterval(websiteTimer);
  }, []);

  useEffect(() => {
    const onCoursePage = /^\/course\/[^/]+$/.test(location.pathname);
    if (!onCoursePage) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    let learningSeconds = 0;
    const learningTimer = setInterval(() => {
      if (document.hidden) return;
      learningSeconds += 1;
      if (learningSeconds % 60 === 0) {
        userService.updateLearningTime({ minutesSpent: 1 }).catch(() => { });
      }
    }, 1000);

    return () => clearInterval(learningTimer);
  }, [location.pathname]);

  return null;
}

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      userService.updateLoginHistory().catch(() => { });
    }
  }, []);

  return (
    <Router>
      <Trackers />
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;