import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
}

// Export environment variables for use in other files
export const env = {
  FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_URL: process.env.VITE_FIREBASE_DATABASE_URL,
  FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log loaded environment variables (without sensitive values)
console.log('Firebase environment variables loaded:', {
  API_KEY: env.FIREBASE_API_KEY ? '✓ Present' : '✗ Missing',
  AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN ? '✓ Present' : '✗ Missing',
  PROJECT_ID: env.FIREBASE_PROJECT_ID ? '✓ Present' : '✗ Missing',
  DATABASE_URL: env.FIREBASE_DATABASE_URL ? '✓ Present' : '✗ Missing',
  STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET ? '✓ Present' : '✗ Missing',
  MESSAGING_SENDER_ID: env.FIREBASE_MESSAGING_SENDER_ID ? '✓ Present' : '✗ Missing',
  APP_ID: env.FIREBASE_APP_ID ? '✓ Present' : '✗ Missing',
  MEASUREMENT_ID: env.FIREBASE_MEASUREMENT_ID ? '✓ Present' : '✗ Missing'
});
