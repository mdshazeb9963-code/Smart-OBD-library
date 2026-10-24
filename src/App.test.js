import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { saveVehicle, VehicleDetails } from './component/car';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

test('shows the workspace choices and opens the mechanic sign-in', () => {
  render(<App />);

  expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /choose your workspace/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));

  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/workshop password/i)).toBeInTheDocument();
});

test('brand logo returns to role selection before mechanic password sign-in', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: /smart obd home/i }));
  expect(screen.getByRole('heading', { name: /choose your workspace/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  expect(screen.getByLabelText(/workshop password/i)).toBeInTheDocument();
});

test('customer choice opens the customer support page', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /continue as customer/i }));

  expect(screen.getByRole('heading', { name: /access your vehicle/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/car id/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/phone number \(password\)/i)).toBeInTheDocument();
});

test('customer sign-in opens a mechanic-style vehicle workspace', async () => {
  const [vehicle] = saveVehicle({
    name: 'Customer test car',
    year: '2026',
    status: 'Available',
    code: 'CT',
    license: 'CUST-123',
    customerName: 'Sam Customer',
    phone: '+1 555 010 3333',
    odometer: '20k mi',
    fuel: '80%',
    image: 'data:image/png;base64,dGVzdA==',
  }).filter(({ id }) => id === '104');
  window.localStorage.setItem('smart-obd-workshop-about', 'Workshop profile for customers.');
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /continue as customer/i }));
  fireEvent.change(screen.getByLabelText(/car id/i), { target: { value: vehicle.id } });
  fireEvent.change(screen.getByLabelText(/phone number \(password\)/i), { target: { value: '+1 555 010 3333' } });
  fireEvent.click(screen.getByRole('button', { name: /view my vehicle/i }));

  expect(await screen.findByRole('navigation', { name: /customer navigation/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Your vehicle' })).toBeInTheDocument();
  expect(screen.getByText(/Customer test car/)).toBeInTheDocument();
  expect(screen.getByText('CUST-123')).toBeInTheDocument();
  expect(screen.getByText('Sam Customer')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Customer test car' })).toHaveAttribute('src', 'data:image/png;base64,dGVzdA==');

  fireEvent.click(screen.getByRole('button', { name: /^about$/i }));
  expect(screen.getByRole('heading', { name: /about the mechanic/i })).toBeInTheDocument();
  expect(await screen.findByText('Workshop profile for customers.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /my vehicle/i }));
  expect(screen.getByRole('heading', { name: 'Your vehicle' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
  expect(screen.getByRole('heading', { name: /access your vehicle/i })).toBeInTheDocument();
});

test('shows an accessible error when the mechanic password is incorrect', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: 'incorrect' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));

  expect(screen.getByRole('alert')).toHaveTextContent(/password is incorrect/i);
});

test('shows available cars, opens Add New from the sidebar, and opens History', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));

  expect(screen.getByRole('heading', { name: 'Available cars', level: 1 })).toBeInTheDocument();
  expect(
    screen.getAllByRole('link', { name: /obd code/i }).some(
      (link) => link.getAttribute('href') === 'https://mdshazeb9963-code.github.io/obd-ai-diagnostic-center/'
    )
  ).toBe(true);
  expect(screen.getByRole('link', { name: /obd code/i })).toHaveAttribute('target', '_blank');
  expect(screen.getAllByText(/Toyota Corolla/).length).toBeGreaterThan(0);
  expect(screen.queryByRole('link', { name: /add a new car/i })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: /add new/i }));
  expect(screen.getByRole('heading', { name: 'Available cars', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /add a new car/i })).toBeInTheDocument();
  expect(screen.getByLabelText('Car ID')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /close add vehicle form/i }));
  expect(screen.getAllByText(/Toyota Corolla/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('link', { name: /history/i }));
  expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/deleted cars will appear here/i);
});

test('deletes a car from available cars and records it in History', async () => {
  window.localStorage.clear();
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));

  expect(screen.getAllByText(/Toyota Corolla/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Toyota Corolla, car ID 101' }));

  await waitFor(() => expect(screen.queryByText(/Toyota Corolla/)).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('link', { name: /history/i }));
  expect(screen.getByText(/Toyota Corolla/)).toBeInTheDocument();
  expect(screen.getByText(/456-ABC/)).toBeInTheDocument();

  confirmSpy.mockRestore();
});

test('shows details for the selected car route', () => {
  render(
    <MemoryRouter initialEntries={['/cars/101']}>
      <Routes>
        <Route path="/cars/:vehicleId" element={<VehicleDetails />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'Toyota Corolla' })).toBeInTheDocument();
  expect(screen.getByText('Car ID')).toBeInTheDocument();
  expect(screen.getByText('101')).toBeInTheDocument();
  expect(screen.getByText('456-ABC')).toBeInTheDocument();
  expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
});

