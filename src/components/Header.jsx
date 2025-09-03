import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Menu, X, Zap, Crown, Home, GraduationCap, BarChart3 } from 'lucide-react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Add scroll listener for header background effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        className="header"
        // style={{
        //   background: isScrolled 
        //     ? 'rgba(15, 76, 117, 0.95)' 
        //     : '#0F4C75',
        //   backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        //   borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        //   transition: 'all 0.3s ease'
        // }}
      >
        <div className="header-content">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="logo" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <div 
              style={{
                position: 'relative',
                padding: '12px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <BookOpen size={28} color="white" />
            </div>
            <span 
              style={{
                background: 'linear-gradient(135deg, #E8F4FD, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                fontSize: '1.8rem'
              }}
            >
              LearnHub
            </span>
            {/* <Zap size={16} color="#FDE047" style={{ animation: 'pulse 2s infinite' }} /> */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav" style={{ display: 'flex', gap: '8px' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  color: '#E8F4FD',
                  textDecoration: 'none',
                  fontWeight: '500',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="auth-buttons" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                {/* Profile Button */}
                <Link 
                  to="/dashboard" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#E8F4FD',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <User size={20} />
                </Link>
                
                {/* Logout Button */}
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
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link 
                  to="/login"
                  style={{
                    padding: '12px 24px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#E8F4FD',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.color = '#3B82F6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#E8F4FD';
                  }}
                >
                  Login
                </Link>
                
                {/* Sign Up Button */}
                <Link 
                  to="/signup"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: '#E8F4FD',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            className="mobile-menu-btn"
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
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '24px',
              zIndex: 1000
            }}
            className="mobile-menu"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Mobile Navigation */}
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
                    color: '#E8F4FD',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <item.icon size={20} color="#3B82F6" />
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {isLoggedIn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#E8F4FD',
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
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        background: 'transparent',
                        color: '#E8F4FD',
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
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
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

      {/* Add CSS for mobile responsiveness */}
      <style jsx>{`
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
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

export default Header;