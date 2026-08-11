const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

const {
  initializeSocket,
} = require("./socket/socket");

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();