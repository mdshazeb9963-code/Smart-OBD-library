const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
const port = Number(process.env.API_PORT || 3001);
const connectionUrl = (process.env.MYSQL_URL || 'jdbc:mysql://localhost:3306/obd')
  .replace(/^jdbc:/, '');
const parsedUrl = new URL(connectionUrl);

if (parsedUrl.protocol !== 'mysql:') {
  throw new Error('MYSQL_URL must use the mysql:// or jdbc:mysql:// protocol.');
}

if (!process.env.MYSQL_USER) {
  throw new Error('Set MYSQL_USER before starting the API server.');
}

const pool = mysql.createPool({
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port || 3306),
  database: decodeURIComponent(parsedUrl.pathname.slice(1)),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(express.json({ limit: '2mb' }));

function respondWithError(res, error) {
  console.error(error);
  res.status(500).json({ error: 'The database request failed.' });
}

function mapVehicle(row) {
  return {
    id: String(row.id),
    name: row.name,
    year: String(row.year),
    status: row.status,
    code: row.code,
    license: row.license,
    customerName: row.customer_name || '',
    phone: row.phone || '',
    odometer: row.odometer || 'Not provided',
    fuel: row.fuel || 'Not provided',
    amount: row.amount === null || row.amount === undefined ? '' : String(row.amount),
    image: row.image || '',
    scanReport: row.scan_report || null,
    ...(row.deleted_at ? { deletedAt: row.deleted_at.toISOString() } : {}),
  };
}

function validVehicle(vehicle) {
  return vehicle &&
    typeof vehicle.name === 'string' &&
    typeof vehicle.license === 'string' &&
    typeof vehicle.phone === 'string' &&
    workStatuses.has(vehicle.status || 'Available') &&
    (vehicle.amount === undefined || vehicle.amount === null || vehicle.amount === '' ||
      (Number.isFinite(Number(vehicle.amount)) && Number(vehicle.amount) >= 0)) &&
    vehicle.name.trim() &&
    vehicle.license.trim() &&
    vehicle.phone.trim();
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    respondWithError(res, error);
  }
});

const workStatuses = new Set(['Available', 'Work pending', 'Done']);

