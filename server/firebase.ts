import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { env } from "./env";

console.log('Initializing Firebase in server context...');

// Firebase configuration for server-side
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  databaseURL: env.FIREBASE_DATABASE_URL,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID
};

// Log config (without sensitive values)
console.log('Server Firebase config:', {
  apiKey: env.FIREBASE_API_KEY ? '✓ Present' : '✗ Missing',
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  databaseURL: env.FIREBASE_DATABASE_URL,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: '✓ Present',
  appId: '✓ Present',
  measurementId: env.FIREBASE_MEASUREMENT_ID
});

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully in server');
  
  database = getDatabase(app);
  console.log('Firebase database initialized successfully in server');
} catch (error) {
  console.error('Error initializing Firebase in server:', error);
  throw error;
}

// Firebase Database Service for server-side operations
export const firebaseDB = {
  database,
  
  // Methods can be added here as needed
  isConnected() {
    return !!database;
  }
};

export default firebaseDB;
