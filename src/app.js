const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const fs = require("fs");

const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "/client")));
app.use(express.static(path.join(__dirname, "../public/img")));

console.log(__dirname);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/home.html"));
});

// Dynamic HTML routing
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "../public", `${page}.html`);

  // Check if file exists to avoid errors
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res
      .status(404)
      .sendFile(path.join(__dirname, "../public", `/client-error.html`));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
