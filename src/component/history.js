import React from 'react';
import { BrandHeader, MechanicSidebar } from './layout';
import { getVehicleHistory, loadVehicleHistory } from './car';
import { usesDatabaseApi } from './api';

function History() {
  const [archivedVehicles, setArchivedVehicles] = React.useState(usesDatabaseApi ? [] : getVehicleHistory);
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    if (usesDatabaseApi) {
      loadVehicleHistory()
        .then(setArchivedVehicles)
        .catch(() => setLoadError('History could not be loaded. Check the database connection and try again.'));
    }
  }, []);

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> VEHICLE HISTORY</p>
            <h1>History</h1>
            <p className="page-description">Review deleted vehicles.</p>
          </div>
          {loadError && <p className="form-message" role="alert">{loadError}</p>}
          {archivedVehicles.length === 0 ? (
            <p className="history-unavailable-panel" role="status">Deleted cars will appear here.</p>
          ) : (
            <section className="vehicle-list history-vehicle-list" aria-label="Deleted cars">
              {archivedVehicles.map((vehicle) => (
                <article className="vehicle-row" key={`${vehicle.id}-${vehicle.deletedAt}`}>
                  <span className="vehicle-id">{vehicle.id}</span>
                  <div className="vehicle-details">
                    <h3>{vehicle.name} <span>·</span> {vehicle.year} <span>·</span> {vehicle.license}</h3>
                    {vehicle.customerName && <p>Customer: {vehicle.customerName}</p>}
                    {vehicle.phone && <p>Phone: {vehicle.phone}</p>}
                    <p>Deleted: {new Date(vehicle.deletedAt).toLocaleString()}</p>
                  </div>
                  <span className="vehicle-status history-status">Deleted</span>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default History;
