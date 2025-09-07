import React, { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DiscountClaimConfirmationModal = ({ show, onClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
                navigate('/courses');
            }, 3000); // Close and redirect after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose, navigate]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl overflow-hidden transform transition-all duration-500 scale-100">

                <div className="relative bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 p-4">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 hover:rotate-90"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>

                    <div className="relative text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 backdrop-blur-sm">
                            <CheckCircle size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Offer Claimed!</h2>
                        <p className="text-emerald-100/90 text-xs font-medium">
                            Your 50% discount has been applied to all premium courses.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscountClaimConfirmationModal;