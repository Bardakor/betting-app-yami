# MongoDB Setup for Local Development

This guide explains how to set up MongoDB for local development of the betting platform.

## Overview

The betting platform uses MongoDB for data storage. For local development, we've set up a MongoDB instance without authentication to simplify the development process.

## Setup Instructions

1. **Start MongoDB without authentication**

   Run the following command to start MongoDB without authentication:

   ```bash
   ./start-local-mongodb.sh
   ```

   This script will:
   - Stop and remove any existing MongoDB container named `betting-mongodb`
   - Start a new MongoDB container without authentication
   - Initialize the required databases

2. **Start the application**

   Run the following command to start all services:

   ```bash
   ./clean-and-dev.sh
   ```

## Database Structure

The application uses the following databases:

- `betting_main`: Main service database (users, authentication)
- `betting_wallet`: Wallet service database (transactions)
- `betting_bets`: Bet service database (bets)
- `betting_results`: Result service database (processed results)

## Testing

We've included several test scripts to verify the MongoDB setup:

1. **Test MongoDB Connection**

   ```bash
   node test-mongo-connection.js
   ```

2. **Test Wallet Deposit**

   ```bash
   node test-wallet-deposit.js
   ```

3. **Test Bet Placement**

   ```bash
   node test-bet-placement.js
   ```

## Troubleshooting

If you encounter any issues with MongoDB:

1. **Check MongoDB container status**

   ```bash
   docker ps | grep mongo
   ```

2. **Check MongoDB logs**

   ```bash
   docker logs betting-mongodb
   ```

3. **Reset MongoDB**

   ```bash
   ./start-local-mongodb.sh
   ```

4. **Verify MongoDB connection**

   ```bash
   node test-mongo-connection.js
   ```

## Notes

- The MongoDB container is configured to persist data between restarts
- No authentication is required for local development
- The MongoDB server is accessible at `mongodb://localhost:27017` 