const http = require("http");
const url = require("url");
const fs = require("fs");
const pth = require("path");

const server = http.createServer((req, res) => {
  let parsedURL = url.parse(req.url, true);
  let path = parsedURL.path.replace(/^\/+|/ + $ / g, "");
  if (path == "") {
    path = "index.html";
  }
  console.log(path);

  let file = pth.resolve(path);
});
