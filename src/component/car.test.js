import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  deleteVehicle,
  getCustomerVehicle,
  getNextVehicleId,
  getVehicleHistory,
  getVehicleList,
  loadCustomerFeedback,
  saveVehicle,
  submitCustomerFeedback,
  updateVehicle,
  VehiclePhoto,
} from './car';

beforeEach(() => {
  window.localStorage.clear();
});

test('lets a vehicle photo be uploaded and keeps it in the vehicle list', async () => {
  const onPhotoChange = jest.fn();
  const vehicle = getVehicleList()[0];
  const { container } = render(
    <VehiclePhoto
      vehicle={vehicle}
      className="vehicle-thumbnail"
      onPhotoChange={onPhotoChange}
    />,
  );

  fireEvent.change(container.querySelector('input[type="file"]'), {
    target: {
      files: [new File(['vehicle photo'], 'vehicle.png', { type: 'image/png' })],
    },
  });

  await waitFor(() => expect(onPhotoChange).toHaveBeenCalled());
  const updatedVehicles = onPhotoChange.mock.calls[0][0];
  const savedVehicle = updatedVehicles.find((item) => item.id === vehicle.id);
  expect(savedVehicle.image).toMatch(/^data:image\/png;base64,/);
  expect(getVehicleList().find((item) => item.id === vehicle.id).image).toBe(savedVehicle.image);
});

test('assigns sequential car IDs and matches customer phone numbers independent of formatting', () => {
  expect(getNextVehicleId()).toBe('104');
  const savedVehicles = saveVehicle({
    name: 'Customer car',
    year: '2025',
    phone: '+1 (555) 010-2020',
  });
  const createdVehicle = savedVehicles.find(({ name }) => name === 'Customer car');

  expect(createdVehicle.id).toBe('104');
  expect(getNextVehicleId()).toBe('105');
  expect(getCustomerVehicle('104', '1-555-010-2020')).toEqual(createdVehicle);
  expect(getCustomerVehicle('104', '555-999-0000')).toBeNull();
});

test('moves a deleted vehicle to history and does not reuse its ID', () => {
  saveVehicle({
    name: 'Archived car',
    year: '2025',
    phone: '+1 (555) 010-2020',
  });

  const activeVehicles = deleteVehicle('104');

  expect(activeVehicles.some(({ id }) => id === '104')).toBe(false);
  expect(getVehicleHistory()[0]).toMatchObject({
    id: '104',
    name: 'Archived car',
  });
  expect(getVehicleHistory()[0].deletedAt).toBeTruthy();
  expect(getCustomerVehicle('104', '+1 555 010-2020')).toBeNull();
  expect(getNextVehicleId()).toBe('105');
});

test('updates and persists vehicle work status and amount', async () => {
  const [vehicle] = getVehicleList();

  const updatedVehicle = await updateVehicle(vehicle.id, {
    status: 'Work pending',
    amount: '250.50',
  });

  expect(updatedVehicle).toMatchObject({
    id: vehicle.id,
    status: 'Work pending',
    amount: '250.50',
  });
  expect(getVehicleList().find(({ id }) => id === vehicle.id)).toMatchObject({
    status: 'Work pending',
    amount: '250.50',
  });
});

test('saves customer feedback for the mechanic inbox', async () => {
  const [vehicle] = getVehicleList();

  await submitCustomerFeedback(vehicle, '  Please call me about the repair.  ');

  expect(await loadCustomerFeedback()).toEqual([
    expect.objectContaining({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      message: 'Please call me about the repair.',
    }),
  ]);
});
