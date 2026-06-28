import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  Clock,
  BookOpen,
  Code,
  Briefcase,
  Lightbulb,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Calendar,
  Zap,
  Sparkles,
  FileText,
  Users,
  Layers,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Analysis = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("resumeData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResumeData(parsed);
      } catch (err) {
        console.error("Invalid JSON:", err);
        toast.error("Failed to load analysis data");
      }
    }
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-semibold mt-4">Analyzing your resume...</h2>
        <p className="text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <AlertCircle size={64} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Analysis Data Found</h2>
        <p className="text-gray-600 mb-6">
          Please upload your resume first to get analysis results.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload Resume
        </button>
      </motion.div>
    );
  }

  const atsScore = resumeData.ats_score || {};
  const improvements = resumeData.improvements || {};
  const roadmap = resumeData.roadmap || {};
  const finalScore = atsScore.final_score || 0;
  const atsPassed = resumeData.ats_passed || false;
  const cleanedResume = resumeData.cleaned_resume || {};

  // FIX: Properly extract breakdown data with score values
  const getBreakdownValue = (key) => {
    const breakdown = atsScore.breakdown || {};
    const item = breakdown[key];
    if (typeof item === 'number') return item;
    if (typeof item === 'object' && item !== null) {
      return item.score || 0;
    }
    return 0;
  };

  // Prepare data for charts - FIX: Extract scores correctly
  const breakdownKeys = atsScore.breakdown ? Object.keys(atsScore.breakdown) : [];
  
  const breakdownData = breakdownKeys
    .filter((key) => key !== 'score' && key !== 'final_score')
    .map((key) => ({
      name: key.replace(/_/g, ' ').toUpperCase(),
      value: getBreakdownValue(key),
    }));

  // Prepare radar data - FIX: Extract scores correctly
  const radarData = breakdownKeys
    .filter((key) => key !== 'score' && key !== 'final_score')
    .map((key) => ({
      subject: key.replace(/_/g, ' ').toUpperCase().slice(0, 12),
      value: getBreakdownValue(key),
      fullMark: 20,
    }));

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getBarColor = (value) => {
    if (value >= 15) return '#22c55e';
    if (value >= 10) return '#eab308';
    return '#ef4444';
  };

