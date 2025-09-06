import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Menu, X, Zap, Crown, Home, GraduationCap, BarChart3, Clock } from 'lucide-react';
import { userService } from '../services/userService';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFreeTrialActive, setIsFreeTrialActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // New function to calculate time left
  const calculateTimeLeft = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry.getTime() - now.getTime();

    if (difference <= 0) {
      setIsFreeTrialActive(false);
      return 'Expired';
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      userService.getUserProfile().then(res => {
        const user = res.data.user;
        const expiry = new Date(user.freeTrialExpiry);
        const now = new Date();
        if (user.freeTrialStatus === 'active' && expiry > now) {
          setIsFreeTrialActive(true);
          setTimeLeft(calculateTimeLeft(expiry));
        }
      });
    }

    const interval = setInterval(() => {
      if (isFreeTrialActive) {
        userService.getUserProfile().then(res => {
          const expiry = res.data.user.freeTrialExpiry;
          setTimeLeft(calculateTimeLeft(expiry));
        });
      }
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFreeTrialActive]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/courses', label: 'Courses', icon: GraduationCap },
    { path: '/premium', label: 'Premium', icon: Crown },
    ...(isLoggedIn ? [{ path: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : [])
  ];

  return (
    <>
      <header
        style={{
          // position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled
            ? 'rgba(15, 23, 42, 0.9)'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: isScrolled ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isScrolled 
            ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
            : '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          height: '72px'
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              style={{
                position: 'relative',
                padding: '12px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite'
              }} />
              <BookOpen size={28} color="white" style={{ position: 'relative', zIndex: 1 }} />
            </div>
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #3B82F6 50%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '800',
                fontSize: '1.8rem',
                letterSpacing: '-0.02em'
              }}
            >
              LearnHub
            </span>
          </Link>

          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }} className="nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontWeight: '500',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.color = '#3B82F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }} className="auth-buttons">
            {isLoggedIn ? (
              <>
                {isFreeTrialActive && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Clock size={16} />
                    <span>Trial: {timeLeft}</span>
                  </div>
                )}
                
                <Link
                  to="/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#3B82F6',
                    textDecoration: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = '#3B82F6';
                  }}
                >
                  <User size={20} />
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: '12px 24px',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    background: 'rgba(59, 130, 246, 0.05)',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#3B82F6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.color = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>Sign Up</span>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                    transform: 'translateX(-100%)',
                    animation: 'shimmer 3s infinite'
                  }} />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              color: '#3B82F6',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            className="mobile-menu-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.color = '#3B82F6';
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '24px',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            className="mobile-menu"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <item.icon size={20} color="#3B82F6" />
                  {item.label}
                </Link>
              ))}

              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                {isLoggedIn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {isFreeTrialActive && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        animation: 'pulse 2s infinite'
                      }}>
                        <Clock size={16} />
                        <span>Free Trial: {timeLeft}</span>
                      </div>
                    )}
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#3B82F6',
                        textDecoration: 'none',
                        fontWeight: '500',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <User size={20} />
                      Profile
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '16px',
                        textAlign: 'center',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        background: 'rgba(59, 130, 246, 0.05)',
                        color: '#e2e8f0',
                        textDecoration: 'none',
                        fontWeight: '500',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Login
                    </Link>
                    
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '16px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: '600',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>
        {`
        @media (max-width: 768px) {
          .nav {
            display: none !important;
          }
          .auth-buttons {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        /* Add smooth scrolling offset for fixed header */
        html {
          scroll-padding-top: 80px;
        }
      `}
      </style>
    </>
  );
};

export default Header;