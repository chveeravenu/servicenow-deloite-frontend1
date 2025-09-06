import React from 'react';
import { X, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

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
                                className={`group relative w-full overflow-hidden px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 transform ${isSubmitting
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
                            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 text-white font-semibold shadow-md transform transition-all duration-500 text-xs ${submissionStatus === 'success'
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

export default TicketFormModal;