require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const Route = require("./routes/routes");
const connectToDb = require("./config/db");
// const authenticateToken = require("./middlewares/auth");
const port = process.env.PORT;
const Uri = process.env.MONGO_URI;
const server = http.createServer(app);
const setupSocket = require("./socket");

connectToDb(Uri);
app.use(cors());
app.use(express.json());
// app.use(authenticateToken);
app.use("/api", Route);

app.get("/", (req, res) => {
  res.send("Api is running....");
});

setupSocket(server);

server.listen(`${port}`, () => {
  console.log(`Server started at port ${port}`);
});
