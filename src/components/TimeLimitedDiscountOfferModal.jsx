import React, { useState, useEffect } from 'react';
import { X, Clock, Tag } from 'lucide-react';

const TimeLimitedDiscountOfferModal = ({ show, onClose, onClaim, expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!show || !expiryDate) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expiry = new Date(expiryDate);
            const difference = expiry.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft('Offer Expired!');
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [show, expiryDate]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl overflow-hidden transform transition-all duration-500 scale-100 hover:scale-[1.02]">
                <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-600 p-4">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all duration-200 hover:rotate-90"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>

                    <div className="relative text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-2 backdrop-blur-sm">
                            <Tag size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Time-Limited Offer!</h2>
                        <p className="text-red-100/90 text-xs font-medium">
                            An exclusive 50% discount awaits
                        </p>
                    </div>
                </div>

                <div className="relative p-4 -mt-2">
                    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-700 font-medium text-center">
                                For the next **24 hours**, get a flat **50% discount** on every premium course and plan!
                            </p>
                            <div className="flex items-center justify-center gap-2 font-bold text-lg text-red-500 animate-pulse">
                                <Clock size={20} />
                                <span>{timeLeft}</span>
                            </div>
                            <button
                                type="button"
                                onClick={onClaim}
                                className="group relative w-full overflow-hidden px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 transform bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                <span className="relative flex items-center justify-center text-white">
                                    Avail Your 50% Discount
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeLimitedDiscountOfferModal;