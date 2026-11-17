const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const JOBS = path.join(__dirname, "jobs.json");

if (!fs.existsSync(JOBS)) {
  console.error("jobs.json not found, run `npm start` first");
  process.exit(1);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
fs.copyFileSync(path.join(__dirname, "ui.html"), path.join(DIST, "index.html"));
fs.copyFileSync(JOBS, path.join(DIST, "jobs.json"));

console.log(`built ${path.relative(__dirname, DIST)}/`);
