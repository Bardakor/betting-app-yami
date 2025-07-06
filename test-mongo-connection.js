const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/betting_wallet';
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Create a simple schema and model
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Insert a document
    const testDoc = new Test({ name: 'Test Document' });
    await testDoc.save();
    console.log('✅ Document saved successfully!');
    
    // Find the document
    const docs = await Test.find();
    console.log('✅ Found documents:', docs);
    
    // Clean up
    await Test.deleteMany({});
    console.log('✅ Documents cleaned up');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
  }
}

testConnection(); 