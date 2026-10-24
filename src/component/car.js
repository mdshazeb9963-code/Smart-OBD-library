import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BrandHeader, MechanicSidebar } from './layout';
import { apiRequest, usesDatabaseApi } from './api';

const cars = [
  { id: '101', name: 'Toyota Corolla', year: '2022', status: 'Available', code: 'TC', license: '456-ABC', odometer: '82k mi', fuel: '75%' },
  { id: '102', name: 'Honda Civic', year: '2021', status: 'Available', code: 'HC', license: '789-DEF', odometer: '45k mi', fuel: '58%' },
  { id: '103', name: 'Ford Mustang', year: '2023', status: 'Available', code: 'FM', license: '101-XYZ', odometer: '112k mi', fuel: '40%' },
];

const savedCarsKey = 'smart-obd-saved-vehicles';
const vehiclePhotosKey = 'smart-obd-vehicle-photos';
const deletedCarsKey = 'smart-obd-deleted-vehicle-ids';
const vehicleHistoryKey = 'smart-obd-vehicle-history';
const vehicleChangesKey = 'smart-obd-vehicle-changes';
const customerFeedbackKey = 'smart-obd-customer-feedback';

export function getVehicleList() {
  const savedCars = window.localStorage.getItem(savedCarsKey);
  const parsedCars = savedCars ? JSON.parse(savedCars) : [];
  if (!Array.isArray(parsedCars)) {
    throw new Error('Saved vehicle data must be a list.');
  }

  const savedPhotos = window.localStorage.getItem(vehiclePhotosKey);
  const parsedPhotos = savedPhotos ? JSON.parse(savedPhotos) : {};
  if (!parsedPhotos || typeof parsedPhotos !== 'object' || Array.isArray(parsedPhotos)) {
    throw new Error('Saved vehicle photos must be a map.');
  }

  const vehicleChanges = window.localStorage.getItem(vehicleChangesKey);
  const parsedChanges = vehicleChanges ? JSON.parse(vehicleChanges) : {};
  if (!parsedChanges || typeof parsedChanges !== 'object' || Array.isArray(parsedChanges)) {
    throw new Error('Saved vehicle changes must be a map.');
  }

  const deletedIds = getDeletedVehicleIds();
  return [...cars, ...parsedCars].map((vehicle) => ({
    ...vehicle,
    ...(parsedChanges[vehicle.id] || {}),
    image: parsedPhotos[vehicle.id] || vehicle.image || '',
  })).filter((vehicle) => !deletedIds.has(String(vehicle.id)));
}

function getDeletedVehicleIds() {
  const deletedIds = window.localStorage.getItem(deletedCarsKey);
  const parsedIds = deletedIds ? JSON.parse(deletedIds) : [];
  if (!Array.isArray(parsedIds)) {
    throw new Error('Deleted vehicle IDs must be a list.');
  }
  return new Set(parsedIds.map(String));
}

export function getVehicleHistory() {
  const history = window.localStorage.getItem(vehicleHistoryKey);
  const parsedHistory = history ? JSON.parse(history) : [];
  if (!Array.isArray(parsedHistory)) {
    throw new Error('Vehicle history must be a list.');
  }
  return parsedHistory;
}

export function getNextVehicleId() {
  const vehicleIds = [...getVehicleList(), ...getVehicleHistory()]
    .map(({ id }) => String(id))
    .filter((id) => /^\d+$/.test(id))
    .map(Number);

  return String(Math.max(100, ...vehicleIds) + 1);
}

export function getCustomerVehicle(vehicleId, phone) {
  const normalizedPhone = String(phone).replace(/\D/g, '');
  if (!normalizedPhone) {
    return null;
  }

  return getVehicleList().find((vehicle) =>
    String(vehicle.id) === String(vehicleId).trim() &&
    String(vehicle.phone || '').replace(/\D/g, '') === normalizedPhone
  ) || null;
}

export function saveVehicle(vehicle) {
  const savedCars = window.localStorage.getItem(savedCarsKey);
  const parsedCars = savedCars ? JSON.parse(savedCars) : [];
  if (!Array.isArray(parsedCars)) {
    throw new Error('Saved vehicle data must be a list.');
  }

  const savedVehicle = { ...vehicle, id: getNextVehicleId() };
  const updatedCars = [...parsedCars, savedVehicle];
  window.localStorage.setItem(savedCarsKey, JSON.stringify(updatedCars));
  return getVehicleList();
}

