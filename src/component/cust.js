import React from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader, SidebarMenu } from './layout';
import { lookupCustomerVehicle, submitCustomerFeedback } from './car';
import { loadWorkshopAboutText } from './about';
import { usesDatabaseApi } from './api';

function Customer() {
  const [vehicle, setVehicle] = React.useState(null);
  const [loginError, setLoginError] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('vehicle');
  const [aboutText, setAboutText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [feedbackError, setFeedbackError] = React.useState('');
  const [feedbackSuccess, setFeedbackSuccess] = React.useState('');
  const [isSendingFeedback, setIsSendingFeedback] = React.useState(false);
  const signOut = () => {
    setVehicle(null);
    setActiveSection('vehicle');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    try {
      const matchedVehicle = await lookupCustomerVehicle(formData.get('vehicleId'), formData.get('phone'));
      if (!matchedVehicle) {
        setLoginError('The car ID or phone number did not match. Check the details provided by your workshop.');
        return;
      }
      setVehicle(matchedVehicle);
      setActiveSection('vehicle');
      setLoginError('');
    } catch {
      setLoginError('Vehicle access could not be checked. Check the database connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAbout = async () => {
    setActiveSection('about');
    try {
      setAboutText(await loadWorkshopAboutText());
    } catch {
      setAboutText('Mechanic information could not be loaded. Please try again later.');
    }
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSendingFeedback(true);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      await submitCustomerFeedback(vehicle, formData.get('message'));
      form.reset();
      setFeedbackSuccess('Your message has been sent to the mechanic.');
    } catch (error) {
      setFeedbackError(error.message || 'Your message could not be sent. Please try again.');
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <div className="app-page">
      <BrandHeader />
      {vehicle ? (
        <div className="workspace-layout customer-workspace">
          <SidebarMenu
            label="CUSTOMER PORTAL"
            navigationLabel="Customer navigation"
            navigationId="customer-sidebar-navigation"
          >
            <button
              className={`sidebar-link sidebar-action${activeSection === 'vehicle' ? ' active' : ''}`}
              type="button"
              aria-current={activeSection === 'vehicle' ? 'page' : undefined}
              onClick={() => setActiveSection('vehicle')}
            >
              <span className="nav-icon" aria-hidden="true">▣</span>
              My vehicle
            </button>
            <button
              className={`sidebar-link sidebar-action${activeSection === 'about' ? ' active' : ''}`}
              type="button"
              aria-current={activeSection === 'about' ? 'page' : undefined}
              onClick={showAbout}
            >
              <span className="nav-icon" aria-hidden="true">✎</span>
              About
            </button>
            <button
              className={`sidebar-link sidebar-action${activeSection === 'feedback' ? ' active' : ''}`}
              type="button"
              aria-current={activeSection === 'feedback' ? 'page' : undefined}
              onClick={() => {
                setActiveSection('feedback');
                setFeedbackError('');
                setFeedbackSuccess('');
              }}
            >
              <span className="nav-icon" aria-hidden="true">✉</span>
              Contact mechanic
            </button>
            <button className="sidebar-link sidebar-action" type="button" onClick={signOut}>
              <span className="nav-icon" aria-hidden="true">↪</span>
              Sign out
            </button>
          </SidebarMenu>
          <main className="workspace-main">
            <div className="page-heading">
              <p className="eyebrow"><span className="eyebrow-line" /> {activeSection === 'vehicle' ? 'CUSTOMER PORTAL' : activeSection === 'about' ? 'WORKSHOP INFORMATION' : 'CUSTOMER SUPPORT'}</p>
              <h1>{activeSection === 'vehicle' ? 'Your vehicle' : activeSection === 'about' ? 'About the mechanic' : 'Contact the mechanic'}</h1>
              {activeSection === 'vehicle' && (
                <p className="page-description">
                  Welcome{vehicle.customerName ? `, ${vehicle.customerName}` : ' back'}. Here are your vehicle details.
                </p>
              )}
            </div>
            {activeSection === 'vehicle' ? (
              <section className="vehicle-detail-card customer-dashboard-card" aria-label="Vehicle overview">
                <div className="customer-dashboard-heading">
                  {vehicle.image && <img className="vehicle-detail-image" src={vehicle.image} alt={vehicle.name} />}
                  <div>
                    <p className="customer-vehicle-id">CAR ID {vehicle.id}</p>
                    <h2>{vehicle.name} <span>·</span> {vehicle.year}</h2>
                    <span className="vehicle-status"><span className="status-dot" aria-hidden="true" />{vehicle.status}</span>
                  </div>
                </div>
                <div className="vehicle-detail-grid">
                  <div><span>Number plate</span><strong>{vehicle.license || 'Not provided'}</strong></div>
                  <div><span>Customer name</span><strong>{vehicle.customerName || 'Not provided'}</strong></div>
                  <div><span>Customer phone</span><strong>{vehicle.phone || 'Not provided'}</strong></div>
                  <div><span>Odometer</span><strong>{vehicle.odometer || 'Not provided'}</strong></div>
                  <div><span>Fuel level</span><strong>{vehicle.fuel || 'Not provided'}</strong></div>
                  <div><span>Amount</span><strong>{vehicle.amount || 'Not provided'}</strong></div>
                </div>
                {vehicle.scanReport?.codes?.length > 0 && (
                  <div className="vehicle-scan-summary">
                    <strong>OBD scan: {vehicle.scanReport.codes.map(({ code }) => code).join(', ')}</strong>
                    <ul>
                      {vehicle.scanReport.codes.map(({ code, description }) => (
                        <li key={code}><code>{code}</code> {description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : activeSection === 'about' ? (
              <section className="about-panel" aria-label="About the mechanic">
                <p>{aboutText}</p>
              </section>
            ) : (
              <section className="feedback-panel" aria-label="Contact the mechanic">
                <p className="page-description">
                  Send a message about car ID {vehicle.id}. The mechanic will see your message in the workshop feedback page.
                </p>
                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                  <label htmlFor="customer-feedback-message">Your message</label>
                  <textarea id="customer-feedback-message" name="message" maxLength="1000" required rows="6" placeholder="Tell the mechanic how they can help..." />
                  {feedbackError && <p className="form-message" role="alert">{feedbackError}</p>}
                  {feedbackSuccess && <p className="form-message success-message" role="status">{feedbackSuccess}</p>}
                  <button className="primary-button" type="submit" disabled={isSendingFeedback}>
                    {isSendingFeedback ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              </section>
            )}
          </main>
        </div>
      ) : (
        <main className="auth-content">
          <section className="auth-card customer-access-card">
            <div className="auth-icon customer-auth-icon" aria-hidden="true">♙</div>
            <p className="section-kicker">CUSTOMER SUPPORT</p>
            <h1>Access your vehicle</h1>
            <p className="auth-description">Enter the car ID and phone number provided by your workshop.</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <label htmlFor="customer-vehicle-id">Car ID</label>
              <input id="customer-vehicle-id" name="vehicleId" inputMode="numeric" required />
              <label htmlFor="customer-phone">Phone number (password)</label>
              <input id="customer-phone" name="phone" type="password" inputMode="tel" autoComplete="current-password" minLength="7" maxLength="20" required />
              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Checking access...' : <>View my vehicle <span aria-hidden="true">→</span></>}
              </button>
              {loginError && <p className="form-message" role="alert">{loginError}</p>}
            </form>
            <p className="auth-hint">
              {usesDatabaseApi
                ? 'Vehicle information is loaded from the workshop database. Phone-number login is not secure for production use.'
                : 'Demo access only: this app stores vehicle details in this browser. Phone-number login is not secure for production use.'}
            </p>
            <Link className="customer-back-link" to="/">
              Back to role selection <span aria-hidden="true">→</span>
            </Link>
          </section>
        </main>
      )}
    </div>
  );
}

export default Customer;
