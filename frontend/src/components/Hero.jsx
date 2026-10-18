import React from 'react';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="page-content hero-layout">
        <div className="hero-copy">
          <div className="hero-badge">AI-powered spam detection</div>
          <h1>Spam Email Classifier</h1>
          <p>
            Check whether an email or text message looks like spam. This project
            uses a machine learning model to classify the text and show its result.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#prediction">Try the text checker</a>
            <a className="secondary-button" href="#features">See how it works</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card">
            <div className="visual-card-heading">
              <span className="status-dot" />
              <strong>Spam Risk</strong>
            </div>
            <em>High confidence</em>
          </div>
          <div className="visual-card">
            <div className="visual-card-heading">
              <span className="status-dot success" />
              <strong>Legitimate</strong>
            </div>
            <em>Safe and verified</em>
          </div>
        </div>
      </div>
    </section>
  );
}
