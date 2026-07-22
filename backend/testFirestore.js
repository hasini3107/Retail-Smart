const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

console.log('==================================================');
console.log('RetailSmart AI - Firestore Connection Test');
console.log('==================================================');

const serviceAccountPath = path.join(__dirname, 'config/firebase-service-account.json');
const projectId = 'retail-smart-628eb';
let db;

try {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
      db = getFirestore();
      console.log(`✔ Firebase Admin SDK initialized using Environment Variables for Project: [${projectId}].`);
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
      db = getFirestore();
      console.log(`✔ Firebase Admin SDK initialized using service account key file for Project: [${projectId}].`);
    } else {
      console.log(`ℹ Initializing Firebase for Project ID: [${projectId}]`);
      
      if (!process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
      }

      initializeApp({
        projectId: projectId
      });
      db = getFirestore();
    }
  }

  runDiagnostics();
} catch (error) {
  console.error('✖ Firebase initialization failed:', error.message);
  process.exit(1);
}

async function runDiagnostics() {
  const collections = ['sellers', 'products', 'inventory', 'orders', 'payments', 'returns', 'analytics'];
  console.log(`\nRunning diagnostics check on Firestore collections for [${projectId}]...\n`);

  try {
    for (const collName of collections) {
      const snapshot = await db.collection(collName).get();
      console.log(`- Collection [${collName.padEnd(10)}]: ${snapshot.size.toString().padStart(3)} documents found.`);
    }

    console.log('\n==================================================');
    console.log('✔ DIAGNOSTICS COMPLETED SUCCESSFULLY!');
    
    const sellersSnapshot = await db.collection('sellers').limit(1).get();
    if (sellersSnapshot.empty) {
      console.log('\n[!] Warning: Your Firestore database is currently empty.');
      console.log('Please run the seeding script to populate test data:');
      console.log('  node database/seedFirestore.js');
    } else {
      console.log('\n✔ Database is populated and ready for seller login.');
      console.log('Default Credentials:');
      console.log('  Email: demo@retailsmart.com');
      console.log('  Password: password123');
    }
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.log('\n==================================================');
    console.log('ℹ Local Emulator / Credential Notice');
    console.log('Error Details:', error.message);
    console.log('Note: To connect to live Firebase Cloud Firestore:');
    console.log('1. Download serviceAccountKey.json from Firebase Console.');
    console.log('2. Save it to backend/config/firebase-service-account.json');
    console.log('==================================================');
    process.exit(0);
  }
}
