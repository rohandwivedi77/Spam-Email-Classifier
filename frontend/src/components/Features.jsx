import React from 'react';
import { BrainCircuit, Cpu, Zap, Layout } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: 'Machine Learning',
      subtitle: 'ExtraTreesClassifier & Scikit-learn',
      description:
        'The classifier was trained to label messages as Spam or Ham.',
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'group-hover:border-[#7C3AED]/50',
      iconColor: 'text-[#7C3AED]',
    },
    {
      icon: Cpu,
      title: 'Natural Language Processing',
      subtitle: 'TF-IDF & NLTK Tokenization',
      description:
        'Text is prepared and converted into numbers that can be used by the classifier.',
      color: 'from-cyan-500/20 to-cyan-600/5',
      borderColor: 'group-hover:border-[#06B6D4]/50',
      iconColor: 'text-[#06B6D4]',
    },
    {
      icon: Zap,
      title: 'FastAPI Backend',
      subtitle: 'High Throughput & REST API',
      description:
        'The backend provides the prediction endpoint used by the frontend.',
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'group-hover:border-[#22C55E]/50',
      iconColor: 'text-[#22C55E]',
    },
    {
      icon: Layout,
      title: 'React + Tailwind CSS',
      subtitle: 'Modern Glassmorphic UI',
      description:
        'The page is made with React components and straightforward styling.',
      color: 'from-[#7C3AED]/20 to-[#06B6D4]/5',
      borderColor: 'group-hover:border-[#7C3AED]/50',
      iconColor: 'text-[#06B6D4]',
    },
  ];

  return (
    <section id="features" className="page-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">Maximum Accuracy</span>
          </h2>
          <p className="text-base sm:text-lg text-[#94A3B8]">
            These are the main parts used to build the project.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`group relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.06] transition-all duration-300 transform hover:-translate-y-1 ${item.borderColor}`}
              >
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 ${item.iconColor} shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <span className="inline-block text-xs font-mono text-[#06B6D4] px-2.5 py-0.5 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/20">
                      {item.subtitle}
                    </span>
                    <p className="text-sm text-[#94A3B8] leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
