const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = process.env.PORT || 3000;

const routes = {
  "/": ["ui.html", "text/html; charset=utf-8"],
  "/jobs.json": ["jobs-2026-11-17T12:32:12.497Z.json", "application/json; charset=utf-8"],
};

http
  .createServer((req, res) => {
    const route = routes[req.url.split("?")[0]];
    if (!route) {
      res.writeHead(404).end("not found");
      return;
    }
    const [file, type] = route;
    const stream = fs.createReadStream(path.join(__dirname, file));
    stream.on("error", () => res.writeHead(500).end(`cannot read ${file}`));
    stream.on("open", () => {
      res.writeHead(200, { "Content-Type": type });
      stream.pipe(res);
    });
  })
  .listen(PORT, () => console.log(`http://localhost:${PORT}`));
