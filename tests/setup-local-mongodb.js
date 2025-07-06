// MongoDB initialization script for local development (no authentication)
print('Starting MongoDB local development initialization...');

// Create databases for each service
const services = [
  'betting_main',
  'betting_bets',
  'betting_wallet',
  'betting_results'
];

services.forEach(dbName => {
  print(`Creating database: ${dbName}`);
  
  // Switch to the service database
  db = db.getSiblingDB(dbName);
  
  // Create a test collection to initialize the database
  db.createCollection('init');
  
  print(`✅ Database ${dbName} created successfully`);
});

print('MongoDB local development initialization completed successfully!'); 