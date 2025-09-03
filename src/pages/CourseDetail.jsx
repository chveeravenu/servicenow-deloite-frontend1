import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Users, Star, CheckCircle, Lock, User, X, Mail, AlertTriangle } from 'lucide-react';
import { courseService } from '../services/courseService';
import { userService } from '../services/userService';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [totalLessons, setTotalLessons] = useState(0);
  
  // OTP Modal states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // New states for cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState('');

  const videoRef = useRef(null);
  const progressUpdateTimeout = useRef(null);
  const watchTimeRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);

  useEffect(() => {
    if (id) {
      loadCourseAndEnrollmentStatus(id);
    }
  }, [id]);

  // Enhanced YouTube progress tracking
  useEffect(() => {
    const iframe = videoRef.current;
    if (iframe && currentLesson && isEnrolled) {
      
      const handleMessage = (event) => {
        if (event.origin !== 'https://www.youtube.com') return;
        
        try {
          const data = JSON.parse(event.data);
          
          // Handle different YouTube API events
          if (data.event === 'video-progress') {
            handleVideoProgress(data.info);
          } else if (data.info && typeof data.info === 'object') {
            // Handle direct progress data
            if (data.info.currentTime !== undefined && data.info.duration !== undefined) {
              handleVideoProgress(data.info);
            }
          }
        } catch (error) {
          console.log('YouTube message parsing - this is normal:', error.message);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Also set up periodic progress checking for YouTube videos
      const progressInterval = setInterval(() => {
        if (iframe && iframe.contentWindow) {
          try {
            // Try to get video progress via postMessage
            iframe.contentWindow.postMessage('{"event":"listening"}', 'https://www.youtube.com');
          } catch (error) {
            console.log('Could not communicate with YouTube iframe');
          }
        }
      }, 10000); // Check every 10 seconds
      
      return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(progressInterval);
      };
    }
  }, [currentLesson, isEnrolled]);

  const loadCourseAndEnrollmentStatus = async (courseId) => {
    try {
      setLoading(true);
      const courseResponse = await courseService.getCourseById(courseId);
      const fetchedCourse = courseResponse.data.course;
      setCourse(fetchedCourse);

      // Calculate total lessons
      const totalLessonCount = fetchedCourse.modules?.reduce((total, module) => {
        return total + (module.lessons?.length || 0);
      }, 0) || 0;
      setTotalLessons(totalLessonCount);

      const userEmail = localStorage.getItem('emai'); // Note: you have 'emai' instead of 'email'
      
      if (userEmail) {
        try {
          const enrollmentResponse = await axios.post("https://sdb1.onrender.com/user/coursechec", {
            courseId: courseId,
            email: userEmail
          });
          
          console.log('Enrollment check response:', enrollmentResponse.data);
          
          if (enrollmentResponse.data.success && enrollmentResponse.data.isEnrolled) {
            setIsEnrolled(true);
            setProgress(enrollmentResponse.data.progress || 0);
            
            // Set completed lessons if available
            if (enrollmentResponse.data.completedLessons && Array.isArray(enrollmentResponse.data.completedLessons)) {
              setCompletedLessons(new Set(enrollmentResponse.data.completedLessons));
            }
          } else {
            setIsEnrolled(false);
            setProgress(0);
            setCompletedLessons(new Set());
          }
          
        } catch (enrollmentError) {
          console.error('Error checking enrollment status:', enrollmentError);
          setIsEnrolled(false);
        }
      }

      // Set initial video
      if (fetchedCourse.previewVideo) {
        setCurrentVideo(fetchedCourse.previewVideo);
      } else {
        const firstLesson = fetchedCourse.modules?.[0]?.lessons?.[0];
        if (firstLesson?.videoUrl) {
          setCurrentVideo(firstLesson.videoUrl);
          setCurrentLesson({
            ...firstLesson,
            moduleIndex: 0,
            lessonIndex: 0,
            lessonId: `0-0`
          });
        }
      }

    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setOtpSending(true);
    setOtpError('');
    
    try {
      const userEmail = localStorage.getItem('emai');
      const response = await axios.post("https://sdb1.onrender.com/mailer/", {
        email: userEmail,
        courseTitle: course.title
      });
      
      if (response.data.success) {
        setGeneratedOTP(response.data.otp);
        setOtpSent(true);
        console.log('OTP sent successfully');
      } else {
        setOtpError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setOtpError('Please enter OTP');
      return;
    }
    
    if (otp !== generatedOTP) {
      setOtpError('Invalid OTP. Please try again.');
      return;
    }
    
    setOtpVerifying(true);
    setOtpError('');
    
    try {
      // Enroll in premium course
      const response = await axios.post("https://sdb1.onrender.com/user/courseup", {
        courseId: course._id,
        email: localStorage.getItem('emai')
      });
      
      console.log('Enrollment API response:', response.data);
      
      if (response.data.success) {
        // Close modal and reload enrollment status
        setShowOTPModal(false);
        setOtp('');
        setOtpSent(false);
        setGeneratedOTP('');
        await loadCourseAndEnrollmentStatus(id);
      } else {
        setOtpError('Enrollment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setOtpError('Enrollment failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleLessonClick = (lesson, isPremiumCourse, moduleIndex, lessonIndex) => {
    if (!lesson.isPreview && isPremiumCourse && !isEnrolled) {
      setShowPremiumOverlay(true);
    } else {
      if (lesson.videoUrl) {
        setCurrentVideo(lesson.videoUrl);
        setCurrentLesson({
          ...lesson,
          moduleIndex,
          lessonIndex,
          lessonId: `${moduleIndex}-${lessonIndex}`
        });
        setShowPremiumOverlay(false);
        
        // Reset watch time for new lesson
        watchTimeRef.current = 0;
        lastProgressUpdateRef.current = 0;
        
        // Update last accessed
        if (isEnrolled) {
          updateLastAccessed();
        }
      } else {
        console.warn('No video URL found for lesson:', lesson.title);
      }
    }
  };

  const handleVideoProgress = (progressInfo) => {
    if (!currentLesson || !isEnrolled) return;

    const { currentTime, duration } = progressInfo;
    
    if (!currentTime || !duration || duration === 0) return;

    const watchPercentage = (currentTime / duration) * 100;
    
    // Update watch time (increment based on time difference)
    const timeDifference = Math.max(0, currentTime - lastProgressUpdateRef.current);
    if (timeDifference > 0 && timeDifference < 30) { // Reasonable time jump (less than 30 seconds)
      watchTimeRef.current += timeDifference;
    }
    lastProgressUpdateRef.current = currentTime;

    // Consider lesson completed if watched 80% or more
    if (watchPercentage >= 80) {
      markLessonComplete(currentLesson.lessonId);
    }

    // Update progress periodically (every 30 seconds of watch time)
    if (Math.floor(watchTimeRef.current) % 30 === 0 && watchTimeRef.current > 0) {
      updateWatchTime();
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (completedLessons.has(lessonId)) return;

    const newCompletedLessons = new Set([...completedLessons, lessonId]);
    setCompletedLessons(newCompletedLessons);

    const newProgress = Math.round((newCompletedLessons.size / totalLessons) * 100);
    setProgress(newProgress);

    console.log(`Marking lesson ${lessonId} complete. Progress: ${newProgress}%`);

    // Update progress on backend
    try {
      const response = await axios.post("https://sdb1.onrender.com/user/updateprogress", {
        courseId: id,
        email: localStorage.getItem('emai'),
        progress: newProgress,
        completedLessons: Array.from(newCompletedLessons),
        lastAccessed: new Date().toISOString(),
        watchTime: Math.round(watchTimeRef.current / 60) // Convert to minutes
      });
      
      console.log('Progress updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert the state if the API call failed
      setCompletedLessons(completedLessons);
      setProgress(progress);
    }
  };

  const updateWatchTime = async () => {
    if (!isEnrolled || !currentLesson) return;

    try {
      await axios.post("https://sdb1.onrender.com/user/updateprogress", {
        courseId: id,
        email: localStorage.getItem('emai'),
        watchTime: Math.round(watchTimeRef.current / 60), // Convert to minutes
        lastAccessed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating watch time:', error);
    }
  };

  const updateLastAccessed = async () => {
    if (progressUpdateTimeout.current) {
      clearTimeout(progressUpdateTimeout.current);
    }

    progressUpdateTimeout.current = setTimeout(async () => {
      try {
        await axios.post("https://sdb1.onrender.com/user/updateaccess", {
          courseId: id,
          email: localStorage.getItem('emai'),
          lastAccessed: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating last accessed:', error);
      }
    }, 2000); // Update after 2 seconds of inactivity
  };

  const handleEnroll = async () => {
    try {
      console.log('Enrolling in course:', course._id);
      if (!course.isPremium) {
        const response = await axios.post("https://sdb1.onrender.com/user/courseup", {
          courseId: course._id,
          email: localStorage.getItem('emai')
        });
        
        console.log('Enrollment API response:', response.data);
        
        if (response.data.success) {
          // Reload enrollment status
          await loadCourseAndEnrollmentStatus(id);
        }
      } else {
        // Open OTP verification popup for premium courses
        setShowOTPModal(true);
        setOtp('');
        setOtpError('');
        setOtpSent(false);
        setGeneratedOTP('');
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
    }
  };

  const closeOTPModal = () => {
    setShowOTPModal(false);
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setGeneratedOTP('');
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
    setCancellationReason('');
    setCancellationMessage('');
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const submitCancellation = async () => {
    if (cancellationReason.trim() === '') {
      setCancellationMessage('Please provide a reason for cancellation.');
      return;
    }

    setIsSubmittingCancellation(true);
    setCancellationMessage('');

    try {
      const email = localStorage.getItem('emai');
      const courseId = course._id;

      const response = await axios.post("https://sdb1.onrender.com/cancellation/submit", {
        email,
        courseId,
        reason: cancellationReason
      });

      if (response.data.success) {
        setCancellationMessage(response.data.message);
        setTimeout(closeCancelModal, 3000); // Close modal after 3 seconds
      } else {
        setCancellationMessage(response.data.message || 'Failed to submit cancellation.');
      }
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      setCancellationMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmittingCancellation(false);
    }
  };

  const getProperVideoUrl = (url) => {
    if (!url) return null;
    if (url.includes('/embed/')) {
      // Add enablejsapi parameter for progress tracking
      return url.includes('?') ? `${url}&enablejsapi=1` : `${url}?enablejsapi=1`;
    }
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
    }
    return url;
  };

  const isLessonCompleted = (moduleIndex, lessonIndex) => {
    return completedLessons.has(`${moduleIndex}-${lessonIndex}`);
  };

  // Manual lesson completion for testing
  const handleManualComplete = () => {
    if (currentLesson && isEnrolled) {
      markLessonComplete(currentLesson.lessonId);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#e2e8f0' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
      </div>
    );
  }

  const videoUrl = getProperVideoUrl(currentVideo);

  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <div className="video-container">
              {showPremiumOverlay ? (
                <div className="video-placeholder" style={{ cursor: 'pointer', flexDirection: 'column' }}>
                  <Lock size={64} color="#60a5fa" />
                  <h3 style={{ marginTop: '1rem', color: '#e2e8f0' }}>
                    This lesson is for premium members
                  </h3>
                  <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>
                    Unlock all content by enrolling in this course.
                  </p>
                  <Link to="/premium" className="btn-primary" style={{ marginTop: '1.5rem', textDecoration: 'none' }}>
                    Try Premium
                  </Link>
                </div>
              ) : videoUrl ? (
                <div style={{ position: 'relative' }}>
                  <iframe
                    ref={videoRef}
                    width="100%"
                    height="450"
                    src={videoUrl}
                    title="Course Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ borderRadius: '12px' }}
                  ></iframe>
                  
                  {/* Debug/Manual Complete Button */}
                  {isEnrolled && currentLesson && (
                    <button
                      onClick={handleManualComplete}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ) : (
                <img
                  src={course.thumbnailUrl}
                  alt={`Thumbnail for ${course.title}`}
                  style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '12px' }}
                />
              )}
            </div>
            
            {/* Current Lesson Info */}
            {currentLesson && isEnrolled && (
              <div className="course-detail-container" style={{ padding: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Now Playing: {currentLesson.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Duration: {currentLesson.duration}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Watch Time: {Math.round(watchTimeRef.current / 60)}min
                  </span>
                  {isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: '0.875rem' }}>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEnrolled && (
              <div className="progress-container" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#e2e8f0', fontSize: '1rem' }}>Your Progress</h4>
                  <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{progress}% Complete</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {completedLessons.size} of {totalLessons} lessons completed
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(71, 85, 105, 0.5)', borderRadius: '4px', marginTop: '0.5rem' }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progress === 100 ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="course-detail-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>About This Course</h2>
              <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                {course.detailedDescription || course.description}
              </p>
            </div>
            
            <div className="course-detail-container" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Course Content</h2>
              {course.modules?.map((module, moduleIndex) => (
                <div key={moduleIndex} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                    {module.title}
                  </h3>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const lessonCompleted = isLessonCompleted(moduleIndex, lessonIndex);
                    const isCurrentLesson = currentLesson?.lessonId === `${moduleIndex}-${lessonIndex}`;
                    
                    return (
                      <div
                        key={lessonIndex}
                        className="lesson-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          cursor: lesson.videoUrl ? 'pointer' : 'default',
                          opacity: lesson.videoUrl ? 1 : 0.6,
                          backgroundColor: isCurrentLesson ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        }}
                        onClick={() => lesson.videoUrl && handleLessonClick(lesson, course.isPremium, moduleIndex, lessonIndex)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {lessonCompleted ? (
                            <CheckCircle size={16} color="#10b981" />
                          ) : lesson.isPreview || !course.isPremium || isEnrolled ? (
                            <Play size={16} color={lesson.videoUrl ? '#60a5fa' : '#9ca3af'} />
                          ) : (
                            <Lock size={16} color="#9ca3af" />
                          )}
                          <span style={{ 
                            color: lesson.isPreview || !course.isPremium || isEnrolled ? '#e2e8f0' : '#94a3b8',
                            fontWeight: isCurrentLesson ? '600' : 'normal'
                          }}>
                            {lesson.title}
                            {!lesson.videoUrl && ' (No video)'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            {lesson.duration}
                          </span>
                          {isCurrentLesson && (
                            <span style={{ 
                              color: '#60a5fa', 
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              Playing
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="course-detail-container" style={{ padding: '2rem', marginBottom: '2rem', top: '2rem' }}>
              {isEnrolled ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Enrolled!</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                    You have access to all course content
                  </p>
                  <Link to="/dashboard" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.75rem' }}>
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={handleCancelClick}
                    className="btn-outline"
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      color: '#ef4444',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancel Enrollment
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {course.isPremium ? `$${course.price}` : 'Free'}
                    </div>
                    {course.isPremium && (
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        One-time payment
                      </p>
                    )}
                  </div>
                  {course.isPremium && !localStorage.getItem('token') ? (
                    <div>
                      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#94a3b8' }}>
                        Sign up to access premium content
                      </p>
                      <Link to="/signup" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.75rem', marginBottom: '0.5rem' }}>
                        Sign Up Now
                      </Link>
                      <Link to="/login" className="btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.75rem' }}>
                        Already have an account?
                      </Link>
                    </div>
                  ) : (
                    <button onClick={handleEnroll} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                      {course.isPremium ? 'Enroll Now' : 'Start Learning'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="course-detail-container" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Course Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#94a3b8" />
                  <span style={{ color: '#e2e8f0' }}>{course.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="#94a3b8" />
                  <span style={{ color: '#e2e8f0' }}>{course.students.toLocaleString()} students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ color: '#e2e8f0' }}>{course.rating} rating</span>
                </div>
              </div>
              <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
              <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Instructor</h4>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem', 
                  color: 'white', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold' 
                }}>
                  {course.instructor.charAt(0)}
                </div>
                <h5 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#e2e8f0' }}>{course.instructor}</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  Expert Instructor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={closeOTPModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal content */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white'
              }}>
                <Mail size={24} />
              </div>
              <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                Verify Your Email
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Please verify your email to enroll in this premium course
              </p>
            </div>

            {!otpSent ? (
              <div>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', textAlign: 'center' }}>
                  We'll send a verification code to your email address
                </p>
                <button
                  onClick={sendOTP}
                  disabled={otpSending}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    opacity: otpSending ? 0.6 : 1,
                    cursor: otpSending ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {otpSending ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: '#94a3b8', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                  Enter the 6-digit code sent to your email
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    letterSpacing: '0.1em',
                    marginBottom: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                
                {otpError && (
                  <div className="error-message" style={{
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    padding: '0.5rem',
                    borderRadius: '6px'
                  }}>
                    {otpError}
                  </div>
                )}

                <button
                  onClick={verifyOTP}
                  disabled={otpVerifying || !otp}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    opacity: otpVerifying || !otp ? 0.6 : 1,
                    cursor: otpVerifying || !otp ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginBottom: '1rem'
                  }}
                >
                  {otpVerifying ? 'Verifying...' : 'Verify & Enroll'}
                </button>

                <button
                  onClick={sendOTP}
                  disabled={otpSending}
                  className="btn-outline"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    cursor: otpSending ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: otpSending ? 0.6 : 1
                  }}
                >
                  {otpSending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '450px',
            width: '90%',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button
              onClick={closeCancelModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}
            >
              <X size={20} />
            </button>
            
            <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '1rem', margin: '0 auto' }} />
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Confirm Cancellation
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Please tell us why you want to cancel your enrollment in this course.
            </p>

            {cancellationMessage && (
              <div className={cancellationMessage.includes('Failed') ? 'error-message' : 'success-message'} style={{
                fontSize: '0.875rem',
                marginBottom: '1rem',
                padding: '0.5rem',
                borderRadius: '6px'
              }}>
                {cancellationMessage}
              </div>
            )}

            {!cancellationMessage && (
              <>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter your reason here..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    resize: 'vertical',
                    outline: 'none',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#e2e8f0',
                    backdropFilter: 'blur(10px)'
                  }}
                ></textarea>
                <button
                  onClick={submitCancellation}
                  disabled={isSubmittingCancellation || cancellationReason.trim() === ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isSubmittingCancellation || cancellationReason.trim() === '' ? '#9ca3af' : '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSubmittingCancellation || cancellationReason.trim() === '' ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {isSubmittingCancellation ? 'Submitting...' : 'Submit Cancellation'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail;