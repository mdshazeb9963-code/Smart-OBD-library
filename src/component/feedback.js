import React from 'react';
import { BrandHeader, MechanicSidebar } from './layout';
import { loadCustomerFeedback } from './car';

function Feedback() {
  const [feedback, setFeedback] = React.useState([]);
  const [loadError, setLoadError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadCustomerFeedback()
      .then((items) => {
        setFeedback(items);
        setLoadError('');
      })
      .catch(() => setLoadError('Customer messages could not be loaded. Check the database connection and try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> CUSTOMER SUPPORT</p>
            <h1>Customer feedback</h1>
            <p className="page-description">Messages sent by customers from their vehicle page.</p>
          </div>
          {loadError && <p className="form-message" role="alert">{loadError}</p>}
          {isLoading ? (
            <p className="history-unavailable-panel" role="status">Loading customer messages...</p>
          ) : feedback.length === 0 ? (
            <p className="history-unavailable-panel" role="status">Customer messages will appear here.</p>
          ) : (
            <section className="feedback-list" aria-label="Customer messages">
              {feedback.map((item) => (
                <article className="feedback-card" key={item.id}>
                  <div className="feedback-card-heading">
                    <div>
                      <h2>{item.customerName || 'Customer'}</h2>
                      <p>{item.vehicleName} · Car ID {item.vehicleId}</p>
                    </div>
                    <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="feedback-message">{item.message}</p>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Feedback;