export function deleteVehicle(vehicleId) {
  const vehicle = getVehicleList().find((item) => String(item.id) === String(vehicleId));
  if (!vehicle) {
    throw new Error(`Vehicle ${vehicleId} was not found.`);
  }

  const history = getVehicleHistory();
  const deletedIds = getDeletedVehicleIds();
  const archivedVehicle = {
    ...vehicle,
    deletedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(vehicleHistoryKey, JSON.stringify([
    archivedVehicle,
    ...history.filter((item) => String(item.id) !== String(vehicle.id)),
  ]));
  deletedIds.add(String(vehicle.id));
  window.localStorage.setItem(deletedCarsKey, JSON.stringify([...deletedIds]));
  return getVehicleList();
}

export function saveVehiclePhoto(vehicleId, image) {
  const savedPhotos = window.localStorage.getItem(vehiclePhotosKey);
  const parsedPhotos = savedPhotos ? JSON.parse(savedPhotos) : {};
  if (!parsedPhotos || typeof parsedPhotos !== 'object' || Array.isArray(parsedPhotos)) {
    throw new Error('Saved vehicle photos must be a map.');
  }

  parsedPhotos[vehicleId] = image;
  window.localStorage.setItem(vehiclePhotosKey, JSON.stringify(parsedPhotos));
  return getVehicleList();
}

export async function loadVehicleList() {
  return usesDatabaseApi ? apiRequest('/vehicles') : getVehicleList();
}

export async function loadNextVehicleId() {
  if (usesDatabaseApi) {
    const result = await apiRequest('/vehicles/next-id');
    return result.id;
  }
  return getNextVehicleId();
}

export async function createVehicle(vehicle) {
  if (usesDatabaseApi) {
    return apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }
  return saveVehicle(vehicle);
}

export async function updateVehicle(vehicleId, changes) {
  if (usesDatabaseApi) {
    return apiRequest(`/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
  }

  const vehicle = getVehicleList().find((item) => String(item.id) === String(vehicleId));
  if (!vehicle) {
    throw new Error(`Vehicle ${vehicleId} was not found.`);
  }

  const savedChanges = window.localStorage.getItem(vehicleChangesKey);
  const parsedChanges = savedChanges ? JSON.parse(savedChanges) : {};
  if (!parsedChanges || typeof parsedChanges !== 'object' || Array.isArray(parsedChanges)) {
    throw new Error('Saved vehicle changes must be a map.');
  }
  parsedChanges[vehicleId] = { ...vehicle, ...changes };
  window.localStorage.setItem(vehicleChangesKey, JSON.stringify(parsedChanges));
  return getVehicleList().find((item) => String(item.id) === String(vehicleId));
}

export async function removeVehicle(vehicleId) {
  if (usesDatabaseApi) {
    await apiRequest(`/vehicles/${encodeURIComponent(vehicleId)}`, { method: 'DELETE' });
    return { id: String(vehicleId) };
  }
  return deleteVehicle(vehicleId);
}

export async function loadCustomerFeedback() {
  if (usesDatabaseApi) {
    return apiRequest('/feedback');
  }

  const storedFeedback = window.localStorage.getItem(customerFeedbackKey);
  const parsedFeedback = storedFeedback ? JSON.parse(storedFeedback) : [];
  if (!Array.isArray(parsedFeedback)) {
    throw new Error('Customer feedback must be a list.');
  }
  return parsedFeedback;
}

export async function submitCustomerFeedback(vehicle, message) {
  const feedback = {
    vehicleId: String(vehicle.id),
    vehicleName: vehicle.name,
    customerName: vehicle.customerName || '',
    message: message.trim(),
  };

  if (usesDatabaseApi) {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  const storedFeedback = window.localStorage.getItem(customerFeedbackKey);
  const parsedFeedback = storedFeedback ? JSON.parse(storedFeedback) : [];
  if (!Array.isArray(parsedFeedback)) {
    throw new Error('Customer feedback must be a list.');
  }
  const savedFeedback = {
    ...feedback,
    id: `${Date.now()}-${parsedFeedback.length}`,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(customerFeedbackKey, JSON.stringify([savedFeedback, ...parsedFeedback]));
  return savedFeedback;
}

export async function loadVehicleHistory() {
  return usesDatabaseApi ? apiRequest('/history') : getVehicleHistory();
}

export async function lookupCustomerVehicle(vehicleId, phone) {
  if (!usesDatabaseApi) {
    return getCustomerVehicle(vehicleId, phone);
  }
  try {
    return await apiRequest('/customer/login', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, phone }),
    });
  } catch (error) {
    if (error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function persistVehiclePhoto(vehicleId, image) {
  if (usesDatabaseApi) {
    return apiRequest(`/vehicles/${encodeURIComponent(vehicleId)}/photo`, {
      method: 'PUT',
      body: JSON.stringify({ image }),
    });
  }
  return saveVehiclePhoto(vehicleId, image);
}

export function VehiclePhoto({ vehicle, className, onPhotoChange }) {
  const inputRef = React.useRef(null);
  const [photoError, setPhotoError] = React.useState('');

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

      persistVehiclePhoto(vehicle.id, reader.result)
        .then((result) => {
          if (Array.isArray(result)) {
            onPhotoChange(result);
          } else {
            onPhotoChange((vehicles) => vehicles.map((item) => (
              String(item.id) === String(result.id) ? result : item
            )));
          }
          setPhotoError('');
        })
        .catch(() => {
          setPhotoError('The photo could not be saved. Check browser storage or the database connection and try again.');
        });
    };
    reader.onerror = () => {
      setPhotoError('The selected image could not be loaded. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`${className} vehicle-photo-control`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhotoChange}
        aria-label={`Choose a photo for ${vehicle.name}`}
      />
      <button
        type="button"
        className="vehicle-photo-trigger"
        onClick={() => inputRef.current?.click()}
        aria-label={`${vehicle.image ? 'Change' : 'Add'} photo for ${vehicle.name}`}
      >
        {vehicle.image ? (
          <>
            <img className="vehicle-photo-image" src={vehicle.image} alt="" />
            <span className="vehicle-photo-action" aria-hidden="true">Change photo</span>
          </>
        ) : (
          <span className="vehicle-photo-placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7.5h3l1.5-2h7l1.5 2h3A1.5 1.5 0 0 1 21.5 9v9a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span>Add photo</span>
          </span>
        )}
      </button>
      {photoError && <span className="vehicle-photo-upload-error" role="alert">{photoError}</span>}
    </div>
  );
}

function Cars() {
  const [vehicleList, setVehicleList] = React.useState(usesDatabaseApi ? [] : getVehicleList);
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    if (usesDatabaseApi) {
      loadVehicleList()
        .then(setVehicleList)
        .catch(() => setLoadError('Vehicles could not be loaded. Check the database connection and try again.'));
    }
  }, []);

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> VEHICLE LIBRARY</p>
            <h1>Available vehicles</h1>
            <p className="page-description">Browse the vehicles currently in your workshop library.</p>
          </div>

          <div className="library-toolbar">
            <div>
              <span className="library-count">{vehicleList.length}</span>
              <span className="library-count-label">vehicles in library</span>
            </div>
            {loadError && <p className="form-message" role="alert">{loadError}</p>}
            <span className="availability-label"><span className="status-dot" aria-hidden="true" /> All systems ready</span>
          </div>

          <section className="car-grid" aria-label="Available vehicles">
            {vehicleList.map((car) => (
              <article className="car-card" key={car.name}>
                <div className="car-visual">
                  <span className="car-monogram">{car.code}</span>
                  <VehiclePhoto vehicle={car} className="car-photo" onPhotoChange={setVehicleList} />
                  <span className="car-status"><span className="status-dot" aria-hidden="true" /> {car.status}</span>
                </div>
                <div className="car-details">
                  <p className="car-type">PASSENGER VEHICLE</p>
                  <h2>{car.name}</h2>
                  <div className="car-footer">
                    <span><span className="detail-icon" aria-hidden="true">◷</span> Model year <strong>{car.year}</strong></span>
                    <span className="car-arrow" aria-hidden="true">↗</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export function VehicleDetails() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = React.useState(() => (
    usesDatabaseApi ? null : getVehicleList().find((car) => String(car.id) === vehicleId) || null
  ));
  const [loadError, setLoadError] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState('');

  React.useEffect(() => {
    if (usesDatabaseApi) {
      apiRequest(`/vehicles/${encodeURIComponent(vehicleId)}`)
        .then(setVehicle)
        .catch((error) => {
          if (error.status !== 404) {
            setLoadError('Vehicle details could not be loaded. Check the database connection and try again.');
          }
        });
    }
  }, [vehicleId]);

  const handleSaveVehicle = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const changes = {
      customerName: formData.get('customerName').trim(),
      phone: formData.get('phone').trim(),
      license: formData.get('license').trim(),
      amount: formData.get('amount'),
      status: formData.get('status'),
    };

    try {
      setVehicle(await updateVehicle(vehicleId, changes));
      setIsEditing(false);
      setSaveError('');
      setSaveSuccess('Vehicle details updated.');
    } catch (error) {
      setSaveError(error.message || 'Vehicle details could not be updated. Please try again.');
      setSaveSuccess('');
    }
  };

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          {vehicle ? (
            <>
              <div className="page-heading">
                <p className="eyebrow"><span className="eyebrow-line" /> VEHICLE DETAILS</p>
                <h1>{vehicle.name}</h1>
                <p className="page-description">Details for car ID {vehicle.id}.</p>
                <button
                  className="secondary-button vehicle-edit-trigger"
                  type="button"
                  onClick={() => {
                    setIsEditing((editing) => !editing);
                    setSaveError('');
                    setSaveSuccess('');
                  }}
                >
                  {isEditing ? 'Cancel edit' : 'Edit vehicle'}
                </button>
              </div>
              {saveError && <p className="form-message" role="alert">{saveError}</p>}
              {saveSuccess && <p className="form-message success-message" role="status">{saveSuccess}</p>}
              <section className="vehicle-detail-card" aria-label={`${vehicle.name} details`}>
                {vehicle.image && <img className="vehicle-detail-image" src={vehicle.image} alt={`${vehicle.name}`} />}
                <div className="vehicle-detail-grid">
                  <div><span>Car ID</span><strong>{vehicle.id}</strong></div>
                  <div><span>Vehicle name</span><strong>{vehicle.name}</strong></div>
                  <div><span>Year</span><strong>{vehicle.year}</strong></div>
                  <div><span>Number plate</span><strong>{vehicle.license || 'Not provided'}</strong></div>
                  <div><span>Customer name</span><strong>{vehicle.customerName || 'Not provided'}</strong></div>
                  <div><span>Customer phone</span><strong>{vehicle.phone || 'Not provided'}</strong></div>
                  <div><span>Status</span><strong>{vehicle.status}</strong></div>
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
              {isEditing && (
                <form className="vehicle-edit-form" onSubmit={handleSaveVehicle}>
                  <h2>Edit vehicle details</h2>
                  <label>
                    Customer name
                    <input name="customerName" defaultValue={vehicle.customerName || ''} />
                  </label>
                  <label>
                    Customer phone number
                    <input name="phone" type="tel" minLength="7" maxLength="20" required defaultValue={vehicle.phone || ''} />
                  </label>
                  <label>
                    Car number plate
                    <input name="license" required defaultValue={vehicle.license || ''} />
                  </label>
                  <label>
                    Amount
                    <input name="amount" type="number" min="0" step="0.01" defaultValue={vehicle.amount ?? ''} />
                  </label>
                  <label>
                    Work status
                    <select name="status" defaultValue={vehicle.status}>
                      <option value="Available">Available</option>
                      <option value="Work pending">Work pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </label>
                  <button className="primary-button" type="submit">Save changes</button>
                </form>
              )}
            </>
          ) : (
            <section className="vehicle-detail-card" role="status">
              <h1>{loadError ? 'Vehicle details unavailable' : 'Vehicle not found'}</h1>
              <p>{loadError || `There is no vehicle with car ID ${vehicleId} in this workshop library.`}</p>
            </section>
          )}
          <Link to="/home" className="vehicle-library-link vehicle-detail-back">← Back to available cars</Link>
        </main>
      </div>
    </div>
  );
}

export default Cars;