test('updates a car status from the list and saves edited vehicle details', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));

  const statusSelector = screen.getByRole('combobox', { name: /work status for toyota corolla/i });
  fireEvent.change(statusSelector, { target: { value: 'Work pending' } });
  await waitFor(() => expect(statusSelector).toHaveValue('Work pending'));

  fireEvent.click(screen.getAllByRole('link', { name: /view/i })[0]);
  fireEvent.click(screen.getByRole('button', { name: /edit vehicle/i }));
  fireEvent.change(screen.getByLabelText(/customer phone number/i), {
    target: { value: '5551234567' },
  });
  fireEvent.change(screen.getByRole('spinbutton', { name: /amount/i }), {
    target: { value: '250.50' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  expect(await screen.findByRole('status')).toHaveTextContent(/vehicle details updated/i);
  expect(screen.getByText('Work pending')).toBeInTheDocument();
  expect(screen.getByText('250.50')).toBeInTheDocument();
  expect(window.localStorage.getItem('smart-obd-vehicle-changes')).toContain('"amount":"250.50"');
});

test('lets customers send feedback and shows the message in the mechanic inbox', async () => {
  const [vehicle] = saveVehicle({
    name: 'Feedback test car',
    year: '2026',
    license: 'FDB-123',
    customerName: 'Taylor Customer',
    phone: '5551234567',
  }).filter(({ id }) => id === '104');
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /continue as customer/i }));
  fireEvent.change(screen.getByLabelText(/car id/i), { target: { value: vehicle.id } });
  fireEvent.change(screen.getByLabelText(/phone number \(password\)/i), { target: { value: vehicle.phone } });
  fireEvent.click(screen.getByRole('button', { name: /view my vehicle/i }));
  expect(await screen.findByRole('navigation', { name: /customer navigation/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /switch workspace/i })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /contact mechanic/i }));
  fireEvent.change(screen.getByLabelText(/your message/i), {
    target: { value: 'Please call me about the repair.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
  expect(await screen.findByRole('status')).toHaveTextContent(/message has been sent/i);

  fireEvent.click(screen.getByRole('link', { name: /smart obd home/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));
  fireEvent.click(screen.getByRole('link', { name: /customer feedback/i }));

  expect(await screen.findByText('Please call me about the repair.')).toBeInTheDocument();
  expect(screen.getByText(/Taylor Customer/)).toBeInTheDocument();
  expect(screen.getByText(/Feedback test car/)).toBeInTheDocument();
});

test('opens the About page and saves the existing workshop information', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));
  fireEvent.click(screen.getByRole('link', { name: /^about$/i }));

  expect(screen.getByText('Quick access to your vehicle reference library.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /edit about/i }));
  fireEvent.change(screen.getByLabelText(/workshop about text/i), {
    target: { value: 'Workshop profile information.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(await screen.findByText('Workshop profile information.')).toBeInTheDocument();
  expect(window.localStorage.getItem('smart-obd-workshop-about')).toBe('Workshop profile information.');
});

test('creates a car with an incrementing ID and lets its customer sign in with the phone number', async () => {
  window.localStorage.clear();
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /continue as mechanic/i }));
  fireEvent.change(screen.getByLabelText(/workshop password/i), {
    target: { value: '123321' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enter workspace/i }));

  fireEvent.click(screen.getByRole('link', { name: /add new/i }));
  expect(screen.getByLabelText('Car ID')).toHaveValue('104');
  expect(screen.queryByLabelText(/vehicle name/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/^year$/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/odometer/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/fuel level/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/obd scan file/i)).not.toBeInTheDocument();
  expect(
    screen.getAllByRole('link', { name: /obd code/i }).some(
      (link) => link.getAttribute('href') === 'https://mdshazeb9963-code.github.io/obd-ai-diagnostic-center/'
    )
  ).toBe(true);
  fireEvent.change(screen.getByLabelText(/customer phone number/i), { target: { value: '+1 555 123 4567' } });
  fireEvent.change(screen.getByLabelText(/car number plate/i), { target: { value: 'TST-104' } });
  fireEvent.click(screen.getByRole('button', { name: /add car/i }));

  expect(await screen.findByText('104')).toBeInTheDocument();
  expect(window.localStorage.getItem('smart-obd-saved-vehicles')).toContain('"id":"104"');

  fireEvent.click(screen.getByRole('link', { name: /smart obd home/i }));
  fireEvent.click(screen.getByRole('button', { name: /continue as customer/i }));
  fireEvent.change(screen.getByLabelText(/car id/i), { target: { value: '104' } });
  fireEvent.change(screen.getByLabelText(/phone number \(password\)/i), { target: { value: '15551234567' } });
  fireEvent.click(screen.getByRole('button', { name: /view my vehicle/i }));

  expect(await screen.findByRole('heading', { name: `Car 104 · ${new Date().getFullYear()}` })).toBeInTheDocument();
  expect(screen.getByText(/car id 104/i)).toBeInTheDocument();
});
