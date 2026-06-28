/**
 * resumePdfExport.js
 * Pure jsPDF native-text PDF export for all 6 resume templates.
 * Output is 100% text-based — fully ATS parseable, selectable, searchable.
 * No html2canvas, no rasterization, no images of text.
 */

import jsPDF from "jspdf";

/* ─── Hex → RGB ─── */
function hexRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/* ─── Date formatting (mirrors Builder's fmtDate) ─── */
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(month, year) {
  if (!year) return "";
  if (!month) return year;
  const idx = parseInt(month, 10) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS_SHORT[idx]} ${year}` : year;
}
function fmtRange(sm, sy, em, ey, current) {
  const s = fmtDate(sm, sy);
  const e = current ? "Present" : fmtDate(em, ey);
  if (!s && !e) return "";
  if (!e) return s;
  if (!s) return e;
  return `${s} \u2013 ${e}`;
}

/* ─── Font mapping: design.font → jsPDF built-in ─── */
function jsPdfFont(fontKey) {
  if (fontKey === "georgia" || fontKey === "merri") return "times";
  if (fontKey === "mono") return "courier";
  return "helvetica"; // inter, roboto, default
}

/* ═══════════════════════════════════════════════════════════════
   PDF DRAWING PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

class ResumeDoc {
  constructor(design) {
    this.pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.design  = design;
    this.font    = jsPdfFont(design.font);
    this.accent  = hexRgb(design.accent);
    this.fs      = design.fontSize;   // pt
    this.lh      = design.lineHeight; // multiplier

    // A4 dimensions
    this.PW = 210;
    this.PH = 297;

    // FIX: Better margin mapping from pixels to mm
    // Default 28px = ~10mm, scale proportionally
    const marginScale = design.pagePadding / 28;
    this.ML = Math.max(6, 10 * marginScale);  // min 6mm, scale from 10mm base
    this.MR = this.ML;
    this.MT = Math.max(6, 10 * marginScale);
    this.MB = 10; // bottom safe zone

    this.CW = this.PW - this.ML - this.MR;
    this.SS = Math.max(2, (design.sectionSpacing / 14) * 5); // scale section spacing

    this.y      = this.MT;
    this.page   = 1;
    this.col    = "full";
    this.colX   = this.ML;
    this.colW   = this.CW;

    // line height in mm for the base font size
    this.LH = (this.fs * 0.352778) * this.lh;
  }

  /* ── page management ── */
  newPage() {
    this.pdf.addPage();
    this.page++;
    this.y = this.MT;
  }

  checkPage(needed = 0) {
    if (this.y + needed > this.PH - this.MB) {
      this.newPage();
      return true;
    }
    return false;
  }

  /* ── typography ── */
  f(style, size) {
    this.pdf.setFont(this.font, style);
    this.pdf.setFontSize(size ?? this.fs);
  }

  color(r, g, b) { this.pdf.setTextColor(r, g, b); }
  fill(r, g, b)  { this.pdf.setFillColor(r, g, b); }
  draw(r, g, b)  { this.pdf.setDrawColor(r, g, b); }
  lw(w)          { this.pdf.setLineWidth(w); }

  accent_rgb() { return this.accent; }
  black()   { this.color(17, 17, 17); }
  gray()    { this.color(55, 65, 81); }
  muted()   { this.color(107, 114, 128); }
  light()   { this.color(156, 163, 175); }
  white()   { this.color(255, 255, 255); }
  accentC() { this.color(...this.accent); }

  /* ── text line height for a given pt size ── */
  lineH(pt) {
    return (pt * 0.352778) * this.lh;
  }

  /* ── write single line, return new y ── */
  text(str, x, y, opts = {}) {
    if (!str) return y;
    const { align = "left", maxW, color } = opts;
    if (color) this.color(...color);
    const lines = maxW
      ? this.pdf.splitTextToSize(String(str), maxW)
      : [String(str)];
    const opts2 = align !== "left" ? { align } : {};
    this.pdf.text(lines, x, y, opts2);
    return y + lines.length * this.lineH(this.pdf.getFontSize());
  }

  /* ── write wrapped text block, return final y ── */
  textBlock(str, x, y, maxW, opts = {}) {
    if (!str) return y;
    const { color } = opts;
    if (color) this.color(...color);
    const lines = this.pdf.splitTextToSize(String(str), maxW);
    const lh2 = this.lineH(this.pdf.getFontSize());
    lines.forEach(ln => {
      this.checkPage(lh2);
      this.pdf.text(ln, x, this.y === y ? y : this.y);
      this.y += lh2;
    });
    return this.y;
  }

  /* ── filled rectangle ── */
  rect(x, y, w, h, fillColor) {
    if (fillColor) this.fill(...fillColor);
    this.pdf.rect(x, y, w, h, "F");
  }

  /* ── outlined rectangle ── */
  rectStroke(x, y, w, h, strokeColor, fillColor, lw = 0.2) {
    this.lw(lw);
    if (strokeColor) this.draw(...strokeColor);
    if (fillColor) this.fill(...fillColor);
    else this.pdf.setFillColor(255, 255, 255);
    this.pdf.rect(x, y, w, h, fillColor ? "FD" : "D");
  }

  /* ── horizontal rule ── */
  hr(y, color = [229, 231, 235], lw = 0.3) {
    this.lw(lw);
    this.draw(...color);
    this.pdf.line(this.colX, y, this.colX + this.colW, y);
  }

  /* ── text width ── */
  tw(str) { return this.pdf.getTextWidth(String(str)); }

  /* ── right-aligned text at fixed x ── */
  textRight(str, rightEdge, y) {
    if (!str) return;
    const w = this.tw(str);
    this.pdf.text(String(str), rightEdge - w, y);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SECTION RENDERERS
   Each returns the final Y position after rendering.
   ═══════════════════════════════════════════════════════════════ */

/* ── Section Title variants ── */
function renderSectionTitle(doc, label, x, y, w, variant = "atlantic") {
  const [ar, ag, ab] = doc.accent;

  if (variant === "atlantic") {
    doc.f("bold", doc.fs + 0.5);
    doc.accentC();
    doc.pdf.text(label.toUpperCase(), x, y);
    y += 0.5;
    doc.lw(0.5);
    doc.draw(ar, ag, ab);
    doc.pdf.line(x, y, x + w, y);
    return y + 3;
  }

  if (variant === "mercury") {
    doc.f("bold", doc.fs + 1);
    doc.black();
    doc.pdf.text(label.toUpperCase(), x, y);
    y += 0.5;
    doc.lw(0.7);
    doc.draw(17, 17, 17);
    doc.pdf.line(x, y, x + w, y);
    return y + 3.5;
  }

  if (variant === "modern") {
    // Vertical accent bar + label
    doc.rect(x, y - 3.5, 1, 4.5, [ar, ag, ab]);
    doc.f("bold", doc.fs + 0.5);
    doc.black();
    doc.pdf.text(label.toUpperCase(), x + 3, y);
    return y + 4;
  }

  if (variant === "executive") {
    doc.f("bold", doc.fs + 0.5);
    doc.black();
    doc.pdf.text(label.toUpperCase(), x, y);
    y += 0.5;
    doc.lw(0.7);
    doc.draw(17, 17, 17);
    doc.pdf.line(x, y, x + w, y);
    return y + 3.5;
  }

  // classic / minimal / default
  doc.f("bold", doc.fs);
  doc.black();
  doc.pdf.text(label.toUpperCase(), x, y);
  y += 0.5;
  doc.lw(0.3);
  doc.draw(209, 213, 219);
  doc.pdf.line(x, y, x + w, y);
  return y + 3;
}

/* ── Experience ── */
function renderExperience(doc, experience, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;
  const gap = 3.5;

  experience.forEach((exp, ei) => {
    if (ei > 0) y += gap * 0.7;
    doc.checkPage(16);
    y = doc.y === doc.MT && ei === 0 ? y : doc.y || y;

    const dateStr = fmtRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current);

    // Role + date on same line
    doc.f("bold", doc.fs + 0.5);
    doc.black();
    const roleMaxW = w - doc.tw(dateStr) - 3;
    const roleLines = doc.pdf.splitTextToSize(exp.role || "", roleMaxW);
    doc.pdf.text(roleLines[0], x, y);

    doc.f("normal", doc.fs - 1);
    doc.light();
    doc.textRight(dateStr, x + w, y);

    y += doc.lineH(doc.fs + 0.5);
    if (roleLines.length > 1) {
      doc.f("bold", doc.fs + 0.5); doc.black();
      roleLines.slice(1).forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs + 0.5); });
    }

    // Company
    doc.f("bold", doc.fs - 0.5);
    doc.color(ar, ag, ab);
    const compStr = [exp.company, exp.location].filter(Boolean).join(" \u00B7 ");
    doc.pdf.text(compStr, x, y);
    y += doc.lineH(doc.fs - 0.5) + 1;

    // Bullets
    doc.f("normal", doc.fs - 0.5);
    doc.gray();
    exp.bullets?.filter(Boolean).forEach(b => {
      doc.checkPage(doc.lineH(doc.fs - 0.5) + 1);
      const lines = doc.pdf.splitTextToSize(b, w - 4);
      doc.pdf.text("\u2022", x, y);
      lines.forEach((ln, li) => {
        doc.pdf.text(ln, x + 3.5, y);
        y += doc.lineH(doc.fs - 0.5);
      });
    });

    doc.y = y;
  });

  return y;
}

/* ── Education ── */
function renderEducation(doc, education, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;

  education.forEach((edu, i) => {
    if (i > 0) y += 3;
    doc.checkPage(10);

    const dateStr = fmtRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false);
    doc.f("bold", doc.fs + 0.5);
    doc.black();
    const degW = w - doc.tw(dateStr) - 3;
    const degLines = doc.pdf.splitTextToSize(edu.degree || "", degW);
    doc.pdf.text(degLines[0], x, y);
    doc.f("normal", doc.fs - 1);
    doc.light();
    doc.textRight(dateStr, x + w, y);
    y += doc.lineH(doc.fs + 0.5);

    doc.f("bold", doc.fs - 0.5);
    doc.color(ar, ag, ab);
    const schoolStr = [edu.school, edu.location].filter(Boolean).join(" \u00B7 ");
    doc.pdf.text(schoolStr, x, y);
    y += doc.lineH(doc.fs - 0.5);

    if (edu.gpa) {
      doc.f("normal", doc.fs - 1);
      doc.muted();
      doc.pdf.text(`GPA: ${edu.gpa}`, x, y);
      y += doc.lineH(doc.fs - 1);
    }
    if (edu.highlights) {
      doc.f("normal", doc.fs - 0.5);
      doc.gray();
      const hl = doc.pdf.splitTextToSize(edu.highlights, w);
      hl.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); });
    }
    doc.y = y;
  });

  return y;
}

/* ── Projects ── */
function renderProjects(doc, projects, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;

  projects.forEach((proj, i) => {
    if (i > 0) y += 3;
    doc.checkPage(10);

    doc.f("bold", doc.fs + 0.5);
    doc.black();
    doc.pdf.text(proj.title || "", x, y);

    if (proj.subtitle) {
      doc.f("normal", doc.fs - 1);
      doc.light();
      const sw = doc.tw(proj.title || "") + 2.5;
      doc.pdf.text(proj.subtitle, x + sw, y);
    }
    y += doc.lineH(doc.fs + 0.5);

    if (proj.description) {
      doc.f("normal", doc.fs - 0.5);
      doc.gray();
      const dl = doc.pdf.splitTextToSize(proj.description, w);
      dl.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); });
    }

    if (proj.tech?.length) {
      doc.f("normal", doc.fs - 1.5);
      doc.color(ar, ag, ab);
      doc.pdf.text("Tech: " + proj.tech.join(" \u00B7 "), x, y);
      y += doc.lineH(doc.fs - 1.5) + 0.5;
    }

    doc.y = y;
  });

  return y;
}

/* ── Skills (grouped) ── */
function renderSkills(doc, skills, x, y, w, variant, compact = false) {
  const [ar, ag, ab] = doc.accent;
  const isInline = ["mercury", "classic", "minimal", "executive"].includes(variant);

  skills.forEach((group, gi) => {
    if (gi > 0) y += compact ? 2 : 3;
    doc.checkPage(8);

    if (isInline) {
      // "Category: item, item, item" on one line(s)
      doc.f("bold", doc.fs - 0.5);
      doc.black();
      const catLabel = group.category + ": ";
      const catW = doc.tw(catLabel);
      doc.pdf.text(catLabel, x, y);
      doc.f("normal", doc.fs - 0.5);
      doc.gray();
      const itemStr = group.items.map(i => i.val).join(", ");
      const itemLines = doc.pdf.splitTextToSize(itemStr, w - catW);
      doc.pdf.text(itemLines[0], x + catW, y);
      y += doc.lineH(doc.fs - 0.5);
      if (itemLines.length > 1) {
        itemLines.slice(1).forEach(ln => { doc.pdf.text(ln, x + catW, y); y += doc.lineH(doc.fs - 0.5); });
      }
    } else {
      // Category header + pills (written as comma-separated for ATS)
      doc.f("bold", doc.fs - 0.5);
      doc.gray();
      doc.pdf.text(group.category, x, y);
      y += doc.lineH(doc.fs - 0.5) + 0.5;
      doc.f("normal", doc.fs - 1.5);
      doc.color(ar, ag, ab);
      const itemStr = group.items.map(i => i.val).join("  \u00B7  ");
      const itemLines = doc.pdf.splitTextToSize(itemStr, w);
      itemLines.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 1.5); });
    }

    doc.y = y;
  });

  return y;
}

/* ── Certifications ── */
function renderCertifications(doc, certs, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;

  certs.forEach((c, i) => {
    if (i > 0) y += 2.5;
    doc.checkPage(8);

    doc.f("bold", doc.fs - 0.5);
    doc.black();
    doc.pdf.text(c.name || "", x, y);

    const dateStr = fmtDate(c.month, c.year);
    if (dateStr) { doc.f("normal", doc.fs - 1); doc.light(); doc.textRight(dateStr, x + w, y); }
    y += doc.lineH(doc.fs - 0.5);

    doc.f("normal", doc.fs - 1);
    doc.color(ar, ag, ab);
    doc.pdf.text(c.issuer || "", x, y);
    y += doc.lineH(doc.fs - 1);

    doc.y = y;
  });

  return y;
}

/* ── Languages ── */
function renderLanguages(doc, langs, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;

  if (["atlantic", "modern", "minimal"].includes(variant)) {
    // Two-column: language | proficiency
    langs.forEach((l, i) => {
      if (i > 0) y += 2;
      doc.f("bold", doc.fs - 0.5); doc.gray();
      doc.pdf.text(l.language || "", x, y);
      doc.f("normal", doc.fs - 1.5); doc.color(ar, ag, ab);
      doc.textRight(l.proficiency || "", x + w, y);
      y += doc.lineH(doc.fs - 0.5);
      doc.y = y;
    });
  } else {
    // Inline: "English (Native) · Spanish (Professional)"
    doc.f("normal", doc.fs - 0.5); doc.gray();
    const str = langs.map(l => `${l.language} (${l.proficiency})`).join("  \u00B7  ");
    const lines = doc.pdf.splitTextToSize(str, w);
    lines.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); });
    doc.y = y;
  }

  return y;
}

/* ── Volunteering ── */
function renderVolunteering(doc, vol, x, y, w, variant) {
  const [ar, ag, ab] = doc.accent;

  vol.forEach((v, i) => {
    if (i > 0) y += 3;
    doc.checkPage(10);

    const dateStr = fmtRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current);
    doc.f("bold", doc.fs + 0.5); doc.black();
    doc.pdf.text(v.role || "", x, y);
    doc.f("normal", doc.fs - 1); doc.light();
    doc.textRight(dateStr, x + w, y);
    y += doc.lineH(doc.fs + 0.5);

    doc.f("bold", doc.fs - 0.5); doc.color(ar, ag, ab);
    doc.pdf.text(v.organization || "", x, y);
    y += doc.lineH(doc.fs - 0.5);

    if (v.description) {
      doc.f("normal", doc.fs - 0.5); doc.gray();
      const dl = doc.pdf.splitTextToSize(v.description, w);
      dl.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); });
    }
    doc.y = y;
  });

  return y;
}

/* ── Custom/unknown section (plain text) ── */
function renderCustom(doc, content, x, y, w) {
  if (typeof content === "string" && content) {
    doc.f("normal", doc.fs - 0.5); doc.gray();
    const lines = doc.pdf.splitTextToSize(content, w);
    lines.forEach(ln => { doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); });
  }
  doc.y = y;
  return y;
}

/* ─────────────────────────────────────────────────────────────
   Unified section dispatcher
   ───────────────────────────────────────────────────────────── */
function renderSection(doc, sectionId, data, x, y, w, variant) {
  const { personal, summary, experience, education, projects, skills,
          certifications, languages, volunteering } = data;

  switch (sectionId) {
    case "summary":
      if (!summary) return y;
      doc.f("normal", doc.fs - 0.5); doc.gray();
      const sumLines = doc.pdf.splitTextToSize(summary, w);
      sumLines.forEach(ln => { doc.checkPage(doc.lineH(doc.fs - 0.5)); doc.pdf.text(ln, x, y); y += doc.lineH(doc.fs - 0.5); doc.y = y; });
      return y;

    case "experience":
      if (!experience?.length) return y;
      return renderExperience(doc, experience, x, y, w, variant);

    case "education":
      if (!education?.length) return y;
      return renderEducation(doc, education, x, y, w, variant);

    case "projects":
      if (!projects?.length) return y;
      return renderProjects(doc, projects, x, y, w, variant);

    case "skills":
      if (!skills?.length) return y;
      return renderSkills(doc, skills, x, y, w, variant);

    case "certifications":
      if (!certifications?.length) return y;
      return renderCertifications(doc, certifications, x, y, w, variant);

    case "languages":
      if (!languages?.length) return y;
      return renderLanguages(doc, languages, x, y, w, variant);

    case "volunteering":
      if (!volunteering?.length) return y;
      return renderVolunteering(doc, volunteering, x, y, w, variant);

    default:
      // custom section
      return renderCustom(doc, data[sectionId], x, y, w);
  }
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: ATLANTIC
   Colored header band, sidebar 34% | main 66%
   ═══════════════════════════════════════════════════════════════ */
function buildAtlantic(doc, data, sections, visible) {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const [ar, ag, ab] = doc.accent;
  const pad  = doc.ML;
  const PW   = doc.PW;
  const fs   = doc.fs;

  // ── Header band ──
  const headerH = 32;
  doc.rect(0, 0, PW, headerH, [ar, ag, ab]);

  let hx = pad;
  let hy = 9;

  // Name
  doc.f("bold", fs + 9);
  doc.white();
  doc.pdf.text(personal.name || "", hx, hy);
  hy += doc.lineH(fs + 9) + 0.5;

  // Title
  doc.f("normal", fs + 1);
  doc.pdf.setTextColor(255, 255, 255, 0.85);
  doc.color(220, 230, 255);
  doc.pdf.text(personal.title || "", hx, hy);
  hy += doc.lineH(fs + 1) + 1.5;

  // Contact line
  doc.f("normal", fs - 1);
  doc.color(200, 215, 255);
  const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.website].filter(Boolean);
  const contactStr = contactParts.join("   ");
  const contactLines = doc.pdf.splitTextToSize(contactStr, PW - pad * 2);
  contactLines.forEach(ln => { doc.pdf.text(ln, hx, hy); hy += doc.lineH(fs - 1); });

  // ── Two-column body ──
  const bodyY = headerH + 5;
  const sideW = doc.CW * 0.34;
  const mainW = doc.CW * 0.62;
  const sideX = pad;
  const mainX = pad + sideW + doc.CW * 0.04;

  const SIDEBAR_IDS = new Set(["summary", "skills", "certifications", "languages"]);
  const MAIN_IDS    = new Set(["experience", "education", "projects", "volunteering"]);

  const sidebarSections = sections.filter(s => s !== "personal" && visible.includes(s) && SIDEBAR_IDS.has(s));
  const mainSections    = sections.filter(s => s !== "personal" && visible.includes(s) && MAIN_IDS.has(s));

  let sideY = bodyY;
  let mainY = bodyY;

  // Render sidebar
  sidebarSections.forEach((s, i) => {
    if (i > 0) sideY += doc.SS;
    const label = s === "summary" ? "Profile" : s.charAt(0).toUpperCase() + s.slice(1);
    sideY = renderSectionTitle(doc, label, sideX, sideY, sideW, "atlantic");
    doc.y = sideY;

    switch (s) {
      case "summary":
        if (summary) {
          doc.f("normal", fs - 0.5); doc.gray();
          const lines = doc.pdf.splitTextToSize(summary, sideW);
          lines.forEach(ln => { doc.pdf.text(ln, sideX, sideY); sideY += doc.lineH(fs - 0.5); });
        }
        break;
      case "skills":
        sideY = renderSkills(doc, skills, sideX, sideY, sideW, "atlantic", true);
        break;
      case "certifications":
        sideY = renderCertifications(doc, certifications, sideX, sideY, sideW, "atlantic");
        break;
      case "languages":
        sideY = renderLanguages(doc, languages, sideX, sideY, sideW, "atlantic");
        break;
    }
    doc.y = sideY;
  });

  // Render main column
  mainSections.forEach((s, i) => {
    if (i > 0) mainY += doc.SS;
    const labels = { experience: "Work Experience", education: "Education", projects: "Projects", volunteering: "Volunteering" };
    const label = labels[s] || s;
    mainY = renderSectionTitle(doc, label, mainX, mainY, mainW, "atlantic");
    doc.y = mainY;

    switch (s) {
      case "experience":
        mainY = renderExperience(doc, experience, mainX, mainY, mainW, "atlantic");
        break;
      case "education":
        mainY = renderEducation(doc, education, mainX, mainY, mainW, "atlantic");
        break;
      case "projects":
        mainY = renderProjects(doc, projects, mainX, mainY, mainW, "atlantic");
        break;
      case "volunteering":
        mainY = renderVolunteering(doc, volunteering, mainX, mainY, mainW, "atlantic");
        break;
    }
    doc.y = mainY;
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: MERCURY
   Bold name underline, single full-width column
   ═══════════════════════════════════════════════════════════════ */
function buildMercury(doc, data, sections, visible) {
  const { personal } = data;
  const [ar, ag, ab] = doc.accent;
  const pad = doc.ML;
  const PW  = doc.PW;
  const fs  = doc.fs;
  const CW  = doc.CW;
  let y = doc.MT;

  // Name
  doc.f("bold", fs + 13);
  doc.black();
  doc.pdf.text(personal.name || "", pad, y);
  y += doc.lineH(fs + 13);

  // Title
  doc.f("normal", fs + 2);
  doc.color(ar, ag, ab);
  doc.pdf.text(personal.title || "", pad, y);
  y += doc.lineH(fs + 2) + 1;

  // Contact
  doc.f("normal", fs - 1);
  doc.muted();
  const parts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
  const contactStr = parts.join("   \u00B7   ");
  const cLines = doc.pdf.splitTextToSize(contactStr, CW);
  cLines.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 1); });
  y += 1;

  // Thick underline
  doc.lw(0.8); doc.draw(17, 17, 17);
  doc.pdf.line(pad, y, PW - pad, y);
  y += 5;

  // Sections
  const ordered = sections.filter(s => s !== "personal" && visible.includes(s));
  const labels = { summary: "Profile", experience: "Experience", education: "Education", projects: "Projects", skills: "Skills", certifications: "Certifications", languages: "Languages", volunteering: "Volunteering" };

  ordered.forEach((s, i) => {
    if (i > 0) y += doc.SS;
    doc.checkPage(16); y = doc.y || y;
    const label = labels[s] || s;
    y = renderSectionTitle(doc, label, pad, y, CW, "mercury");
    doc.y = y;

    switch (s) {
      case "summary":
        if (data.summary) { doc.f("normal", fs - 0.5); doc.gray(); const sl = doc.pdf.splitTextToSize(data.summary, CW); sl.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 0.5); }); doc.y = y; }
        break;
      case "experience":    y = renderExperience(doc, data.experience, pad, y, CW, "mercury"); break;
      case "education":     y = renderEducation(doc, data.education, pad, y, CW, "mercury"); break;
      case "projects":      y = renderProjects(doc, data.projects, pad, y, CW, "mercury"); break;
      case "skills":        y = renderSkills(doc, data.skills, pad, y, CW, "mercury"); break;
      case "certifications":y = renderCertifications(doc, data.certifications, pad, y, CW, "mercury"); break;
      case "languages":     y = renderLanguages(doc, data.languages, pad, y, CW, "mercury"); break;
      case "volunteering":  y = renderVolunteering(doc, data.volunteering, pad, y, CW, "mercury"); break;
      default: y = renderCustom(doc, data[s], pad, y, CW); break;
    }
    doc.y = y;
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: CLASSIC CLEAR
   Centered header, single column, ATS-safe
   ═══════════════════════════════════════════════════════════════ */
function buildClassic(doc, data, sections, visible) {
  const { personal } = data;
  const [ar, ag, ab] = doc.accent;
  const pad = doc.ML;
  const PW  = doc.PW;
  const CW  = doc.CW;
  const fs  = doc.fs;
  let y = doc.MT;

  // Name centered
  doc.f("bold", fs + 10);
  doc.black();
  doc.pdf.text((personal.name || "").toUpperCase(), PW / 2, y, { align: "center" });
  y += doc.lineH(fs + 10) + 0.5;

  // Title centered
  doc.f("normal", fs + 1);
  doc.color(ar, ag, ab);
  doc.pdf.text(personal.title || "", PW / 2, y, { align: "center" });
  y += doc.lineH(fs + 1) + 1;

  // Contact centered
  doc.f("normal", fs - 1);
  doc.muted();
  const parts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
  const contactStr = parts.join("   \u00B7   ");
  const cLines = doc.pdf.splitTextToSize(contactStr, CW);
  cLines.forEach(ln => { doc.pdf.text(ln, PW / 2, y, { align: "center" }); y += doc.lineH(fs - 1); });
  y += 1.5;

  // Double line separator
  doc.lw(0.6); doc.draw(55, 65, 81);
  doc.pdf.line(pad, y, PW - pad, y);
  y += 4;

  // Sections
  const ordered = sections.filter(s => s !== "personal" && visible.includes(s));
  const labels = { summary: "Summary", experience: "Experience", education: "Education", projects: "Projects", skills: "Skills", certifications: "Certifications", languages: "Languages", volunteering: "Volunteering" };

  ordered.forEach((s, i) => {
    if (i > 0) y += doc.SS;
    doc.checkPage(16);
    const label = labels[s] || s;
    y = renderSectionTitle(doc, label, pad, y, CW, "classic");
    doc.y = y;

    switch (s) {
      case "summary":
        if (data.summary) { doc.f("normal", fs - 0.5); doc.gray(); const sl = doc.pdf.splitTextToSize(data.summary, CW); sl.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 0.5); }); doc.y = y; }
        break;
      case "experience":    y = renderExperience(doc, data.experience, pad, y, CW, "classic"); break;
      case "education":     y = renderEducation(doc, data.education, pad, y, CW, "classic"); break;
      case "projects":      y = renderProjects(doc, data.projects, pad, y, CW, "classic"); break;
      case "skills":        y = renderSkills(doc, data.skills, pad, y, CW, "classic"); break;
      case "certifications":y = renderCertifications(doc, data.certifications, pad, y, CW, "classic"); break;
      case "languages":     y = renderLanguages(doc, data.languages, pad, y, CW, "classic"); break;
      case "volunteering":  y = renderVolunteering(doc, data.volunteering, pad, y, CW, "classic"); break;
      default: y = renderCustom(doc, data[s], pad, y, CW); break;
    }
    doc.y = y;
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: MINIMAL
   Left header, light weight name, inline underline titles
   ═══════════════════════════════════════════════════════════════ */
function buildMinimal(doc, data, sections, visible) {
  const { personal } = data;
  const [ar, ag, ab] = doc.accent;
  const pad = doc.ML;
  const PW  = doc.PW;
  const CW  = doc.CW;
  const fs  = doc.fs;
  let y = doc.MT;

  // Name (thin weight — simulate with normal)
  doc.f("normal", fs + 11);
  doc.black();
  doc.pdf.text(personal.name || "", pad, y);
  y += doc.lineH(fs + 11);

  // Title
  doc.f("normal", fs + 1.5);
  doc.color(ar, ag, ab);
  doc.pdf.text(personal.title || "", pad, y);
  y += doc.lineH(fs + 1.5) + 1.5;

  // Contact
  doc.f("normal", fs - 1);
  doc.muted();
  const parts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
  const cLines = doc.pdf.splitTextToSize(parts.join("   "), CW);
  cLines.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 1); });
  y += 2;

  // Thin accent line
  doc.lw(0.3); doc.draw(ar, ag, ab);
  doc.pdf.line(pad, y, PW - pad, y);
  y += 5;

  // Sections
  const ordered = sections.filter(s => s !== "personal" && visible.includes(s));
  const labels = { summary: "Profile", experience: "Experience", education: "Education", projects: "Projects", skills: "Skills", certifications: "Certifications", languages: "Languages", volunteering: "Volunteering" };

  ordered.forEach((s, i) => {
    if (i > 0) y += doc.SS;
    doc.checkPage(16);
    const label = labels[s] || s;
    y = renderSectionTitle(doc, label, pad, y, CW, "minimal");
    doc.y = y;

    switch (s) {
      case "summary":
        if (data.summary) { doc.f("normal", fs - 0.5); doc.gray(); const sl = doc.pdf.splitTextToSize(data.summary, CW); sl.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 0.5); }); doc.y = y; }
        break;
      case "experience":    y = renderExperience(doc, data.experience, pad, y, CW, "minimal"); break;
      case "education":     y = renderEducation(doc, data.education, pad, y, CW, "minimal"); break;
      case "projects":      y = renderProjects(doc, data.projects, pad, y, CW, "minimal"); break;
      case "skills":        y = renderSkills(doc, data.skills, pad, y, CW, "minimal"); break;
      case "certifications":y = renderCertifications(doc, data.certifications, pad, y, CW, "minimal"); break;
      case "languages":     y = renderLanguages(doc, data.languages, pad, y, CW, "minimal"); break;
      case "volunteering":  y = renderVolunteering(doc, data.volunteering, pad, y, CW, "minimal"); break;
      default: y = renderCustom(doc, data[s], pad, y, CW); break;
    }
    doc.y = y;
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: MODERN
   Gradient header (simulated solid), sidebar 35% | main 65%
   ═══════════════════════════════════════════════════════════════ */
function buildModern(doc, data, sections, visible) {
  const { personal } = data;
  const [ar, ag, ab] = doc.accent;
  const pad = doc.ML;
  const PW  = doc.PW;
  const CW  = doc.CW;
  const fs  = doc.fs;

  // Header
  const headerH = 28;
  doc.rect(0, 0, PW, headerH, [ar, ag, ab]);

  let hx = pad;
  let hy = 8;
  doc.f("bold", fs + 9); doc.white();
  doc.pdf.text(personal.name || "", hx, hy);
  hy += doc.lineH(fs + 9);

  doc.f("normal", fs + 1); doc.color(220, 230, 255);
  doc.pdf.text(personal.title || "", hx, hy);
  hy += doc.lineH(fs + 1) + 1;

  doc.f("normal", fs - 1); doc.color(200, 215, 255);
  const parts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
  const cLines = doc.pdf.splitTextToSize(parts.map((p, i) => (i === 0 ? "\u2709 " : "") + p).join("   "), PW - pad * 2);
  cLines.forEach(ln => { doc.pdf.text(ln, hx, hy); hy += doc.lineH(fs - 1); });

  // Two-column body
  const bodyY = headerH + 5;
  const sideW = CW * 0.34;
  const mainW = CW * 0.62;
  const sideX = pad;
  const mainX = pad + sideW + CW * 0.04;

  const LEFT_IDS  = new Set(["summary", "skills", "certifications", "languages"]);
  const RIGHT_IDS = new Set(["experience", "education", "projects", "volunteering"]);

  const leftSections  = sections.filter(s => s !== "personal" && visible.includes(s) && LEFT_IDS.has(s));
  const rightSections = sections.filter(s => s !== "personal" && visible.includes(s) && RIGHT_IDS.has(s));

  let sideY = bodyY;
  let mainY = bodyY;

  leftSections.forEach((s, i) => {
    if (i > 0) sideY += doc.SS;
    const labels = { summary: "Profile", skills: "Skills", certifications: "Certifications", languages: "Languages" };
    sideY = renderSectionTitle(doc, labels[s] || s, sideX, sideY, sideW, "modern");
    doc.y = sideY;

    switch (s) {
      case "summary":
        if (data.summary) { doc.f("normal", fs - 0.5); doc.gray(); const sl = doc.pdf.splitTextToSize(data.summary, sideW); sl.forEach(ln => { doc.pdf.text(ln, sideX, sideY); sideY += doc.lineH(fs - 0.5); }); doc.y = sideY; }
        break;
      case "skills":        sideY = renderSkills(doc, data.skills, sideX, sideY, sideW, "atlantic", true); break;
      case "certifications":sideY = renderCertifications(doc, data.certifications, sideX, sideY, sideW, "modern"); break;
      case "languages":     sideY = renderLanguages(doc, data.languages, sideX, sideY, sideW, "modern"); break;
    }
    doc.y = sideY;
  });

  rightSections.forEach((s, i) => {
    if (i > 0) mainY += doc.SS;
    const labels = { experience: "Experience", education: "Education", projects: "Projects", volunteering: "Volunteering" };
    mainY = renderSectionTitle(doc, labels[s] || s, mainX, mainY, mainW, "modern");
    doc.y = mainY;

    switch (s) {
      case "experience":   mainY = renderExperience(doc, data.experience, mainX, mainY, mainW, "modern"); break;
      case "education":    mainY = renderEducation(doc, data.education, mainX, mainY, mainW, "modern"); break;
      case "projects":     mainY = renderProjects(doc, data.projects, mainX, mainY, mainW, "modern"); break;
      case "volunteering": mainY = renderVolunteering(doc, data.volunteering, mainX, mainY, mainW, "modern"); break;
    }
    doc.y = mainY;
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE: EXECUTIVE
   Centered header, formal, subtle borders on experience
   ═══════════════════════════════════════════════════════════════ */
function buildExecutive(doc, data, sections, visible) {
  const { personal } = data;
  const [ar, ag, ab] = doc.accent;
  const pad = doc.ML;
  const PW  = doc.PW;
  const CW  = doc.CW;
  const fs  = doc.fs;
  let y = doc.MT;

  // Name centered — UPPERCASE
  doc.f("bold", fs + 11);
  doc.black();
  doc.pdf.text((personal.name || "").toUpperCase(), PW / 2, y, { align: "center" });
  y += doc.lineH(fs + 11) + 0.5;

  // Title centered
  doc.f("normal", fs + 1.5);
  doc.color(ar, ag, ab);
  doc.pdf.text(personal.title || "", PW / 2, y, { align: "center" });
  y += doc.lineH(fs + 1.5) + 1.5;

  // Contact centered
  doc.f("normal", fs - 1);
  doc.muted();
  const parts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
  doc.pdf.text(parts.join("   \u00B7   "), PW / 2, y, { align: "center" });
  y += doc.lineH(fs - 1) + 1;

  // Thin rule
  doc.lw(0.4); doc.draw(209, 213, 219);
  doc.pdf.line(pad, y, PW - pad, y);
  y += 5;

  // Sections
  const ordered = sections.filter(s => s !== "personal" && visible.includes(s));
  const labels = { summary: "Executive Summary", experience: "Professional Experience", education: "Education", projects: "Key Projects", skills: "Core Competencies", certifications: "Certifications", languages: "Languages", volunteering: "Board & Advisory Roles" };

  ordered.forEach((s, i) => {
    if (i > 0) y += doc.SS;
    doc.checkPage(16);
    const label = labels[s] || s;
    y = renderSectionTitle(doc, label, pad, y, CW, "executive");
    doc.y = y;

    switch (s) {
      case "summary":
        if (data.summary) { doc.f("normal", fs - 0.3); doc.gray(); const sl = doc.pdf.splitTextToSize(data.summary, CW); sl.forEach(ln => { doc.pdf.text(ln, pad, y); y += doc.lineH(fs - 0.3); }); doc.y = y; }
        break;
      case "experience":    y = renderExperience(doc, data.experience, pad, y, CW, "executive"); break;
      case "education":     y = renderEducation(doc, data.education, pad, y, CW, "executive"); break;
      case "projects":      y = renderProjects(doc, data.projects, pad, y, CW, "executive"); break;
      case "skills":        y = renderSkills(doc, data.skills, pad, y, CW, "executive"); break;
      case "certifications":y = renderCertifications(doc, data.certifications, pad, y, CW, "executive"); break;
      case "languages":     y = renderLanguages(doc, data.languages, pad, y, CW, "executive"); break;
      case "volunteering":  y = renderVolunteering(doc, data.volunteering, pad, y, CW, "executive"); break;
      default: y = renderCustom(doc, data[s], pad, y, CW); break;
    }
    doc.y = y;
  });
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT FUNCTION
   ═══════════════════════════════════════════════════════════════ */
export async function exportResumePdf(data, design, sections, visible) {
  const doc = new ResumeDoc(design);

  // Dispatch to the right template builder
  const template = design.template || "atlantic";
  switch (template) {
    case "mercury":   buildMercury(doc, data, sections, visible);  break;
    case "classic":   buildClassic(doc, data, sections, visible);  break;
    case "minimal":   buildMinimal(doc, data, sections, visible);  break;
    case "modern":    buildModern(doc, data, sections, visible);   break;
    case "executive": buildExecutive(doc, data, sections, visible); break;
    default:          buildAtlantic(doc, data, sections, visible); break;
  }

  // Save
  const safeName = (data.personal?.name || "Resume").replace(/\s+/g, "_");
  doc.pdf.save(`${safeName}_Resume.pdf`);
}