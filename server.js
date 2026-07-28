const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server running on Port : ${PORT}`);
});