const fs = require("fs");
const cheerio = require("cheerio");

const BASE_URL = "https://deftech.dou.ua/jobs/";
const XHR_URL = "https://deftech.dou.ua/jobs/xhr-load/?";
const date = new Date().toISOString();
const OUTPUT = `jobs-${date}.json`;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

function parseVacancy($, li) {
  const el = $(li);
  const titleLink = el.find("a.vt");
  const href = titleLink.attr("href") || "";
  return {
    title: clean(titleLink.text()),
    description: clean(el.find(".sh-info").text()),
    link: href.split("?")[0],
    location: clean(el.find("span.cities").text()),
    company: clean(el.find("a.company").text()),
    date: clean(el.find(".date").text()),
  };
}

function parseList(html) {
  const $ = cheerio.load(html);
  return $("li.l-vacancy")
    .toArray()
    .map((li) => parseVacancy($, li));
}

async function main() {
  const res = await fetch(BASE_URL, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`GET ${BASE_URL} failed: ${res.status}`);
  const html = await res.text();

  const cookie = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.startsWith("csrftoken="));
  const tokenMatch = html.match(/CSRF_TOKEN = "([^"]+)"/);
  if (!cookie || !tokenMatch) throw new Error("CSRF token not found");
  const csrfToken = tokenMatch[1];

  const $ = cheerio.load(html);
  const total = parseInt($("h1").first().text().replace(/\D/g, ""), 10) || "?";
  const initial = $("#vacancyListId li.l-vacancy")
    .toArray()
    .map((li) => parseVacancy($, li));

  const jobs = [...initial];
  let count = initial.length;
  console.log(`loaded ${count} / ${total}`);

  // Emulates clicking "Більше вакансій"
  while (true) {
    const r = await fetch(XHR_URL, {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Referer: BASE_URL,
        Cookie: cookie,
      },
      body: new URLSearchParams({ csrfmiddlewaretoken: csrfToken, count }),
    });
    if (!r.ok) throw new Error(`POST ${XHR_URL} failed: ${r.status}`);
    const d = await r.json();
    if (d.error || !d.num) break;

    jobs.push(...parseList(d.html));
    count += d.num;
    console.log(`loaded ${count} / ${total}`);
    if (d.last) break;
    await sleep(300);
  }

  const unique = [...new Map(jobs.map((j) => [j.link, j])).values()];
  fs.writeFileSync(OUTPUT, JSON.stringify(unique, null, 2), "utf8");
  console.log(`saved ${unique.length} jobs to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
