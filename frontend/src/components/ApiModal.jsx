import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code } from 'lucide-react';

export default function ApiModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState('curl');

  if (!isOpen) return null;

  const curlCode = `curl -X 'POST' \\
  'https://spam-email-classifier-fekr.onrender.com/predict' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "message": "WINNER! You have won a $1000 prize! Claim now."
}'`;

  const pythonCode = `import requests

url = "https://spam-email-classifier-fekr.onrender.com/predict"
payload = {"message": "WINNER! You have won a $1000 prize! Claim now."}

response = requests.post(url, json=payload)
print(response.json())
# Output: {"prediction": "Spam", "confidence": 99.4}`;

  const currentCode = activeLang === 'curl' ? curlCode : pythonCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0B1120] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[#06B6D4]" />
            <h3 className="text-xl font-bold text-white">FastAPI REST Integration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint Specs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="px-2.5 py-1 rounded-md bg-green-500/20 text-[#22C55E] font-bold">
              POST
            </span>
            <span className="text-white font-semibold">/api/predict</span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Accepts JSON body with message text and returns classification label and confidence score.
          </p>
        </div>

        {/* Code Snippet Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveLang('curl')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeLang === 'curl' ? 'bg-[#7C3AED] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveLang('python')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeLang === 'python' ? 'bg-[#7C3AED] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Python
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[#06B6D4] hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy snippet'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-[#06B6D4] overflow-x-auto leading-relaxed">
            {currentCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
