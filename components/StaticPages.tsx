
import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { PLANS, PlanId } from '../services/userService';

interface PlansViewProps {
  onSelectPlan: (id: PlanId) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onSelectPlan }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your content creation needs. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Basic */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 flex flex-col hover:border-brand-500/50 transition-colors">
          <h3 className="text-xl font-bold text-white mb-2">{PLANS.basic.name}</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-white">${PLANS.basic.price}</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>
          <p className="text-gray-400 mb-6 text-sm">Perfect for creators just starting to scale their content.</p>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>{PLANS.basic.limit} Shorts per month</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>Standard Processing Speed</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>AI Auto-Captions</span>
            </li>
          </ul>
          <button 
            onClick={() => onSelectPlan('basic')}
            className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition border border-dark-500 hover:border-brand-500"
          >
            Select Basic
          </button>
        </div>

        {/* Pro - Highlighted */}
        <div className="bg-brand-900/20 border border-brand-500 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
            <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{PLANS.pro.name}</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-white">${PLANS.pro.price}</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>
          <p className="text-brand-100/80 mb-6 text-sm">For serious creators who publish daily content.</p>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>{PLANS.pro.limit} Shorts per month</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>Priority Processing</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>Advanced Styles</span>
            </li>
          </ul>
          <button 
             onClick={() => onSelectPlan('pro')}
             className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition shadow-lg shadow-brand-900/50"
          >
            Select Pro
          </button>
        </div>

        {/* Agency */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 flex flex-col hover:border-brand-500/50 transition-colors">
          <h3 className="text-xl font-bold text-white mb-2">{PLANS.agency.name}</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-black text-white">${PLANS.agency.price}</span>
            <span className="text-gray-400 ml-2">/month</span>
          </div>
          <p className="text-gray-400 mb-6 text-sm">Maximum power for agencies and power users.</p>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>{PLANS.agency.limit} Shorts per month</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>Instant Processing Queue</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 size={18} className="text-brand-400 flex-shrink-0" />
              <span>Priority Support</span>
            </li>
          </ul>
          <button 
             onClick={() => onSelectPlan('agency')}
             className="w-full py-3 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition border border-dark-500 hover:border-brand-500"
          >
            Select Agency
          </button>
        </div>
      </div>
    </div>
  );
};

export const AboutView: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-gray-300">
    <h1 className="text-4xl font-bold text-white mb-8">About ClipGenius</h1>
    <div className="space-y-6 text-lg leading-relaxed">
      <p>
        ClipGenius AI was born from a simple frustration: short-form video content is king, but editing long videos into shorts is tedious, time-consuming, and difficult.
      </p>
      <p>
        Our mission is to democratize viral content creation. We use advanced Artificial Intelligence (Gemini 1.5) to watch your long-form videos, understand the context, listen to the audio, and extract the most engaging moments automatically.
      </p>
      <p>
        Whether you are a streamer, podcaster, or educator, ClipGenius helps you multiply your reach by turning one video into many, effortlessly.
      </p>
    </div>
  </div>
);

export const PrivacyView: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-gray-400">
    <div className="flex items-center gap-3 mb-8">
      <Lock className="text-brand-500" size={32} />
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
    </div>
    <div className="space-y-6 leading-relaxed">
      <p>Last updated: June 2024</p>
      <p>
        At ClipGenius, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">1. Video Data</h3>
      <p>
        Videos you upload are processed temporarily for the purpose of generating clips. We do not use your content to train public AI models without your explicit consent. Uploaded files are deleted from our processing servers after 24 hours.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">2. User Data</h3>
      <p>
        We collect your email address for account management and billing purposes. We do not sell your personal data to third parties.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">3. Payments</h3>
      <p>
        All payments are processed securely via our payment partners. We do not store your full credit card information on our servers.
      </p>
    </div>
  </div>
);

export const TermsView: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-gray-400">
    <div className="flex items-center gap-3 mb-8">
      <FileText className="text-brand-500" size={32} />
      <h1 className="text-3xl font-bold text-white">Terms of Use</h1>
    </div>
    <div className="space-y-6 leading-relaxed">
      <p>
        By accessing ClipGenius, you agree to be bound by these Terms of Use.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">Usage Limits</h3>
      <p>
        You agree to abide by the usage limits of your selected plan. The Free plan is limited to 5 generated shorts per account.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">Content Ownership</h3>
      <p>
        You retain full ownership of the videos you upload and the clips generated. You are responsible for ensuring you have the rights to the content you upload.
      </p>
      <h3 className="text-xl font-bold text-white mt-8">Refunds</h3>
      <p>
        Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time to prevent future billing.
      </p>
    </div>
  </div>
);
