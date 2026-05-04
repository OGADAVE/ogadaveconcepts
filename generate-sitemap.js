const fs = require("fs");

const siteUrl = "https://ogadaveconcepts.com.ng";

// 👉 Add all your pages here
const pages = [
  "/",
  "/index.html",
  "/cryptopreneur.html",
  "/techpreneur.html",
  "/real-estate.html",
  "/blog-detail.html",
  "/airdrop.html"
];

const today = new Date().toISOString().split("T")[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(page => {
    return `
  <url>
    <loc>${siteUrl + page}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
  })
  .join("")}
</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap);

console.log("✅ sitemap.xml generated successfully!");