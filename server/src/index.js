import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 5000;

const listen = () =>
  new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      resolve(server);
    });

    server.on("error", reject);
  });

const startServer = async () => {
  await connectDB();
  await listen();
};

startServer().catch((error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Failed to start server: port ${PORT} is already in use`);
  } else {
  console.error("Failed to start server", error);
  }
  process.exit(1);
});
