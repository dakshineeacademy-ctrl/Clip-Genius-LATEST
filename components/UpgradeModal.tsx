
import React, { useState, useEffect } from 'react';
import { Check, CreditCard, X, Loader2, ArrowLeft } from 'lucide-react';
import { userService, PLANS, PlanId } from '../services/userService';
import { PlansView } from './StaticPages';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete: () => void;
  initialPlan?: PlanId | null; // If passed, skip selection
}

type Step = 'SELECTION' | 'REGISTER' | 'PAYMENT' | 'SUCCESS';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgradeComplete, initialPlan }) => {
  const [step, setStep] = useState<Step>('SELECTION');
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('pro');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setSelectedPlanId(initialPlan);
        setStep('REGISTER');
      } else {
        setStep('SELECTION');
      }
      setEmail('');
      setPassword('');
    }
  }, [isOpen, initialPlan]);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) setStep('PAYMENT');
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setEmail('alex.creator@gmail.com');
      setStep('PAYMENT');
    }, 1500);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      userService.upgradeToPlan(selectedPlanId, email);
      setIsProcessing(false);
      setStep('SUCCESS');
    }, 2000);
  };

  const handlePlanSelection = (id: PlanId) => {
    setSelectedPlanId(id);
    setStep('REGISTER');
  };

  const selectedPlanDetails = PLANS[selectedPlanId];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`bg-dark-800 border border-dark-600 w-full ${step === 'SELECTION' ? 'max-w-6xl' : 'max-w-lg'} rounded-2xl shadow-2xl overflow-hidden relative transition-all duration-300`}>
        
        {/* Header Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm transition">
                <X size={20} />
            </button>
        </div>
        
        {step !== 'SELECTION' && step !== 'SUCCESS' && (
            <div className="absolute top-4 left-4 z-10">
                <button onClick={() => setStep('SELECTION')} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm transition">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
        )}

        {/* Step 1: Selection */}
        {step === 'SELECTION' && (
           <div className="p-2 md:p-8 overflow-y-auto max-h-[90vh]">
              <PlansView onSelectPlan={handlePlanSelection} />
           </div>
        )}

        {/* Step 2: Register */}
        {step === 'REGISTER' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-gray-400 mb-6">to subscribe to the <span className="text-brand-400 font-bold">{selectedPlanDetails.name}</span></p>
            
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3 bg-white text-gray-800 hover:bg-gray-100 font-bold rounded-xl transition flex items-center justify-center gap-2 mb-6 relative overflow-hidden group"
            >
                {isGoogleLoading ? <Loader2 className="animate-spin text-gray-800" size={24} /> : <><GoogleIcon /><span>Sign up with Google</span></>}
            </button>

            <div className="relative mb-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-600"></div></div>
                <span className="relative bg-dark-800 px-3 text-sm text-gray-500 font-medium">Or continue with email</span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl mt-4 transition border border-dark-600">
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'PAYMENT' && (
          <div className="p-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Secure Checkout</h2>
                <div className="flex gap-2">
                    <div className="w-8 h-5 bg-white rounded opacity-50"></div>
                    <div className="w-8 h-5 bg-white rounded opacity-50"></div>
                </div>
             </div>
             
             <form onSubmit={handlePayment} className="space-y-4">
                <div className="p-4 bg-brand-900/20 border border-brand-500/30 rounded-lg mb-6 flex justify-between items-center">
                    <div>
                        <p className="font-bold text-white text-lg">{selectedPlanDetails.name}</p>
                        <p className="text-sm text-brand-300">{selectedPlanDetails.limit} shorts / month</p>
                    </div>
                    <div className="text-2xl font-black text-white">${selectedPlanDetails.price}</div>
                </div>

                <div className="mb-4 bg-dark-900/50 px-4 py-2 rounded-lg border border-dark-600 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Account:</span>
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        {email} <Check size={12} className="text-green-500" />
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="0000 0000 0000 0000"
                            defaultValue="4242 4242 4242 4242"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                        <input type="text" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" defaultValue="12/25" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">CVC</label>
                        <input type="text" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 outline-none" defaultValue="123" />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl mt-4 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isProcessing ? 'Processing Payment...' : `Pay $${selectedPlanDetails.price} & Subscribe`}
                </button>
             </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'SUCCESS' && (
           <div className="p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/50">
                  <Check size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Upgrade Successful!</h2>
              <p className="text-gray-400 mb-8">
                  Welcome to the <span className="text-white font-bold">{selectedPlanDetails.name}</span>. 
                  Your limit has been increased to {selectedPlanDetails.limit} shorts.
              </p>
              <button 
                  onClick={onUpgradeComplete}
                  className="px-8 py-3 bg-white text-dark-900 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                  Start Creating
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
