// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAJ6E1RxgNOY8nnqbm-h7ljO02xDY5hnpg",
  authDomain: "naman-checkin.firebaseapp.com",
  projectId: "naman-checkin",
  storageBucket: "naman-checkin.firebasestorage.app",
  messagingSenderId: "344648391329",
  appId: "1:344648391329:web:3b84c2878faf2ed4c82ee0",
  measurementId: "G-HLP8SGH1HZ"
};

// API configuration
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://sales.namanrealty.vn'
  : 'http://localhost:8080';