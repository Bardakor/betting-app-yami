const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3005/api/bets';
const MAIN_SERVICE_URL = 'http://localhost:3001';
const WALLET_SERVICE_URL = 'http://localhost:3004';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!';

// Helper function to get auth token
async function getAuthToken() {
  try {
    // Create a test user if it doesn't exist
    try {
      await axios.post(`${MAIN_SERVICE_URL}/auth/register`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('Test user created');
    } catch (error) {
      console.log('User might already exist:', error.message);
    }

    // Login to get token
    const loginResponse = await axios.post(`${MAIN_SERVICE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    return loginResponse.data.token;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    throw error;
  }
}

// Test the bet placement API
async function testBetPlacement() {
  try {
    console.log('Starting bet placement test...');
    
    // Get auth token
    const token = await getAuthToken();
    console.log('Got auth token:', token);
    
    // Check user balance
    const balanceResponse = await axios.get(`${WALLET_SERVICE_URL}/api/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Current balance:', balanceResponse.data.balance);
    
    // Add funds if balance is low
    if (balanceResponse.data.balance < 100) {
      console.log('Adding funds to wallet...');
      
      const depositResponse = await axios.post(`${WALLET_SERVICE_URL}/api/wallet/deposit`, {
        amount: 1000,
        paymentMethod: 'test'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Deposit response:', depositResponse.data);
      
      // Check updated balance
      const updatedBalanceResponse = await axios.get(`${WALLET_SERVICE_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Updated balance:', updatedBalanceResponse.data.balance);
    }
    
    // Place a bet
    console.log('Placing bet...');
    
    // Try using the API gateway instead
    const betResponse = await axios.post('http://localhost:8000/api/bets', {
      fixtureId: '1351923', // Okzhetpes vs Kaisar
      betType: 'match_winner',
      selection: 'home',
      stake: 100,
      odds: 2.5
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Bet response:', betResponse.data);
    
    // Check final balance
    const finalBalanceResponse = await axios.get(`${WALLET_SERVICE_URL}/api/wallet/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Final balance:', finalBalanceResponse.data.balance);
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

testBetPlacement(); 