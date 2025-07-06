const axios = require('axios');

// Set default timeout for all axios requests
axios.defaults.timeout = 10000; // 10 seconds

// Configuration
const API_GATEWAY_URL = 'http://localhost:8000';
const MAIN_SERVICE_URL = 'http://localhost:3001';

// Function to get admin token
async function getAdminToken() {
  try {
    // Login as admin
    const response = await axios.post(`${MAIN_SERVICE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Failed to get admin token:', error.message);
    return null;
  }
}

// Function to add funds to a user
async function addFundsToUser(userId, amount, token) {
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/wallet/admin/add-funds`, {
      userId,
      amount,
      description: 'Test funds'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to add funds:', error.message);
    return null;
  }
}

// Function to place a bet
async function placeBet(token) {
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/bets`, {
      fixtureId: '1351923', // Okzhetpes vs Kaisar
      betType: 'match_winner',
      selection: 'home',
      stake: 50,
      odds: 2.5
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to place bet:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    return null;
  }
}

// Main function
async function testBetting() {
  try {
    // Get admin token
    console.log('Getting admin token...');
    const adminToken = await getAdminToken();
    if (!adminToken) {
      throw new Error('Failed to get admin token');
    }
    console.log('Admin token obtained');
    
    // Place a bet as admin
    console.log('Placing bet as admin...');
    const betResult = await placeBet(adminToken);
    console.log('Bet result:', betResult);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testBetting(); 