// MongoDB initialization script for the betting platform
print('Starting MongoDB initialization...');

// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases and users for each service
const services = [
  { name: 'betting_main', user: 'main_user' },
  { name: 'betting_bets', user: 'bet_user' },
  { name: 'betting_wallet', user: 'wallet_user' },
  { name: 'betting_results', user: 'result_user' }
];

services.forEach(service => {
  print(`Creating database: ${service.name}`);
  
  // Switch to the service database
  db = db.getSiblingDB(service.name);
  
  // Create a user for this service
  db.createUser({
    user: service.user,
    pwd: 'service123',
    roles: [
      { role: 'readWrite', db: service.name },
      { role: 'dbAdmin', db: service.name }
    ]
  });
  
  // Create a test collection to initialize the database
  db.createCollection('init');
  
  print(`✅ Database ${service.name} created with user ${service.user}`);
});

print('MongoDB initialization completed successfully!'); 