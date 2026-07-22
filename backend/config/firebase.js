const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db = null;
let bucket = null;

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || path.join(__dirname, 'firebase-service-account.json');
const projectId = process.env.FIREBASE_PROJECT_ID || 'retail-smart-628eb';
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

try {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: storageBucket
      });
      console.log(`✔ Firebase Admin SDK connected via Environment Variables [Project: ${projectId}].`);
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: storageBucket
      });
      console.log(`✔ Firebase Admin SDK connected via serviceAccountKey.json [Project: ${projectId}].`);
    } else {
      console.log(`ℹ Initializing Firebase Admin SDK for Project ID: [${projectId}]`);
      initializeApp({
        projectId: projectId,
        storageBucket: storageBucket
      });
    }
  }

  db = getFirestore();
  bucket = getStorage().bucket();
} catch (error) {
  console.error('✖ Firebase Admin SDK initialization error:', error.message);
  db = null;
  bucket = null;
}

module.exports = { db, bucket };
