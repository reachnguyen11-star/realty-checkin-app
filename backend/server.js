require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Firebase Admin
let db, bucket;
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('./firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  db = admin.firestore();
  bucket = admin.storage().bucket();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Realty Check-in API is running',
    timestamp: new Date().toISOString()
  });
});

// Upload image to Firebase Storage
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileName = `checkin-images/${Date.now()}_${uuidv4()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    // Create a write stream
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        }
      }
    });

    // Handle stream events
    await new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Make the file public
          await file.makePublic();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.end(req.file.buffer);
    });

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    res.json({
      success: true,
      imageUrl: publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
});

// Create check-in report
app.post('/api/checkin', async (req, res) => {
  try {
    const {
      saleName,
      customerName,
      customerPhone,
      location,
      latitude,
      longitude,
      notes,
      imageUrl,
      checkInType
    } = req.body;

    // Validation
    if (!saleName || !customerName) {
      return res.status(400).json({
        error: 'Sale name and customer name are required'
      });
    }

    const checkInData = {
      saleName,
      customerName,
      customerPhone: customerPhone || '',
      location: location || '',
      latitude: latitude || null,
      longitude: longitude || null,
      notes: notes || '',
      imageUrl: imageUrl || '',
      checkInType: checkInType || 'meeting',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('checkins').add(checkInData);

    res.json({
      success: true,
      id: docRef.id,
      message: 'Check-in recorded successfully',
      data: checkInData
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      error: 'Failed to create check-in',
      details: error.message
    });
  }
});

// Get all check-ins
app.get('/api/checkins', async (req, res) => {
  try {
    const { saleName, startDate, endDate, limit = 100 } = req.query;

    let query = db.collection('checkins');

    if (saleName) {
      query = query.where('saleName', '==', saleName);
    }

    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();
    const checkins = [];

    snapshot.forEach(doc => {
      checkins.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      count: checkins.length,
      data: checkins
    });
  } catch (error) {
    console.error('Fetch check-ins error:', error);
    res.status(500).json({
      error: 'Failed to fetch check-ins',
      details: error.message
    });
  }
});

// Get single check-in
app.get('/api/checkin/:id', async (req, res) => {
  try {
    const doc = await db.collection('checkins').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Fetch check-in error:', error);
    res.status(500).json({
      error: 'Failed to fetch check-in',
      details: error.message
    });
  }
});

// Delete check-in
app.delete('/api/checkin/:id', async (req, res) => {
  try {
    await db.collection('checkins').doc(req.params.id).delete();

    res.json({
      success: true,
      message: 'Check-in deleted successfully'
    });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({
      error: 'Failed to delete check-in',
      details: error.message
    });
  }
});

// Get sales list from Google Sheets
app.get('/api/sales-list', async (req, res) => {
  try {
    const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxoB-FQ6-Ldj_849_N1bgX6YMtfZk7T7Mapp8b2I5qtsnsQNy2T-Ffv-Py_vaILs4wCNzUOvO28WLt/pub?output=csv';

    // Fetch CSV data
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.split('\n');
    const salesList = [];

    // Skip header row, process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      const name = columns[0]?.trim();
      const lastPSGD = columns[1]?.trim();
      const daysWithoutPSGD = columns[2]?.trim();
      const type = columns[3]?.trim();

      if (name) {
        salesList.push({
          name,
          lastPSGD,
          daysWithoutPSGD: daysWithoutPSGD ? parseInt(daysWithoutPSGD) : null,
          type
        });
      }
    }

    res.json({
      success: true,
      data: salesList,
      count: salesList.length
    });
  } catch (error) {
    console.error('Sales list error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales list',
      details: error.message
    });
  }
});

// Employee login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên đăng nhập và mật khẩu'
      });
    }

    // Check admin login first
    const ADMIN_PASSWORD = 'NamAn2026!';
    if (username === 'admin' && password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        data: {
          name: 'Administrator',
          username: 'admin',
          role: 'admin'
        },
        message: 'Đăng nhập thành công'
      });
    }

    // Fetch accounts from Google Sheets
    const ACCOUNTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxoB-FQ6-Ldj_849_N1bgX6YMtfZk7T7Mapp8b2I5qtsnsQNy2T-Ffv-Py_vaILs4wCNzUOvO28WLt/pub?gid=1547413144&output=csv';

    const response = await fetch(ACCOUNTS_CSV_URL);
    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.split('\n');
    let userFound = null;

    // Skip header row, find matching user
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      const name = columns[0]?.trim();
      const accountUsername = columns[4]?.trim(); // Cột "Tài khoản"
      const accountPassword = columns[5]?.trim(); // Cột "Pass"

      if (accountUsername === username && accountPassword === password) {
        userFound = {
          name,
          username: accountUsername,
          role: 'employee'
        };
        break;
      }
    }

    if (userFound) {
      res.json({
        success: true,
        data: userFound,
        message: 'Đăng nhập thành công'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi đăng nhập',
      details: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const { saleName } = req.query;

    let query = db.collection('checkins');
    if (saleName) {
      query = query.where('saleName', '==', saleName);
    }

    const snapshot = await query.get();

    const stats = {
      totalCheckins: snapshot.size,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate() || new Date(data.createdAt);

      if (timestamp >= startOfDay) stats.today++;
      if (timestamp >= startOfWeek) stats.thisWeek++;
      if (timestamp >= startOfMonth) stats.thisMonth++;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
