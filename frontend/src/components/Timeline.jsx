import React from 'react';
import { Mail, Scissors, Binary, Cpu, ShieldCheck } from 'lucide-react';

export default function Timeline() {
  const steps = [
    {
      step: '01',
      title: 'Input Message',
      subtitle: 'Email or SMS Text',
      description: 'Raw textual content received via web UI or API endpoint payload.',
      icon: Mail,
    },
    {
      step: '02',
      title: 'Text Preprocessing',
      subtitle: 'Cleaning & Normalization',
      description: 'Lowercasing, punctuation stripping, stop-word filtering & Porter Stemming.',
      icon: Scissors,
    },
    {
      step: '03',
      title: 'TF-IDF Vectorization',
      subtitle: 'Feature Extraction',
      description: 'Converts processed tokens into sparse numerical matrix using term weighting.',
      icon: Binary,
    },
    {
      step: '04',
      title: 'Machine Learning Model',
      subtitle: 'ExtraTrees Classifier',
      description: 'Ensemble decision trees evaluate feature probabilities and output confidence score.',
      icon: Cpu,
    },
    {
      step: '05',
      title: 'Spam/Ham Prediction',
      subtitle: 'Final Classification',
      description: 'Instant verdict returned with probability percentage and diagnostic metrics.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="timeline" className="page-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-mono text-[#06B6D4] px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20">
            Pipeline Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">Works</span>
          </h2>
          <p className="text-base sm:text-lg text-[#94A3B8]">
            The main steps from entering a message to seeing its classification.
          </p>
        </div>

        {/* Timeline Grid / Horizontal Desktop & Vertical Mobile */}
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                {/* Step Connector line (Desktop) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#7C3AED]/50 to-[#06B6D4]/30 z-0" />
                )}

                {/* Step Node Card */}
                <div className="relative z-10 p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 group-hover:border-[#7C3AED]/50 group-hover:bg-white/[0.07] transition-all duration-300 w-full flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#06B6D4] mb-1">
                    STEP {item.step}
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <span className="text-[11px] font-medium text-[#7C3AED] mb-2">{item.subtitle}</span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
