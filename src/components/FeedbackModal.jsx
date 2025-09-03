import React from 'react';
import { X, CheckCircle, XCircle, Star, Heart } from 'lucide-react';

const FeedbackModal = ({ 
  show, 
  onClose, 
  formData, 
  onFormChange, 
  onSubmit, 
  isSubmitting, 
  submissionStatus 
}) => {
  if (!show) return null;

  const getStatusMessage = () => {
    switch (submissionStatus) {
      case 'success':
        return 'Feedback submitted successfully!';
      case 'updated':
        return 'Your feedback has been updated successfully!';
      case 'error':
        return 'Failed to submit feedback. Please try again.';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (submissionStatus) {
      case 'success':
      case 'updated':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl overflow-hidden transform transition-all duration-500 scale-100 hover:scale-[1.02]">
        
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 hover:rotate-90"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-2 backdrop-blur-sm">
              <Heart size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Share Feedback</h2>
            <p className="text-emerald-100/90 text-xs font-medium">
              Help us improve
            </p>
          </div>
        </div>

        <div className="relative p-4 -mt-2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onFormChange({ target: { name: 'rating', value: star } })}
                      className={`p-1 rounded-lg transition-all duration-200 ${
                        star <= formData.rating 
                          ? 'text-yellow-500' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star size={20} fill={star <= formData.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-gray-800 mb-1">
                  Your Feedback<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  placeholder="Tell us about your experience..."
                  value={formData.description}
                  onChange={onFormChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 resize-none font-medium text-gray-700 placeholder-gray-400"
                ></textarea>
                <div className="mt-1 text-[10px] text-gray-500">
                  {formData.description.length}/1000 characters
                </div>
              </div>
              
              <button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitting || formData.rating === 0}
                className={`group relative w-full overflow-hidden px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 transform ${
                  isSubmitting || formData.rating === 0
                    ? 'bg-gray-400 cursor-not-allowed scale-95' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/30'
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
                    'Submit Feedback'
                  )}
                </span>
              </button>
            </div>

            {submissionStatus && (
              <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 text-white font-semibold shadow-md transform transition-all duration-500 text-xs ${getStatusColor()}`}>
                <div className="flex-shrink-0">
                  {(submissionStatus === 'success' || submissionStatus === 'updated') ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {(submissionStatus === 'success' || submissionStatus === 'updated') ? 'Success!' : 'Error'}
                  </div>
                  <div className="text-white/90">
                    {getStatusMessage()}
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

export default FeedbackModal;