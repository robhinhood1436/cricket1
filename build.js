// AJ Cricket Academy static site builder.
//
// The header/footer are shared across all pages (see partials/). Edit them
// (or a page's <main> in templates/) and regenerate the site with:
//
//   node build.js
//
// The generated *.html files in this folder are ready to deploy.

const fs = require("fs");
const path = require("path");

const PAGES = {
  "index.html": {
    title: "AJAY Cricket Academy | Home",
    description: "AJAY Cricket Academy — train with purpose, play with confidence.",
    bodyClass: ' class="home-page"',
    active: "HOME"
  },
  "academy.html": {
    title: "AJAY Cricket Academy | Academy",
    description: "Learn about AJAY Cricket Academy and our coaching philosophy.",
    bodyClass: "",
    active: "ACADEMY"
  },
  "programs.html": {
    title: "AJAY Cricket Academy | Programs",
    description: "Cricket coaching programs at AJAY Cricket Academy.",
    bodyClass: "",
    active: "PROGRAMS"
  },
  "coaches.html": {
    title: "AJAY Cricket Academy | Coaches",
    description: "Meet the coaching team at AJAY Cricket Academy.",
    bodyClass: "",
    active: "COACHES"
  },
  "gallery.html": {
    title: "AJAY Cricket Academy | Gallery",
    description: "Training moments at AJAY Cricket Academy.",
    bodyClass: "",
    active: "GALLERY"
  },
  "contact.html": {
    title: "AJAY Cricket Academy | Contact",
    description: "Contact AJAY Cricket Academy to enquire about training.",
    bodyClass: "",
    active: "CONTACT"
  }
};

const NAV_IDS = ["HOME", "ACADEMY", "PROGRAMS", "COACHES", "GALLERY", "CONTACT"];

const header = fs.readFileSync(path.join(__dirname, "partials", "header.html"), "utf8");
const footer = fs.readFileSync(path.join(__dirname, "partials", "footer.html"), "utf8");

for (const [file, config] of Object.entries(PAGES)) {
  let pageHeader = header
    .replace("{{TITLE}}", config.title)
    .replace("{{DESCRIPTION}}", config.description)
    .replace("{{BODY_CLASS}}", config.bodyClass);

  NAV_IDS.forEach((id) => {
    pageHeader = pageHeader.split(`{{ACTIVE_${id}}}`).join(id === config.active ? ' aria-current="page"' : "");
  });

  const template = fs.readFileSync(path.join(__dirname, "templates", file), "utf8");
  const page = template.replace("{{HEADER}}", pageHeader).replace("{{FOOTER}}", footer);
  fs.writeFileSync(path.join(__dirname, file), page);
  console.log(`built ${file}`);
}

console.log("Done.");