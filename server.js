const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { saveInvoice, getInvoice, getAllInvoices, deleteInvoice } = require('./invoice-db');
const { saveProduct, saveProducts, getAllProducts, deleteProduct } = require('./product-db');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase Admin SDK initialization
// Note: For production, you need to set up Firebase Admin SDK with service account credentials
let firebaseAdminInitialized = false;
try {
  // Initialize Firebase Admin with service account
  // You would typically use: admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount)
  // });
  // For now, we'll use a simpler approach without full token verification
  console.log('Firebase Admin SDK imported - token verification not fully configured');
  firebaseAdminInitialized = true;
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Save invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    const result = await saveInvoice(invoiceData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await getAllInvoices();
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ success: false, error: error.message, details: error.stack });
  }
});

// Get single invoice
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await getInvoice(req.params.id);
    if (!invoice) {
      res.status(404).json({ success: false, error: 'Invoice not found' });
      return;
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const result = await deleteInvoice(req.params.id);
    res.json({ success: true, deleted: result });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save product or products
app.post('/api/products', async (req, res) => {
  try {
    const payload = req.body;
    let result;

    if (Array.isArray(payload)) {
      result = await saveProducts(payload);
    } else {
      result = await saveProduct(payload);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving product(s):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Create new user
    const userId = 'USR-' + Date.now();
    const result = await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [userId, name, email, password]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Get owner email from settings (or use default)
    const settingsResult = await pool.query(
      'SELECT value FROM settings WHERE key = $1',
      ['ownerEmail']
    );
    const ownerEmail = settingsResult.rows.length > 0 ? settingsResult.rows[0].value : 'abdurrahmanpalashbd@gmail.com';
    const isOwner = user.email === ownerEmail;

    // Create session
    const sessionId = 'SES-' + Date.now();
    const sessionToken = generateSessionToken(email, password);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [sessionId, user.id, sessionToken, expiresAt]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: isOwner ? 'owner' : 'user'
        },
        session: {
          id: sessionId,
          token: sessionToken,
          expiresAt: expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate session
app.get('/api/auth/session', async (req, res) => {
  try {
    const { sessionId, token } = req.query;

    if (!sessionId || !token) {
      return res.status(400).json({ success: false, error: 'Session ID and token are required' });
    }

    // Get session
    const sessionResult = await pool.query(
      'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.token = $2 AND s.expires_at > NOW()',
      [sessionId, token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    const session = sessionResult.rows[0];
    const user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role
    };

    // Get owner email from settings
    constSettingsResult = await pool.query(
      'SELECT value FROM settings WHERE key = $1',
      ['ownerEmail']
    );
    const ownerEmail = constSettingsResult.rows.length > 0 ? constSettingsResult.rows[0].value : 'abdurrahmanpalashbd@gmail.com';
    const isOwner = user.email === ownerEmail;

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          role: isOwner ? 'owner' : 'user'
        }
      }
    });
  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to generate session token
function generateSessionToken(email, password) {
  const secret = 'invoice-web-session-secret-2026';
  const data = email + password + secret;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Settings API endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
      [key, value]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Firebase Authentication endpoint
app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { idToken, email, displayName } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'ID token is required' });
    }

    // For production, verify the Firebase ID token using Firebase Admin SDK
    // For now, we'll accept the token and use the provided email/displayName
    // In production: const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const firebaseEmail = email || 'firebase-user@example.com';
    const firebaseName = displayName || 'Firebase User';
    
    // Create session for Firebase users
    const sessionId = generateSessionId();
    const sessionToken = generateSessionToken(firebaseEmail, 'firebase-auth');
    
    // Check if user exists in database, if not create them
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [firebaseEmail]);
    let user;
    
    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await pool.query(
        'INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3) RETURNING *',
        [firebaseEmail, 'firebase-auth', firebaseName]
      );
      user = insertResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Store session in database
    await pool.query(
      'INSERT INTO sessions (session_id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'7 days\')',
      [sessionId, user.id, sessionToken]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        },
        sessionId,
        sessionToken
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
