import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandHeader } from './layout';

function User() {
  const navigate = useNavigate();

  return (
    <div className="app-page landing-page">
      <BrandHeader landing />
      <main className="landing-content">
        <section className="role-section" aria-labelledby="role-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">GET STARTED</p>
              <h2 id="role-heading">Choose your workspace</h2>
            </div>
            <span className="section-sparkle" aria-hidden="true">✧</span>
          </div>

          <div className="role-cards-frame">
            <div className="role-grid">
            <button className="role-card mechanic-card" onClick={() => navigate('/mechanic')}>
              <span className="role-icon mechanic-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M14.7 6.3a5.1 5.1 0 0 0-6.5 6.5L3 18l3 3 5.2-5.2a5.1 5.1 0 0 0 6.5-6.5l-3 3-3-3 3-3Z" />
                  <circle cx="6" cy="18" r=".8" />
                </svg>
              </span>
              <span className="role-card-copy">
                <span className="role-title">Mechanic</span>
                <span className="role-description">Manage your workspace and browse the vehicle library.</span>
                <span className="role-action">Continue as mechanic <span aria-hidden="true">→</span></span>
              </span>
            </button>

            <button className="role-card customer-card" onClick={() => navigate('/customer')}>
              <span className="role-icon customer-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="9" cy="7" r="3.2" />
                  <path d="M3.5 19c0-3.1 2.2-5.2 5.5-5.2s5.5 2.1 5.5 5.2v1h-11v-1Z" />
                  <path d="M17 8.5a2.4 2.4 0 1 0 0 4.8M18.3 16.2c1.4.3 2.2 1.3 2.2 2.8v1h-4" />
                </svg>
              </span>
              <span className="role-card-copy">
                <span className="role-title">Customer</span>
                <span className="role-description">Get help with your vehicle from your workshop.</span>
                <span className="role-action">Continue as customer <span aria-hidden="true">→</span></span>
              </span>
            </button>
            </div>
          </div>
        </section>

        <section className="welcome-copy">
          <h1>Smart Value</h1>
          <p className="eyebrow">SMART VEHICLE SUPPORT</p>
          <p className="page-description">
            Find vehicle information and diagnostic references in one simple workspace.
          </p>
        </section>

        <p className="landing-footnote">
          Built for clear diagnostics and confident conversations.
        </p>
      </main>
    </div>
  );
}

export default User;
