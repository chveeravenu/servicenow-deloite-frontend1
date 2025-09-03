import React, { useState } from 'react';
import { Play, BookOpen, Award, Users, Star, TrendingUp, X, CheckCircle, XCircle, MessageSquare, Heart, Zap, Target, Globe } from 'lucide-react';
import axios from 'axios';
import FeedbackModal from '../components/FeedbackModal';

const TicketFormModal = ({ show, onClose, formData, onFormChange, onSubmit, isSubmitting, submissionStatus, categories }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl overflow-hidden transform transition-all duration-500 scale-100 hover:scale-[1.02]">
        
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
          
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 hover:rotate-90"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-2 backdrop-blur-sm">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Raise a Ticket</h2>
            <p className="text-blue-100/90 text-xs font-medium">
              We're here to help
            </p>
          </div>
        </div>

        <div className="relative p-4 -mt-2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div className="space-y-4">
              
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-gray-800 mb-1">
                  Category<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={onFormChange}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none cursor-pointer font-medium text-gray-700"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-semibold text-gray-800 mb-1">
                  Your Issue<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="subject"
                  name="subject"
                  rows="3"
                  placeholder="Provide detailed information..."
                  value={formData.subject}
                  onChange={onFormChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none font-medium text-gray-700 placeholder-gray-400"
                ></textarea>
                <div className="mt-1 text-[10px] text-gray-500">
                  {formData.subject.length}/500 characters
                </div>
              </div>

              <button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitting}
                className={`group relative w-full overflow-hidden px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 transform ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed scale-95' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className="relative flex items-center justify-center text-white">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </span>
              </button>
            </div>

            {submissionStatus && (
              <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 text-white font-semibold shadow-md transform transition-all duration-500 text-xs ${
                submissionStatus === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
                <div className="flex-shrink-0">
                  {submissionStatus === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {submissionStatus === 'success' ? 'Success!' : 'Error'}
                  </div>
                  <div className="text-white/90">
                    {submissionStatus === 'success'
                      ? 'Ticket submitted.'
                      : 'Failed to submit.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: 'Premium Issue', subject: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState({ rating: 0, description: '' });
  const [feedbackSubmissionStatus, setFeedbackSubmissionStatus] = useState(null);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({ category: 'Premium Issue', subject: '' });
    setSubmissionStatus(null);
  };

  const handleCloseModal = () => setShowModal(false);

  const categories = [
    'Premium Issue',
    'Payment Issue', 
    'Video Issue',
    'Course Content',
    'Technical Support',
    'Other'
  ];

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);
    
    try {
      const email = localStorage.getItem('emai');
      if (!email) {
        console.error('Email not found in localStorage');
        setSubmissionStatus('error');
        return;
      }
      const requestData = { ...formData, email: email };
      await axios.post('https://sdb1.onrender.com/tickets', requestData);
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmissionStatus(null);
        if (submissionStatus === 'success') {
          handleCloseModal();
        }
      }, 3000);
    }
  };

  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
    setFeedbackFormData({ rating: 0, description: '' });
    setFeedbackSubmissionStatus(null);
  };
  
  const handleCloseFeedbackModal = () => setShowFeedbackModal(false);

  const handleFeedbackFormChange = (e) => setFeedbackFormData({
    ...feedbackFormData,
    [e.target.name]: e.target.value
  });

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsFeedbackSubmitting(true);
    setFeedbackSubmissionStatus(null);

    if (feedbackFormData.rating === 0 || !feedbackFormData.description) {
      setFeedbackSubmissionStatus('error');
      setIsFeedbackSubmitting(false);
      return;
    }

    try {
      const email = localStorage.getItem('emai');
      if (!email) {
        console.error('Email not found in localStorage');
        setFeedbackSubmissionStatus('error');
        setIsFeedbackSubmitting(false);
        return;
      }

      const requestData = { ...feedbackFormData, email: email };
      const response = await axios.post('https://sdb1.onrender.com/feedback', requestData);
      const isUpdate = response.data.isUpdate;
      setFeedbackSubmissionStatus(isUpdate ? 'updated' : 'success');
      console.log(isUpdate ? 'Feedback updated successfully!' : 'New feedback submitted successfully!');

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackSubmissionStatus('error');
    } finally {
      setIsFeedbackSubmitting(false);
      setTimeout(() => {
        setFeedbackSubmissionStatus(null);
        handleCloseFeedbackModal();
      }, 3000);
    }
  };

  const features = [
    {
      icon: Play,
      title: "Interactive Learning",
      description: "Immersive video content with hands-on projects and real-world applications.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Industry-recognized credentials that showcase your expertise to employers.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with learners worldwide and build lasting professional relationships.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: BookOpen,
      title: "Rich Content Library",
      description: "Comprehensive curriculum from beginner fundamentals to advanced mastery.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Career Advancement",
      description: "Develop in-demand skills that accelerate your professional growth.",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your pace and preferences.",
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "100K+", label: "Active Learners", icon: Users },
    { number: "2K+", label: "Expert Courses", icon: BookOpen },
    { number: "98%", label: "Success Rate", icon: Target },
    { number: "24/7", label: "Global Support", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-gray-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <section className="relative px-6 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-8 backdrop-blur-sm">
            <Zap size={16} className="text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-gray-300"></span>
          </div> */}
          
          <h1 className="text-6xl md:text-7xl font-extrabold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Master Skills That
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Shape Tomorrow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join the next generation of learners. Access cutting-edge content, AI-powered personalization, 
            and earn certificates that employers recognize worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center">
                <Play size={20} className="mr-3" />
                Start Learning Now
              </span>
            </button>
            
            <button className="px-10 py-5 border-2 border-gray-400/30 text-gray-300 rounded-2xl font-bold text-lg hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 backdrop-blur-sm">
              Explore Premium
            </button>
          </div>
        </div>
        
        <div className="absolute top-32 left-10 w-4 h-4 bg-blue-500 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-48 right-20 w-6 h-6 bg-purple-500 rounded-full animate-bounce opacity-40" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-emerald-500 rounded-full animate-bounce opacity-50" style={{animationDelay: '1s'}}></div>
      </section>

      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose LearnHub?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of learning with our innovative platform designed for modern professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-6 shadow-lg`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
                
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Trusted by Millions Worldwide
            </h2>
            <p className="text-xl text-gray-400">Join our thriving community of successful learners</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative p-8 text-center bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl border border-gray-700/30 hover:border-blue-500/50 transition-all duration-500 hover:scale-110 backdrop-blur-sm"
              >
                <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4 group-hover:shadow-2xl transition-all duration-300">
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-blue-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Start your learning journey today with our premium courses and expert mentorship
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl">
                  Get Started Free
                </button>
                <button className="px-10 py-5 border-2 border-gray-400/30 text-gray-300 rounded-2xl font-bold text-lg hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-300">
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <button
          onClick={handleOpenFeedbackModal}
          className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 backdrop-blur-sm"
        >
          <Heart size={20} className="group-hover:animate-pulse" />
          <span className="font-semibold hidden sm:block">Feedback</span>
        </button>
        
        <button
          onClick={handleOpenModal}
          className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 backdrop-blur-sm"
        >
          <MessageSquare size={20} className="group-hover:animate-bounce" />
          <span className="font-semibold hidden sm:block">Support</span>
        </button>
      </div>

      <TicketFormModal
        show={showModal}
        onClose={handleCloseModal}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submissionStatus={submissionStatus}
        categories={categories}
      />

      <FeedbackModal
        show={showFeedbackModal}
        onClose={handleCloseFeedbackModal}
        formData={feedbackFormData}
        onFormChange={handleFeedbackFormChange}
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isFeedbackSubmitting}
        submissionStatus={feedbackSubmissionStatus}
      />
    </div>
  );
};

export default App;