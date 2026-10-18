import React, { useState } from 'react';
import axios from "axios";
import { Send, Trash2, Loader2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export default function Prediction({ onPredictionComplete, isLoading , setIsLoading }) {
  const [text, setText] = useState('');
  const maxLength = 5000;

  // Placeholder function required by specification - backend to be connected later
const handlePredict = async () => {
  // Don't start loading if the input is empty
  if (!text.trim()) return;

  setIsLoading(true);

  try {
    const response = await axios.post(
      "https://spam-email-classifier-fekr.onrender.com/predict",
      {
        message: text,
      }
    );

    if (onPredictionComplete) {
      onPredictionComplete(response.data);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};

  const handleClear = () => {
    setText('');
    if (onPredictionComplete) {
      onPredictionComplete(null);
    }
  };

  // Sample presets for quick testing fill
  const handleLoadSample = (sampleType) => {
    if (sampleType === 'spam') {
      setText('CONGRATULATIONS! You have won a $1,000 Walmart Gift Card! Click http://bit.ly/claim-now to claim your prize immediately or call 1-800-555-0199. Urgent!');
    } else {
      setText('Hi Rohan, hope you are doing well. Please let me know if we are still meeting at 3 PM today to discuss the project updates. Thanks!');
    }
  };

  return (
    <section id="prediction" className="py-16 md:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-xs font-semibold text-[#7C3AED]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Analyze Email or SMS
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto">
            Paste any email content or text message below to classify whether it is Spam or Genuine (Ham).
          </p>
        </div>

        {/* Centered Glass Card */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6 hover:border-white/20 transition-all duration-300">
          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
            <span className="text-[#94A3B8] font-medium flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
              Quick Fill Presets:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('spam')}
                className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
              >
                Sample Spam
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('ham')}
                className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors font-medium"
              >
                Sample Ham
              </button>
            </div>
          </div>

          {/* Form & Textarea */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePredict();
            }}
            className="space-y-4"
          >
            <div className="relative">
              <label htmlFor="email-input" className="sr-only">
                Email or SMS Text Input
              </label>
              <textarea
                id="email-input"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                placeholder="Paste your Email or SMS here..."
                disabled={isLoading}
                className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all resize-y text-sm sm:text-base leading-relaxed disabled:opacity-50"
              />

              {/* Character Counter */}
              <div className="absolute bottom-3 right-4 text-xs font-mono text-[#94A3B8] bg-black/60 px-2.5 py-1 rounded-md border border-white/5">
                {text.length} / {maxLength}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={!text || isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold text-sm shadow-lg shadow-[#7C3AED]/25 hover:shadow-xl hover:shadow-[#7C3AED]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Predict Classification</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Backend Connection Note */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-[#94A3B8]/70">
            <AlertCircle className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Connects directly to FastAPI backend via REST API.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