app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vehicles WHERE deleted_at IS NULL ORDER BY id'
    );
    res.json(rows.map(mapVehicle));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.get('/api/vehicles/next-id', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT GREATEST(104, COALESCE(MAX(id), 103) + 1) AS next_id FROM vehicles'
    );
    res.json({ id: String(row.next_id) });
  } catch (error) {
    respondWithError(res, error);
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    res.json(mapVehicle(rows[0]));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.post('/api/vehicles', async (req, res) => {
  const vehicle = req.body;
  if (!validVehicle(vehicle)) {
    res.status(400).json({
      error: 'Vehicle details are invalid. Check the name, phone, number plate, amount, and work status.',
    });
    return;
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO vehicles
        (name, year, status, code, license, customer_name, phone, odometer, fuel, amount, image, scan_report)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle.name.trim(),
        Number(vehicle.year) || new Date().getFullYear(),
        vehicle.status || 'Available',
        vehicle.code || '',
        vehicle.license.trim(),
        vehicle.customerName || null,
        vehicle.phone.trim(),
        vehicle.odometer || 'Not provided',
        vehicle.fuel || 'Not provided',
        vehicle.amount === '' || vehicle.amount === null || vehicle.amount === undefined
          ? null
          : Number(vehicle.amount),
        vehicle.image || null,
        vehicle.scanReport ? JSON.stringify(vehicle.scanReport) : null,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    res.status(201).json(mapVehicle(rows[0]));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  const body = req.body || {};
  const assignments = [];
  const values = [];
  const fields = [
    ['customerName', 'customer_name', (value) => typeof value === 'string' && value.length <= 120, (value) => value.trim() || null],
    ['phone', 'phone', (value) => typeof value === 'string' && value.trim().length >= 7 && value.trim().length <= 30, (value) => value.trim()],
    ['license', 'license', (value) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 40, (value) => value.trim()],
    ['amount', 'amount', (value) => value === '' || value === null || (Number.isFinite(Number(value)) && Number(value) >= 0), (value) => value === '' || value === null ? null : Number(value)],
    ['status', 'status', (value) => workStatuses.has(value), (value) => value],
  ];

  for (const [bodyField, column, isValid, normalize] of fields) {
    if (Object.prototype.hasOwnProperty.call(body, bodyField)) {
      if (!isValid(body[bodyField])) {
        res.status(400).json({ error: `The ${bodyField} value is invalid.` });
        return;
      }
      assignments.push(`${column} = ?`);
      values.push(normalize(body[bodyField]));
    }
  }

  if (!assignments.length) {
    res.status(400).json({ error: 'At least one vehicle field must be updated.' });
    return;
  }

  try {
    values.push(req.params.id);
    const [result] = await pool.execute(
      `UPDATE vehicles SET ${assignments.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(mapVehicle(rows[0]));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.put('/api/vehicles/:id/photo', async (req, res) => {
  const image = req.body?.image;
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    res.status(400).json({ error: 'A valid image data URL is required.' });
    return;
  }

  try {
    const [result] = await pool.execute(
      'UPDATE vehicles SET image = ? WHERE id = ? AND deleted_at IS NULL',
      [image, req.params.id]
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(mapVehicle(rows[0]));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE vehicles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [req.params.id]
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    res.status(204).end();
  } catch (error) {
    respondWithError(res, error);
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vehicles WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
    );
    res.json(rows.map(mapVehicle));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.post('/api/customer/login', async (req, res) => {
  const { vehicleId, phone } = req.body || {};
  if (!String(phone || '').replace(/\D/g, '')) {
    res.status(400).json({ error: 'Car ID and phone number are required.' });
    return;
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicles WHERE id = ? AND deleted_at IS NULL',
      [String(vehicleId || '').trim()]
    );
    const submittedPhone = String(phone).replace(/\D/g, '');
    const vehicle = rows[0];
    if (!vehicle || String(vehicle.phone || '').replace(/\D/g, '') !== submittedPhone) {
      res.status(401).json({ error: 'The car ID or phone number did not match.' });
      return;
    }
    res.json(mapVehicle(vehicle));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.get('/api/about', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT content FROM workshop_about WHERE id = 1');
    res.json({ content: rows[0]?.content || 'Quick access to your vehicle reference library.' });
  } catch (error) {
    respondWithError(res, error);
  }
});

app.put('/api/about', async (req, res) => {
  const rawContent = req.body?.content;
  const content = typeof rawContent === 'string' ? rawContent.trim() : '';
  if (!content || content.length > 180) {
    res.status(400).json({ error: 'About text must contain 1 to 180 characters.' });
    return;
  }

  try {
    await pool.execute(
      `INSERT INTO workshop_about (id, content) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content)`,
      [content]
    );
    res.json({ content });
  } catch (error) {
    respondWithError(res, error);
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, vehicle_id, vehicle_name, customer_name, message, created_at
       FROM customer_feedback ORDER BY created_at DESC, id DESC`
    );
    res.json(rows.map((row) => ({
      id: String(row.id),
      vehicleId: String(row.vehicle_id),
      vehicleName: row.vehicle_name,
      customerName: row.customer_name || '',
      message: row.message,
      createdAt: row.created_at.toISOString(),
    })));
  } catch (error) {
    respondWithError(res, error);
  }
});

app.post('/api/feedback', async (req, res) => {
  const vehicleId = String(req.body?.vehicleId || '').trim();
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!/^\d+$/.test(vehicleId) || !message || message.length > 1000) {
    res.status(400).json({ error: 'A valid car ID and a message of 1 to 1000 characters are required.' });
    return;
  }

  try {
    const [vehicles] = await pool.execute(
      'SELECT id, name, customer_name FROM vehicles WHERE id = ? AND deleted_at IS NULL',
      [vehicleId]
    );
    if (!vehicles.length) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    const vehicle = vehicles[0];
    const [result] = await pool.execute(
      `INSERT INTO customer_feedback
        (vehicle_id, vehicle_name, customer_name, message)
       VALUES (?, ?, ?, ?)`,
      [vehicle.id, vehicle.name, vehicle.customer_name, message]
    );
    const [rows] = await pool.execute(
      `SELECT id, vehicle_id, vehicle_name, customer_name, message, created_at
       FROM customer_feedback WHERE id = ?`,
      [result.insertId]
    );
    const row = rows[0];
    res.status(201).json({
      id: String(row.id),
      vehicleId: String(row.vehicle_id),
      vehicleName: row.vehicle_name,
      customerName: row.customer_name || '',
      message: row.message,
      createdAt: row.created_at.toISOString(),
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Smart OBD API listening on http://127.0.0.1:${port}`);
});