// ========== DOWNLOAD: Professional PDF Report (jsPDF native — no html2canvas) ==========
  const handleDownload = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      toast.info("Building your professional report...");

      const pdf = new jsPDF('p', 'mm', 'a4');
      const PW = 210; // page width mm
      const PH = 297; // page height mm
      const ML = 18;  // margin left
      const MR = 18;  // margin right
      const CW = PW - ML - MR; // content width
      const MB = 15;  // margin bottom (footer zone)

      let y = 0; // current Y cursor

      // ── Colour palette ──────────────────────────────────────────────
      const C = {
        navy:       [15,  23,  42],
        blue:       [37, 99,  235],
        blueMid:    [59, 130, 246],
        blueLight:  [219, 234, 254],
        green:      [22, 163,  74],
        greenLight: [220, 252, 231],
        red:        [220,  38,  38],
        redLight:   [254, 226, 226],
        amber:      [217, 119,   6],
        amberLight: [254, 243, 199],
        slate6:     [71,  85, 105],
        slate4:     [148, 163, 184],
        slate2:     [226, 232, 240],
        slate1:     [241, 245, 249],
        white:      [255, 255, 255],
        purple:     [124,  58, 237],
        purpleLight:[237, 233, 254],
      };

      // ── Helpers ──────────────────────────────────────────────────────
      const rgb = (c) => ({ r: c[0], g: c[1], b: c[2] });

      const setFill = (c) => pdf.setFillColor(c[0], c[1], c[2]);
      const setDraw = (c) => pdf.setDrawColor(c[0], c[1], c[2]);
      const setTxt  = (c) => pdf.setTextColor(c[0], c[1], c[2]);

      const font = (style, size) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', style); // bold | normal | italic
      };

      // Pill / filled rect
      const fillRect = (x, ry, w, h, color, radius = 2) => {
        setFill(color);
        setDraw(color);
        pdf.roundedRect(x, ry, w, h, radius, radius, 'F');
      };

      // Outlined rect
      const outlineRect = (x, ry, w, h, color, radius = 2, lw = 0.3) => {
        pdf.setLineWidth(lw);
        setDraw(color);
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, ry, w, h, radius, radius, 'FD');
      };

      // Text with colour, auto-wraps, returns final Y
      const text = (str, tx, ty, color, maxW = null) => {
        setTxt(color);
        if (maxW) {
          const lines = pdf.splitTextToSize(String(str), maxW);
          pdf.text(lines, tx, ty);
          return ty + lines.length * (pdf.getFontSize() * 0.352778 * 1.4);
        }
        pdf.text(String(str), tx, ty);
        return ty + pdf.getFontSize() * 0.352778 * 1.4;
      };

      // Horizontal rule
      const hr = (ry, color = C.slate2, lw = 0.3) => {
        pdf.setLineWidth(lw);
        setDraw(color);
        pdf.line(ML, ry, PW - MR, ry);
      };

      // Check if we need a new page; add one if so
      const pageBreak = (neededHeight = 20) => {
        if (y + neededHeight > PH - MB) {
          addFooter();
          pdf.addPage();
          y = 22;
          addPageHeader();
        }
      };

      // Score → colour
      const scoreColor = (s) => s >= 80 ? C.green : s >= 60 ? C.amber : C.red;
      const scoreBg    = (s) => s >= 80 ? C.greenLight : s >= 60 ? C.amberLight : C.redLight;
      const barColor   = (v, max = 20) => {
        const pct = (v / max) * 100;
        return pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red;
      };

      // Draw a labelled horizontal progress bar
      const progressBar = (label, value, maxVal, bx, by, bw, bh = 3.5) => {
        const pct = Math.min(value / maxVal, 1);
        // Background track
        fillRect(bx, by, bw, bh, C.slate2, 1);
        // Fill
        if (pct > 0) fillRect(bx, by, bw * pct, bh, barColor(value, maxVal), 1);
      };

      // Section header with left accent bar
      const sectionHeader = (title, sy) => {
        fillRect(ML, sy, 3, 6, C.blue, 1);
        font('bold', 11);
        text(title, ML + 5, sy + 4.5, C.navy);
        return sy + 10;
      };

      // Small pill label
      const pill = (label, px, py, bg, fg) => {
        font('normal', 7);
        const w = pdf.getTextWidth(label) + 5;
        fillRect(px, py - 3.2, w, 4.8, bg, 2);
        text(label, px + 2.5, py, fg);
        return px + w + 2;
      };

      // Page header strip (pages 2+)
      const addPageHeader = () => {
        fillRect(0, 0, PW, 10, C.navy, 0);
        font('bold', 7);
        text('ResumeIQ — Resume Analysis Report', ML, 6.5, C.white);
        font('normal', 7);
        const name = cleanedResume.personal_info?.name || '';
        if (name) {
          const nw = pdf.getTextWidth(name);
          text(name, PW - MR - nw, 6.5, C.slate4);
        }
      };

      // Page footer
      const addFooter = () => {
        const pn = pdf.internal.getCurrentPageInfo().pageNumber;
        hr(PH - 10, C.slate2, 0.2);
        font('normal', 7);
        text(`ResumeIQ AI-Powered Resume Analysis  •  Generated ${new Date().toLocaleDateString()}`, ML, PH - 6, C.slate4);
        const pnStr = `Page ${pn}`;
        const pw2 = pdf.getTextWidth(pnStr);
        text(pnStr, PW - MR - pw2, PH - 6, C.slate4);
      };

      // ════════════════════════════════════════════════════════════════
      // PAGE 1 — COVER / HERO
      // ════════════════════════════════════════════════════════════════

      // Navy hero band
      fillRect(0, 0, PW, 72, C.navy, 0);

      // Brand name
      font('bold', 22);
      setTxt(C.white);
      pdf.text('ResumeIQ', ML, 22);

      font('normal', 9);
      text('AI-Powered Resume Analysis Report', ML, 30, C.slate4);

      // Candidate name
      const cname = cleanedResume.personal_info?.name || 'Candidate';
      font('bold', 16);
      text(cname, ML, 46, C.white);

      font('normal', 8);
      const location = cleanedResume.personal_info?.location || '';
      const email    = cleanedResume.personal_info?.email?.[0] || '';
      const meta = [location, email].filter(Boolean).join('   •   ');
      if (meta) text(meta, ML, 54, C.slate4);

      font('normal', 8);
      text(`Generated on ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, ML, 62, C.slate4);

      // ATS score circle area (top-right of hero)
      const cx = PW - MR - 24;
      const scoreVal = finalScore;
      const sColor = scoreColor(scoreVal);
      // Outer ring (track)
      pdf.setLineWidth(2.5);
      setDraw(C.slate6);
      pdf.circle(cx, 36, 20, 'S');
      // Arc fill simulation (draw coloured arc using many line segments)
      const arcAngle = (scoreVal / 100) * 2 * Math.PI;
      pdf.setLineWidth(2.5);
      setDraw(sColor);
      const steps = 64;
      const startA = -Math.PI / 2;
      for (let i = 0; i < steps; i++) {
        const a1 = startA + (arcAngle / steps) * i;
        const a2 = startA + (arcAngle / steps) * (i + 1);
        if (a2 > startA + arcAngle) break;
        pdf.line(
          cx + 20 * Math.cos(a1), 36 + 20 * Math.sin(a1),
          cx + 20 * Math.cos(a2), 36 + 20 * Math.sin(a2)
        );
      }
      font('bold', 14);
      setTxt(C.white);
      const sw = pdf.getTextWidth(scoreVal.toFixed(1) + '%');
      pdf.text(scoreVal.toFixed(1) + '%', cx - sw / 2, 34);
      font('normal', 7);
      setTxt(C.slate4);
      const asw = pdf.getTextWidth('ATS Score');
      pdf.text('ATS Score', cx - asw / 2, 40);

      // ── Status badge below hero ──────────────────────────────────────
      y = 80;
      const statusBg = atsPassed ? C.greenLight : C.redLight;
      const statusFg = atsPassed ? C.green : C.red;
      const statusText = atsPassed ? 'PASSED ATS SCREENING' : 'DID NOT PASS - IMPROVEMENTS NEEDED';
      fillRect(ML, y, CW, 10, statusBg, 2);
      font('bold', 9);
      const stw = pdf.getTextWidth(statusText);
      text(statusText, ML + CW / 2 - stw / 2, y + 6.5, statusFg);
      y += 15;

      // ── 4-card executive summary row ────────────────────────────────
      const cards = [
      { 
        label: 'ATS Score', 
        value: finalScore.toFixed(2) + '%', 
        bg: scoreBg(finalScore), 
        fg: scoreColor(finalScore) 
      },
      { 
        label: 'Current Level', 
        value: resumeData.current_level || 'N/A', 
        bg: C.blueLight, 
        fg: C.blue, 
        smallText: true 
      },
      { 
        label: 'Top Role', 
        value: resumeData.top_roles?.[0]?.role || 'N/A', 
        bg: C.purpleLight, 
        fg: C.purple, 
        smallText: true 
      },
      { 
        label: 'After Fixes', 
        value: (improvements.estimated_score_after_fix || 0) + '%', 
        bg: C.greenLight, 
        fg: C.green 
      }
    ];
      const cardW = (CW - 9) / 4;
      const cardH = 28; // taller cards so wrapped text fits
      cards.forEach((card, i) => {
        const cx2 = ML + i * (cardW + 3);
        outlineRect(cx2, y, cardW, cardH, C.slate2, 2);
        font('normal', 7);
        text(card.label, cx2 + 3, y + 6, C.slate6);
        // smallText cards use size 8 and wrap more aggressively
        const valSize = card.smallText ? 8 : 10;
        font('bold', valSize);
        const lines = pdf.splitTextToSize(String(card.value), cardW - 5);
        lines.forEach((ln, li) => {
          text(ln, cx2 + 3, y + 13 + li * 5, card.fg);
        });
      });
      y += cardH + 6;
      // ── Score breakdown bars ─────────────────────────────────────────
      y = sectionHeader('Score breakdown', y);
      const breakdown = atsScore.breakdown || {};
      const bdKeys = Object.keys(breakdown).filter(k => k !== 'score' && k !== 'final_score');

      // Max scores per category (from data structure)
      const maxMap = {
        required_skills: 40, optional_skills: 20,
        education: 10, role_match: 10, experience_bonus: 10,
      };

      bdKeys.forEach((key) => {
        pageBreak(14);
        const item = breakdown[key];
        const val = typeof item === 'object' ? (item.score || 0) : (item || 0);
        const maxV = maxMap[key] || 20;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        font('normal', 8);
        text(label, ML, y + 4, C.slate6);
        font('bold', 8);
        const valStr = `${val.toFixed(1)} / ${maxV}`;
        const vw = pdf.getTextWidth(valStr);
        text(valStr, PW - MR - vw, y + 4, C.navy);

        // Bar
        progressBar(label, val, maxV, ML, y + 5.5, CW, 3);
        y += 11;

        // Show matched/missing inline for required_skills
        if (key === 'required_skills' && typeof item === 'object') {
          if (item.matched?.length) {
            font('normal', 7);
            let px2 = ML;
            text('Matched: ', px2, y + 4, C.green);
            px2 += pdf.getTextWidth('Matched: ');
            item.matched.slice(0, 6).forEach(s => {
              const sw2 = pdf.getTextWidth(s) + 5;
              if (px2 + sw2 > PW - MR) { y += 5; px2 = ML + 15; }
              px2 = pill(s, px2, y + 4, C.greenLight, C.green);
            });
            y += 7;
          }
          if (item.missing?.length) {
            font('normal', 7);
            let px2 = ML;
            text('Missing:  ', px2, y + 4, C.red);
            px2 += pdf.getTextWidth('Missing:  ');
            item.missing.slice(0, 6).forEach(s => {
              const sw2 = pdf.getTextWidth(s) + 5;
              if (px2 + sw2 > PW - MR) { y += 5; px2 = ML + 15; }
              px2 = pill(s, px2, y + 4, C.redLight, C.red);
            });
            y += 7;
          }
        }
      });

      y += 4;
      hr(y, C.slate2);
      y += 6;

      // ── Potential score lift ─────────────────────────────────────────
      pageBreak(18);
      if (improvements.estimated_score_after_fix) {
        const lift = improvements.estimated_score_after_fix - finalScore;
        fillRect(ML, y, CW, 14, C.greenLight, 2);
        font('bold', 9);
        text('Estimated score after applying all improvements', ML + 4, y + 5.5, C.green);
        font('bold', 12);
        const liftStr = `${improvements.estimated_score_after_fix}%  (+${lift.toFixed(1)}%)`;
        const lw2 = pdf.getTextWidth(liftStr);
        text(liftStr, PW - MR - lw2 - 4, y + 9, C.green);
        y += 18;
      }

      // ── Professional summary ─────────────────────────────────────────
      if (cleanedResume.summary) {
        pageBreak(30);
        y = sectionHeader('Professional summary', y);
        outlineRect(ML, y, CW, 1, C.slate2, 2); // will auto-size below
        font('normal', 8.5);
        setTxt(C.slate6);
        const sumLines = pdf.splitTextToSize(cleanedResume.summary, CW - 8);
        const boxH = sumLines.length * 4.2 + 7;
        outlineRect(ML, y, CW, boxH, C.slate2, 2);
        sumLines.forEach((ln, i) => text(ln, ML + 4, y + 5.5 + i * 4.2, C.slate6));
        y += boxH + 6;
      }

      addFooter();

      // ════════════════════════════════════════════════════════════════
      // PAGE 2 — SKILLS & CRITICAL IMPROVEMENTS
      // ════════════════════════════════════════════════════════════════
      pdf.addPage();
      y = 22;
      addPageHeader();

      // ── Technical skills ─────────────────────────────────────────────
      y = sectionHeader('Technical skills', y);
      const allTech = cleanedResume.skills?.technical || [];
      const allTools = cleanedResume.skills?.tools || [];
      const allSoft = cleanedResume.skills?.soft_skills || [];
      const allLangs = cleanedResume.languages || [];

      const renderPillRow = (items, bg, fg, startY) => {
        let px2 = ML;
        let ry2 = startY;
        items.forEach(s => {
          font('normal', 7);
          const sw2 = pdf.getTextWidth(s) + 6;
          if (px2 + sw2 > PW - MR) { ry2 += 6; px2 = ML; }
          px2 = pill(s, px2, ry2 + 3.5, bg, fg);
        });
        return ry2 + 8;
      };

      if (allTech.length) {
        font('bold', 8); text('Programming languages & frameworks', ML, y + 4, C.navy); y += 7;
        y = renderPillRow(allTech, C.blueLight, C.blue, y);
      }
      if (allTools.length) {
        pageBreak(16); font('bold', 8); text('Tools & platforms', ML, y + 4, C.navy); y += 7;
        y = renderPillRow(allTools, C.greenLight, C.green, y);
      }
      if (allSoft.length) {
        pageBreak(16); font('bold', 8); text('Soft skills', ML, y + 4, C.navy); y += 7;
        y = renderPillRow(allSoft, C.purpleLight, C.purple, y);
      }
      if (allLangs.length) {
        pageBreak(16); font('bold', 8); text('Languages', ML, y + 4, C.navy); y += 7;
        y = renderPillRow(allLangs, C.amberLight, C.amber, y);
      }

      y += 4; hr(y); y += 8;

      // ── Job requirements match ────────────────────────────────────────
      pageBreak(20);
      y = sectionHeader('Job requirements match', y);
      const jobJson = resumeData.job_json || {};
      const reqSkills = jobJson.required_skills || [];
      const optSkills = jobJson.optional_skills || [];
      const matched = breakdown.required_skills?.matched || [];
      const missing = breakdown.required_skills?.missing || [];

      if (reqSkills.length) {
        font('bold', 8); text('Required skills', ML, y + 4, C.navy); y += 7;
        let px2 = ML;
        reqSkills.forEach(s => {
          const isMatched = matched.some(m => m.toLowerCase().includes(s.toLowerCase().split(' ')[0]));
          const bg2 = isMatched ? C.greenLight : C.redLight;
          const fg2 = isMatched ? C.green : C.red;
          font('normal', 7);
          const sw2 = pdf.getTextWidth(s) + 6;
          if (px2 + sw2 > PW - MR) { y += 6; px2 = ML; }
          px2 = pill(s, px2, y + 3.5, bg2, fg2);
        });
        y += 8;
        font('normal', 7); text('Green = matched   Red = missing from your resume', ML, y, C.slate4); y += 7;
      }

      y += 2; hr(y); y += 8;

      // ── Critical missing skills ───────────────────────────────────────
      pageBreak(20);
      const missingSkills = improvements.critical_missing_skills || [];
      if (missingSkills.length) {
        y = sectionHeader('Critical missing skills — action required', y);
        missingSkills.forEach((item, idx) => {
          pageBreak(22);
          const rowH = 18;
          // card
          outlineRect(ML, y, CW, rowH, C.redLight, 2);
          // left accent
          fillRect(ML, y, 3, rowH, C.red, 1);
          // importance badge
          font('bold', 7);
          const impW = pdf.getTextWidth(item.importance || 'High') + 5;
          fillRect(PW - MR - impW - 2, y + 3, impW, 5.5, C.redLight, 2);
          setDraw(C.red); pdf.setLineWidth(0.3);
          pdf.roundedRect(PW - MR - impW - 2, y + 3, impW, 5.5, 2, 2, 'D');
          text(item.importance || 'High', PW - MR - impW + 0.5, y + 7.2, C.red);

          font('bold', 8.5);
          text(`${idx + 1}.  ${item.skill}`, ML + 5, y + 6.5, C.red);
          font('normal', 7.5);
          const actionLines = pdf.splitTextToSize(item.action || '', CW - 14);
          actionLines.slice(0, 2).forEach((ln, li) => text(ln, ML + 5, y + 12 + li * 3.8, C.slate6));
          y += rowH + 3;
        });
      }

      y += 4; hr(y); y += 8;

      // ── Recommended optional skills ───────────────────────────────────
      pageBreak(20);
      const recSkills = improvements.recommended_skill_additions || [];
      if (recSkills.length) {
        y = sectionHeader('Recommended skills to add', y);
        // 2-column grid
        const colW = (CW - 4) / 2;
        recSkills.forEach((item, idx) => {
          pageBreak(20);
          const col = idx % 2;
          const rx2  = ML + col * (colW + 4);
          const rowIdx = Math.floor(idx / 2);
          const ry2   = (col === 0) ? y : y; // y is managed per pair

          const cardH = 16;
          outlineRect(rx2, y, colW, cardH, C.slate2, 2);
          fillRect(rx2, y, 3, cardH, C.amber, 1);
          font('bold', 8);
          const nameLines = pdf.splitTextToSize(item.skill, colW - 10);
          text(nameLines[0], rx2 + 5, y + 5.5, C.navy);
          font('normal', 7);
          const actLines = pdf.splitTextToSize(item.action || '', colW - 8);
          text(actLines[0], rx2 + 5, y + 10.5, C.slate6);
          const impColor = item.importance === 'High' ? C.red : item.importance === 'Medium' ? C.amber : C.green;
          pill(item.importance || 'Medium', rx2 + colW - 22, y + 3.5, scoreBg(item.importance === 'High' ? 40 : item.importance === 'Medium' ? 65 : 90), impColor);

          if (col === 1 || idx === recSkills.length - 1) y += cardH + 3;
        });
      }

      addFooter();

      // ════════════════════════════════════════════════════════════════
      // PAGE 3 — EDUCATION, PROJECTS, TOP ROLES
      // ════════════════════════════════════════════════════════════════
      pdf.addPage();
      y = 22;
      addPageHeader();

      // ── Education ────────────────────────────────────────────────────
      const education = cleanedResume.education || [];
      if (education.length) {
        y = sectionHeader('Education', y);
        education.forEach(edu => {
          pageBreak(28);
          const cardH = 24;
          outlineRect(ML, y, CW, cardH, C.slate2, 2);
          fillRect(ML, y, 3, cardH, C.blue, 1);

          font('bold', 9.5);
          text(edu.institution || '', ML + 5, y + 6, C.navy);
          font('normal', 8);
          const degLines = pdf.splitTextToSize(edu.degree || '', CW - 40);
          text(degLines[0], ML + 5, y + 11.5, C.slate6);
          font('normal', 7.5);
          text(`${edu.start_year || ''} – ${edu.end_year || ''}  •  ${edu.field_of_study || ''}`, ML + 5, y + 17, C.slate4);

          if (edu.gpa) {
            fillRect(PW - MR - 28, y + 5, 26, 13, C.blueLight, 2);
            font('bold', 11);
            text(edu.gpa, PW - MR - 22, y + 11.5, C.blue);
            font('normal', 6.5);
            text('GPA', PW - MR - 15, y + 16, C.slate4);
          }
          y += cardH + 4;
        });
        y += 4; hr(y); y += 8;
      }

      // ── Projects ─────────────────────────────────────────────────────
      const projects = cleanedResume.projects || [];
      if (projects.length) {
        y = sectionHeader(`Projects  (${projects.length} total)`, y);
        projects.forEach((proj, idx) => {
          font('normal', 8);
          const descLines = pdf.splitTextToSize(proj.description || '', CW - 8);
          const techLineCount = Math.ceil((proj.technologies || []).length / 8);
          const cardH = 10 + descLines.length * 4 + techLineCount * 5 + 8;
          pageBreak(cardH + 4);

          outlineRect(ML, y, CW, cardH, C.slate2, 2);
          fillRect(ML, y, 3, cardH, C.purple, 1);

          font('bold', 9);
          text(`${idx + 1}.  ${proj.title || ''}`, ML + 5, y + 6, C.navy);
          font('normal', 7);
          const roleBadgeW = pdf.getTextWidth(proj.role || '') + 6;
          fillRect(PW - MR - roleBadgeW - 2, y + 2, roleBadgeW, 5.5, C.purpleLight, 2);
          text(proj.role || '', PW - MR - roleBadgeW + 0.5, y + 6.2, C.purple);

          font('normal', 7.5);
          let dy2 = y + 11;
          descLines.forEach(ln => { text(ln, ML + 5, dy2, C.slate6); dy2 += 4; });

          // Tech pills
          if (proj.technologies?.length) {
            let px2 = ML + 5;
            proj.technologies.forEach(t => {
              font('normal', 6.5);
              const tw = pdf.getTextWidth(t) + 5;
              if (px2 + tw > PW - MR) { dy2 += 5; px2 = ML + 5; }
              px2 = pill(t, px2, dy2, C.slate1, C.slate6);
            });
            dy2 += 4;
          }
          y += cardH + 4;
        });
        y += 2; hr(y); y += 8;
      }

      // ── Top roles ─────────────────────────────────────────────────────
      const topRoles = resumeData.top_roles || [];
      if (topRoles.length) {
        pageBreak(20);
        y = sectionHeader('Top role matches', y);
        topRoles.forEach((role, idx) => {
          pageBreak(18);
          const pctLabel = `${((role.score || 0) * 10).toFixed(0)}%`;
          font('normal', 7);
          const pctW = pdf.getTextWidth(pctLabel) + 2;
          const barW = CW * 0.38;               // shorter bar — leaves room for label inside card
          const rowH = 14;
          outlineRect(ML, y, CW, rowH, C.slate2, 2);

          font('bold', 9);
          text(`${idx + 1}.  ${role.role || ''}`, ML + 5, y + 5.5, C.navy);

          const conf = role.confidence || '';
          const confColor = conf === 'High' ? C.green : conf === 'Medium' ? C.amber : C.red;
          pill(conf, ML + 72, y + 3, scoreBg(conf === 'High' ? 85 : conf === 'Medium' ? 65 : 40), confColor);

          // bar + label — both inside card, right-aligned with MR margin
          const bx2 = PW - MR - barW - pctW - 4;
          const rolePct = Math.min((role.score || 0) / 10, 1);
          fillRect(bx2, y + 5.2, barW, 3, C.slate2, 1);
          if (rolePct > 0) fillRect(bx2, y + 5.2, barW * rolePct, 3, C.blue, 1);
          font('normal', 7);
          text(pctLabel, bx2 + barW + 2, y + 7.5, C.slate6);   // label sits right of bar, still inside card

          y += rowH + 3;
        });
        y += 2; hr(y); y += 8;
      }

      // ── Project improvements ──────────────────────────────────────────
      const projImprovements = improvements.project_improvements || [];
      if (projImprovements.length) {
        pageBreak(20);
        y = sectionHeader('Project improvement suggestions', y);
        projImprovements.forEach(item => {
          pageBreak(16);
          font('normal', 8);
          const issueLines = pdf.splitTextToSize(item.issue || '', CW - 10);
          const suggLines  = pdf.splitTextToSize(`Fix: ${item.suggestion || ''}`, CW - 10);
          const totalH = (issueLines.length + suggLines.length) * 4.2 + 10;
          outlineRect(ML, y, CW, totalH, C.slate2, 2);
          fillRect(ML, y, 3, totalH, C.red, 1);
          let dy2 = y + 5.5;
          font('bold', 7.5);
          issueLines.forEach(ln => { text(ln, ML + 6, dy2, C.red); dy2 += 4.2; });
          dy2 += 1;
          font('normal', 7.5);
          suggLines.forEach(ln => { text(ln, ML + 6, dy2, C.slate6); dy2 += 4.2; });
          y += totalH + 3;
        });
        y += 2; hr(y); y += 8;
      }

      // ── Summary improvements ──────────────────────────────────────────
      const sumImprovements = improvements.summary_improvements || [];
      if (sumImprovements.length) {
        pageBreak(20);
        y = sectionHeader('Summary improvements', y);
        sumImprovements.forEach(item => {
          pageBreak(10);
          font('normal', 8);
          const lines = pdf.splitTextToSize(`• ${item}`, CW - 4);
          lines.forEach(ln => { text(ln, ML + 4, y + 4, C.slate6); y += 4.5; });
          y += 2;
        });
      }

      addFooter();

      // ════════════════════════════════════════════════════════════════
      // PAGE 4 — ROADMAP (if data exists)
      // ════════════════════════════════════════════════════════════════
      const weeklyPlan = roadmap.weekly_plan || [];
      if (roadmap.roadmap_overview || weeklyPlan.length) {
        pdf.addPage();
        y = 22;
        addPageHeader();
        y = sectionHeader('Interview preparation roadmap', y);

        // Overview card
        if (roadmap.roadmap_overview) {
          pageBreak(20);
          outlineRect(ML, y, CW, 1, C.blueLight, 2);
          font('normal', 8.5);
          const ovLines = pdf.splitTextToSize(roadmap.roadmap_overview, CW - 8);
          const ovH = ovLines.length * 4.5 + 8;
          outlineRect(ML, y, CW, ovH, C.blueLight, 2);
          font('bold', 8); text('Overview', ML + 4, y + 5.5, C.blue);
          font('normal', 8);
          ovLines.forEach((ln, i) => text(ln, ML + 4, y + 10.5 + i * 4.5, C.slate6));
          y += ovH + 4;
          if (roadmap.total_duration) {
            font('bold', 8); text(`Total duration: `, ML, y + 4, C.navy);
            font('normal', 8); text(roadmap.total_duration, ML + pdf.getTextWidth('Total duration: '), y + 4, C.slate6);
            y += 8;
          }
          hr(y); y += 8;
        }

        // Weekly plan
        if (weeklyPlan.length) {
          weeklyPlan.forEach(week => {
            const focusLines = pdf.splitTextToSize(week.focus || '', CW - 30);
            const learnLines = pdf.splitTextToSize(
              Array.isArray(week.learning) ? week.learning.join(' • ') : (week.learning || ''), CW - 30);
            const practLines = pdf.splitTextToSize(
              Array.isArray(week.practice) ? week.practice.join(' • ') : (week.practice || ''), CW - 30);
            const delivLines = pdf.splitTextToSize(week.deliverables || '', CW - 30);

            const allRows = [
              { label: 'Focus',        lines: focusLines },
              { label: 'Learning',     lines: learnLines },
              { label: 'Practice',     lines: practLines },
              { label: 'Deliverables', lines: delivLines },
            ].filter(r => r.lines[0]);

            const innerH = allRows.reduce((acc, r) => acc + r.lines.length * 4 + 4, 0);
            const cardH = innerH + 14;
            pageBreak(cardH + 4);

            outlineRect(ML, y, CW, cardH, C.slate2, 2);
            // Header band
            fillRect(ML, y, CW, 11, C.navy, 2);
            font('bold', 9);
            text(`Week ${week.week}`, ML + 4, y + 7.5, C.white);
            if (week.focus) {
              font('normal', 8);
              const shortFocus = week.focus.slice(0, 55);
              text(shortFocus + (week.focus.length > 55 ? '…' : ''), ML + 28, y + 7.5, C.slate4);
            }

            let dy2 = y + 14;
            allRows.forEach(row => {
              font('bold', 7.5);
              text(row.label, ML + 4, dy2, C.blue);
              font('normal', 7.5);
              row.lines.forEach((ln, li) => {
                text(ln, ML + 26, dy2 + li * 4, C.slate6);
              });
              dy2 += row.lines.length * 4 + 4;
            });

            y += cardH + 4;
          });
        } else {
          // No weekly plan — show a nice "no roadmap yet" message
          pageBreak(30);
          outlineRect(ML, y, CW, 24, C.amberLight, 2);
          font('bold', 9);
          text('Weekly plan not generated yet', ML + 4, y + 8, C.amber);
          font('normal', 8);
          text('Focus on the improvements above to boost your score before requesting a roadmap.', ML + 4, y + 15, C.slate6);
          y += 28;
        }

        addFooter();
      }

      // ════════════════════════════════════════════════════════════════
      // Final page — closing note
      // ════════════════════════════════════════════════════════════════
      addFooter(); // safety net for last page

      pdf.save(`ResumeIQ_${(cleanedResume.personal_info?.name || 'Report').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("✅ Professional PDF report downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  // ========== SHARE: Improved Hybrid Approach ==========
  const handleShare = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      toast.info("Building your LinkedIn post card...");

      // ── Data prep ────────────────────────────────────────────────────
      const breakdown   = atsScore.breakdown || {};
      const maxMap      = { required_skills: 40, optional_skills: 20, education: 10, role_match: 10, experience_bonus: 10 };
      const bdEntries   = Object.keys(breakdown)
        .filter(k => k !== 'score' && k !== 'final_score')
        .map(k => {
          const item = breakdown[k];
          const val  = typeof item === 'object' ? (item.score || 0) : (item || 0);
          const max  = maxMap[k] || 20;
          return { label: k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()), val, max };
        });

      const matchedSkills = breakdown.required_skills?.matched || [];
      const topRoles      = resumeData.top_roles || [];
      const lift          = improvements.estimated_score_after_fix
        ? (improvements.estimated_score_after_fix - finalScore).toFixed(1)
        : null;
      const degree = cleanedResume.education?.[0]?.degree || '';
      const statusText = atsPassed ? 'PASSED ATS' : 'NEEDS IMPROVEMENT';
      const statusColor = atsPassed ? '#22c55e' : '#f59e0b';
      const statusBorder = atsPassed ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)';
      const statusBg    = atsPassed ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)';

      const barColor = (val, max) => {
        const pct = (val / max) * 100;
        return pct >= 80 ? '#22c55e' : pct >= 55 ? '#f59e0b' : '#ef4444';
      };
      const ringColor = finalScore >= 80 ? '#22c55e' : finalScore >= 60 ? '#f59e0b' : '#ef4444';

      // ── Build 1200×630 card ──────────────────────────────────────────
      const card = document.createElement('div');
      card.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1200px;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        border-radius: 0;
        overflow: hidden;
      `;

      card.innerHTML = `
        <!-- Top bar -->
        <div style="background:#0f172a;padding:28px 48px 24px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">ResumeIQ</div>
            <div style="font-size:14px;color:#94a3b8;margin-top:3px;">AI-Powered Resume Analysis</div>
          </div>
          <div style="font-size:13px;font-weight:700;padding:7px 20px;border-radius:30px;background:${statusBg};color:${statusColor};border:1px solid ${statusBorder};letter-spacing:0.3px;">
            ${statusText}
          </div>
        </div>

        <!-- Body -->
        <div style="display:flex;padding:32px 48px 28px;gap:32px;min-height:490px;">

          <!-- Left column -->
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:24px;">

            <!-- Candidate -->
            <div>
              <div style="font-size:26px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                ${cleanedResume.personal_info?.name || ''}
              </div>
              <div style="font-size:13px;color:#64748b;margin-top:4px;">
                ${cleanedResume.personal_info?.location || ''}${degree ? '  ·  ' + degree : ''}
              </div>
              <div style="display:inline-block;margin-top:10px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 14px;border-radius:30px;">
                ${resumeData.current_level || ''}
              </div>
            </div>

            <!-- Score breakdown bars -->
            <div>
              <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:12px;">Score breakdown</div>
              ${bdEntries.map(({ label, val, max }) => `
                <div style="margin-bottom:11px;">
                  <div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:4px;">
                    <span>${label}</span>
                    <span style="font-weight:600;color:#0f172a;">${val.toFixed(1)} / ${max}</span>
                  </div>
                  <div style="height:6px;background:#f1f5f9;border-radius:4px;overflow:hidden;">
                    <div style="width:${Math.min((val/max)*100,100)}%;height:100%;background:${barColor(val,max)};border-radius:4px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Matched skills -->
            ${matchedSkills.length ? `
              <div>
                <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:10px;">Matched skills</div>
                <div style="display:flex;flex-wrap:wrap;gap:7px;">
                  ${matchedSkills.map(s => `
                    <span style="font-size:12px;font-weight:500;padding:4px 12px;border-radius:30px;background:#dcfce7;color:#166534;">${s}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Vertical divider -->
          <div style="width:1px;background:#f1f5f9;flex-shrink:0;"></div>

          <!-- Right column -->
          <div style="width:220px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:24px;padding-top:8px;">

            <!-- Score ring (canvas drawn below via JS) -->
            <div>
              <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.7px;text-align:center;margin-bottom:12px;">ATS Score</div>
              <div style="position:relative;width:160px;height:160px;">
                <canvas id="__iq_ring__" width="160" height="160"></canvas>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                  <div style="font-size:32px;font-weight:700;color:#0f172a;letter-spacing:-1px;">${finalScore.toFixed(1)}%</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">out of 100</div>
                </div>
              </div>
            </div>

            <!-- Top role matches -->
            ${topRoles.length ? `
              <div style="width:100%;">
                <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:10px;">Top role matches</div>
                ${topRoles.map((r, i) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;${i < topRoles.length - 1 ? 'border-bottom:0.5px solid #f1f5f9;' : ''}">
                    <span style="font-size:13px;font-weight:500;color:#0f172a;">${r.role}</span>
                    <span style="font-size:11px;color:#94a3b8;">${r.confidence}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:12px;color:#94a3b8;">Generated via ResumeIQ  ·  resumeiq.app  ·  ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
          ${lift ? `<div style="font-size:12px;font-weight:700;color:#16a34a;background:#dcfce7;padding:5px 16px;border-radius:30px;">+${lift}pts potential after fixes</div>` : ''}
        </div>
      `;

      document.body.appendChild(card);

      // ── Draw score ring via canvas ───────────────────────────────────
      const ringCanvas = card.querySelector('#__iq_ring__');
      if (ringCanvas) {
        const ctx  = ringCanvas.getContext('2d');
        const cx2  = 80, cy2 = 80, radius = 64, lw2 = 10;
        const startA = -Math.PI / 2;
        const endA   = startA + (finalScore / 100) * 2 * Math.PI;

        // Track
        ctx.beginPath();
        ctx.arc(cx2, cy2, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = lw2;
        ctx.stroke();

        // Fill arc
        ctx.beginPath();
        ctx.arc(cx2, cy2, radius, startA, endA);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = lw2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── Capture ──────────────────────────────────────────────────────
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1200,
        height: card.scrollHeight,
      });

      document.body.removeChild(card);

      const imageDataUrl = canvas.toDataURL('image/png', 1.0);

      // ── Share / copy / download ──────────────────────────────────────
      if (navigator.share) {
        try {
          const blob = await (await fetch(imageDataUrl)).blob();
          const file = new File(
            [blob],
            `ResumeIQ_${(cleanedResume.personal_info?.name || 'Card').replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.png`,
            { type: 'image/png' }
          );
          await navigator.share({
            title: 'My ResumeIQ Resume Analysis',
            text: `I scored ${finalScore.toFixed(1)}% on my resume analysis with ResumeIQ!`,
            files: [file],
          });
          toast.success("Shared successfully!");
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      try {
        const blob = await (await fetch(imageDataUrl)).blob();
        if (navigator.clipboard?.write) {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          toast.success("Card copied to clipboard — paste it directly into LinkedIn!", { duration: 5000 });
        } else {
          throw new Error('no clipboard api');
        }
      } catch {
        const link = document.createElement('a');
        link.download = `ResumeIQ_${(cleanedResume.personal_info?.name || 'Card').replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = imageDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Card downloaded — ready to post on LinkedIn!");
      }

    } catch (err) {
      console.error('Share error:', err);
      toast.error("Failed to generate share card. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate("/upload")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Resume Analysis Results</h1>
            <p className="text-gray-500 text-sm truncate">
              {new Date().toLocaleDateString()} • Detailed breakdown
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
              isGenerating 
                ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download Report'}</span>
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
              isGenerating 
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Share2 size={18} />
            )}
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['overview', 'skills', 'experience', 'improvements', 'roadmap'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content - KEEP EXACTLY AS YOUR EXISTING CODE */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Score Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">ATS Score</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(finalScore)}`}>
                      {finalScore.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getScoreBg(finalScore)} flex items-center justify-center flex-shrink-0 ml-2`}>
                    <Award className={getScoreColor(finalScore)} size={20} />
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                      finalScore >= 80 ? 'bg-green-500' : 
                      finalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(finalScore, 100)}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {atsPassed ? (
                        <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                      ) : (
                        <XCircle className="text-red-500 flex-shrink-0" size={18} />
                      )}
                      <span className={`text-sm sm:text-base font-semibold truncate ${atsPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {atsPassed ? "Passed" : "Needs Improvement"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2">
                    <Target size={20} className="text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">
                  {atsPassed ? "Your resume meets requirements" : "Focus on improvements below"}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">Current Level</p>
                    <p className="text-sm sm:text-base font-semibold mt-1 truncate">
                      {resumeData.current_level?.slice(0, 25) || "N/A"}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 ml-2">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">Based on skills & experience</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">Top Roles</p>
                    <p className="text-sm font-semibold mt-1 truncate">
                      {resumeData.top_roles?.map(r => r.role).slice(0, 2).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 ml-2">
                    <Briefcase size={20} className="text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 truncate">Best matches for your profile</p>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3">Score Breakdown</h3>
                <div className="h-[200px] sm:h-[250px]">
                  {breakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" domain={[0, 20]} stroke="#6b7280" fontSize={10} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="#6b7280" 
                          fontSize={9} 
                          width={80}
                          tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [`${value}/20`, 'Score']}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 4, 4, 0]} 
                          barSize={20}
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      No breakdown data available
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3">Skills Radar</h3>
                <div className="h-[200px] sm:h-[250px]">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 8 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 8 }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value) => [`${value}/20`, 'Score']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      No radar data available
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ATS Score Breakdown - Detailed */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-500 flex-shrink-0" />
                ATS Score Breakdown
              </h2>
              <div className="space-y-4">
                {breakdownKeys
                  .filter((key) => key !== 'score' && key !== 'final_score')
                  .map((key) => {
                    const value = getBreakdownValue(key);
                    const percentage = (value / 20) * 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="capitalize truncate mr-2">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold flex-shrink-0">{value.toFixed(1)}/20</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              value >= 15 ? 'bg-green-500' :
                              value >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {breakdownKeys.length === 0 && (
                  <p className="text-gray-500 text-sm">No breakdown data available</p>
                )}
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500 flex-shrink-0" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">{cleanedResume.personal_info?.name || "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cleanedResume.personal_info?.email?.[0] || "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cleanedResume.personal_info?.phone?.[0] || "N/A"}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm sm:text-base">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{cleanedResume.personal_info?.location || "N/A"}</span>
                  </p>
                  {cleanedResume.personal_info?.linkedin && (
                    <p className="flex items-center gap-2 text-sm sm:text-base">
                      <Linkedin size={16} className="text-gray-400 flex-shrink-0" />
                      <a href={cleanedResume.personal_info.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        LinkedIn
                      </a>
                    </p>
                  )}
                  {cleanedResume.personal_info?.github && (
                    <p className="flex items-center gap-2 text-sm sm:text-base">
                      <Github size={16} className="text-gray-400 flex-shrink-0" />
                      <a href={cleanedResume.personal_info.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        GitHub
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Summary */}
            {cleanedResume.summary && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-blue-500 flex-shrink-0" />
                  Professional Summary
                </h2>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {cleanedResume.summary}
                </p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'skills' && (
          <>
            {/* Skills Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Code size={20} className="text-blue-500 flex-shrink-0" />
                  Technical Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cleanedResume.skills?.technical?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {(!cleanedResume.skills?.technical || cleanedResume.skills.technical.length === 0) && (
                  <p className="text-gray-500 text-sm">No technical skills listed</p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-500 flex-shrink-0" />
                  Soft Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cleanedResume.skills?.soft_skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {(!cleanedResume.skills?.soft_skills || cleanedResume.skills.soft_skills.length === 0) && (
                  <p className="text-gray-500 text-sm">No soft skills listed</p>
                )}
              </motion.div>
            </div>

            {/* Tools & Frameworks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Layers size={20} className="text-green-500 flex-shrink-0" />
                  Tools & Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cleanedResume.skills?.tools?.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs sm:text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                {(!cleanedResume.skills?.tools || cleanedResume.skills.tools.length === 0) && (
                  <p className="text-gray-500 text-sm">No tools listed</p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-orange-500 flex-shrink-0" />
                  Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cleanedResume.languages?.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs sm:text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                {(!cleanedResume.languages || cleanedResume.languages.length === 0) && (
                  <p className="text-gray-500 text-sm">No languages listed</p>
                )}
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'experience' && (
          <>
            {/* Education */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-blue-500 flex-shrink-0" />
                Education
              </h2>
              {cleanedResume.education?.map((edu, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
                  <h3 className="font-semibold text-base sm:text-lg">{edu.institution}</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{edu.degree}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {edu.start_year} - {edu.end_year} • GPA: {edu.gpa}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.field_of_study}</p>
                </div>
              ))}
              {(!cleanedResume.education || cleanedResume.education.length === 0) && (
                <p className="text-gray-500">No education listed</p>
              )}
            </motion.div>

            {/* Projects */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500 flex-shrink-0" />
                Projects ({cleanedResume.projects?.length || 0})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {cleanedResume.projects?.map((project, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{project.title}</h3>
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-xs flex-shrink-0">
                        {project.role}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies?.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-2">
                      {project.github_link && (
                        <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <Github size={14} /> GitHub
                        </a>
                      )}
                      {project.live_demo && (
                        <a href={project.live_demo} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink size={14} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {(!cleanedResume.projects || cleanedResume.projects.length === 0) && (
                  <p className="text-gray-500">No projects listed</p>
                )}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'improvements' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            {/* Critical Missing Skills */}
            {improvements.critical_missing_skills?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                  Critical Missing Skills
                </h2>
                <div className="space-y-3">
                  {improvements.critical_missing_skills.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-r-lg">
                      <p className="font-semibold text-sm sm:text-base">{item.skill}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Importance: {item.importance}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{item.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Skill Additions */}
            {improvements.recommended_skill_additions?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-yellow-500 flex-shrink-0" />
                  Recommended Skill Additions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {improvements.recommended_skill_additions.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <p className="font-semibold text-sm truncate">{item.skill}</p>
                      <p className={`text-xs font-medium mt-1 ${
                        item.importance === 'High' ? 'text-red-600' :
                        item.importance === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.importance} Priority
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Improvements */}
            {improvements.project_improvements?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Code size={20} className="text-blue-500 flex-shrink-0" />
                  Project Improvements
                </h2>
                <div className="space-y-3">
                  {improvements.project_improvements.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.issue}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{item.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Score After Fix */}
            {improvements.estimated_score_after_fix && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Estimated Score After Improvements</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Complete the recommendations above to achieve this score</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{improvements.estimated_score_after_fix}%</p>
                    <p className="text-xs sm:text-sm text-green-500">↑ +{(improvements.estimated_score_after_fix - finalScore).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock size={24} className="text-purple-500 flex-shrink-0" />
                Interview Roadmap
              </h2>
              
              {/* Roadmap Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <div>
                  <p className="text-sm"><strong>Total Duration:</strong> {roadmap.total_duration || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm"><strong>Overview:</strong> {roadmap.roadmap_overview || 'No overview available'}</p>
                </div>
              </div>

              {/* Weekly Plan */}
              {roadmap.weekly_plan?.length > 0 ? (
                <div className="space-y-4">
                  {roadmap.weekly_plan.map((week, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-r-xl transition-colors"
                    >
                      <h4 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                        Week {week.week}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Focus</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{week.focus}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Code size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Learning</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{week.learning}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target size={16} className="text-purple-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Practice</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{week.practice}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Deliverables</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{week.deliverables}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No weekly roadmap available yet.</p>
                  {finalScore >= 60 ? (
                    <p className="text-sm text-gray-400">Your resume is already strong! Focus on the improvements section for optimization.</p>
                  ) : (
                    <button
                      onClick={() => setActiveTab('improvements')}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
                    >
                      View Improvements
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      {finalScore < 60 && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
          <button
            onClick={() => setActiveTab('improvements')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
          >
            <Zap size={18} />
            Improve Your Score
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Analysis;