"use strict";

var path = require("path");
var http = require("http");
var fs = require("fs");
const https = require("https");

const options = {
  key: fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem"),
};

var staticBasePath = process.argv[2];
var port = parseInt(process.argv[3]);

var staticServe = function (req, res) {
  var resolvedBase = path.resolve(staticBasePath);
  var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, "");
  var fileLoc = path.join(resolvedBase, safeSuffix);

  fs.readFile(fileLoc, function (err, data) {
    if (err) {
      res.writeHead(404, "Not Found");
      res.write("404: File Not Found!");
      return res.end();
    }

    res.statusCode = 200;

    res.write(data);
    return res.end();
  });
};

var httpServer = http.createServer(staticServe);

httpServer.listen(port + 10000, "0.0.0.0");

https.createServer(options, staticServe).listen(port, "0.0.0.0");

console.log(
  "HTTP: Listen on port: " + (port + 10000),
  "\nServe files under directory: " + staticBasePath
);
console.log(
  "HTTPS: Listen on port: " + port,
  "\nServe files under directory: " + staticBasePath
);
