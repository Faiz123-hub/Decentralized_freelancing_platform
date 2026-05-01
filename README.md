# Decentralized Freelancing Platform

A full-stack MERN freelancing marketplace with Ethereum escrow payments.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Blockchain: Solidity + Hardhat + ethers

## Project Structure

```text
client/      React frontend
server/      Express API
contracts/   Solidity smart contracts and Hardhat config
```

## 1. Install dependencies

Open three terminals or run these one by one:

```bash
cd server
npm install
```

```bash
cd client
npm install
```

```bash
cd contracts
npm install
```

## 2. Configure environment variables

Copy each example file and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cp contracts/.env.example contracts/.env
```

Required values:

- `server/.env`
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
- `client/.env`
  - `VITE_API_URL`
  - `VITE_ESCROW_CONTRACT_ADDRESS`
- `contracts/.env`
  - `SEPOLIA_RPC_URL`
  - `PRIVATE_KEY`
  - `ETHERSCAN_API_KEY` (optional)

## 3. Start MongoDB

Use a local MongoDB instance or MongoDB Atlas, then place the connection string in `server/.env`.

## 4. Run the backend

```bash
cd server
npm run dev
```

API base URL defaults to `http://localhost:5000/api`.

## 5. Deploy the smart contract

Start a local chain or use Sepolia.

For a local Hardhat node:

```bash
cd contracts
npx hardhat node
```

In a second terminal, deploy the contract:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address into `client/.env` as `VITE_ESCROW_CONTRACT_ADDRESS`.

For Sepolia deployment:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

## 6. Run the frontend

```bash
cd client
npm run dev
```

The Vite app will start on `http://localhost:5173`.

## 7. Demo Flow

1. Register as a client and freelancer.
2. Client creates a job.
3. Freelancer browses jobs and applies.
4. Client hires a freelancer from the dashboard.
5. Client connects MetaMask and deposits escrow funds on-chain.
6. Freelancer marks the job complete.
7. Client releases the escrow payment on-chain.

## Notes

- Job and user data are stored in MongoDB.
- Escrow payments are managed by the smart contract.
- The UI is intentionally minimal, but all main flows are wired.

