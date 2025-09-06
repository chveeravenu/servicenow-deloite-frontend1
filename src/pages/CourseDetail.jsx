import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Users, Star, CheckCircle, Lock, User, X, Mail, AlertTriangle, Check } from 'lucide-react';
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

  const [isFreeTrialActive, setIsFreeTrialActive] = useState(false); // New state for free trial
  const [freeTrialExpiry, setFreeTrialExpiry] = useState(null); // New state for expiry date
  const [timeLeft, setTimeLeft] = useState(''); // New state for the countdown timer
  const intervalRef = useRef(null); // Ref to hold the timer interval

  const [subscriptionPlans, setSubs] = useState([
    {
      id: '1month',
      duration: '1 Month Access',
      price: 499,
      monthlyRate: '₹499/month',
      description: 'Basic'
    },
    {
      id: '3months',
      duration: '3 Months Access',
      price: 1299,
      originalPrice: 1497,
      savings: 13,
      monthlyRate: '₹433/month',
      description: 'Popular',
      popular: true
    },
    {
      id: '6months',
      duration: '6 Months Access',
      price: 2299,
      originalPrice: 2994,
      savings: 23,
      monthlyRate: '₹383/month',
      description: 'Best Value'
    }
  ]);

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState('');

  const [selectedPlan, setSelectedPlan] = useState('6months');

  const videoRef = useRef(null);
  const progressUpdateTimeout = useRef(null);
  const watchTimeRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);

  // Function to calculate and format the time left
  const calculateTimeLeft = (expiryDate) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      clearInterval(intervalRef.current);
      setIsFreeTrialActive(false); // Expire the trial on the frontend
      return 'Expired';
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (id) {
      loadCourseAndEnrollmentStatus(id);
    }
  }, [id]);

  useEffect(() => {
    const iframe = videoRef.current;
    if (iframe && currentLesson && (isEnrolled || isFreeTrialActive)) {

      const handleMessage = (event) => {
        if (event.origin !== 'https://www.youtube.com') return;

        try {
          const data = JSON.parse(event.data);

          if (data.event === 'video-progress') {
            handleVideoProgress(data.info);
          } else if (data.info && typeof data.info === 'object') {
            if (data.info.currentTime !== undefined && data.info.duration !== undefined) {
              handleVideoProgress(data.info);
            }
          }
        } catch (error) {
          console.log('YouTube message parsing - this is normal:', error.message);
        }
      };

      window.addEventListener('message', handleMessage);

      const progressInterval = setInterval(() => {
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage('{"event":"listening"}', 'https://www.youtube.com');
          } catch (error) {
            console.log('Could not communicate with YouTube iframe');
          }
        }
      }, 10000);

      return () => {
        window.removeEventListener('message', handleMessage);
        clearInterval(progressInterval);
      };
    }
  }, [currentLesson, isEnrolled, isFreeTrialActive]);

  // NEW: Effect for the countdown timer
  useEffect(() => {
    if (isFreeTrialActive && freeTrialExpiry) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(calculateTimeLeft(freeTrialExpiry));
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isFreeTrialActive, freeTrialExpiry]);

  const loadCourseAndEnrollmentStatus = async (courseId) => {
    try {
      setLoading(true);
      const courseResponse = await courseService.getCourseById(courseId);
      const fetchedCourse = courseResponse.data.course;
      setCourse(fetchedCourse);

      const totalLessonCount = fetchedCourse.modules?.reduce((total, module) => {
        return total + (module.lessons?.length || 0);
      }, 0) || 0;
      setTotalLessons(totalLessonCount);

      const userEmail = localStorage.getItem('emai');

      if (userEmail) {
        try {
          // Correct API URL
          const enrollmentResponse = await axios.post("https://sdb1.onrender.com/user/coursechec", {
            courseId: courseId,
            email: userEmail
          });

          console.log('Enrollment check response:', enrollmentResponse.data);

          if (enrollmentResponse.data.success) {
            setIsEnrolled(enrollmentResponse.data.isEnrolled);
            setIsFreeTrialActive(enrollmentResponse.data.isFreeTrialActive);
            setFreeTrialExpiry(enrollmentResponse.data.freeTrialExpiry);
            setProgress(enrollmentResponse.data.progress || 0);

            if (enrollmentResponse.data.completedLessons && Array.isArray(enrollmentResponse.data.completedLessons)) {
              setCompletedLessons(new Set(enrollmentResponse.data.completedLessons));
            }
          } else {
            setIsEnrolled(false);
            setIsFreeTrialActive(false);
            setFreeTrialExpiry(null);
            setProgress(0);
            setCompletedLessons(new Set());
          }

        } catch (enrollmentError) {
          console.error('Error checking enrollment status:', enrollmentError);
          setIsEnrolled(false);
          setIsFreeTrialActive(false);
          setFreeTrialExpiry(null);
        }
      }

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
      const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
      const response = await axios.post("https://sdb1.onrender.com/mailer/", {
        email: userEmail,
        courseTitle: course.title,
        planDetails: selectedPlanData
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
      const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
      // Enroll in premium course with selected plan
      const response = await axios.post("https://sdb1.onrender.com/user/courseup", {
        courseId: course._id,
        email: localStorage.getItem('emai'),
        subscriptionPlan: selectedPlanData
      });

      console.log('Enrollment API response:', response.data);

      if (response.data.success) {
        setShowOTPModal(false);
        setOtp('');
        setOtpSent(false);
        setGeneratedOTP('');
        await loadCourseAndEnrollmentStatus(id);

      } else {
        setOtpError('Enrollment failed. Please try again.');
      }
      const abc = await axios.post("https://sdb1.onrender.com/Rod/", {
        courseId: course._id,
        email: localStorage.getItem('emai'),
        subscriptionPlan: selectedPlanData
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setOtpError('Enrollment failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleLessonClick = (lesson, isPremiumCourse, moduleIndex, lessonIndex) => {
    // Corrected logic: Check if it's a premium course AND the user is not enrolled AND the free trial is not active
    if (!lesson.isPreview && isPremiumCourse && !isEnrolled && !isFreeTrialActive) {
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

        watchTimeRef.current = 0;
        lastProgressUpdateRef.current = 0;

        if (isEnrolled) {
          updateLastAccessed();
        }
      } else {
        console.warn('No video URL found for lesson:', lesson.title);
      }
    }
  };

  const handleVideoProgress = (progressInfo) => {
    // Only track progress if enrolled in the course, not for free trial
    if (!currentLesson || !isEnrolled) return;

    const { currentTime, duration } = progressInfo;

    if (!currentTime || !duration || duration === 0) return;

    const watchPercentage = (currentTime / duration) * 100;

    const timeDifference = Math.max(0, currentTime - lastProgressUpdateRef.current);
    if (timeDifference > 0 && timeDifference < 30) {
      watchTimeRef.current += timeDifference;
    }
    lastProgressUpdateRef.current = currentTime;

    if (watchPercentage >= 80) {
      markLessonComplete(currentLesson.lessonId);
    }

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

    try {
      // Correct API URL
      const response = await axios.post("https://sdb1.onrender.com/user/updateprogress", {
        courseId: id,
        email: localStorage.getItem('emai'),
        progress: newProgress,
        completedLessons: Array.from(newCompletedLessons),
        lastAccessed: new Date().toISOString(),
        watchTime: Math.round(watchTimeRef.current / 60)
      });

      console.log('Progress updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating progress:', error);
      setCompletedLessons(completedLessons);
      setProgress(progress);
    }
  };

  const updateWatchTime = async () => {
    if (!isEnrolled || !currentLesson) return;

    try {
      // Correct API URL
      await axios.post("https://sdb1.onrender.com/user/updateprogress", {
        courseId: id,
        email: localStorage.getItem('emai'),
        watchTime: Math.round(watchTimeRef.current / 60),
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
        // Correct API URL
        await axios.post("https://sdb1.onrender.com/user/updateaccess", {
          courseId: id,
          email: localStorage.getItem('emai'),
          lastAccessed: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating last accessed:', error);
      }
    }, 2000);
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
          await loadCourseAndEnrollmentStatus(id);
        }
      } else {
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
      // Correct API URL
      const response = await axios.post("https://sdb1.onrender.com/cancellation/submit", {
        email,
        courseId,
        reason: cancellationReason
      });

      if (response.data.success) {
        setCancellationMessage(response.data.message);
        setTimeout(closeCancelModal, 3000);
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

  const handleManualComplete = () => {
    if (currentLesson && (isEnrolled || isFreeTrialActive)) {
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
        {/* NEW: Free Trial countdown banner */}
        {isFreeTrialActive && timeLeft && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            color: 'white',
            padding: '1rem',
            marginBottom: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}>
            Your free trial is active! Time remaining: {timeLeft}
          </div>
        )}
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

                  {(isEnrolled || isFreeTrialActive) && currentLesson && (
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

            {(isEnrolled || isFreeTrialActive) && currentLesson && (
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

            {(isEnrolled || isFreeTrialActive) && (
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
                    const isLocked = !lesson.isPreview && course.isPremium && !isEnrolled && !isFreeTrialActive;

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
                          ) : isLocked ? (
                            <Lock size={16} color="#9ca3af" />
                          ) : (
                            <Play size={16} color={lesson.videoUrl ? '#60a5fa' : '#9ca3af'} />
                          )}
                          <span style={{
                            color: isLocked ? '#94a3b8' : '#e2e8f0',
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
              {(isEnrolled || isFreeTrialActive) ? (
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
                  {course.isPremium ? (
                    <div>
                      <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#e2e8f0', fontSize: '1.25rem' }}>
                        Choose Your Plan
                      </h3>

                      {subscriptionPlans && subscriptionPlans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          style={{
                            background: selectedPlan === plan.id
                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))'
                              : 'rgba(30, 41, 59, 0.3)',
                            border: selectedPlan === plan.id
                              ? '2px solid #3b82f6'
                              : plan.popular
                                ? '2px solid #8b5cf6'
                                : '2px solid rgba(71, 85, 105, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative'
                          }}
                        >
                          {plan.popular && (
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '12px',
                              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {plan.description}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                {plan.duration}
                              </h4>
                              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>
                                {plan.monthlyRate}
                              </p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: selectedPlan === plan.id ? '#3b82f6' : '#e2e8f0'
                              }}>
                                ₹{plan.price}
                              </div>
                              {plan.originalPrice && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <span style={{
                                    fontSize: '0.875rem',
                                    color: '#94a3b8',
                                    textDecoration: 'line-through'
                                  }}>
                                    ₹{plan.originalPrice}
                                  </span>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#10b981',
                                    fontWeight: '600'
                                  }}>
                                    Save {plan.savings}%
                                  </span>
                                </div>
                              )}
                            </div>

                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: selectedPlan === plan.id ? '6px solid #3b82f6' : '2px solid #94a3b8',
                              transition: 'all 0.2s ease'
                            }} />
                          </div>
                        </div>
                      ))}

                      <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '2px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                          Selected: <strong style={{ color: '#e2e8f0' }}>
                            {subscriptionPlans.find(p => p.id === selectedPlan)?.duration}
                          </strong>
                        </p>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#3b82f6',
                          marginBottom: '0.5rem'
                        }}>
                          Total: ₹{subscriptionPlans.find(p => p.id === selectedPlan)?.price}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8'
                        }}>
                          ✓ Cancel anytime • ✓ 7-day money back
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '0.5rem'
                      }}>
                        Free
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        No payment required
                      </p>
                    </div>
                  )}

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
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
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
                Confirm Your Subscription
              </h3>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: '#e2e8f0', fontSize: '1rem', margin: 0, fontWeight: '600' }}>
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.duration} Plan
                </p>
                <p style={{ color: '#3b82f6', fontSize: '1.25rem', margin: '0.25rem 0', fontWeight: 'bold' }}>
                  ₹{subscriptionPlans.find(p => p.id === selectedPlan)?.price}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.monthlyRate}
                </p>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Please verify your email to complete enrollment
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
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
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
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'transparent',
                    color: '#94a3b8',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: '6px',
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
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '450px',
            width: '90%',
            position: 'relative',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={48} color="#f59e0b" />
            </div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Confirm Cancellation
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Please tell us why you want to cancel your enrollment in this course.
            </p>

            {cancellationMessage && (
              <div style={{
                backgroundColor: cancellationMessage.includes('Failed') || cancellationMessage.includes('error')
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
                border: cancellationMessage.includes('Failed') || cancellationMessage.includes('error')
                  ? '1px solid #ef4444'
                  : '1px solid #10b981',
                color: cancellationMessage.includes('Failed') || cancellationMessage.includes('error')
                  ? '#f87171'
                  : '#34d399',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                textAlign: 'center'
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
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'inherit'
                  }}
                ></textarea>
                <button
                  onClick={submitCancellation}
                  disabled={isSubmittingCancellation || cancellationReason.trim() === ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isSubmittingCancellation || cancellationReason.trim() === ''
                      ? 'rgba(156, 163, 175, 0.5)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSubmittingCancellation || cancellationReason.trim() === '' ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
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