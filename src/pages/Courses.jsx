import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Play } from 'lucide-react';
import { courseService } from '../services/courseService';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'free') return !course.isPremium;
    if (filter === 'premium') return course.isPremium;
    return true;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Discover thousands of courses taught by expert instructors</p>

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          <button
            className={filter === 'all' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setFilter('all')}
          >
            All Courses
          </button>
          <button
            className={filter === 'free' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setFilter('free')}
          >
            Free Courses
          </button>
          <button
            className={filter === 'premium' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setFilter('premium')}
          >
            Premium Courses
          </button>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-thumbnail" style={{ padding: 0 }}>
              <img 
                src={course.thumbnailUrl} 
                alt={`Thumbnail for ${course.title}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div className="course-info">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} />
                    <span>{course.students}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                {course.isPremium ? (
                  <span className="premium-badge">Premium</span>
                ) : (
                  <span className="free-badge">Free</span>
                )}
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div className="course-price">
                  {course.isPremium ? 'Premium' : 'Free'}
                </div>
                <Link
                  to={`/course/${course._id}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3>No courses found</h3>
          <p>Try adjusting your filters or check back later for new courses.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;