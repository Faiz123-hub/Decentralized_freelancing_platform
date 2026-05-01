# Escrow Testing Guide

## 1. Start the local blockchain

From `contracts/`:

```bash
npm install
npx hardhat node
```

## 2. Deploy the escrow contract locally

In another terminal from `contracts/`:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address from the terminal output.

## 3. Configure environment variables

Update `server/.env`:

```env
PORT=5002
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
ESCROW_CONTRACT_ADDRESS=0xYourDeployedEscrowContractAddress
```

Update `client/.env`:

```env
VITE_API_URL=http://localhost:5002/api
VITE_ESCROW_CONTRACT_ADDRESS=0xYourDeployedEscrowContractAddress
VITE_CHAIN_ID=31337
```

## 4. Install app dependencies

From `server/`:

```bash
npm install
```

From `client/`:

```bash
npm install
```

## 5. Run the app

Start the backend from `server/`:

```bash
npm start
```

Start the frontend from `client/`:

```bash
npm run dev
```

## 6. Import Hardhat accounts into MetaMask

Use any funded private key printed by `hardhat node`.

Suggested setup:

- Account 1: client
- Account 2: freelancer

Register the client and freelancer in the app using those wallet addresses.

## 7. Test the full escrow flow

1. Log in as the client and post a job.
2. Log in as the freelancer and apply to the job.
3. Log back in as the client and hire the freelancer.
4. In the client dashboard, click `Create Escrow`.
5. Click `Fund Escrow` and approve the MetaMask transaction.
6. Log in as the freelancer and open the freelancer dashboard.
7. Click `Mark Complete` and approve the MetaMask transaction.
8. Log back in as the client and click `Release Payment`.
9. Verify the job now shows `paid` in Mongo-backed UI and `Released` in escrow status.

## 8. API endpoints added

- `PATCH /api/jobs/:id/escrow/link`
- `PATCH /api/jobs/:id/escrow/fund`
- `PATCH /api/jobs/:id/escrow/complete`
- `PATCH /api/jobs/:id/escrow/release`
- `GET /api/jobs/:id/escrow-status`
