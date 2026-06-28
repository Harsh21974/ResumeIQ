import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  User, Briefcase, GraduationCap, Code, FolderGit2, FileText,
  Globe, Phone, Mail, MapPin, Award, Languages, Heart,
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Download, Upload, Eye, EyeOff, Settings2,
  ChevronRight, X, Check, Loader2, Palette,
  AlignLeft, ZoomIn, ZoomOut, Undo2, Redo2,
  Save, Monitor, Smartphone, RotateCcw
} from "lucide-react";

/* NOTE: PDF export uses browser print-to-PDF via @media print injection.
   This preserves real DOM text nodes — output is fully ATS-parseable.          */

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

// A4 at 96 dpi = 794 × 1123 px — the single source of truth for page size
const A4_W = 794;
const A4_H = 1123;

const SECTION_DEFS = {
  personal:      { label: "Personal details",      icon: User },
  summary:       { label: "Professional summary",   icon: FileText },
  experience:    { label: "Work experience",        icon: Briefcase },
  education:     { label: "Education",              icon: GraduationCap },
  projects:      { label: "Projects",               icon: FolderGit2 },
  skills:        { label: "Skills",                 icon: Code },
  certifications:{ label: "Certifications",         icon: Award },
  languages:     { label: "Languages",              icon: Languages },
  volunteering:  { label: "Volunteering",           icon: Heart },
};

