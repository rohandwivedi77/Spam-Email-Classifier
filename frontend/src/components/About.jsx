import React from 'react';
import { Code2, Cpu, Server, Layers, CheckCircle } from 'lucide-react';

export default function About() {
  const techStack = [
    { name: 'Scikit-learn', category: 'Machine Learning Framework' },
    { name: 'TF-IDF Vectorizer', category: 'Natural Language Processing' },
    { name: 'ExtraTreesClassifier', category: 'Classification Model Algorithm' },
    { name: 'FastAPI', category: 'Python REST API Backend' },
    { name: 'React', category: 'Frontend UI Framework' },
    { name: 'Tailwind CSS', category: 'Utility-first Styling' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Project Overview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-xs font-semibold text-[#06B6D4]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Project Overview</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              About the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">Spam Email Classifier</span>
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              This project checks email and SMS text for common spam patterns. It uses text preprocessing and a machine learning model to return a Spam or Ham result.
            </p>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              The frontend is built with React and sends prediction requests to a separate FastAPI backend.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-[#94A3B8] font-mono uppercase">Dataset</p>
                <p className="text-lg font-bold text-white mt-1">SMS Spam Collection</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-[#94A3B8] font-mono uppercase">Architecture</p>
                <p className="text-lg font-bold text-[#06B6D4] mt-1">Decoupled REST API</p>
              </div>
            </div>
          </div>

          {/* Right Column: Tech Stack Matrix */}
          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Code2 className="w-6 h-6 text-[#7C3AED]" />
                <h3 className="text-xl font-bold text-white">Technology Stack</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {techStack.map((tech, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#7C3AED]/40 transition-colors flex items-start gap-3"
                  >
                    <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{tech.name}</h4>
                      <p className="text-xs text-[#94A3B8]">{tech.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
