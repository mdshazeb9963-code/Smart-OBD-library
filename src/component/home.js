import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandHeader, MechanicSidebar } from './layout';
import { createVehicle, getNextVehicleId, getVehicleList, loadNextVehicleId, loadVehicleList, removeVehicle, updateVehicle, VehiclePhoto } from './car';
import { usesDatabaseApi } from './api';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = React.useState(usesDatabaseApi ? [] : getVehicleList);
  const [nextVehicleId, setNextVehicleId] = React.useState(usesDatabaseApi ? '' : getNextVehicleId());
  const [loadError, setLoadError] = React.useState('');
  const [photo, setPhoto] = React.useState('');
  const [photoError, setPhotoError] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const [deleteError, setDeleteError] = React.useState('');
  const [statusError, setStatusError] = React.useState('');
  const uploadInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);
  const isAddFormOpen = searchParams.get('add') === 'new';

  React.useEffect(() => {
    if (usesDatabaseApi) {
      Promise.all([loadVehicleList(), loadNextVehicleId()])
        .then(([loadedVehicles, nextId]) => {
          setVehicles(loadedVehicles);
          setNextVehicleId(nextId);
          setLoadError('');
        })
        .catch(() => {
          setLoadError('Workshop data could not be loaded. Check the database connection and try again.');
        });
    }
  }, []);

  const closeAddForm = () => {
    setSearchParams({}, { replace: true });
    setPhoto('');
    setPhotoError('');
    setSaveError('');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file for the vehicle photo.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoError('Choose an image smaller than 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoError('The selected image could not be loaded. Please try another image.');
        return;
      }
      setPhoto(reader.result);
      setPhotoError('');
    };
    reader.onerror = () => {
      setPhotoError('The selected image could not be loaded. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddVehicle = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = `Car ${nextVehicleId}`;

    const vehicle = {
      name,
      year: String(new Date().getFullYear()),
      status: 'Available',
      code: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      license: formData.get('license').trim(),
      customerName: formData.get('customerName').trim(),
      phone: formData.get('phone').trim(),
      odometer: 'Not provided',
      fuel: 'Not provided',
      image: photo,
      amount: formData.get('amount'),
    };

    try {
      const result = await createVehicle(vehicle);
      if (Array.isArray(result)) {
        setVehicles(result);
      } else {
        setVehicles((currentVehicles) => [...currentVehicles, result]);
      }
      closeAddForm();
      loadNextVehicleId()
        .then(setNextVehicleId)
        .catch(() => setLoadError('The car was added, but the next car ID could not be loaded.'));
    } catch (error) {
      setSaveError(error.message || 'The vehicle could not be saved. Check the database connection and try again.');
    }
  };

  const handleStatusChange = async (vehicle, status) => {
    try {
      const updatedVehicle = await updateVehicle(vehicle.id, { status });
      setVehicles((currentVehicles) => currentVehicles.map((item) => (
        String(item.id) === String(updatedVehicle.id) ? updatedVehicle : item
      )));
      setStatusError('');
    } catch (error) {
      setStatusError(error.message || 'The work status could not be updated. Please try again.');
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.name} (car ID ${vehicle.id})? It will be moved to History.`)) {
      return;
    }

    try {
      const result = await removeVehicle(vehicle.id);
      if (Array.isArray(result)) {
        setVehicles(result);
      } else {
        setVehicles((currentVehicles) => currentVehicles.filter((item) => String(item.id) !== result.id));
      }
      setDeleteError('');
      loadNextVehicleId()
        .then(setNextVehicleId)
        .catch(() => setLoadError('The car was deleted, but the next car ID could not be loaded.'));
    } catch (error) {
      setDeleteError(error.message || `Car ${vehicle.id} could not be deleted. Please try again.`);
    }
  };

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> YOUR WORKSPACE</p>
            <h1>Available cars</h1>
            {isAddFormOpen && <p className="page-description">Add a vehicle to your workshop.</p>}
            <a
              className="obd-code-button"
              href="https://mdshazeb9963-code.github.io/obd-ai-diagnostic-center/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">⌘</span>
              OBD Code
              <span className="obd-code-external" aria-hidden="true">↗</span>
            </a>
          </div>

          {loadError && <p className="form-message" role="alert">{loadError}</p>}
          {statusError && <p className="form-message" role="alert">{statusError}</p>}

          {isAddFormOpen && (
            <section className="add-vehicle-panel" aria-labelledby="add-vehicle-heading">
              <div className="add-vehicle-panel-heading">
                <div>
                  <p className="section-kicker">WORKSHOP INVENTORY</p>
                  <h2 id="add-vehicle-heading">Add a new car</h2>
                  <p className="page-description">New customer access ID: <strong>{nextVehicleId || 'Loading...'}</strong></p>
                </div>
                <button className="close-panel-button" type="button" onClick={closeAddForm} aria-label="Close add vehicle form">×</button>
              </div>
              <form className="add-vehicle-form" onSubmit={handleAddVehicle}>
                <label>
                  Car ID
                  <input value={nextVehicleId} readOnly aria-describedby="car-id-help" />
                </label>
                <label>
                  Customer name <span className="optional-field">(Optional)</span>
                  <input name="customerName" autoComplete="name" placeholder="e.g. Alex Morgan" />
                </label>
                <label>
                  Customer phone number (customer password)
                  <input name="phone" type="tel" autoComplete="tel" placeholder="e.g. +1 555 010 1234" minLength="7" maxLength="20" required />
                </label>
                <p id="car-id-help" className="obd-scan-help">Customers use this car ID and their phone number to access this vehicle.</p>
                <label>
                  Car number plate
                  <input name="license" placeholder="e.g. ABC-123" required />
                </label>
                <label>
                  Amount
                  <input name="amount" type="number" min="0" step="0.01" placeholder="e.g. 250.00" />
                </label>
                <div className="vehicle-photo-field">
                  <span className="vehicle-photo-label">Vehicle photo <span>Optional</span></span>
                  <div className="vehicle-photo-controls">
                    <input ref={uploadInputRef} className="sr-only" type="file" accept="image/*" onChange={handlePhotoChange} aria-label="Choose a vehicle photo" />
                    <input ref={cameraInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} aria-label="Take a vehicle photo" />
                    <button type="button" className="photo-choice-button" onClick={() => uploadInputRef.current?.click()}>
                      <span aria-hidden="true">▧</span> Choose image
                    </button>
                    <button type="button" className="photo-choice-button" onClick={() => cameraInputRef.current?.click()}>
                      <span aria-hidden="true">◎</span> Use camera
                    </button>
                  </div>
                  {photo && (
                    <div className="vehicle-photo-preview">
                      <img src={photo} alt="Selected vehicle preview" />
                      <button type="button" onClick={() => setPhoto('')}>Remove photo</button>
                    </div>
                  )}
                  {photoError && <p className="photo-error" role="alert">{photoError}</p>}
                </div>
                <div className="vehicle-photo-field">
                  <span className="vehicle-photo-label">OBD diagnostics</span>
                  <div className="vehicle-photo-controls">
                    <a
                      className="photo-choice-button"
                      href="https://mdshazeb9963-code.github.io/obd-ai-diagnostic-center/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span aria-hidden="true">▣</span> OBD Code
                    </a>
                  </div>
                </div>
                {saveError && <p className="photo-error save-error" role="alert">{saveError}</p>}
                <button className="primary-button add-vehicle-submit" type="submit" disabled={!nextVehicleId}>
                  Add car <span aria-hidden="true">→</span>
                </button>
              </form>
            </section>
          )}

          {deleteError && <p className="form-message" role="alert">{deleteError}</p>}
          <section className="mechanic-vehicles" aria-labelledby="available-cars-heading">
            <div className="vehicle-list-heading">
              <div>
                <h2 id="available-cars-heading">Available cars</h2>
                <span>{vehicles.length} vehicles</span>
              </div>
              <Link to="/cars" className="vehicle-library-link">Open vehicle library <span aria-hidden="true">→</span></Link>
            </div>

            <div className="vehicle-list">
              {vehicles.map((car) => (
                <article className="vehicle-row" key={car.id}>
                  <span className="vehicle-id">{car.id}</span>
                  <VehiclePhoto vehicle={car} className="vehicle-thumbnail" onPhotoChange={setVehicles} />
                  <div className="vehicle-details">
                    <h3>{car.name} <span>·</span> {car.year} <span>·</span> {car.license}</h3>
                    {car.customerName && <p>Customer: {car.customerName}</p>}
                    {car.phone && <p>Phone: {car.phone}</p>}
                    <p>Odometer: {car.odometer} <span>·</span> Fuel: {car.fuel}</p>
                    {car.scanReport?.codes?.length > 0 && (
                      <div className="vehicle-scan-summary">
                        <strong>OBD scan: {car.scanReport.codes.map(({ code }) => code).join(', ')}</strong>
                        <ul>
                          {car.scanReport.codes.map(({ code, description }) => (
                            <li key={code}><code>{code}</code> {description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <label className="vehicle-status-control">
                    <span className="sr-only">Work status for {car.name}</span>
                    <select
                      className={`vehicle-status vehicle-status-${String(car.status).toLowerCase().replace(/\s+/g, '-')}`}
                      value={car.status}
                      onChange={(event) => handleStatusChange(car, event.target.value)}
                    >
                      <option value="Available">Available</option>
                      <option value="Work pending">Work pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </label>
                  <div className="vehicle-row-actions">
                    <Link to={`/cars/${car.id}`} className="vehicle-row-action">View <span aria-hidden="true">↗</span></Link>
                    <button
                      type="button"
                      className="vehicle-row-delete"
                      aria-label={`Delete ${car.name}, car ID ${car.id}`}
                      onClick={() => handleDeleteVehicle(car)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;
