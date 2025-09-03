import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar } from 'lucide-react';
import { userService } from '../services/userService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    totalWebsiteUsage: 0,
    dailyLearningTime: [],
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [user, setUser] = useState({ name: 'Student' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userRes, usageRes, coursesRes] = await Promise.all([
        userService.getUserProfile(),
        userService.getUsageStats(),
        userService.getEnrolledCourses()
      ]);

      setUser(userRes.data.user);

      setStats({
        enrolledCourses: coursesRes.data.courses?.length || 0,
        completedCourses: userRes.data.user.completedCourses?.length || 0,
        certificates: userRes.data.user.completedCourses?.length || 0,
        totalWebsiteUsage: usageRes.data.totalWebsiteUsage || 0,
        dailyLearningTime: usageRes.data.dailyLearningTime || []
      });

      setEnrolledCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Continue your learning journey</p>
      </div>

      {/* ===== Stats Section ===== */}
      <div className="dashboard-stats">
        {[
          { icon: <BookOpen size={32} color="#3b82f6" />, value: stats.enrolledCourses, label: 'Enrolled Courses' },
          { icon: <Award size={32} color="#10b981" />, value: stats.completedCourses, label: 'Completed' },
          { icon: <Clock size={32} color="#f59e0b" />, value: formatMinutes(stats.totalWebsiteUsage), label: 'Learning Time' },
          { icon: <TrendingUp size={32} color="#8b5cf6" />, value: stats.certificates, label: 'Certificates' }
        ].map((stat, idx) => (
          <div key={idx} className="stat-card">
            {stat.icon}
            <div className="stat-number">
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ===== Recent Activity / Enrolled Courses ===== */}
      <div className="course-detail-container" style={{ marginTop: '2rem',padding:"10px"}}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0',padding:"10px" }}>
          <Calendar /> Continue Learning
        </h2>
        {enrolledCourses.length > 0 ? (
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-info">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">
                    Instructor: {course.instructor}
                  </p>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Progress</span>
                      <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{course.progress}%</span>
                    </div>
                    <div className="progress-container" style={{ height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', height: '100%', width: `${course.progress}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                  <p className="course-meta">
                    Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn-primary" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Play size={16} /> Continue
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <BookOpen size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>No courses yet</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Start your learning journey by enrolling in a course
            </p>
            <a href="/courses" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Courses</a>
          </div>
        )}
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="plans-grid" style={{ marginTop: '2rem' }}>
        <div className="plan-card">
          <BookOpen size={32} color="#3b82f6" />
          <h3 className="plan-name">Browse Courses</h3>
          <p className="plan-features">Discover new skills</p>
          <a href="/courses" className="btn-outline">Explore</a>
        </div>
        <div className="plan-card">
          <Award size={32} color="#10b981" />
          <h3 className="plan-name">Certificates</h3>
          <p className="plan-features">View achievements</p>
          <button className="btn-outline">View All</button>
        </div>
        <div className="plan-card">
          <TrendingUp size={32} color="#f59e0b" />
          <h3 className="plan-name">Upgrade</h3>
          <p className="plan-features">Get premium access</p>
          <a href="/premium" className="btn-primary">Go Premium</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;