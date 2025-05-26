const express = require("express");
const app = express();
app.use(express.static("public"));

const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 3000;
const IP = "127.0.0.1";
server.listen(PORT, IP);
console.log("Server started on http://127.0.0.1:3512");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/" + "home.html");
});

app.get("/choose", (req, res) => {
  res.sendFile(__dirname + "/public/" + "choose.html");
});

app.get("/leaderboard", (req, res) => {
  res.sendFile(__dirname + "/public/" + "home.html");
});

app.get("/play", (req, res) => {
  res.sendFile(__dirname + "/public/" + "home.html");
});
