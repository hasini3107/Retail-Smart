const { db } = require('../config/firebase');

const Seller = {
  // Find seller by email in Firestore
  findByEmail: async (email) => {
    if (!db) throw new Error('Firestore not initialized');
    const snapshot = await db.collection('sellers').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // Find seller by ID in Firestore
  findById: async (id) => {
    if (!db) throw new Error('Firestore not initialized');
    const doc = await db.collection('sellers').doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    return {
      id: doc.id,
      business_name: data.business_name,
      email: data.email,
      created_at: data.created_at ? data.created_at.toDate() : null
    };
  },

  // Register a new seller (with pre-hashed password) in Firestore
  create: async (sellerData) => {
    if (!db) throw new Error('Firestore not initialized');
    const { business_name, email, password } = sellerData;
    
    const docRef = await db.collection('sellers').add({
      business_name,
      email,
      password,
      created_at: new Date()
    });
    
    return { id: docRef.id, business_name, email };
  }
};

module.exports = Seller;
