import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Prediction from '../components/Prediction';
import ResultCard from '../components/ResultCard';
import Features from '../components/Features';
import Timeline from '../components/Timeline';
import About from '../components/About';
import Footer from '../components/Footer';
import GmailScanner from '../components/GmailScanner';

export default function Home() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="site-shell">
      <Navbar />

      <main>
        <Hero />

        <GmailScanner />
        <div className="page-content">
          <Prediction
            onPredictionComplete={(data) => setPredictionResult(data)}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          <ResultCard result={predictionResult} />
        </div>
        <Features />
        <Timeline />
        <About />
      </main>

      <Footer />
    </div>
  );
}