const DEFAULT_DATA = {
  personal: {
    name: "Alex Rivera",
    title: "Senior Software Engineer",
    email: "alex.rivera@email.com",
    phone: "+1 (415) 555-0182",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexrivera",
    github: "github.com/alexrivera",
    website: "",
    photo: null,
  },
  summary: "Full-stack engineer with 6 years of experience building scalable web applications. Led teams across three product launches, reduced API latency by 40%, and mentored 8 junior engineers. Comfortable owning systems end-to-end.",
  experience: [
    {
      id: 1,
      role: "Senior Software Engineer",
      company: "Stripe",
      location: "San Francisco, CA",
      startMonth: "01", startYear: "2022",
      endMonth: "", endYear: "",
      current: true,
      bullets: [
        "Led redesign of payment retry logic, reducing failed transactions by 23% across 12K merchants",
        "Built internal tooling adopted by 40+ engineers, cutting deployment time from 25 min to 8 min",
        "Mentored 3 engineers; two received promotions within 18 months",
      ],
    },
    {
      id: 2,
      role: "Software Engineer",
      company: "Figma",
      location: "San Francisco, CA",
      startMonth: "03", startYear: "2019",
      endMonth: "12", endYear: "2021",
      current: false,
      bullets: [
        "Owned real-time collaboration engine serving 2M+ daily active users",
        "Reduced initial load time by 35% via progressive asset loading and caching strategy",
      ],
    },
  ],
  education: [
    {
      id: 1,
      degree: "B.S. Computer Science",
      school: "UC Berkeley",
      location: "Berkeley, CA",
      startMonth: "08", startYear: "2015",
      endMonth: "05", endYear: "2019",
      gpa: "3.8",
      highlights: "",
    },
  ],
  projects: [
    {
      id: 1,
      title: "OpenReview",
      subtitle: "GitHub · 1.2k stars",
      description: "Open-source code review tool built on AST diffing. Supports 12 languages, integrates with GitHub Actions.",
      tech: ["TypeScript", "Go", "PostgreSQL"],
    },
    {
      id: 2,
      title: "Latency.dev",
      subtitle: "Side project",
      description: "Real-time API latency monitoring dashboard with alerting. Processes 50M data points per day.",
      tech: ["React", "Rust", "ClickHouse"],
    },
  ],
  skills: [
    { id: 1, category: "Languages", items: [{ id: "s1", val: "TypeScript" }, { id: "s2", val: "Python" }, { id: "s3", val: "Go" }, { id: "s4", val: "Rust" }, { id: "s5", val: "SQL" }] },
    { id: 2, category: "Frameworks", items: [{ id: "s6", val: "React" }, { id: "s7", val: "Next.js" }, { id: "s8", val: "Node.js" }, { id: "s9", val: "FastAPI" }] },
    { id: 3, category: "Infrastructure", items: [{ id: "s10", val: "AWS" }, { id: "s11", val: "Kubernetes" }, { id: "s12", val: "Terraform" }, { id: "s13", val: "PostgreSQL" }] },
  ],
  certifications: [
    { id: 1, name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", month: "06", year: "2023", expMonth: "", expYear: "", noExpiry: true },
  ],
  languages: [
    { id: 1, language: "English", proficiency: "Native" },
    { id: 2, language: "Spanish", proficiency: "Professional" },
  ],
  volunteering: [],
};

const DEFAULT_DESIGN = {
  template: "atlantic",
  accent: "#2563eb",
  font: "inter",
  fontSize: 9,
  lineHeight: 1.4,
  pagePadding: 28,
  sectionSpacing: 14,
  showPhoto: true,
};

const DEFAULT_SECTIONS = ["personal","summary","experience","education","projects","skills","certifications","languages","volunteering"];
const DEFAULT_VISIBLE  = ["personal","summary","experience","education","projects","skills"];

const FONTS = {
  inter:   { label: "Inter",        stack: "Inter, system-ui, sans-serif" },
  georgia: { label: "Georgia",      stack: "Georgia, 'Times New Roman', serif" },
  roboto:  { label: "Roboto",       stack: "Roboto, Arial, sans-serif" },
  merri:   { label: "Merriweather", stack: "Merriweather, Georgia, serif" },
  mono:    { label: "Mono",         stack: "'JetBrains Mono', 'Courier New', monospace" },
};

const ACCENTS = ["#2563eb","#0891b2","#16a34a","#9333ea","#dc2626","#ea580c","#000000","#374151"];

const MONTHS = [
  { v: "01", l: "Jan" }, { v: "02", l: "Feb" }, { v: "03", l: "Mar" },
  { v: "04", l: "Apr" }, { v: "05", l: "May" }, { v: "06", l: "Jun" },
  { v: "07", l: "Jul" }, { v: "08", l: "Aug" }, { v: "09", l: "Sep" },
  { v: "10", l: "Oct" }, { v: "11", l: "Nov" }, { v: "12", l: "Dec" },
];

const PROFICIENCY_LEVELS = ["Native", "Fluent", "Professional", "Conversational", "Elementary"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

/* ─── helpers ─── */
const uid = () => Math.random().toString(36).slice(2, 9);

const fmtDate = (month, year) => {
  if (!year) return "";
  if (!month) return year;
  const m = MONTHS.find(x => x.v === month);
  return m ? `${m.l} ${year}` : year;
};

const formatDateRange = (startMonth, startYear, endMonth, endYear, current) => {
  const start = fmtDate(startMonth, startYear);
  const end   = current ? "Present" : fmtDate(endMonth, endYear);
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} – ${end}`;
};

/* ═══════════════════════════════════════════════════════════════
   UNDO / REDO HOOK
   ═══════════════════════════════════════════════════════════════ */
function useHistory(initial) {
  const idxRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const stack = useRef([initial]);

  const state = stack.current[idx];

  const push = useCallback((next) => {
    const cur = idxRef.current;
    stack.current = stack.current.slice(0, cur + 1);
    stack.current.push(next);
    if (stack.current.length > 60) {
      stack.current = stack.current.slice(stack.current.length - 60);
    }
    const newIdx = stack.current.length - 1;
    idxRef.current = newIdx;
    setIdx(newIdx);
  }, []);

  const undo = useCallback(() => {
    setIdx(i => {
      const next = Math.max(0, i - 1);
      idxRef.current = next;
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    setIdx(i => {
      const next = Math.min(stack.current.length - 1, i + 1);
      idxRef.current = next;
      return next;
    });
  }, []);

  const canUndo = idx > 0;
  const canRedo = idx < stack.current.length - 1;

  return { state, push, undo, redo, canUndo, canRedo };
}

/* ═══════════════════════════════════════════════════════════════
   AUTO-SAVE HOOK
   ═══════════════════════════════════════════════════════════════ */
const LS_KEY = "resume_builder_v2";

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function useSaveState(data, design, sections, visible) {
  const [saveStatus, setSaveStatus] = useState("saved");
  const timerRef = useRef(null);

  useEffect(() => {
    setSaveStatus("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ data, design, sections, visible }));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [data, design, sections, visible]);

  return saveStatus;
}

/* ═══════════════════════════════════════════════════════════════
   DATE PICKER COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const DatePicker = ({ month, year, onChange, placeholder = "Month / Year", allowEmpty = true }) => {
  const selStyle = {
    padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb",
    fontSize: 12, color: "#111", outline: "none", background: "#fff",
    cursor: "pointer", appearance: "none", WebkitAppearance: "none",
  };
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select value={month || ""} onChange={e => onChange(e.target.value, year || "")} style={{ ...selStyle, flex: 1 }}>
        {allowEmpty && <option value="">Month</option>}
        {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
      </select>
      <select value={year || ""} onChange={e => onChange(month || "", e.target.value)} style={{ ...selStyle, flex: 1 }}>
        {allowEmpty && <option value="">Year</option>}
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   RESUME TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

/* shared section-title factory per template */
const makeSectionTitle = (accent, fs, variant = "atlantic") => {
  if (variant === "atlantic") return ({ children }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        fontSize: fs + 1, fontWeight: 700, color: accent, textTransform: "uppercase",
        letterSpacing: "0.08em", paddingBottom: 3, borderBottom: `1.5px solid ${accent}`,
      }}>{children}</div>
    </div>
  );
  if (variant === "mercury") return ({ children }) => (
    <div style={{
      fontSize: fs + 1.5, fontWeight: 800, color: "#111", textTransform: "uppercase",
      letterSpacing: "0.1em", marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #111",
    }}>{children}</div>
  );
  return ({ children }) => (
    <div style={{
      fontSize: fs + 0.5, fontWeight: 700, color: "#111", textTransform: "uppercase",
      letterSpacing: "0.06em", borderBottom: "1px solid #d1d5db", paddingBottom: 3, marginBottom: 7,
    }}>{children}</div>
  );
};

/* ── ATLANTIC ── */
const AtlanticTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;
  const SectionTitle = makeSectionTitle(accent, fs, "atlantic");

  const vis = (s) => visible.includes(s);

  const SIDEBAR_SET = new Set(["summary", "skills", "certifications", "languages"]);
  const MAIN_SET    = new Set(["experience", "education", "projects", "volunteering"]);
  const sidebarSections = sections.filter(s => vis(s) && SIDEBAR_SET.has(s));
  const mainSections    = sections.filter(s => vis(s) && MAIN_SET.has(s));

  return (
    <div id="resume-canvas" style={{
      width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh,
    }}>
      <div style={{ background: accent, padding: `${pad * 0.9}px ${pad}px`, display: "flex", alignItems: "center", gap: 16 }}>
        {design.showPhoto && personal.photo && (
          <img src={personal.photo} alt="" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fs + 10, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{personal.name}</div>
          <div style={{ fontSize: fs + 1, color: "rgba(255,255,255,0.85)", fontWeight: 500, marginTop: 3 }}>{personal.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 7, fontSize: fs - 0.5, color: "rgba(255,255,255,0.8)" }}>
            {personal.email    && <span>{personal.email}</span>}
            {personal.phone    && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && <span>{personal.linkedin}</span>}
            {personal.github   && <span>{personal.github}</span>}
            {personal.website  && <span>{personal.website}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, padding: `${pad * 0.85}px ${pad}px`, gap: pad * 0.9 }}>
        <div style={{ width: "34%", flexShrink: 0, display: "flex", flexDirection: "column", gap: ss }}>
          {sidebarSections.map(s => (
            <div key={s}>
              {s === "summary" && summary && (
                <><SectionTitle>Profile</SectionTitle>
                <p style={{ margin: 0, color: "#374151", fontSize: fs - 0.5 }}>{summary}</p></>
              )}
              {s === "skills" && skills.length > 0 && (
                <><SectionTitle>Skills</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {skills.map(group => (
                    <div key={group.id}>
                      <div style={{ fontWeight: 600, fontSize: fs - 0.5, color: "#374151", marginBottom: 3 }}>{group.category}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {group.items.map(item => (
                          <span key={item.id} style={{ fontSize: fs - 1.5, padding: "2px 7px", background: `${accent}14`, color: accent, borderRadius: 3, fontWeight: 500 }}>{item.val}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div></>
              )}
              {s === "certifications" && certifications.length > 0 && (
                <><SectionTitle>Certifications</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {certifications.map(c => (
                    <div key={c.id}>
                      <div style={{ fontWeight: 600, fontSize: fs - 0.5, color: "#111" }}>{c.name}</div>
                      <div style={{ fontSize: fs - 1, color: accent }}>{c.issuer}</div>
                      {(c.month || c.year) && <div style={{ fontSize: fs - 1.5, color: "#9ca3af" }}>{fmtDate(c.month, c.year)}{!c.noExpiry && (c.expMonth || c.expYear) ? ` – ${fmtDate(c.expMonth, c.expYear)}` : ""}</div>}
                    </div>
                  ))}
                </div></>
              )}
              {s === "languages" && languages.length > 0 && (
                <><SectionTitle>Languages</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {languages.map(l => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: fs - 0.5, color: "#374151", fontWeight: 500 }}>{l.language}</span>
                      <span style={{ fontSize: fs - 1.5, padding: "1px 6px", background: `${accent}14`, color: accent, borderRadius: 3 }}>{l.proficiency}</span>
                    </div>
                  ))}
                </div></>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: ss }}>
          {mainSections.map(s => (
            <div key={s}>
              {s === "experience" && experience.length > 0 && (
                <><SectionTitle>Work experience</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: fs + 0.5, color: "#111" }}>{exp.role}</span>
                        <span style={{ fontSize: fs - 1, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>
                          {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                        </span>
                      </div>
                      <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                      <ul style={{ margin: 0, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                        {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151" }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></>
              )}
              {s === "education" && education.length > 0 && (
                <><SectionTitle>Education</SectionTitle>
                {education.map(edu => (
                  <div key={edu.id} style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, color: "#111", fontSize: fs + 0.5 }}>{edu.degree}</span>
                      <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}</span>
                    </div>
                    <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600 }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>
                    {edu.gpa && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>GPA: {edu.gpa}</div>}
                    {edu.highlights && <div style={{ fontSize: fs - 0.5, color: "#374151", marginTop: 2 }}>{edu.highlights}</div>}
                  </div>
                ))}</>
              )}
              {s === "projects" && projects.length > 0 && (
                <><SectionTitle>Projects</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {projects.map(proj => (
                    <div key={proj.id}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#111", fontSize: fs + 0.5 }}>{proj.title}</span>
                        {proj.subtitle && <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{proj.subtitle}</span>}
                      </div>
                      <p style={{ margin: "2px 0 4px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                      {proj.tech?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {proj.tech.map((t, i) => <span key={i} style={{ fontSize: fs - 1.5, padding: "1px 6px", background: "#f3f4f6", color: "#374151", borderRadius: 3 }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div></>
              )}
              {s === "volunteering" && volunteering.length > 0 && (
                <><SectionTitle>Volunteering</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {volunteering.map(v => (
                    <div key={v.id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: "#111", fontSize: fs + 0.5 }}>{v.role}</span>
                        <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                      </div>
                      <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600 }}>{v.organization}</div>
                      {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                    </div>
                  ))}
                </div></>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── MERCURY ── */
const MercuryTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;
  const SectionTitle = makeSectionTitle(accent, fs, "mercury");
  const vis = (s) => visible.includes(s);

  const ordered = sections.filter(s => s !== "personal" && vis(s));

  return (
    <div id="resume-canvas" style={{ width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh, padding: `${pad}px` }}>
      <div style={{ marginBottom: pad * 0.8, borderBottom: "3px solid #111", paddingBottom: pad * 0.6 }}>
        <div style={{ fontSize: fs + 14, fontWeight: 900, color: "#111", letterSpacing: "-0.03em", lineHeight: 1 }}>{personal.name}</div>
        <div style={{ fontSize: fs + 2, color: accent, fontWeight: 600, marginTop: 5 }}>{personal.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", marginTop: 7, fontSize: fs - 1, color: "#6b7280" }}>
          {personal.email    && <span>{personal.email}</span>}
          {personal.phone    && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.github   && <span>{personal.github}</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ss }}>
        {ordered.map(s => (
          <div key={s}>
            {s === "summary" && summary && (
              <div><SectionTitle>Profile</SectionTitle><p style={{ margin: 0, color: "#374151" }}>{summary}</p></div>
            )}
            {s === "experience" && experience.length > 0 && (
              <div><SectionTitle>Experience</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: fs + 1, color: "#111" }}>{exp.role}</span>
                        <span style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600, marginLeft: 8 }}>{exp.company}</span>
                      </div>
                      <span style={{ fontSize: fs - 1, color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
                        {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                      </span>
                    </div>
                    {exp.location && <div style={{ fontSize: fs - 1, color: "#9ca3af", marginBottom: 3 }}>{exp.location}</div>}
                    <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151", marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div></div>
            )}
            {s === "education" && education.length > 0 && (
              <div><SectionTitle>Education</SectionTitle>
              {education.map(edu => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111" }}>{edu.degree}</div>
                    <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600 }}>{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>
                    {edu.highlights && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>{edu.highlights}</div>}
                  </div>
                  <div style={{ textAlign: "right", fontSize: fs - 1, color: "#9ca3af", flexShrink: 0, marginLeft: 12 }}>
                    <div>{formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}</div>
                    {edu.gpa && <div>GPA {edu.gpa}</div>}
                  </div>
                </div>
              ))}</div>
            )}
            {s === "projects" && projects.length > 0 && (
              <div><SectionTitle>Projects</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{proj.title}
                      {proj.subtitle && <span style={{ fontWeight: 400, fontSize: fs - 1, color: "#9ca3af", marginLeft: 8 }}>{proj.subtitle}</span>}
                    </div>
                    <p style={{ margin: "2px 0 4px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                    {proj.tech?.length > 0 && (
                      <div style={{ display: "flex", gap: 4 }}>
                        {proj.tech.map((t, i) => <span key={i} style={{ fontSize: fs - 1.5, padding: "1px 6px", background: `${accent}15`, color: accent, borderRadius: 3 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div></div>
            )}
            {s === "skills" && skills.length > 0 && (
              <div><SectionTitle>Skills</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {skills.map(group => (
                  <div key={group.id} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700, color: "#111", minWidth: 90, fontSize: fs - 0.5, flexShrink: 0 }}>{group.category}</span>
                    <span style={{ fontSize: fs - 0.5, color: "#374151" }}>{group.items.map(i => i.val).join(" · ")}</span>
                  </div>
                ))}
              </div></div>
            )}
            {s === "certifications" && certifications.length > 0 && (
              <div><SectionTitle>Certifications</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {certifications.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "#111" }}>{c.name}</span>
                      <span style={{ color: accent, fontSize: fs - 0.5, marginLeft: 8 }}>{c.issuer}</span>
                    </div>
                    <span style={{ fontSize: fs - 1, color: "#9ca3af" }}>{fmtDate(c.month, c.year)}</span>
                  </div>
                ))}
              </div></div>
            )}
            {s === "languages" && languages.length > 0 && (
              <div><SectionTitle>Languages</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 24px" }}>
                {languages.map(l => (
                  <span key={l.id} style={{ fontSize: fs - 0.5, color: "#374151" }}>
                    <strong>{l.language}</strong> — {l.proficiency}
                  </span>
                ))}
              </div></div>
            )}
            {s === "volunteering" && volunteering.length > 0 && (
              <div><SectionTitle>Volunteering</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {volunteering.map(v => (
                  <div key={v.id}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: "#111" }}>{v.role} — {v.organization}</span>
                      <span style={{ fontSize: fs - 1, color: "#9ca3af" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                    </div>
                    {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                  </div>
                ))}
              </div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── CLASSIC ── */
const ClassicClearTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;
  const SectionTitle = makeSectionTitle(accent, fs, "classic");
  const vis = (s) => visible.includes(s);
  const ordered = sections.filter(s => s !== "personal" && vis(s));

  return (
    <div id="resume-canvas" style={{ width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh, padding: `${pad}px` }}>
      <div style={{ textAlign: "center", marginBottom: pad * 0.8, paddingBottom: pad * 0.5, borderBottom: "2px solid #374151" }}>
        {design.showPhoto && personal.photo && <img src={personal.photo} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 10px" }} />}
        <div style={{ fontSize: fs + 12, fontWeight: 700, color: "#111", letterSpacing: "0.06em", textTransform: "uppercase" }}>{personal.name}</div>
        <div style={{ fontSize: fs + 0.5, color: accent, fontWeight: 600, marginTop: 4 }}>{personal.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3px 16px", marginTop: 6, fontSize: fs - 1, color: "#6b7280" }}>
          {personal.email    && <span>{personal.email}</span>}
          {personal.phone    && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.github   && <span>{personal.github}</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: ss }}>
        {ordered.map(s => (
          <div key={s}>
            {s === "summary" && summary && (
              <div><SectionTitle>Summary</SectionTitle><p style={{ margin: 0, color: "#374151" }}>{summary}</p></div>
            )}
            {s === "experience" && experience.length > 0 && (
              <div><SectionTitle>Experience</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#111" }}>{exp.role}</span>
                        <span style={{ color: "#374151" }}>, {exp.company}</span>
                        {exp.location && <span style={{ color: "#9ca3af", fontSize: fs - 1 }}> — {exp.location}</span>}
                      </div>
                      <span style={{ fontSize: fs - 1, color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
                        {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                      </span>
                    </div>
                    <ul style={{ margin: "3px 0 0", paddingLeft: 16 }}>
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151", marginBottom: 2 }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div></div>
            )}
            {s === "education" && education.length > 0 && (
              <div><SectionTitle>Education</SectionTitle>
              {education.map(edu => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#111" }}>{edu.degree}</span>
                    <span style={{ color: "#374151" }}>, {edu.school}</span>
                    {edu.gpa && <span style={{ color: "#9ca3af", fontSize: fs - 1 }}> (GPA: {edu.gpa})</span>}
                    {edu.highlights && <div style={{ fontSize: fs - 0.5, color: "#374151", marginTop: 1 }}>{edu.highlights}</div>}
                  </div>
                  <span style={{ fontSize: fs - 1, color: "#9ca3af", flexShrink: 0, marginLeft: 8 }}>
                    {formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}
                  </span>
                </div>
              ))}</div>
            )}
            {s === "projects" && projects.length > 0 && (
              <div><SectionTitle>Projects</SectionTitle>
              {projects.map(proj => (
                <div key={proj.id} style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#111" }}>{proj.title}</span>
                    {proj.subtitle && <span style={{ color: "#9ca3af", fontSize: fs - 1, marginLeft: 8 }}>{proj.subtitle}</span>}
                  </div>
                  <p style={{ margin: "2px 0 3px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                  {proj.tech?.length > 0 && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>Tech: {proj.tech.join(", ")}</div>}
                </div>
              ))}</div>
            )}
            {s === "skills" && skills.length > 0 && (
              <div><SectionTitle>Skills</SectionTitle>
              {skills.map(group => (
                <div key={group.id} style={{ marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>{group.category}: </span>
                  <span style={{ color: "#374151" }}>{group.items.map(i => i.val).join(", ")}</span>
                </div>
              ))}</div>
            )}
            {s === "certifications" && certifications.length > 0 && (
              <div><SectionTitle>Certifications</SectionTitle>
              {certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>{c.name}</span>
                  <span style={{ color: "#374151" }}> — {c.issuer}</span>
                  {(c.month || c.year) && <span style={{ color: "#9ca3af", fontSize: fs - 1 }}> ({fmtDate(c.month, c.year)})</span>}
                </div>
              ))}</div>
            )}
            {s === "languages" && languages.length > 0 && (
              <div><SectionTitle>Languages</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 24px" }}>
                {languages.map(l => (
                  <span key={l.id} style={{ fontSize: fs - 0.5, color: "#374151" }}><strong>{l.language}</strong>: {l.proficiency}</span>
                ))}
              </div></div>
            )}
            {s === "volunteering" && volunteering.length > 0 && (
              <div><SectionTitle>Volunteering</SectionTitle>
              {volunteering.map(v => (
                <div key={v.id} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#111" }}>{v.role}, {v.organization}</span>
                    <span style={{ fontSize: fs - 1, color: "#9ca3af" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                  </div>
                  {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                </div>
              ))}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── NEW: MINIMAL TEMPLATE ── */
const MinimalTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;

  const SectionTitle = ({ children }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        fontSize: fs + 1.5, fontWeight: 700, color: "#111", textTransform: "uppercase",
        letterSpacing: "0.1em", paddingBottom: 4, borderBottom: `2px solid ${accent}`,
        display: "inline-block",
      }}>{children}</div>
    </div>
  );

  const vis = (s) => visible.includes(s);
  const ordered = sections.filter(s => s !== "personal" && vis(s));

  return (
    <div id="resume-canvas" style={{ width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh, padding: `${pad}px` }}>
      <div style={{ marginBottom: pad * 0.8, paddingBottom: pad * 0.4, borderBottom: `1px solid ${accent}20` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {design.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: fs + 12, fontWeight: 300, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{personal.name}</div>
            <div style={{ fontSize: fs + 2, color: accent, fontWeight: 500, marginTop: 2 }}>{personal.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 6, fontSize: fs - 1, color: "#6b7280" }}>
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && <span>{personal.linkedin}</span>}
              {personal.github && <span>{personal.github}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ss }}>
        {ordered.map(s => (
          <div key={s}>
            {s === "summary" && summary && (
              <div><SectionTitle>Profile</SectionTitle>
              <p style={{ margin: 0, color: "#374151", fontSize: fs - 0.5, lineHeight: lh + 0.3 }}>{summary}</p></div>
            )}
            {s === "experience" && experience.length > 0 && (
              <div><SectionTitle>Experience</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: fs + 0.5, color: "#111" }}>{exp.role}</span>
                      <span style={{ fontSize: fs - 1, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>
                        {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                      </span>
                    </div>
                    <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 500, marginBottom: 3 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                    <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 2 }}>
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151" }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div></div>
            )}
            {s === "education" && education.length > 0 && (
              <div><SectionTitle>Education</SectionTitle>
              {education.map(edu => (
                <div key={edu.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, color: "#111", fontSize: fs + 0.5 }}>{edu.degree}</span>
                    <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}</span>
                  </div>
                  <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 500 }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>
                  {edu.gpa && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>GPA: {edu.gpa}</div>}
                  {edu.highlights && <div style={{ fontSize: fs - 0.5, color: "#374151", marginTop: 2 }}>{edu.highlights}</div>}
                </div>
              ))}</div>
            )}
            {s === "projects" && projects.length > 0 && (
              <div><SectionTitle>Projects</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#111", fontSize: fs + 0.5 }}>{proj.title}</span>
                      {proj.subtitle && <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{proj.subtitle}</span>}
                    </div>
                    <p style={{ margin: "2px 0 4px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                    {proj.tech?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        {proj.tech.map((t, i) => <span key={i} style={{ fontSize: fs - 1.5, padding: "2px 6px", background: `${accent}10`, color: accent, borderRadius: 3 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div></div>
            )}
            {s === "skills" && skills.length > 0 && (
              <div><SectionTitle>Skills</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {skills.map(group => (
                  <div key={group.id} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, color: "#111", minWidth: 80, fontSize: fs - 0.5, flexShrink: 0 }}>{group.category}</span>
                    <span style={{ fontSize: fs - 0.5, color: "#374151" }}>{group.items.map(i => i.val).join(" · ")}</span>
                  </div>
                ))}
              </div></div>
            )}
            {s === "certifications" && certifications.length > 0 && (
              <div><SectionTitle>Certifications</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {certifications.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><span style={{ fontWeight: 500, color: "#111" }}>{c.name}</span>
                    <span style={{ color: accent, fontSize: fs - 0.5, marginLeft: 6 }}>{c.issuer}</span></div>
                    <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{fmtDate(c.month, c.year)}</span>
                  </div>
                ))}
              </div></div>
            )}
            {s === "languages" && languages.length > 0 && (
              <div><SectionTitle>Languages</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
                {languages.map(l => (
                  <span key={l.id} style={{ fontSize: fs - 0.5, color: "#374151" }}>
                    <strong>{l.language}</strong> — {l.proficiency}
                  </span>
                ))}
              </div></div>
            )}
            {s === "volunteering" && volunteering.length > 0 && (
              <div><SectionTitle>Volunteering</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {volunteering.map(v => (
                  <div key={v.id}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, color: "#111" }}>{v.role} — {v.organization}</span>
                      <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                    </div>
                    {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                  </div>
                ))}
              </div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── NEW: MODERN TEMPLATE ── */
const ModernTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 50%, ${accent}99 100%)`,
  };

  const SectionTitle = ({ children }) => (
    <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
      <div style={{ fontSize: fs + 1, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</div>
    </div>
  );

  const SkillBadge = ({ skill }) => (
    <span style={{
      fontSize: fs - 1.5, padding: "3px 10px", background: `${accent}12`, color: accent,
      borderRadius: 20, fontWeight: 500, border: `1px solid ${accent}20`,
    }}>{skill}</span>
  );

  const vis = (s) => visible.includes(s);
  const leftSections = ["summary", "skills", "languages", "certifications"];
  const rightSections = ["experience", "education", "projects", "volunteering"];
  const leftContent = sections.filter(s => s !== "personal" && vis(s) && leftSections.includes(s));
  const rightContent = sections.filter(s => s !== "personal" && vis(s) && rightSections.includes(s));

  return (
    <div id="resume-canvas" style={{ width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh }}>
      <div style={{ ...gradientStyle, padding: `${pad * 0.9}px ${pad}px`, display: "flex", alignItems: "center", gap: 18 }}>
        {design.showPhoto && personal.photo && (
          <img src={personal.photo} alt="" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fs + 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{personal.name}</div>
          <div style={{ fontSize: fs + 2, color: "rgba(255,255,255,0.9)", fontWeight: 500, marginTop: 3 }}>{personal.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 6, fontSize: fs - 0.5, color: "rgba(255,255,255,0.8)" }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>📞 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
            {personal.github && <span>💻 {personal.github}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", padding: `${pad * 0.85}px ${pad}px`, gap: pad * 0.9 }}>
        <div style={{ width: "35%", flexShrink: 0, display: "flex", flexDirection: "column", gap: ss }}>
          {leftContent.map(s => (
            <div key={s}>
              {s === "summary" && summary && (
                <><SectionTitle>Profile</SectionTitle>
                <p style={{ margin: 0, color: "#374151", fontSize: fs - 0.5, lineHeight: lh + 0.3 }}>{summary}</p></>
              )}
              {s === "skills" && skills.length > 0 && (
                <><SectionTitle>Skills</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {skills.map(group => (
                    <div key={group.id}>
                      <div style={{ fontWeight: 600, fontSize: fs - 0.5, color: "#374151", marginBottom: 4 }}>{group.category}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {group.items.map(item => <SkillBadge key={item.id} skill={item.val} />)}
                      </div>
                    </div>
                  ))}
                </div></>
              )}
              {s === "certifications" && certifications.length > 0 && (
                <><SectionTitle>Certifications</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {certifications.map(c => (
                    <div key={c.id}>
                      <div style={{ fontWeight: 600, fontSize: fs - 0.5, color: "#111" }}>{c.name}</div>
                      <div style={{ fontSize: fs - 1, color: accent }}>{c.issuer}</div>
                      {(c.month || c.year) && <div style={{ fontSize: fs - 1.5, color: "#6b7280" }}>{fmtDate(c.month, c.year)}</div>}
                    </div>
                  ))}
                </div></>
              )}
              {s === "languages" && languages.length > 0 && (
                <><SectionTitle>Languages</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {languages.map(l => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: fs - 0.5, color: "#374151", fontWeight: 500 }}>{l.language}</span>
                      <span style={{ fontSize: fs - 1.5, padding: "2px 8px", background: `${accent}10`, color: accent, borderRadius: 12 }}>{l.proficiency}</span>
                    </div>
                  ))}
                </div></>
              )}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: ss }}>
          {rightContent.map(s => (
            <div key={s}>
              {s === "experience" && experience.length > 0 && (
                <><SectionTitle>Experience</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {experience.map(exp => (
                    <div key={exp.id} style={{ padding: 8, background: "#f9fafb", borderRadius: 6, borderLeft: `3px solid ${accent}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: fs + 0.5, color: "#111" }}>{exp.role}</span>
                        <span style={{ fontSize: fs - 1, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>
                          {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                        </span>
                      </div>
                      <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                      <ul style={{ margin: 0, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                        {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151" }}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div></>
              )}
              {s === "education" && education.length > 0 && (
                <><SectionTitle>Education</SectionTitle>
                {education.map(edu => (
                  <div key={edu.id} style={{ padding: 8, background: "#f9fafb", borderRadius: 6, marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, color: "#111", fontSize: fs + 0.5 }}>{edu.degree}</span>
                      <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}</span>
                    </div>
                    <div style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600 }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>
                    {edu.gpa && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>GPA: {edu.gpa}</div>}
                    {edu.highlights && <div style={{ fontSize: fs - 0.5, color: "#374151", marginTop: 2 }}>{edu.highlights}</div>}
                  </div>
                ))}</>
              )}
              {s === "projects" && projects.length > 0 && (
                <><SectionTitle>Projects</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {projects.map(proj => (
                    <div key={proj.id} style={{ padding: 8, background: "#f9fafb", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#111", fontSize: fs + 0.5 }}>{proj.title}</span>
                        {proj.subtitle && <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{proj.subtitle}</span>}
                      </div>
                      <p style={{ margin: "2px 0 4px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                      {proj.tech?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {proj.tech.map((t, i) => <span key={i} style={{ fontSize: fs - 1.5, padding: "2px 8px", background: `${accent}10`, color: accent, borderRadius: 12 }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div></>
              )}
              {s === "volunteering" && volunteering.length > 0 && (
                <><SectionTitle>Volunteering</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {volunteering.map(v => (
                    <div key={v.id} style={{ padding: 8, background: "#f9fafb", borderRadius: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, color: "#111" }}>{v.role} — {v.organization}</span>
                        <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                      </div>
                      {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                    </div>
                  ))}
                </div></>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── NEW: EXECUTIVE TEMPLATE ── */
const ExecutiveTemplate = ({ data, design, sections, visible }) => {
  const { personal, summary, experience, education, projects, skills, certifications, languages, volunteering } = data;
  const accent = design.accent;
  const font   = FONTS[design.font]?.stack || FONTS.inter.stack;
  const fs = design.fontSize;
  const lh = design.lineHeight;
  const pad = design.pagePadding;
  const ss  = design.sectionSpacing;

  const SectionTitle = ({ children }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: fs + 0.5, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.12em", borderBottom: `2px solid #111`, paddingBottom: 4 }}>{children}</div>
    </div>
  );

  const vis = (s) => visible.includes(s);
  const ordered = sections.filter(s => s !== "personal" && vis(s));

  return (
    <div id="resume-canvas" style={{ width: A4_W, background: "#fff", fontFamily: font, fontSize: fs, lineHeight: lh, padding: `${pad}px` }}>
      <div style={{ textAlign: "center", marginBottom: pad * 0.7, paddingBottom: pad * 0.5, borderBottom: `1px solid #d1d5db` }}>
        <div style={{ fontSize: fs + 14, fontWeight: 700, color: "#111", letterSpacing: "0.04em", textTransform: "uppercase" }}>{personal.name}</div>
        <div style={{ fontSize: fs + 2, color: accent, fontWeight: 600, marginTop: 4 }}>{personal.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3px 16px", marginTop: 6, fontSize: fs - 0.5, color: "#6b7280" }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.github && <span>{personal.github}</span>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ss }}>
        {ordered.map(s => (
          <div key={s}>
            {s === "summary" && summary && (
              <div><SectionTitle>Executive Summary</SectionTitle>
              <p style={{ margin: 0, color: "#374151", lineHeight: lh + 0.4, fontSize: fs - 0.2 }}>{summary}</p></div>
            )}
            {s === "experience" && experience.length > 0 && (
              <div><SectionTitle>Professional Experience</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {experience.map(exp => (
                  <div key={exp.id} style={{ padding: 8, border: `1px solid #e5e7eb`, borderRadius: 4, background: "#fafafa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div><span style={{ fontWeight: 700, fontSize: fs + 0.5, color: "#111" }}>{exp.role}</span>
                      <span style={{ fontSize: fs - 0.5, color: accent, fontWeight: 600, marginLeft: 8 }}>{exp.company}</span></div>
                      <span style={{ fontSize: fs - 1, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>
                        {formatDateRange(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.current)}
                      </span>
                    </div>
                    {exp.location && <div style={{ fontSize: fs - 1, color: "#6b7280", marginBottom: 4 }}>{exp.location}</div>}
                    <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: fs - 0.5, color: "#374151" }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div></div>
            )}
            {s === "education" && education.length > 0 && (
              <div><SectionTitle>Education</SectionTitle>
              {education.map(edu => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#111" }}>{edu.degree}</span>
                    <span style={{ color: "#374151" }}>, {edu.school}</span>
                    {edu.gpa && <span style={{ color: "#6b7280", fontSize: fs - 1 }}> (GPA: {edu.gpa})</span>}
                    {edu.highlights && <div style={{ fontSize: fs - 0.5, color: "#374151", marginTop: 2 }}>{edu.highlights}</div>}
                  </div>
                  <span style={{ fontSize: fs - 1, color: "#6b7280", flexShrink: 0, marginLeft: 8 }}>
                    {formatDateRange(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, false)}
                  </span>
                </div>
              ))}</div>
            )}
            {s === "projects" && projects.length > 0 && (
              <div><SectionTitle>Key Projects</SectionTitle>
              {projects.map(proj => (
                <div key={proj.id} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: "#111" }}>{proj.title}
                    {proj.subtitle && <span style={{ fontWeight: 400, fontSize: fs - 1, color: "#6b7280", marginLeft: 8 }}>{proj.subtitle}</span>}
                  </div>
                  <p style={{ margin: "2px 0 3px", fontSize: fs - 0.5, color: "#374151" }}>{proj.description}</p>
                  {proj.tech?.length > 0 && <div style={{ fontSize: fs - 1, color: "#6b7280" }}>Tech: {proj.tech.join(", ")}</div>}
                </div>
              ))}</div>
            )}
            {s === "skills" && skills.length > 0 && (
              <div><SectionTitle>Core Competencies</SectionTitle>
              {skills.map(group => (
                <div key={group.id} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>{group.category}: </span>
                  <span style={{ color: "#374151" }}>{group.items.map(i => i.val).join(", ")}</span>
                </div>
              ))}</div>
            )}
            {s === "certifications" && certifications.length > 0 && (
              <div><SectionTitle>Certifications</SectionTitle>
              {certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: "#111" }}>{c.name}</span>
                  <span style={{ color: "#374151" }}> — {c.issuer}</span>
                  {(c.month || c.year) && <span style={{ color: "#6b7280", fontSize: fs - 1 }}> ({fmtDate(c.month, c.year)})</span>}
                </div>
              ))}</div>
            )}
            {s === "languages" && languages.length > 0 && (
              <div><SectionTitle>Languages</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 24px" }}>
                {languages.map(l => (
                  <span key={l.id} style={{ fontSize: fs - 0.5, color: "#374151" }}><strong>{l.language}</strong>: {l.proficiency}</span>
                ))}
              </div></div>
            )}
            {s === "volunteering" && volunteering.length > 0 && (
              <div><SectionTitle>Board & Advisory Roles</SectionTitle>
              {volunteering.map(v => (
                <div key={v.id} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#111" }}>{v.role}, {v.organization}</span>
                    <span style={{ fontSize: fs - 1, color: "#6b7280" }}>{formatDateRange(v.startMonth, v.startYear, v.endMonth, v.endYear, v.current)}</span>
                  </div>
                  {v.description && <p style={{ margin: "2px 0 0", fontSize: fs - 0.5, color: "#374151" }}>{v.description}</p>}
                </div>
              ))}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE REGISTRY — 6 TEMPLATES
   ═══════════════════════════════════════════════════════════════ */
const TEMPLATES = {
  atlantic: { id: "atlantic", label: "Atlantic", description: "Sidebar layout, colored header", component: AtlanticTemplate },
  mercury:  { id: "mercury",  label: "Mercury",  description: "Bold one-column, high impact",   component: MercuryTemplate },
  classic:  { id: "classic",  label: "Classic Clear", description: "Traditional ATS-friendly",  component: ClassicClearTemplate },
  minimal:  { id: "minimal",  label: "Minimal",  description: "Clean, modern, whitespace-heavy", component: MinimalTemplate },
  modern:   { id: "modern",   label: "Modern",   description: "Colorful, dynamic, visual design", component: ModernTemplate },
  executive:{ id: "executive", label: "Executive", description: "Formal, leadership-focused",   component: ExecutiveTemplate },
};

/* ═══════════════════════════════════════════════════════════════
   EDITOR PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{children}</div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <Label>{label}</Label>}
    <input {...props} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, color: "#111", outline: "none", background: "#fff", boxSizing: "border-box", ...props.style }} />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <Label>{label}</Label>}
    <textarea {...props} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, color: "#111", outline: "none", resize: "vertical", background: "#fff", fontFamily: "inherit", boxSizing: "border-box", minHeight: 72, ...props.style }} />
  </div>
);

const Btn = ({ children, onClick, danger, disabled, small, primary, style: ex }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: "inline-flex", alignItems: "center", gap: 5, cursor: disabled ? "not-allowed" : "pointer",
    padding: small ? "4px 10px" : "7px 13px", borderRadius: 6,
    border: danger ? "1px solid #fca5a5" : primary ? "none" : "1px solid #e5e7eb",
    background: danger ? "#fff1f1" : primary ? "#111" : "#fff",
    color: danger ? "#dc2626" : primary ? "#fff" : "#374151",
    fontSize: small ? 11 : 13, fontWeight: 500, opacity: disabled ? 0.5 : 1, ...ex,
  }}>{children}</button>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION EDITORS — defined before Builder uses them
   ═══════════════════════════════════════════════════════════════ */
          /* ═══════════════════════════════════════════════════════════════
        SECTION EDITORS — defined before Builder uses them
        ═══════════════════════════════════════════════════════════════ */

      const PersonalEditor = ({ data, onChange }) => {
        const set = (f, v) => onChange({ ...data, [f]: v });
        return (
          <div>
            {data.photo && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img src={data.photo} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }} />
                <Btn small danger onClick={() => set("photo", null)}><X size={12} /> Remove photo</Btn>
              </div>
            )}
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, cursor: "pointer", marginBottom: 16, fontWeight: 500, color: "#374151" }}>
              <Upload size={14} /> Upload photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0];
                if (f) { const r = new FileReader(); r.onloadend = () => set("photo", r.result); r.readAsDataURL(f); }
              }} />
            </label>
            <Input label="Full name"  value={data.name}     onChange={e => set("name", e.target.value)}     placeholder="Jane Smith" />
            <Input label="Job title"  value={data.title}    onChange={e => set("title", e.target.value)}    placeholder="Senior Product Designer" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Email" value={data.email} onChange={e => set("email", e.target.value)} placeholder="jane@email.com" />
              <Input label="Phone" value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <Input label="Location" value={data.location} onChange={e => set("location", e.target.value)} placeholder="New York, NY" />
            <Input label="LinkedIn"  value={data.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/username" />
            <Input label="GitHub"    value={data.github}   onChange={e => set("github", e.target.value)}   placeholder="github.com/username" />
            <Input label="Website"   value={data.website}  onChange={e => set("website", e.target.value)}  placeholder="yoursite.com" />
          </div>
        );
      };

      const SummaryEditor = ({ data, onChange }) => (
        <div>
          <Textarea label="Summary" value={data} onChange={e => onChange(e.target.value)} rows={6} style={{ minHeight: 110 }} placeholder="Write a 2–4 sentence summary highlighting your experience, key achievements, and what makes you stand out." />
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{data.length} characters · Aim for 200–400</div>
        </div>
      );

      const ExperienceEditor = ({ data, onChange }) => {
        const update = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const updateBullet = (i, bi, v) => {
          const n = [...data]; const b = [...n[i].bullets]; b[bi] = v; n[i] = { ...n[i], bullets: b }; onChange(n);
        };
        const addBullet   = (i) => { const n = [...data]; n[i] = { ...n[i], bullets: [...n[i].bullets, ""] }; onChange(n); };
        const removeBullet = (i, bi) => { const n = [...data]; n[i] = { ...n[i], bullets: n[i].bullets.filter((_, j) => j !== bi) }; onChange(n); };
        const move    = (i, d) => { const n = [...data]; [n[i], n[i+d]] = [n[i+d], n[i]]; onChange(n); };
        const remove  = (i) => onChange(data.filter((_, j) => j !== i));
        const add     = () => onChange([...data, { id: uid(), role: "", company: "", location: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false, bullets: [""] }]);

        return (
          <div>
            {data.map((exp, i) => (
              <div key={exp.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{exp.role || "New position"}</span>
                  <div style={{ display: "flex", gap: 3 }}>
                    <Btn small onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={12} /></Btn>
                    <Btn small onClick={() => move(i,  1)} disabled={i === data.length - 1}><ChevronDown size={12} /></Btn>
                    <Btn small danger onClick={() => remove(i)}><Trash2 size={12} /></Btn>
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Job title" value={exp.role}    onChange={e => update(i, "role", e.target.value)}    placeholder="Software Engineer" />
                    <Input label="Company"   value={exp.company} onChange={e => update(i, "company", e.target.value)} placeholder="Company name" />
                  </div>
                  <Input label="Location" value={exp.location} onChange={e => update(i, "location", e.target.value)} placeholder="City, Country" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <Label>Start date</Label>
                      <DatePicker month={exp.startMonth} year={exp.startYear} onChange={(m, y) => { update(i, "startMonth", m); update(i, "startYear", y); }} />
                    </div>
                    <div>
                      <Label>End date</Label>
                      {exp.current
                        ? <div style={{ padding: "7px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, color: "#9ca3af" }}>Present</div>
                        : <DatePicker month={exp.endMonth} year={exp.endYear} onChange={(m, y) => { update(i, "endMonth", m); update(i, "endYear", y); }} />
                      }
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", cursor: "pointer", marginTop: 4 }}>
                        <input type="checkbox" checked={exp.current} onChange={e => update(i, "current", e.target.checked)} style={{ width: 12, height: 12 }} />
                        Currently working here
                      </label>
                    </div>
                  </div>
                  <Label>Bullet points</Label>
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                      <span style={{ color: "#9ca3af", paddingTop: 9, fontSize: 12, flexShrink: 0 }}>•</span>
                      <textarea value={b} onChange={e => updateBullet(i, bi, e.target.value)} placeholder="Describe an achievement with metrics…" rows={2}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#111", lineHeight: 1.5 }} />
                      <button onClick={() => removeBullet(i, bi)} style={{ marginTop: 7, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }}><X size={14} /></button>
                    </div>
                  ))}
                  <Btn small onClick={() => addBullet(i)} style={{ marginTop: 2 }}><Plus size={12} /> Add bullet</Btn>
                </div>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}><Plus size={16} /> Add position</Btn>
          </div>
        );
      };

      const EducationEditor = ({ data, onChange }) => {
        const update = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const remove  = (i) => onChange(data.filter((_, j) => j !== i));
        const add     = () => onChange([...data, { id: uid(), degree: "", school: "", location: "", startMonth: "", startYear: "", endMonth: "", endYear: "", gpa: "", highlights: "" }]);

        return (
          <div>
            {data.map((edu, i) => (
              <div key={edu.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{edu.degree || "New degree"}</span>
                  <Btn small danger onClick={() => remove(i)}><Trash2 size={12} /></Btn>
                </div>
                <div style={{ padding: 12 }}>
                  <Input label="Degree" value={edu.degree} onChange={e => update(i, "degree", e.target.value)} placeholder="B.S. Computer Science" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="School"   value={edu.school}   onChange={e => update(i, "school", e.target.value)}   placeholder="MIT" />
                    <Input label="Location" value={edu.location} onChange={e => update(i, "location", e.target.value)} placeholder="Cambridge, MA" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div><Label>Start date</Label><DatePicker month={edu.startMonth} year={edu.startYear} onChange={(m, y) => { update(i, "startMonth", m); update(i, "startYear", y); }} /></div>
                    <div><Label>End date</Label>  <DatePicker month={edu.endMonth}   year={edu.endYear}   onChange={(m, y) => { update(i, "endMonth",   m); update(i, "endYear",   y); }} /></div>
                  </div>
                  <Input label="GPA" value={edu.gpa} onChange={e => update(i, "gpa", e.target.value)} placeholder="3.9" />
                  <Textarea label="Highlights" value={edu.highlights} onChange={e => update(i, "highlights", e.target.value)} placeholder="Honors, activities, relevant coursework…" style={{ minHeight: 56 }} />
                </div>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} /> Add education</Btn>
          </div>
        );
      };

      const ProjectsEditor = ({ data, onChange }) => {
        const update    = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const updateTech = (i, s) => { const n = [...data]; n[i] = { ...n[i], tech: s.split(",").map(t => t.trim()).filter(Boolean) }; onChange(n); };
        const remove    = (i) => onChange(data.filter((_, j) => j !== i));
        const add       = () => onChange([...data, { id: uid(), title: "", subtitle: "", description: "", tech: [] }]);

        return (
          <div>
            {data.map((proj, i) => (
              <div key={proj.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{proj.title || "New project"}</span>
                  <Btn small danger onClick={() => remove(i)}><Trash2 size={12} /></Btn>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Project name"   value={proj.title}    onChange={e => update(i, "title", e.target.value)}    placeholder="Project name" />
                    <Input label="Subtitle / link" value={proj.subtitle} onChange={e => update(i, "subtitle", e.target.value)} placeholder="github.com/..." />
                  </div>
                  <Textarea label="Description" value={proj.description} onChange={e => update(i, "description", e.target.value)} placeholder="What it does, your role, impact, scale…" style={{ minHeight: 72 }} />
                  <Input label="Tech stack (comma-separated)" value={proj.tech?.join(", ") || ""} onChange={e => updateTech(i, e.target.value)} placeholder="React, TypeScript, AWS" />
                </div>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} /> Add project</Btn>
          </div>
        );
      };

      const SkillsEditor = ({ data, onChange }) => {
        const [newItem, setNewItem] = useState({});
        const [newCat,  setNewCat]  = useState("");

        const updateCat  = (i, v) => { const n = [...data]; n[i] = { ...n[i], category: v }; onChange(n); };
        const addItem    = (i) => {
          const val = (newItem[i] || "").trim(); if (!val) return;
          const n = [...data]; n[i] = { ...n[i], items: [...n[i].items, { id: uid(), val }] }; onChange(n);
          setNewItem(prev => ({ ...prev, [i]: "" }));
        };
        const removeItem = (i, itemId) => {
          const n = [...data]; n[i] = { ...n[i], items: n[i].items.filter(x => x.id !== itemId) }; onChange(n);
        };
        const removeGroup = (i) => onChange(data.filter((_, j) => j !== i));
        const addGroup    = () => {
          if (!newCat.trim()) return;
          onChange([...data, { id: uid(), category: newCat.trim(), items: [] }]);
          setNewCat("");
        };

        return (
          <div>
            {data.map((group, i) => (
              <div key={group.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <input value={group.category} onChange={e => updateCat(i, e.target.value)} style={{ fontWeight: 600, fontSize: 12, color: "#374151", background: "none", border: "none", outline: "none", flex: 1 }} />
                  <Btn small danger onClick={() => removeGroup(i)}><Trash2 size={12} /></Btn>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                    {group.items.map(item => (
                      <span key={item.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#f3f4f6", borderRadius: 4, fontSize: 12, color: "#374151" }}>
                        {item.val}
                        <button onClick={() => removeItem(i, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={newItem[i] || ""} onChange={e => setNewItem(p => ({ ...p, [i]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addItem(i)} placeholder="Add skill, press Enter…"
                      style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: "1px solid #e5e7eb", fontSize: 12, outline: "none" }} />
                    <Btn small onClick={() => addItem(i)}><Plus size={12} /></Btn>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addGroup()} placeholder="New category name…"
                style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }} />
              <Btn primary onClick={addGroup}>Add</Btn>
            </div>
          </div>
        );
      };

      const CertificationsEditor = ({ data, onChange }) => {
        const update = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const remove = (i) => onChange(data.filter((_, j) => j !== i));
        const add    = () => onChange([...data, { id: uid(), name: "", issuer: "", month: "", year: "", expMonth: "", expYear: "", noExpiry: false }]);

        return (
          <div>
            {data.map((c, i) => (
              <div key={c.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{c.name || "New certification"}</span>
                  <Btn small danger onClick={() => remove(i)}><Trash2 size={12} /></Btn>
                </div>
                <div style={{ padding: 12 }}>
                  <Input label="Certification name" value={c.name}   onChange={e => update(i, "name", e.target.value)}   placeholder="AWS Solutions Architect" />
                  <Input label="Issuing organization" value={c.issuer} onChange={e => update(i, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <div><Label>Issue date</Label><DatePicker month={c.month} year={c.year} onChange={(m, y) => { update(i, "month", m); update(i, "year", y); }} /></div>
                    <div>
                      <Label>Expiry date</Label>
                      {c.noExpiry
                        ? <div style={{ padding: "7px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, color: "#9ca3af" }}>No expiry</div>
                        : <DatePicker month={c.expMonth} year={c.expYear} onChange={(m, y) => { update(i, "expMonth", m); update(i, "expYear", y); }} />
                      }
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", cursor: "pointer", marginTop: 4 }}>
                        <input type="checkbox" checked={c.noExpiry} onChange={e => update(i, "noExpiry", e.target.checked)} style={{ width: 12, height: 12 }} />
                        No expiry date
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} /> Add certification</Btn>
          </div>
        );
      };

      const LanguagesEditor = ({ data, onChange }) => {
        const update = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const remove = (i) => onChange(data.filter((_, j) => j !== i));
        const add    = () => onChange([...data, { id: uid(), language: "", proficiency: "Professional" }]);

        return (
          <div>
            {data.map((l, i) => (
              <div key={l.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input value={l.language} onChange={e => update(i, "language", e.target.value)} placeholder="Language"
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none" }} />
                <select value={l.proficiency} onChange={e => update(i, "proficiency", e.target.value)}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fff", appearance: "none" }}>
                  {PROFICIENCY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={() => remove(i)} style={{ padding: 6, background: "none", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", color: "#dc2626", display: "flex" }}><Trash2 size={13} /></button>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}><Plus size={16} /> Add language</Btn>
          </div>
        );
      };

      const VolunteeringEditor = ({ data, onChange }) => {
        const update = (i, f, v) => { const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n); };
        const remove = (i) => onChange(data.filter((_, j) => j !== i));
        const add    = () => onChange([...data, { id: uid(), role: "", organization: "", startMonth: "", startYear: "", endMonth: "", endYear: "", current: false, description: "" }]);

        return (
          <div>
            {data.map((v, i) => (
              <div key={v.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{v.role || "New entry"}</span>
                  <Btn small danger onClick={() => remove(i)}><Trash2 size={12} /></Btn>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Role"         value={v.role}         onChange={e => update(i, "role", e.target.value)}         placeholder="Volunteer Tutor" />
                    <Input label="Organization" value={v.organization} onChange={e => update(i, "organization", e.target.value)} placeholder="Organization name" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div><Label>Start date</Label><DatePicker month={v.startMonth} year={v.startYear} onChange={(m, y) => { update(i, "startMonth", m); update(i, "startYear", y); }} /></div>
                    <div>
                      <Label>End date</Label>
                      {v.current
                        ? <div style={{ padding: "7px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 12, color: "#9ca3af" }}>Present</div>
                        : <DatePicker month={v.endMonth} year={v.endYear} onChange={(m, y) => { update(i, "endMonth", m); update(i, "endYear", y); }} />
                      }
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", cursor: "pointer", marginTop: 4 }}>
                        <input type="checkbox" checked={v.current} onChange={e => update(i, "current", e.target.checked)} style={{ width: 12, height: 12 }} />
                        Currently volunteering
                      </label>
                    </div>
                  </div>
                  <Textarea label="Description" value={v.description} onChange={e => update(i, "description", e.target.value)} placeholder="Describe your role and impact…" style={{ minHeight: 64 }} />
                </div>
              </div>
            ))}
            <Btn primary onClick={add} style={{ width: "100%", justifyContent: "center" }}><Plus size={16} /> Add entry</Btn>
          </div>
        );
      };

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE THUMBNAIL
   ═══════════════════════════════════════════════════════════════ */
  
const TemplateThumbnail = ({ template, selected, accent, onClick }) => {
  const isA = template.id === "atlantic";
  const isM = template.id === "mercury";
  return (
    <button onClick={onClick} style={{ width: "100%", padding: 0, border: selected ? `2px solid ${accent}` : "2px solid #e5e7eb", borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff", position: "relative" }}>
      <div style={{ width: "100%", aspectRatio: "0.707", background: "#fff", position: "relative", overflow: "hidden" }}>
        {isA && (<>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "22%", background: accent }} />
          <div style={{ position: "absolute", top: "24%", left: "2%", width: "30%", bottom: "2%", display: "flex", flexDirection: "column", gap: "3%" }}>
            {[60, 40, 50, 30, 45].map((w, i) => <div key={i} style={{ height: "6%", background: "#e5e7eb", borderRadius: 1, width: w + "%" }} />)}
          </div>
          <div style={{ position: "absolute", top: "24%", left: "35%", right: "2%", bottom: "2%", display: "flex", flexDirection: "column", gap: "2%" }}>
            {[70, 55, 80, 45, 60, 40, 75].map((w, i) => <div key={i} style={{ height: "5%", background: "#e5e7eb", borderRadius: 1, width: w + "%" }} />)}
          </div>
        </>)}
        {isM && (<>
          <div style={{ position: "absolute", top: "3%", left: "5%", right: "5%", height: "15%", background: "#111", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: "20%", left: "5%", right: "5%", bottom: "3%", display: "flex", flexDirection: "column", gap: "2%" }}>
            <div style={{ height: "5%", background: accent, borderRadius: 1, width: "40%" }} />
            {[80, 60, 70, 50, 65, 45, 75, 55].map((w, i) => <div key={i} style={{ height: "4%", background: "#e5e7eb", borderRadius: 1, width: w + "%" }} />)}
          </div>
        </>)}
        {!isA && !isM && (<>
          <div style={{ position: "absolute", top: "3%", left: "15%", right: "15%", height: "14%", background: "#111", borderRadius: 1 }} />
          <div style={{ position: "absolute", top: "20%", left: "5%", right: "5%", bottom: "3%", display: "flex", flexDirection: "column", gap: "2%" }}>
            {[100, 75, 90, 60, 80, 50, 70, 45, 85].map((w, i) => <div key={i} style={{ height: "4%", background: "#e5e7eb", borderRadius: 1, width: w + "%" }} />)}
          </div>
        </>)}
      </div>
      <div style={{ padding: "7px 8px", borderTop: "1px solid #f3f4f6", textAlign: "left" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{template.label}</div>
        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{template.description}</div>
      </div>
      {selected && (
        <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={11} color="#fff" />
        </div>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PDF EXPORT
   ═══════════════════════════════════════════════════════════════ */
    function usePrintExport(data, design, sections, visible) {
      const [isExporting, setIsExporting] = useState(false);

      const triggerPrint = useCallback(async () => {
        setIsExporting(true);
        try {
          const { exportResumePdf } = await import("./resumePDFExport.js");
          await exportResumePdf(data, design, sections, visible);
        } catch (err) {
          console.error("PDF export failed:", err);
          alert("PDF export failed. Please try again.");
        } finally {
          setIsExporting(false);
        }
      }, [data, design, sections, visible]);

      return { triggerPrint, isExporting };
    }


/* ═══════════════════════════════════════════════════════════════
   MAIN BUILDER with Auto-Fit and Custom Sections
   ═══════════════════════════════════════════════════════════════ */
const Builder = () => {
  const initialState = useMemo(() => {
    const saved = loadSaved();
    return {
      data:     saved?.data     || DEFAULT_DATA,
      design:   saved?.design   || DEFAULT_DESIGN,
      sections: saved?.sections || DEFAULT_SECTIONS,
      visible:  saved?.visible  || DEFAULT_VISIBLE,
    };
  }, []);

  const { state, push, undo, redo, canUndo, canRedo } = useHistory(initialState);
  const { data, design, sections, visible } = state;

  const setState = useCallback((updater) => {
    push(typeof updater === "function" ? updater(state) : updater);
  }, [push, state]);

  const updateData   = useCallback((section, val) =>
    setState(s => ({ ...s, data: { ...s.data, [section]: val } })),
  [setState]);

  const updateDesign = useCallback((field, val) =>
    setState(s => ({ ...s, design: { ...s.design, [field]: val } })),
  [setState]);

  const saveStatus = useSaveState(data, design, sections, visible);
  const { triggerPrint, isExporting } = usePrintExport(data, design, sections, visible);

  const [panel,         setPanel]         = useState("edit");
  const [activeSection, setActiveSection] = useState("personal");
  const [zoom,          setZoom]          = useState(1.0);
  const [autoFit,       setAutoFit]       = useState(true);
  const [mobileView,    setMobileView]    = useState("editor");
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768);
  const [dragIdx,       setDragIdx]       = useState(null);
  const [customSections, setCustomSections] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedSectionType, setSelectedSectionType] = useState("text");
  const fileRef = useRef(null);
  const previewContainerRef = useRef(null);

  // ── Auto-fit calculation ──
  // ── Auto-fit calculation ──
const calculateFitZoom = useCallback(() => {
  const container = previewContainerRef.current;
  if (!container) return 1.0;
  
  const containerWidth = container.clientWidth - 40;
  const containerHeight = container.clientHeight - 40;
  
  const fitWidth = containerWidth / A4_W;
  const fitHeight = containerHeight / A4_H;
  
  // Never zoom beyond 100%
  const fit = Math.min(fitWidth, fitHeight, 1.5);
  return Math.max(0.5, Math.min(1.0, fit));
}, []);


  // ── Auto-fit on mount only ──
  // useEffect(() => {
  //   const fitZoom = calculateFitZoom();
  //   setZoom(Math.max(0.5, Math.min(1.0, fitZoom)));
  // }, []); // Only runs once on mount

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (autoFit) {
  //       const fitZoom = calculateFitZoom();
  //       setZoom(Math.max(0.3, Math.min(1.5, fitZoom)));
  //     }
  //   };
    
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, [autoFit, calculateFitZoom]);

  // ── Custom Sections ──
  const addCustomSection = () => {
    if (!newSectionName.trim()) return;
    const id = `custom_${uid()}`;
    const newSection = {
      id,
      label: newSectionName.trim(),
      icon: FileText,
      type: selectedSectionType,
    };
    setCustomSections([...customSections, newSection]);
    const updatedSections = [...sections, id];
    setState(s => ({ ...s, sections: updatedSections, visible: [...s.visible, id] }));
    updateData(id, selectedSectionType === "list" ? [] : "");
    setNewSectionName("");
    setShowAddSection(false);
  };

  const removeCustomSection = (sectionId) => {
    setCustomSections(customSections.filter(s => s.id !== sectionId));
    setState(s => ({
      ...s,
      sections: s.sections.filter(id => id !== sectionId),
      visible: s.visible.filter(id => id !== sectionId),
    }));
  };

  // ── Responsive ──
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [undo, redo]);

  // ── Drag reorder ──
  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver  = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...sections]; const [moved] = next.splice(dragIdx, 1); next.splice(i, 0, moved);
    setState(s => ({ ...s, sections: next }));
    setDragIdx(i);
  };
  const handleDragEnd = () => setDragIdx(null);

  const toggleVisible = (s) => {
    setState(prev => ({
      ...prev,
      visible: prev.visible.includes(s) ? prev.visible.filter(x => x !== s) : [...prev.visible, s],
    }));
  };

  // ── JSON save / load ──
  const handleSave = () => {
    const payload = JSON.stringify({ data, design, sections, visible, customSections }, null, 2);
    const a = document.createElement("a");
    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
    a.download = "resume-data.json";
    a.click();
  };

  const handleLoad = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setState(s => ({
          data:    parsed.data    || s.data,
          design:  parsed.design  || s.design,
          sections:parsed.sections|| s.sections,
          visible: parsed.visible || s.visible,
        }));
        if (parsed.customSections) {
          setCustomSections(parsed.customSections);
        }
      } catch { alert("Invalid file."); }
    };
    r.readAsText(f);
  };

  const handleReset = () => {
    if (window.confirm("Reset to default resume data?")) {
      setState({ data: DEFAULT_DATA, design: DEFAULT_DESIGN, sections: DEFAULT_SECTIONS, visible: DEFAULT_VISIBLE });
      setCustomSections([]);
    }
  };

  const TemplateComponent = TEMPLATES[design.template]?.component || AtlanticTemplate;

  const sectionEditorMap = {
    personal:      <PersonalEditor       data={data.personal}       onChange={v => updateData("personal", v)} />,
    summary:       <SummaryEditor        data={data.summary}        onChange={v => updateData("summary", v)} />,
    experience:    <ExperienceEditor     data={data.experience}     onChange={v => updateData("experience", v)} />,
    education:     <EducationEditor      data={data.education}      onChange={v => updateData("education", v)} />,
    projects:      <ProjectsEditor       data={data.projects}       onChange={v => updateData("projects", v)} />,
    skills:        <SkillsEditor         data={data.skills}         onChange={v => updateData("skills", v)} />,
    certifications:<CertificationsEditor data={data.certifications} onChange={v => updateData("certifications", v)} />,
    languages:     <LanguagesEditor      data={data.languages}      onChange={v => updateData("languages", v)} />,
    volunteering:  <VolunteeringEditor   data={data.volunteering}   onChange={v => updateData("volunteering", v)} />,
  };

  const scaledWidth  = A4_W * zoom;
  const scaledHeight = A4_H * zoom;

  const iconBtnStyle = (disabled = false) => ({
    padding: 5, background: "none", border: "1px solid #e5e7eb", borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer", color: disabled ? "#d1d5db" : "#6b7280",
    display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1,
  });

  // ── RENDER ──
  const editorPanel = (
    <div style={{ width: isMobile ? "100%" : 340, flexShrink: 0, background: "#fff", borderRight: "1px solid #e5e7eb", height: "100%", overflow: "hidden", display: (!isMobile || mobileView === "editor") ? "flex" : "none", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 8 }}>
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 7, padding: 3, gap: 2 }}>
          {[{ id: "edit", label: "Edit" }, { id: "design", label: "Design" }].map(t => (
            <button key={t.id} onClick={() => setPanel(t.id)} style={{
              padding: "5px 12px", borderRadius: 5, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: panel === t.id ? "#fff" : "transparent",
              color: panel === t.id ? "#111" : "#6b7280",
              boxShadow: panel === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: saveStatus === "saved" ? "#16a34a" : "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
            {saveStatus === "saved" ? <Check size={10} /> : <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />}
            {saveStatus === "saved" ? "Saved" : "Saving…"}
          </span>
          <button onClick={undo}     disabled={!canUndo} title="Undo (⌘Z)"         style={iconBtnStyle(!canUndo)}><Undo2 size={14} /></button>
          <button onClick={redo}     disabled={!canRedo} title="Redo (⌘⇧Z)"        style={iconBtnStyle(!canRedo)}><Redo2 size={14} /></button>
          <button onClick={handleSave} title="Export JSON"                           style={iconBtnStyle()}><Download size={14} /></button>
          <button onClick={() => fileRef.current?.click()} title="Import JSON"       style={iconBtnStyle()}><Upload size={14} /></button>
          <button onClick={handleReset} title="Reset to default"                     style={iconBtnStyle()}><RotateCcw size={14} /></button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleLoad} />
        </div>
      </div>

      {panel === "edit" && (
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{ width: 44, borderRight: "1px solid #f3f4f6", padding: "8px 0", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", flexShrink: 0 }}>
            {sections.map((s, i) => {
              const def  = SECTION_DEFS[s];
              const Icon = def?.icon || FileText;
              const isVis = visible.includes(s);
              const isCustom = customSections.some(c => c.id === s);
              return (
                <div key={s} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}
                  onClick={() => setActiveSection(s)}
                  title={def?.label || s}
                  style={{
                    width: 36, height: 36, margin: "0 4px", borderRadius: 7, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                    background: activeSection === s ? design.accent + "18" : "transparent",
                    color: activeSection === s ? design.accent : isVis ? "#9ca3af" : "#d1d5db",
                    border: activeSection === s ? `1px solid ${design.accent}30` : "1px solid transparent",
                    transition: "all 0.12s",
                    opacity: isVis || s === "personal" ? 1 : 0.45,
                  }}>
                  <Icon size={16} />
                  {isCustom && (
                    <span style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: design.accent,
                    }} />
                  )}
                  {s === "personal" && (
                    <span style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#16a34a",
                    }} />
                  )}
                </div>
              );
            })}
            <button
              onClick={() => setShowAddSection(true)}
              style={{
                width: 36,
                height: 36,
                margin: "0 4px",
                borderRadius: 7,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: design.accent + "18",
                color: design.accent,
                border: `1px dashed ${design.accent}`,
                transition: "all 0.12s",
              }}
              title="Add custom section"
            >
              <Plus size={16} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 14 }}>{SECTION_DEFS[activeSection]?.label || activeSection}</div>
            {sectionEditorMap[activeSection] || (
              <div>
                <Textarea
                  value={data[activeSection] || ""}
                  onChange={e => updateData(activeSection, e.target.value)}
                  placeholder="Enter content for this section..."
                  rows={4}
                  style={{ minHeight: 100 }}
                />
                {customSections.some(c => c.id === activeSection) && (
                  <Btn small danger onClick={() => removeCustomSection(activeSection)} style={{ marginTop: 8 }}>
                    <Trash2 size={14} /> Remove Section
                  </Btn>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {panel === "design" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <Label>Template</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {Object.values(TEMPLATES).map(t => (
                <TemplateThumbnail key={t.id} template={t} selected={design.template === t.id} accent={design.accent} onClick={() => updateDesign("template", t.id)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Label>Accent color</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ACCENTS.map(c => (
                <button key={c} onClick={() => updateDesign("accent", c)} style={{
                  width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer",
                  border: design.accent === c ? "3px solid #111" : "2px solid #e5e7eb",
                }} />
              ))}
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <input type="color" value={design.accent} onChange={e => updateDesign("accent", e.target.value)}
                  style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid #e5e7eb", cursor: "pointer", padding: 0, background: "none" }} title="Custom color" />
                <span style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "#9ca3af", whiteSpace: "nowrap" }}>Custom</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Label>Font family</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {Object.entries(FONTS).map(([k, v]) => (
                <button key={k} onClick={() => updateDesign("font", k)} style={{
                  padding: "7px 10px", borderRadius: 6, border: design.font === k ? `1.5px solid ${design.accent}` : "1px solid #e5e7eb",
                  background: design.font === k ? design.accent + "10" : "#fff",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", fontSize: 13,
                }}>
                  <span style={{ fontFamily: v.stack, color: "#111" }}>{v.label}</span>
                  {design.font === k && <Check size={13} color={design.accent} />}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: "fontSize",       label: "Font size",        min: 7,  max: 12,  step: 0.5, unit: "pt" },
            { key: "lineHeight",     label: "Line height",      min: 1.1,max: 2.0, step: 0.05,unit: "×" },
            { key: "pagePadding",    label: "Page margin",      min: 12, max: 44,  step: 2,   unit: "px" },
            { key: "sectionSpacing", label: "Section spacing",  min: 6,  max: 28,  step: 2,   unit: "px" },
          ].map(ctrl => (
            <div key={ctrl.key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <Label>{ctrl.label}</Label>
                <span style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{design[ctrl.key]}{ctrl.unit}</span>
              </div>
              <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={design[ctrl.key]} onChange={e => updateDesign(ctrl.key, parseFloat(e.target.value))} style={{ width: "100%", accentColor: design.accent }} />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={design.showPhoto} onChange={e => updateDesign("showPhoto", e.target.checked)} style={{ width: 14, height: 14, accentColor: design.accent }} />
              <span style={{ fontSize: 13, color: "#374151" }}>Show profile photo</span>
            </label>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Sections — drag to reorder, eye to show/hide</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sections.map((s, i) => {
                const def  = SECTION_DEFS[s];
                const Icon = def?.icon || FileText;
                const isVis = visible.includes(s) || s === "personal";
                const isCustom = customSections.some(c => c.id === s);
                return (
                  <div key={s} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", cursor: "grab", fontSize: 12, color: "#374151", opacity: isVis ? 1 : 0.5 }}>
                    <GripVertical size={13} style={{ color: "#d1d5db", flexShrink: 0 }} />
                    <Icon size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{def?.label || s}</span>
                    {isCustom && (
                      <span style={{ fontSize: 8, color: design.accent, marginLeft: 4 }}>✨</span>
                    )}
                    {s !== "personal" && (
                      <button onClick={() => toggleVisible(s)} style={{ background: "none", border: "none", cursor: "pointer", color: isVis ? "#374151" : "#d1d5db", padding: 2, display: "flex" }}>
                        {isVis ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <div style={{ flex: 1, minWidth: 0, height: "100%", display: (!isMobile || mobileView === "preview") ? "flex" : "none", flexDirection: "column" }}>
      <div style={{ height: 52, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: design.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={13} color="#fff" />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Resume Builder</span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>A4 · {TEMPLATES[design.template]?.label}</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f3f4f6", borderRadius: 7, padding: "3px 6px" }}>
            <button onClick={() => { setAutoFit(false); setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1))); }} style={iconBtnStyle(zoom <= 0.3)} title="Zoom out"><ZoomOut size={13} /></button>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => { setAutoFit(false); setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1))); }} style={iconBtnStyle(zoom >= 1.5)} title="Zoom in"><ZoomIn size={13} /></button>
            <button 
              onClick={() => { 
                setAutoFit(true); 
                setZoom(1.0); // Reset to 100% instead of calculating
              }} 
              style={{
                padding: "2px 6px",
                background: autoFit ? design.accent : "transparent",
                color: autoFit ? "#fff" : "#6b7280",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
              }}
              title="Reset to 100%"
            >
              100%
            </button>
          </div>

          <button onClick={triggerPrint} disabled={isExporting} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none",
            background: design.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: isExporting ? "not-allowed" : "pointer", opacity: isExporting ? 0.7 : 1,
          }}>
            {isExporting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
            {isExporting ? "Opening print…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div ref={previewContainerRef} style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 20, background: "#f0f2f5" }}>
        <div style={{ 
          position: "relative", 
          width: A4_W, 
          height: A4_H, 
          flexShrink: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)",
          borderRadius: 3,
          transition: "transform 0.2s ease",
        }}>
          <TemplateComponent data={data} design={design} sections={sections} visible={visible} />
          {[1].map(page => (
            <div key={page} style={{
              position: "absolute", 
              top: A4_H * page, 
              left: 0, 
              right: 0,
              pointerEvents: "none", 
              zIndex: 10,
            }} className="page-break-indicator">
              <div style={{ height: 2, background: "rgba(220,38,38,0.3)" }} />
              <div style={{
                position: "absolute", 
                top: 3, 
                right: 0,
                fontSize: 8, 
                color: "rgba(220,38,38,0.6)", 
                background: "rgba(255,255,255,0.9)",
                padding: "1px 6px", 
                borderRadius: "3px 0 0 3px", 
                fontFamily: "sans-serif",
                fontWeight: 600, 
                letterSpacing: "0.03em",
              }}>Page {page + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "calc(100vh - 64px)", fontFamily: "Inter, system-ui, sans-serif", background: "#f0f2f5", overflow: "hidden", marginTop: "64px" }}>
      {isMobile && (
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          {[{ id: "editor", label: "Edit", icon: <AlignLeft size={15} /> }, { id: "preview", label: "Preview", icon: <Monitor size={15} /> }].map(t => (
            <button key={t.id} onClick={() => setMobileView(t.id)} style={{
              flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
              background: mobileView === t.id ? "#fff" : "#f9fafb",
              color: mobileView === t.id ? design.accent : "#6b7280",
              fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              borderBottom: mobileView === t.id ? `2px solid ${design.accent}` : "2px solid transparent",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}
      {editorPanel}
      {previewPanel}
      
      {/* Add Section Modal */}
      {showAddSection && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            maxWidth: 400,
            width: "90%",
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Add Custom Section</h3>
            
            <Input
              label="Section Name"
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              placeholder="e.g., Awards, Publications"
              style={{ marginBottom: 12 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <Label>Section Type</Label>
              <select
                value={selectedSectionType}
                onChange={e => setSelectedSectionType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                }}
              >
                <option value="text">Text (Single Paragraph)</option>
                <option value="list">List (Multiple Items)</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => setShowAddSection(false)}>Cancel</Btn>
              <Btn primary onClick={addCustomSection} disabled={!newSectionName.trim()}>
                Add Section
              </Btn>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&family=Merriweather:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: #e5e7eb; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${design.accent}; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; borderRadius: 3px; }
        * { box-sizing: border-box; }
        select { appearance: none; -webkit-appearance: none; }
        .page-break-indicator { display: block; }
        @media print {
          body > *:not(#resume-print-root) { display: none !important; }
          .page-break-indicator { display: none !important; }
          #resume-print-root { transform: none !important; position: static !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default Builder;