import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  API HELPER
// ══════════════════════════════════════════════════════════════════════════════
const API = process.env.REACT_APP_API_URL + "/api" || "http://localhost:5000/api";

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("pp_token");
  const res   = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Pacifico&family=Fredoka:wght@500;600;700&family=Poppins:wght@400;600;800&family=Inter:wght@800&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

  :root {
    --bg:           #F6F1E9;
    --green:        #CDE7BE;
    --green-dark:   #aed4a0;
    --green-teal:   #01C38E;
    --green-logo:   #1A4D2E;
    --pink:         #F7C8C8;
    --pink-bright:  #FF85A1;
    --pink-dark:    #D65A7F;
    --accent:       #FF85A1;
    --accent-dk:    #d47f90;
    --text:         #1a1a1a;
    --text-mid:     #6b5555;
    --text-muted:   #9e8b8b;
    --white:        #ffffff;
    --border:       #111111;
    --shadow:       6px 6px 0px #555;
    --shadow-sm:    4px 4px 0px #555;
    --shadow-lg:    8px 8px 0px #555;
    --shadow-card:  0 8px 40px rgba(232,157,170,.18);
    --radius:       10px;
    --radius-lg:    24px;
    --font-body:    'Nunito', sans-serif;
    --font-brand:   'Fredoka', sans-serif;
    --font-script:  'Pacifico', cursive;
    --font-poppins: 'Poppins', sans-serif;
    --font-inter:   'Inter', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
  }

  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-16px); }
  }
  @keyframes drift {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    50%      { transform: translate(8px,-14px) rotate(15deg); }
  }
  @keyframes slideIn {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes heroFadeUp {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes popIn {
    0%   { opacity:0; transform:scale(.85) translateY(12px); }
    70%  { transform:scale(1.03) translateY(-2px); }
    100% { opacity:1; transform:scale(1) translateY(0); }
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--pink); border-radius: 6px; }

  /* ── Navbar ── */
  .pp-navbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    background: var(--bg);
    border-bottom: 3px solid var(--border);
    position: sticky; top: 0; z-index: 200;
  }
  .pp-logo {
    font-family: var(--font-poppins); font-size: 1.8rem; font-weight: 800;
    color: var(--text); display: flex; align-items: center; gap: 6px;
    letter-spacing: 1px; line-height: 1;
    border: none; background: none; cursor: pointer;
  }
  .pp-nav-links { display: flex; align-items: center; gap: 1.8rem; }
  .pp-nav-link {
    font-weight: 600; font-size: .9rem; color: var(--text);
    border: none; background: none; cursor: pointer;
    font-family: var(--font-poppins); transition: color .2s;
    text-decoration: none;
  }
  .pp-nav-link:hover  { color: var(--green-logo); }
  .pp-nav-link.active { color: var(--green-logo); font-weight: 800; }

  /* ── Shared hero (listing pages) ── */
  .listing-hero {
    padding: 52px 40px 44px; text-align: center;
    position: relative; overflow: hidden;
    border-bottom: 3px solid var(--border);
  }
  .listing-hero h1 {
    font-family: var(--font-brand); font-size: 2.6rem;
    color: var(--text); margin-bottom: 10px; letter-spacing: -.5px;
  }
  .listing-hero p { font-size: 1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 30px; }
  .hero-deco {
    position: absolute; font-size: 2rem; opacity: .15;
    animation: drift 5s ease-in-out infinite;
  }

  /* ── Search bar ── */
  .search-wrap {
    display: flex; max-width: 540px; margin: 0 auto;
    background: var(--white); border-radius: var(--radius);
    box-shadow: var(--shadow); overflow: hidden; border: 3px solid var(--border);
  }
  .search-wrap input {
    flex: 1; border: none; outline: none; padding: 14px 22px;
    font-family: var(--font-body); font-size: .95rem; color: var(--text); background: transparent;
  }
  .search-wrap button {
    background: var(--accent); border: none; border-left: 3px solid var(--border);
    padding: 14px 24px; color: white; font-size: 1.1rem;
    cursor: pointer; transition: filter .2s; font-weight: 800;
  }
  .search-wrap button:hover { filter: brightness(1.08); }

  /* ── Filter bar ── */
  .filter-bar {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 40px; background: var(--white);
    border-bottom: 3px solid var(--border); flex-wrap: wrap;
  }
  .filter-label { font-size:.78rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:.8px; }
  .filter-select {
    padding: 8px 14px; border: 2px solid var(--border); border-radius: 6px;
    background: var(--bg); font-family: var(--font-body); font-size: .85rem;
    font-weight: 700; color: var(--text); outline: none; cursor: pointer;
    box-shadow: var(--shadow-sm); transition: box-shadow .2s;
  }
  .filter-select:focus { box-shadow: 6px 6px 0 #555; }
  .result-count { margin-left: auto; font-size: .82rem; font-weight: 800; color: var(--text-muted); }

  /* ── Verified badge ── */
  .verified-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: .75rem; font-weight: 800; color: #2e7d32;
    background: #e8f5e9; border: 2px solid #111;
    padding: 4px 12px; border-radius: 6px; flex-shrink: 0;
  }

  /* ── Empty state ── */
  .empty-state { text-align:center; padding:80px 20px; animation:fadeIn .3s; }
  .empty-state .e-emoji { font-size:4rem; margin-bottom:16px; }
  .empty-state h3 { font-family:var(--font-brand); color:var(--accent-dk); font-size:1.5rem; margin-bottom:8px; }
  .empty-state p  { font-weight:600; color:var(--text-muted); font-size:.9rem; }

  /* ── Status message ── */
  .status-msg {
    display:block; text-align:center; font-size:.85rem; font-weight:700;
    margin-top:10px; min-height:20px; border-radius:var(--radius);
    padding:0 6px; animation:fadeIn .25s;
  }
  .status-success { color:#4caf50; }
  .status-error   { color:#d9534f; }

  /* ── Divider ── */
  .divider { display:flex; align-items:center; gap:10px; margin:18px 0; }
  .divider::before,.divider::after { content:''; flex:1; height:1.5px; background:#f0e6e6; border-radius:2px; }
  .divider span { font-size:.75rem; color:var(--text-muted); font-weight:700; }

  /* ── Neo-brutal card (home page) ── */
  .brutal-card {
    background: white; border: 3px solid var(--border) !important;
    box-shadow: var(--shadow-lg) !important; border-radius: var(--radius) !important;
    transition: transform .2s, box-shadow .2s;
  }
  .brutal-card:hover { transform:translate(-3px,-3px); box-shadow:11px 11px 0 #555 !important; }

  /* ── Home: impact section ── */
  .pp-impact {
    background: var(--pink-bright); padding: 60px 0;
    border-top: 3px solid #555; border-bottom: 3px solid #555;
  }
  .metric-number {
    font-family: var(--font-inter); font-weight: 800; font-size: 3.5rem;
    color: var(--pink-dark); line-height: 1; display: block; margin-bottom: 10px;
  }
  .metric-label {
    font-family: var(--font-poppins); text-transform: uppercase;
    font-weight: 700; letter-spacing: 2px; font-size: .9rem; color: var(--border);
  }

  /* ── Home: pet cards ── */
  .pet-card {
    background: white; border: 3px solid var(--border);
    box-shadow: var(--shadow); border-radius: 15px; overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .pet-card:hover { transform:translate(-3px,-3px); box-shadow:9px 9px 0 #555; }
  .pet-image { height:250px; width:100%; object-fit:cover; border-bottom:3px solid var(--border); display:block; }
  .urgent-badge {
    background: var(--pink-bright); color: white; font-weight: 800;
    padding: 5px 15px; border: 2px solid var(--border); position: absolute;
    top: 15px; left: 15px; text-transform: uppercase; font-size: .8rem; border-radius: 4px;
  }

  /* ── Home: review cards ── */
  .review-card {
    background: var(--bg); border: 3px solid var(--border);
    box-shadow: var(--shadow); padding: 30px; border-radius: 20px;
    min-height: 280px; display: flex; flex-direction: column;
    justify-content: space-between;
    transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s;
    cursor: pointer;
  }
  .review-card:hover { transform:translate(-3px,-3px) scale(1.02); box-shadow:9px 9px 0 #555; }
  .reviewer-name {
    font-family: var(--font-inter); font-weight: 800; font-size: 1.1rem;
    color: var(--green-logo); margin-top: 16px; letter-spacing: -.03em;
  }

  /* ── About Us ── */
  .mission-card {
    border: 3px solid #555; box-shadow: var(--shadow-lg);
    border-radius: 25px; padding: 30px; height: 100%;
    display: flex; flex-direction: column; justify-content: center;
  }
  .credibility-box {
    background: var(--green); border: 3px solid #555;
    box-shadow: var(--shadow-lg); border-radius: 25px;
    padding: 30px; margin-top: 40px;
  }
  .team-card {
    background: white; border: 3px solid #555; box-shadow: var(--shadow);
    border-radius: 20px; padding: 25px; text-align: center;
    transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s, border-color .3s;
    cursor: pointer;
  }
  .team-card:hover {
    transform: translateY(-10px);
    box-shadow: 12px 12px 0 var(--green-logo);
    border-color: var(--green-logo);
  }

  /* ── Footer ── */
  .pp-footer { background: var(--bg); border-top: 3px solid var(--border); padding: 80px 0 40px; }
  .contact-info-box {
    background: var(--green); border: 3px solid var(--border);
    box-shadow: var(--shadow); padding: 40px; border-radius: 20px; height: 100%;
  }
  .contact-form-input {
    border: 3px solid var(--border) !important; border-radius: 12px !important;
    padding: 12px !important; margin-bottom: 20px; background: white;
    font-weight: 600; font-family: var(--font-poppins); font-size: .95rem;
    width: 100%; outline: none; transition: box-shadow .2s, border-color .2s;
    display: block;
  }
  .contact-form-input:focus { box-shadow: 4px 4px 0 var(--green-logo); border-color: var(--green-logo) !important; }
  .info-item { display:flex; align-items:center; margin-bottom:25px; }
  .info-icon {
    font-size:1.5rem; margin-right:20px; background:white;
    width:50px; height:50px; display:flex; align-items:center; justify-content:center;
    border:2px solid var(--border); border-radius:10px; flex-shrink:0;
  }

  /* ── Pets page specific ── */
  .pet-listing-card {
    background: var(--white); border: 3px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform .18s, box-shadow .18s;
    display: flex; flex-direction: column;
    animation: popIn .4s ease both;
  }
  .pet-listing-card:hover {
    transform: translate(-3px,-3px);
    box-shadow: 9px 9px 0 #555;
  }
  .pet-listing-img {
    width: 100%; height: 220px; object-fit: cover;
    border-bottom: 3px solid var(--border); display: block;
  }
  .pet-listing-img-placeholder {
    width: 100%; height: 220px;
    border-bottom: 3px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 5rem;
  }
  .tab-btn {
    padding: 12px 32px; font-family: var(--font-poppins); font-weight: 800;
    font-size: .95rem; border: 3px solid var(--border); cursor: pointer;
    transition: background .15s, box-shadow .15s, transform .15s;
    border-radius: 10px;
  }
  .tab-btn.active {
    background: var(--accent); color: white;
    box-shadow: 5px 5px 0 #555; transform: translate(-2px,-2px);
  }
  .tab-btn:not(.active) {
    background: var(--white); color: var(--text);
    box-shadow: var(--shadow-sm);
  }
  .tab-btn:not(.active):hover {
    background: var(--bg); box-shadow: 6px 6px 0 #555; transform: translate(-1px,-1px);
  }
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; padding: 20px; animation: fadeIn .2s;
  }
  .modal-box {
    background: var(--white); border: 3px solid var(--border);
    border-radius: 20px; box-shadow: 12px 12px 0 #333;
    max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto;
    animation: popIn .3s ease;
  }
  .interest-input {
    width: 100%; padding: 11px 14px; border: 2px solid var(--border);
    border-radius: 8px; font-family: var(--font-body); font-size: .9rem;
    background: var(--bg); outline: none; font-weight: 600;
    transition: border-color .2s, box-shadow .2s;
  }
  .interest-input:focus { border-color: var(--accent); box-shadow: 3px 3px 0 var(--accent-dk); }

  /* ── Utility ── */
  .pp-container { max-width:1160px; margin:0 auto; padding:0 24px; }
  .pp-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .pp-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
  .pp-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }

  @media(max-width:900px) {
    .pp-grid-3,.pp-grid-2,.pp-grid-4 { grid-template-columns:1fr; }
    .pp-nav-links { display:none; }
    .pp-navbar { padding:14px 20px; }
    .listing-hero { padding:36px 16px 32px; }
    .listing-hero h1 { font-size:2rem; }
    .filter-bar { padding:14px 16px; }
    .pp-impact .pp-grid-4 { grid-template-columns:repeat(2,1fr); }
  }
`;

const StyleTag = () => {
  useEffect(() => {
    if (document.getElementById("pp-app-css")) return;
    const s = document.createElement("style");
    s.id = "pp-app-css";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }, []);
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const inputStyle = (err) => ({
  width:"100%", paddingLeft:40, paddingRight:14, paddingTop:11, paddingBottom:11,
  border:`2px solid ${err ? "#d9534f" : "#e8d8d8"}`,
  borderRadius:"var(--radius)", fontFamily:"var(--font-body)",
  fontSize:".9rem", color:"var(--text)", background:"#fdf8f6", outline:"none",
  transition:"border-color .2s",
});
const labelStyle    = { fontSize:".82rem", fontWeight:700, display:"block", marginBottom:5 };
const iconStyle     = { position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", fontSize:"1rem" };
const pwdToggleStyle= { position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:"1rem", padding:4 };
const errStyle      = { color:"#d9534f", fontSize:".78rem", fontWeight:700, marginTop:4, display:"block" };
const primaryBtn    = (loading) => ({
  width:"100%", padding:12, background:"linear-gradient(135deg,var(--accent) 0%,#d47f90 100%)",
  color:"var(--white)", border:"none", borderRadius:"var(--radius)",
  fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:800,
  cursor: loading ? "not-allowed":"pointer", opacity: loading ? .75:1,
  boxShadow:"0 4px 18px rgba(232,157,170,.45)", transition:"transform .2s,filter .2s",
});

const tagBase   = { display:"inline-flex", alignItems:"center", gap:5, fontSize:".78rem", fontWeight:800, padding:"5px 14px", borderRadius:6, border:"2px solid var(--border)" };
const tagBaseSm = { display:"inline-flex", alignItems:"center", gap:5, fontSize:".72rem", fontWeight:800, padding:"3px 9px", borderRadius:5, border:"1.5px solid var(--border)" };

const Tag = ({ bg, color, children, sm }) => (
  <span style={{ ...(sm ? tagBaseSm : tagBase), background:bg, color }}>{children}</span>
);

const HoverBtn = ({ children, onClick, style = {} }) => {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding:"10px 28px", background:"var(--accent)", color:"var(--white)",
        border:"3px solid var(--border)", borderRadius:"var(--radius)",
        fontFamily:"var(--font-body)", fontSize:".875rem", fontWeight:800,
        cursor:"pointer", whiteSpace:"nowrap",
        boxShadow: h ? "6px 6px 0 #555" : "var(--shadow-sm)",
        transform: h ? "translate(-2px,-2px)" : "none",
        transition:"transform .15s,box-shadow .15s",
        ...style,
      }}
    >{children}</button>
  );
};

const BrutalBtn = ({ children, onClick, bg = "var(--pink-bright)", color = "white", style = {} }) => {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: bg, color, border:"3px solid var(--border)",
        fontWeight:800, fontFamily:"var(--font-poppins)", textTransform:"uppercase",
        cursor:"pointer", borderRadius:10,
        boxShadow: h ? "8px 8px 0 #555" : "4px 4px 0 #555",
        transform: h ? "translate(-2px,-2px)" : "none",
        transition:"transform .15s,box-shadow .15s",
        ...style,
      }}
    >{children}</button>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  NAVBAR
// ══════════════════════════════════════════════════════════════════════════════
const NAV = [
  { label:"Home",      page:"home" },
  { label:"About Us",  page:"about" },
  { label:"Adoptions", page:"pets" },
  { label:"NGOs",      page:"ngo" },
  { label:"Shop",      page:"shop" },
  { label:"Contact",   page:"contact" },
];

const Navbar = ({ page, setPage, currentUser, onLogout }) => {
  const scrollToContact = () => {
    const el = document.getElementById("pp-contact");
    if (el) { el.scrollIntoView({ behavior:"smooth" }); }
    else { setPage("home"); setTimeout(() => document.getElementById("pp-contact")?.scrollIntoView({ behavior:"smooth" }), 200); }
  };

  return (
    <nav className="pp-navbar">
      <button className="pp-logo" onClick={() => setPage("home")}>
        🐾 PAW<span style={{ color:"var(--green-logo)" }}>PATROL</span>
      </button>
      <div className="pp-nav-links">
        {NAV.map(n => (
          <button
            key={n.label}
            className={`pp-nav-link${page === n.page && n.label !== "Contact" ? " active" : ""}`}
            onClick={() => n.label === "Contact" ? scrollToContact() : setPage(n.page)}
          >{n.label}</button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
        {currentUser ? (
          <>
            <span style={{ fontFamily:"var(--font-poppins)", fontWeight:700, fontSize:".9rem", color:"var(--green-logo)" }}>
              👤 {currentUser.name}
            </span>
            <BrutalBtn onClick={onLogout} bg="var(--pink)" color="var(--border)" style={{ padding:"8px 20px", fontSize:".9rem" }}>
              Sign Out
            </BrutalBtn>
          </>
        ) : (
          <>
            <button className="pp-nav-link" style={{ fontWeight:700 }} onClick={() => setPage("login")}>Sign In</button>
            <BrutalBtn onClick={() => setPage("register")} style={{ padding:"8px 20px", fontSize:".9rem" }}>Register</BrutalBtn>
          </>
        )}
        <span style={{ fontSize:"1.5rem", cursor:"pointer" }}>🛒</span>
      </div>
    </nav>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════════════════════════════════════
const Footer = () => {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const set = k => e => setForm(v => ({ ...v, [k]:e.target.value }));
  const handleSend = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true); setForm({ name:"", email:"", subject:"", message:"" });
    setTimeout(() => setSent(false), 3000);
  };
  return (
    <footer className="pp-footer" id="pp-contact">
      <div className="pp-container">
        <div style={{ display:"flex", gap:40, alignItems:"stretch", flexWrap:"wrap" }}>
          <div style={{ flex:"0 0 38%", minWidth:280 }}>
            <div className="contact-info-box">
              <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"2rem", marginBottom:"1rem" }}>Get in Touch</h2>
              <p style={{ fontSize:"1rem", marginBottom:"2rem", lineHeight:1.6 }}>Have questions about adoption or reporting? Our team is here to help 24/7.</p>
              {[{ icon:"📍", title:"Location", val:"FAST-NUCES, Lahore, Pakistan" },{ icon:"📞", title:"Phone", val:"+92 300 1234567" },{ icon:"✉️", title:"Email", val:"hello@pawpatrol.org" }].map(i => (
                <div key={i.title} className="info-item">
                  <div className="info-icon">{i.icon}</div>
                  <div><h5 style={{ fontWeight:800, marginBottom:2, fontFamily:"var(--font-poppins)" }}>{i.title}</h5><p style={{ margin:0, color:"#444" }}>{i.val}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex:1, minWidth:280, paddingLeft:12 }}>
            <h3 style={{ fontFamily:"var(--font-inter)", fontWeight:800, fontSize:"1.7rem", letterSpacing:-1, marginBottom:"1.5rem" }}>SEND US A MESSAGE</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <input className="contact-form-input" placeholder="Your Name" value={form.name} onChange={set("name")} />
              <input className="contact-form-input" type="email" placeholder="Your Email" value={form.email} onChange={set("email")} />
            </div>
            <input className="contact-form-input" placeholder="Subject" value={form.subject} onChange={set("subject")} />
            <textarea className="contact-form-input" rows={5} placeholder="How can we help?" value={form.message} onChange={set("message")} style={{ resize:"vertical" }} />
            <BrutalBtn onClick={handleSend} bg={sent?"var(--green-teal)":"var(--border)"} style={{ width:"100%", padding:"14px", fontSize:"1.1rem", borderRadius:12, transition:"background .3s" }}>
              {sent ? "✓ MESSAGE SENT!" : "SEND MESSAGE 🐾"}
            </BrutalBtn>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:"3rem", paddingTop:"1.5rem", borderTop:"2px solid #ddd" }}>
          <p style={{ fontWeight:700, color:"#555", fontFamily:"var(--font-poppins)" }}>© 2026 PAWPATROL | FAST-NU Lahore Project</p>
        </div>
      </div>
    </footer>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
const AnimatedCounter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 50, inc = target / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur += inc;
          if (cur >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 1400 / steps);
      }
    }, { threshold:.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref} className="metric-number">{count}{suffix}</span>;
};

const METRICS   = [{ value:250, suffix:"+", label:"Pets Adopted 🏠" },{ value:120, suffix:"", label:"Cases Resolved 🛡️" },{ value:15, suffix:"", label:"Verified NGOs 🤝" },{ value:500, suffix:"+", label:"Active Heroes 🐾" }];
const ACT_CARDS = [
  { icon:"📢", title:"Report",  desc:"Found a case of animal abuse? Report it immediately to our verified NGOs.", btn:"Quick Report", bg:"var(--green-teal)", color:"white" },
  { icon:"🐶", title:"Adopt",   desc:"Browse through hundreds of pets waiting for their forever homes.",         btn:"View Pets",    bg:"var(--pink-bright)", color:"white" },
  { icon:"🤝", title:"Partner", desc:"Are you an NGO? Register with us to reach more potential adopters.",      btn:"NGO Directory",bg:"var(--green-teal)", color:"white" },
];
const HOME_PETS = [
  { name:"Buddy", breed:"Golden Retriever", age:"2 Years", urgent:true,  img:"https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg" },
  { name:"Luna",  breed:"Persian Cat",      age:"1 Year",  urgent:false, img:"https://images.pexels.com/photos/45201/kitty-cat-baby-psycho-45201.jpeg" },
  { name:"Max",   breed:"Beagle",           age:"5 Months",urgent:true,  img:"https://images.pexels.com/photos/1663413/pexels-photo-1663413.jpeg" },
];
const REVIEWS = [
  { stars:4, text:`"Adopting Max was the best decision of my life. The process was so transparent and the NGO was incredibly helpful!"`, name:"Sarah Ahmed" },
  { stars:5, text:`"PawPatrol makes it so easy to report strays in my area. I've seen two rescues happen just this month."`,            name:"Zain Malik" },
  { stars:5, text:`"The design is beautiful and the pet profiles are so detailed. Highly recommend to anyone looking to adopt!"`,        name:"Maria Khan" },
];
const HOW_STEPS = [
  { num:"01", icon:"🔍", title:"Browse Pets",    desc:"Search through hundreds of verified listings from trusted NGOs and shelters across Pakistan." },
  { num:"02", icon:"📋", title:"Submit Interest", desc:"Fill out a quick adoption form. No complicated paperwork — we keep things simple and transparent." },
  { num:"03", icon:"🤝", title:"Meet & Greet",    desc:"Visit the shelter or arrange a home visit. Spend time with your potential new family member." },
  { num:"04", icon:"🏡", title:"Welcome Home",    desc:"Complete the adoption, get your welcome kit, and bring your furry friend home forever." },
];
const CATEGORIES = [
  { label:"Dogs", emoji:"🐶", count:84, bg:"#fce9e9", border:"#f7c8c8" },
  { label:"Cats", emoji:"🐱", count:61, bg:"#e9f4e9", border:"#cde7be" },
  { label:"Birds",emoji:"🦜", count:23, bg:"#e9f0fd", border:"#c5d5f7" },
  { label:"Rabbits",emoji:"🐰",count:17,bg:"#fef5e7", border:"#fce9c2" },
  { label:"Others",emoji:"🐾",count:12, bg:"#f5e9fd", border:"#e4c5f7" },
];
const RECENT_RESCUES = [
  { name:"Bruno",    species:"Dog",   location:"Lahore",    story:"Found injured on Canal Road, now fully recovered and ready for a loving home.", emoji:"🐕", days:3 },
  { name:"Whiskers", species:"Cat",   location:"Karachi",   story:"Rescued from a drainage channel during monsoon floods. Sweet and gentle temperament.", emoji:"🐈", days:5 },
  { name:"Mango",    species:"Parrot",location:"Islamabad", story:"Surrendered by owner moving abroad. Talks a little and loves sunflower seeds.", emoji:"🦜", days:7 },
];

const HomePage = ({ setPage }) => (
  <div>
    <div style={{ height:"70vh", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", backgroundImage:"linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.62)),url('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg')", backgroundSize:"cover", backgroundPosition:"center", paddingBottom:"60px" }}>
      <div style={{ color:"white", textAlign:"center", maxWidth:860, padding:"0 24px", animation:"heroFadeUp .7s ease both" }}>
        <h1 style={{ fontSize:"clamp(2.4rem,5.5vw,4rem)", fontWeight:800, marginBottom:"1.2rem", lineHeight:1.08, fontFamily:"var(--font-poppins)" }}>Every Pet Deserves<br/>a Forever Home</h1>
        <p style={{ fontSize:"clamp(1rem,2vw,1.2rem)", marginBottom:"2.2rem", opacity:.9, fontFamily:"var(--font-poppins)", maxWidth:580, margin:"0 auto 2.2rem" }}>Connect with verified NGOs and shelters. Adopt, report cruelty, or partner with us to save more lives.</p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <BrutalBtn onClick={() => setPage("pets")} style={{ padding:"14px 40px", fontSize:"1.1rem", boxShadow:"4px 4px 0 #111" }}>🐶 Adopt a Pet</BrutalBtn>
          <BrutalBtn bg="rgba(255,255,255,.15)" color="white" onClick={() => setPage("ngo")} style={{ padding:"14px 40px", fontSize:"1.1rem", boxShadow:"4px 4px 0 rgba(0,0,0,.3)", border:"3px solid rgba(255,255,255,.5)", backdropFilter:"blur(8px)" }}>🤝 Find an NGO</BrutalBtn>
        </div>
      </div>
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {[["250+ Pets Adopted","🏠"],["15 Verified NGOs","✅"],["500+ Volunteers","💛"]].map(([t,e])=>(
          <div key={t} style={{ background:"rgba(255,255,255,.18)", backdropFilter:"blur(10px)", border:"1.5px solid rgba(255,255,255,.35)", borderRadius:50, padding:"8px 18px", color:"white", fontWeight:700, fontSize:".82rem", fontFamily:"var(--font-poppins)", display:"flex", alignItems:"center", gap:6 }}>{e} {t}</div>
        ))}
      </div>
    </div>

    <section style={{ padding:"64px 0 0" }}>
      <div className="pp-container">
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".5rem" }}>How Can We Help?</h2>
          <p style={{ color:"#888", fontWeight:600 }}>Three ways to make a difference today.</p>
        </div>
        <div className="pp-grid-3">
          {ACT_CARDS.map(c => (
            <div key={c.title} className="brutal-card" style={{ padding:36, display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:"3rem", marginBottom:12 }}>{c.icon}</div>
              <h3 style={{ fontFamily:"var(--font-poppins)", fontSize:"1.5rem", fontWeight:800, marginBottom:".75rem" }}>{c.title}</h3>
              <p style={{ color:"#666", marginBottom:"1.5rem", flex:1, lineHeight:1.7, fontSize:".95rem" }}>{c.desc}</p>
              <button onClick={()=>setPage("pets")} style={{ background:c.bg, color:c.color, border:"none", borderRadius:50, padding:"10px 30px", fontWeight:700, fontFamily:"var(--font-poppins)", fontSize:".9rem", cursor:"pointer" }}>{c.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="pp-impact" style={{ marginTop:64 }}>
      <div className="pp-container">
        <div className="pp-grid-4" style={{ textAlign:"center" }}>
          {METRICS.map(m => (
            <div key={m.label}><AnimatedCounter target={m.value} suffix={m.suffix} /><div className="metric-label">{m.label}</div></div>
          ))}
        </div>
      </div>
    </div>

    <section style={{ padding:"64px 0" }}>
      <div className="pp-container">
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".5rem" }}>Browse by Animal</h2>
          <p style={{ color:"#888", fontWeight:600 }}>Find the perfect companion for your lifestyle.</p>
        </div>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          {CATEGORIES.map(c => (
            <div key={c.label} onClick={() => setPage("pets")} style={{ background:c.bg, border:`3px solid ${c.border}`, borderRadius:16, padding:"28px 36px", textAlign:"center", cursor:"pointer", boxShadow:"var(--shadow)", transition:"transform .18s,box-shadow .18s", minWidth:130, flex:"0 0 auto" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="8px 8px 0 #555";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="var(--shadow)";}}
            >
              <div style={{ fontSize:"2.8rem", marginBottom:8 }}>{c.emoji}</div>
              <div style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1rem" }}>{c.label}</div>
              <div style={{ fontSize:".78rem", fontWeight:700, color:"#888", marginTop:4 }}>{c.count} available</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ padding:"20px 0 64px", background:"var(--white)", borderTop:"3px solid var(--border)", borderBottom:"3px solid var(--border)" }}>
      <div className="pp-container">
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".5rem", marginTop:"2.5rem" }}>How Adoption Works</h2>
          <p style={{ color:"#888", fontWeight:600 }}>Simple, transparent, and built on trust.</p>
        </div>
        <div className="pp-grid-4">
          {HOW_STEPS.map((s,i) => (
            <div key={s.num} style={{ position:"relative", textAlign:"center", padding:"0 12px" }}>
              {i < HOW_STEPS.length-1 && <div style={{ position:"absolute", top:36, left:"60%", width:"80%", height:3, background:"var(--border)", zIndex:0, borderTop:"3px dashed #ccc" }} />}
              <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--bg)", border:"3px solid var(--border)", boxShadow:"var(--shadow-sm)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", margin:"0 auto 16px", position:"relative", zIndex:1 }}>{s.icon}</div>
              <div style={{ fontFamily:"var(--font-inter)", fontWeight:800, fontSize:"2rem", color:"var(--pink-bright)", lineHeight:1, marginBottom:6 }}>{s.num}</div>
              <h4 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.05rem", marginBottom:8 }}>{s.title}</h4>
              <p style={{ fontSize:".88rem", color:"#888", lineHeight:1.65, fontWeight:600 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ padding:"64px 0" }}>
      <div className="pp-container">
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"2.5rem", flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".4rem" }}>Meet Our Friends</h2>
            <p style={{ color:"#888", fontWeight:600 }}>Urgent cases looking for a loving family today.</p>
          </div>
          <BrutalBtn bg="var(--green)" color="#111" onClick={() => setPage("pets")} style={{ padding:"10px 28px", fontSize:".9rem", boxShadow:"4px 4px 0 #555" }}>View All Pets →</BrutalBtn>
        </div>
        <div className="pp-grid-3">
          {HOME_PETS.map(p => (
            <div key={p.name} className="pet-card" style={{ position:"relative" }}>
              {p.urgent && <span className="urgent-badge">Urgent</span>}
              <img src={p.img} alt={p.name} className="pet-image" />
              <div style={{ padding:"18px 16px 20px" }}>
                <h4 style={{ fontWeight:800, marginBottom:".25rem", fontFamily:"var(--font-poppins)", fontSize:"1.1rem" }}>{p.name}</h4>
                <p style={{ color:"#888", marginBottom:"1rem", fontSize:".9rem" }}>{p.breed} • {p.age}</p>
                <button onClick={() => setPage("pets")} style={{ background:"var(--pink-bright)", color:"white", border:"none", borderRadius:50, padding:"10px 0", fontWeight:700, fontFamily:"var(--font-poppins)", width:"100%", cursor:"pointer" }}>Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ padding:"20px 0 64px", background:"var(--white)", borderTop:"3px solid var(--border)", borderBottom:"3px solid var(--border)" }}>
      <div className="pp-container" style={{ paddingTop:48 }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".5rem" }}>🚨 Recent Rescues</h2>
          <p style={{ color:"#888", fontWeight:600 }}>Animals rescued in the last week — they need you now.</p>
        </div>
        <div className="pp-grid-3">
          {RECENT_RESCUES.map((r,i) => (
            <div key={r.name} style={{ background:"var(--bg)", border:"3px solid var(--border)", borderRadius:16, overflow:"hidden", boxShadow:"var(--shadow)", animation:"slideIn .4s ease both", animationDelay:`${i*.1}s` }}>
              <div style={{ background:"linear-gradient(135deg,var(--pink),var(--green))", height:120, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"4rem", borderBottom:"3px solid var(--border)" }}>{r.emoji}</div>
              <div style={{ padding:"20px 22px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <h4 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.15rem" }}>{r.name}</h4>
                  <span style={{ fontSize:".72rem", fontWeight:800, background:"var(--pink)", color:"var(--pink-dark)", border:"2px solid var(--border)", borderRadius:50, padding:"3px 10px" }}>{r.days}d ago</span>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <Tag bg="#eef7e8" color="#4a7c59" sm>{r.species}</Tag>
                  <Tag bg="#fdf0f5" color="var(--accent-dk)" sm>📍 {r.location}</Tag>
                </div>
                <p style={{ fontSize:".88rem", color:"#666", lineHeight:1.65, fontWeight:600, marginBottom:16 }}>{r.story}</p>
                <HoverBtn style={{ width:"100%", textAlign:"center" }} onClick={()=>{}}>Express Interest</HoverBtn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ padding:"64px 0" }}>
      <div className="pp-container">
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.6rem)", marginBottom:".5rem" }}>Happy Tails ❤️</h2>
          <p style={{ color:"#888", fontWeight:600 }}>Stories from families who found their best friends here.</p>
        </div>
        <div className="pp-grid-3">
          {REVIEWS.map((r,i) => (
            <div key={i} className="review-card">
              <div>
                <div style={{ color:"#FFD700", fontSize:"1.2rem", marginBottom:12 }}>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</div>
                <p style={{ fontSize:"1rem", lineHeight:1.7, color:"#333", fontFamily:"var(--font-poppins)" }}>{r.text}</p>
              </div>
              <h4 className="reviewer-name">{r.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ margin:"0 0 64px", background:"linear-gradient(135deg,var(--green-logo) 0%,#2d7a4f 100%)", border:"3px solid var(--border)", padding:"60px 40px", textAlign:"center" }}>
      <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color:"white", marginBottom:".75rem" }}>Ready to Change a Life? 🐾</h2>
      <p style={{ color:"rgba(255,255,255,.85)", fontWeight:600, fontSize:"1.05rem", marginBottom:"2rem", maxWidth:520, margin:"0 auto 2rem" }}>Every adoption frees up space for another rescue. Be someone's whole world.</p>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <BrutalBtn onClick={() => setPage("pets")} bg="white" color="var(--green-logo)" style={{ padding:"14px 40px", fontSize:"1.05rem", boxShadow:"4px 4px 0 rgba(0,0,0,.3)" }}>🐶 Browse Pets</BrutalBtn>
        <BrutalBtn onClick={() => setPage("register")} bg="var(--pink-bright)" style={{ padding:"14px 40px", fontSize:"1.05rem", boxShadow:"4px 4px 0 rgba(0,0,0,.3)" }}>✍️ Create Account</BrutalBtn>
      </div>
    </section>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  PETS PAGE — fetches live from API
// ══════════════════════════════════════════════════════════════════════════════
const SPECIES_EMOJI = { Dog:"🐕", Cat:"🐱", Bird:"🦜", Rabbit:"🐰" };

const InterestModal = ({ pet, onClose, currentUser, setPage }) => {
  const [form, setForm]         = useState({ name:"", email:"", phone:"", message:"" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const set = k => e => setForm(v=>({...v,[k]:e.target.value}));

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    if (!currentUser) { onClose(); setPage("login"); return; }
    setLoading(true); setError("");
    try {
      await apiFetch("/adoptions", {
        method: "POST",
        body: JSON.stringify({ pet_id: pet.pet_id }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,var(--pink),var(--green))", padding:"28px 32px 20px", borderBottom:"3px solid var(--border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.5rem" }}>Express Interest 🐾</div>
              <div style={{ fontWeight:600, color:"var(--text-mid)", marginTop:4 }}>Interested in adopting <strong>{pet.pet_name}</strong>?</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer", color:"var(--text)" }}>✕</button>
          </div>
        </div>
        <div style={{ padding:"28px 32px" }}>
          {submitted ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:"4rem", marginBottom:16 }}>🎉</div>
              <h3 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.4rem", marginBottom:10 }}>Request Sent!</h3>
              <p style={{ color:"var(--text-mid)", fontWeight:600, lineHeight:1.6 }}>
                The NGO will contact you within 24–48 hours. We're rooting for you and {pet.pet_name}!
              </p>
              <HoverBtn onClick={onClose} style={{ marginTop:20 }}>Close</HoverBtn>
            </div>
          ) : (
            <>
              {!currentUser && (
                <div style={{ background:"#fff3cd", border:"2px solid #ffc107", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:".88rem", fontWeight:700 }}>
                  ⚠️ You need to <button onClick={()=>{onClose();setPage("login");}} style={{ color:"var(--accent-dk)", fontWeight:800, background:"none", border:"none", cursor:"pointer" }}>sign in</button> to submit an adoption request.
                </div>
              )}
              <div style={{ display:"grid", gap:14, marginBottom:16 }}>
                <div>
                  <label style={{ ...labelStyle, marginBottom:6 }}>Your Full Name *</label>
                  <input className="interest-input" placeholder="Jane Doe" value={form.name} onChange={set("name")} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom:6 }}>Email Address *</label>
                    <input className="interest-input" type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom:6 }}>Phone Number</label>
                    <input className="interest-input" placeholder="+92 300 0000000" value={form.phone} onChange={set("phone")} />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom:6 }}>Tell us about your home & lifestyle</label>
                  <textarea className="interest-input" rows={4} placeholder="Do you have a yard? Other pets? Kids?" value={form.message} onChange={set("message")} style={{ resize:"vertical" }} />
                </div>
              </div>
              {error && <p style={{ ...errStyle, marginBottom:10 }}>⚠️ {error}</p>}
              <HoverBtn onClick={handleSubmit} style={{ width:"100%", textAlign:"center", padding:"12px", opacity: loading ? .7:1 }}>
                {loading ? "Submitting…" : "Send Adoption Request 🐾"}
              </HoverBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PetListingCard = ({ pet, idx, onAdopt }) => {
  const [hovered, setHovered] = useState(false);
  const healthColors = { "Vaccinated":"#eef7e8","Neutered":"#e8f0fd","Spayed":"#e8f0fd","Dewormed":"#fff8e1","Microchipped":"#f3e5f5","Vet-checked":"#e0f7fa","Under treatment":"#fff3e0","Recovering":"#fce4ec","Healthy":"#e8f5e9","Parasite-free":"#eef7e8","Malnourished":"#fff3cd","Bottle-raised":"#fce9c2" };
  const healthText   = { "Vaccinated":"#2e7d32","Neutered":"#283593","Spayed":"#283593","Dewormed":"#8a6400","Microchipped":"#6a1b9a","Vet-checked":"#006064","Under treatment":"#e65100","Recovering":"#880e4f","Healthy":"#1b5e20","Parasite-free":"#2e7d32","Malnourished":"#856404","Bottle-raised":"#6a4a00" };

  // Normalise DB rows to match display fields
  const name     = pet.pet_name  || pet.name;
  const species  = pet.category  || pet.species;
  const emoji    = SPECIES_EMOJI[species] || "🐾";

  return (
    <div
      className="pet-listing-card"
      style={{ animationDelay:`${idx * 0.06}s` }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
    >
      <div style={{ position:"relative" }}>
        {pet.img
          ? <img src={pet.img} alt={name} className="pet-listing-img" />
          : <div className="pet-listing-img-placeholder" style={{ background:"linear-gradient(135deg,var(--pink),var(--green))" }}>{emoji}</div>
        }
        <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          {pet.urgent && (
            <span style={{ background:"var(--pink-bright)", color:"white", fontWeight:800, fontSize:".7rem", padding:"4px 10px", border:"2px solid var(--border)", borderRadius:5, textTransform:"uppercase" }}>Urgent</span>
          )}
        </div>
      </div>

      <div style={{ padding:"18px 18px 20px", display:"flex", flexDirection:"column", flex:1, gap:10 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
          <div>
            <h3 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.2rem", lineHeight:1.2 }}>{name}</h3>
            <p style={{ color:"var(--text-muted)", fontSize:".82rem", fontWeight:700, marginTop:2 }}>{pet.breed}</p>
          </div>
          {pet.gender && (
            <span style={{ background:"var(--bg)", border:"2px solid var(--border)", borderRadius:6, padding:"3px 10px", fontSize:".72rem", fontWeight:900, whiteSpace:"nowrap", color:"var(--text-mid)" }}>
              {pet.gender === "Male" ? "♂" : pet.gender === "Female" ? "♀" : "?"} {pet.gender}
            </span>
          )}
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {pet.location && <Tag bg="#fdf0f5" color="var(--accent-dk)" sm>📍 {pet.location}</Tag>}
          {species      && <Tag bg="#eef7e8" color="#4a7c59" sm>🐾 {species}</Tag>}
          {pet.age      && <Tag bg="var(--bg)" color="var(--text-muted)" sm>⏱ {pet.age} yr{pet.age !== 1 ? "s":""}</Tag>}
        </div>

        <p style={{ fontSize:".85rem", color:"#555", lineHeight:1.65, fontWeight:600, flex:1 }}>{pet.description}</p>

        {pet.owner_name && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"var(--bg)", borderRadius:8, border:"2px solid var(--border)" }}>
            <span style={{ fontSize:"1.2rem" }}>🤝</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:".68rem", fontWeight:900, color:"var(--text-muted)", textTransform:"uppercase" }}>Listed by</div>
              <div style={{ fontSize:".82rem", fontWeight:800, color:"var(--green-logo)" }}>{pet.owner_name}</div>
            </div>
            <span style={{ fontSize:".68rem", fontWeight:800, color:"#2e7d32", background:"#e8f5e9", border:"1.5px solid #111", padding:"3px 8px", borderRadius:4 }}>✓ Verified</span>
          </div>
        )}

        <button
          onClick={() => onAdopt(pet)}
          style={{
            marginTop:4, padding:"12px 0", width:"100%",
            background:"var(--green-logo)",
            color:"white", border:"3px solid var(--border)", borderRadius:10,
            fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:".9rem", cursor:"pointer",
            boxShadow: hovered ? "6px 6px 0 #333" : "var(--shadow-sm)",
            transform: hovered ? "translate(-2px,-2px)" : "none",
            transition:"transform .15s,box-shadow .15s",
          }}
        >
          🏡 Adopt Me
        </button>
      </div>
    </div>
  );
};

const PetsPage = ({ currentUser, setPage }) => {
  const [pets, setPets]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch]     = useState("");
  const [species, setSpecies]   = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy]     = useState("default");
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchPets = async () => {
    setLoading(true); setApiError("");
    try {
      const params = new URLSearchParams();
      if (search)   params.append("search",   search);
      if (species)  params.append("species",  species);
      if (location) params.append("location", location);
      const data = await apiFetch(`/pets?${params}`);
      setPets(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, []); // eslint-disable-line

  const filtered = [...pets].sort((a,b) => {
    if (sortBy === "name") return (a.pet_name||"").localeCompare(b.pet_name||"");
    return 0;
  });

  return (
    <div>
      <div className="listing-hero" style={{ background:"linear-gradient(120deg,#fce9e9 0%,#d8efca 55%,#fce9c2 100%)" }}>
        {["🐶","🐱","🐰","🦜"].map((e,i) => <span key={i} className="hero-deco" style={{ top:`${[15,60,15,65][i]}%`, [i<2?"left":"right"]:i%2===0?"4%":"6%", animationDelay:`${[0,1,.5,1.5][i]}s` }}>{e}</span>)}
        <div style={{ position:"relative", zIndex:1 }}>
          <h1>Find Your Forever Friend</h1>
          <p>Browse pets available for adoption from our verified NGO partners.</p>
          <div className="search-wrap">
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchPets()} placeholder="Search by name, breed, or keyword…" />
            <button type="button" onClick={fetchPets}><i className="bi bi-search" /></button>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <span className="filter-label">Filter:</span>
        <select className="filter-select" value={species} onChange={e=>{setSpecies(e.target.value);}}>
          <option value="">All Species</option>
          <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option>
        </select>
        <select className="filter-select" value={location} onChange={e=>{setLocation(e.target.value);}}>
          <option value="">All Cities</option>
          <option>Lahore</option><option>Karachi</option><option>Islamabad</option>
        </select>
        <select className="filter-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
        <button onClick={fetchPets} style={{ padding:"8px 18px", background:"var(--green-logo)", color:"white", border:"2px solid var(--border)", borderRadius:6, fontWeight:800, fontSize:".82rem", cursor:"pointer", boxShadow:"var(--shadow-sm)" }}>
          🔍 Apply
        </button>
        {(search||species||location) && (
          <button onClick={()=>{setSearch("");setSpecies("");setLocation("");setTimeout(fetchPets,50);}} style={{ padding:"7px 14px", background:"var(--pink)", border:"2px solid var(--border)", borderRadius:6, fontWeight:800, fontSize:".8rem", cursor:"pointer" }}>
            ✕ Clear
          </button>
        )}
        <span className="result-count">{filtered.length} pet{filtered.length!==1?"s":""} found</span>
      </div>

      <div style={{ padding:"28px 40px 64px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:80 }}>
            <div style={{ fontSize:"3rem", animation:"float 1s ease-in-out infinite" }}>🐾</div>
            <p style={{ fontWeight:700, color:"var(--text-muted)", marginTop:12 }}>Loading pets…</p>
          </div>
        ) : apiError ? (
          <div className="empty-state">
            <div className="e-emoji">⚠️</div>
            <h3>Couldn't load pets</h3>
            <p>{apiError}</p>
            <p style={{ marginTop:8, fontSize:".8rem" }}>Make sure the backend server is running on port 5000.</p>
            <HoverBtn onClick={fetchPets} style={{ marginTop:20 }}>Try Again</HoverBtn>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="e-emoji">🐾</div>
            <h3>No pets match your search</h3>
            <p>Try removing some filters or searching with different keywords.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:24 }}>
            {filtered.map((pet, i) => (
              <PetListingCard key={pet.pet_id} pet={pet} idx={i} onAdopt={setSelectedPet} />
            ))}
          </div>
        )}
      </div>

      {selectedPet && (
        <InterestModal pet={selectedPet} onClose={() => setSelectedPet(null)} currentUser={currentUser} setPage={setPage} />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ABOUT US PAGE
// ══════════════════════════════════════════════════════════════════════════════
const MISSION_CARDS = [
  { title:"Our Origin", bg:"var(--pink-bright)", color:"white", text:"PawPatrol was formed by a group of people passionate about saving animal lives and solving the issues of stray neglect in our city." },
  { title:"Our Goal",   bg:"white",              color:"var(--text)", text:"Our primary goal is to ensure every animal is taken care of, providing a voice for those who cannot speak for themselves." },
  { title:"Our Mission",bg:"var(--pink-bright)", color:"white", text:"We work tirelessly to ensure every animal gets a loving home and the medical attention they deserve through a verified network." },
];
const TEAM = [
  { name:"Noorhan",       role:"Lead Visionary",    emoji:"👩‍💼" },
  { name:"Syeda Farheen", role:"Frontend Architect", emoji:"👩‍🎨" },
  { name:"Manal Muneer",  role:"Backend Developer",  emoji:"👩‍💻" },
  { name:"Fatima Imran",  role:"Backend Developer",  emoji:"👩‍💻" },
];

const AboutPage = () => (
  <div style={{ padding:"60px 0" }}>
    <div className="pp-container">
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <h1 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(2.5rem,6vw,4rem)", marginBottom:".5rem" }}>Who We Are</h1>
        <p style={{ fontSize:"1.1rem", color:"#888", fontWeight:600 }}>The humans behind the paws.</p>
      </div>
      <div className="pp-grid-3">
        {MISSION_CARDS.map(c => (
          <div key={c.title} className="mission-card" style={{ background:c.bg, color:c.color }}>
            <h3 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.25rem", marginBottom:"1rem" }}>{c.title}</h3>
            <p style={{ lineHeight:1.7, margin:0 }}>{c.text}</p>
          </div>
        ))}
      </div>
      <div className="credibility-box">
        <h3 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.25rem", marginBottom:"1rem" }}>Why Trust Us?</h3>
        <p style={{ margin:0, lineHeight:1.7 }}>While we are a student-led initiative currently growing our official licensing, we operate with full transparency. Every NGO on our platform is personally vetted, and our real-time reporting system is built on a foundation of integrity and immediate action for animal welfare.</p>
      </div>
      <div style={{ marginTop:"5rem", textAlign:"center" }}>
        <h2 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"clamp(1.8rem,4vw,3rem)", marginBottom:"2.5rem" }}>The Team Behind It All</h2>
        <div className="pp-grid-2">
          {TEAM.map(m => (
            <div key={m.name} className="team-card">
              <div style={{ width:100, height:100, borderRadius:"50%", border:"3px solid #555", margin:"0 auto 15px", background:"linear-gradient(135deg,var(--pink),var(--green))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem" }}>{m.emoji}</div>
              <h4 style={{ fontFamily:"var(--font-poppins)", fontWeight:800, fontSize:"1.1rem", marginBottom:4 }}>{m.name}</h4>
              <p style={{ color:"#888", margin:0, fontWeight:600 }}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN / REGISTER  — wired to API
// ══════════════════════════════════════════════════════════════════════════════
const LoginPage = ({ setPage, onLoginSuccess }) => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    return e;
  };

  const handleLogin = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true); setStatus(null);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("pp_token", data.token);
      localStorage.setItem("pp_user",  JSON.stringify(data.user));
      setStatus({ type:"success", msg:`🐾 Welcome back, ${data.user.name}! Redirecting…` });
      onLoginSuccess(data.user);
      setTimeout(() => setPage("home"), 900);
    } catch (err) {
      setStatus({ type:"error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"calc(100vh - 72px)", display:"flex", background:"var(--bg)" }}>
      <aside style={{ flex:"0 0 50%", background:"linear-gradient(160deg,#d8efca 0%,#f7dce0 60%,#fce9c2 100%)", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:40, textAlign:"center" }}>
        {[8,22,55,72,88].map((t,i) => <span key={i} style={{ position:"absolute", fontSize:"1.6rem", opacity:.18, top:`${t}%`, left:`${[12,70,15,60,30][i]}%`, animation:`drift 6s ease-in-out infinite`, animationDelay:`${[0,1.2,2.4,.8,1.8][i]}s` }}>🐾</span>)}
        <div style={{ fontSize:"6rem", animation:"float 3s ease-in-out infinite" }}>🐾</div>
        <div style={{ fontFamily:"var(--font-script)", fontSize:"2rem", color:"var(--accent-dk)", lineHeight:1.3 }}>Welcome back to<br/>the family 🏡</div>
        <div style={{ fontSize:"1rem", color:"var(--text-muted)", fontWeight:600, maxWidth:280 }}>Sign in to find, adopt, and care for your perfect furry friend.</div>
        <div style={{ display:"flex", gap:16, fontSize:"2.2rem", marginTop:8 }}>
          {["🐶","🐰","🐹","🦜"].map((a,i) => <span key={i} style={{ animation:`float ${[2.8,3.2,2.6,3.5][i]}s ease-in-out infinite`, animationDelay:`${[0,.4,.8,.2][i]}s` }}>{a}</span>)}
        </div>
      </aside>
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 20px" }}>
        <div style={{ width:"100%", maxWidth:420, background:"var(--white)", borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-card)", padding:"44px 36px 36px" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            <div style={{ width:82, height:82, borderRadius:"50%", background:"linear-gradient(135deg,var(--pink),var(--green))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.6rem", animation:"float 3.5s ease-in-out infinite", border:"3px solid var(--white)", outline:"3px solid var(--accent)" }}>🐾</div>
          </div>
          <h1 style={{ fontFamily:"var(--font-script)", fontSize:"1.7rem", color:"var(--accent-dk)", textAlign:"center", marginBottom:4 }}>Welcome Back!</h1>
          <p style={{ textAlign:"center", fontSize:".85rem", color:"var(--text-muted)", fontWeight:600, marginBottom:28 }}>Sign in to your Paw Patrol account 🌸</p>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position:"relative" }}><i className="bi bi-envelope-fill" style={iconStyle} /><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErrors(v=>({...v,email:null}));}} placeholder="you@email.com" style={inputStyle(!!errors.email)} /></div>
            {errors.email && <span style={errStyle}>{errors.email}</span>}
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position:"relative" }}><i className="bi bi-lock-fill" style={iconStyle} /><input type={showPwd?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setErrors(v=>({...v,password:null}));}} placeholder="••••••••" style={inputStyle(!!errors.password)} /><button type="button" onClick={()=>setShowPwd(v=>!v)} style={pwdToggleStyle} tabIndex={-1}><i className={`bi ${showPwd?"bi-eye-slash-fill":"bi-eye-fill"}`}/></button></div>
            {errors.password && <span style={errStyle}>{errors.password}</span>}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, fontSize:".85rem", fontWeight:600 }}>
            <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:"var(--accent)" }} /> Remember me</label>
            <a href="#" style={{ color:"var(--accent-dk)", fontWeight:700, fontSize:".82rem", textDecoration:"none" }}>Forgot password?</a>
          </div>
          <button onClick={handleLogin} disabled={loading} style={primaryBtn(loading)}>{loading?"Signing in…":"🐾  Sign In"}</button>
          {status && <span className={`status-msg status-${status.type}`}>{status.msg}</span>}
          <div className="divider"><span>or</span></div>
          <p style={{ textAlign:"center", fontSize:".85rem", color:"var(--text-muted)", fontWeight:600 }}>New to Paw Patrol?{" "}<button onClick={()=>setPage("register")} style={{ color:"var(--accent-dk)", fontWeight:800, border:"none", background:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:".85rem" }}>Create an account 🐱</button></p>
        </div>
      </main>
    </div>
  );
};

const RegisterPage = ({ setPage, onLoginSuccess }) => {
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirmPassword:"", location:"", role:"" });
  const [terms, setTerms]     = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(v=>({...v,[k]:e.target.value}));

  // Map display role values to DB values
  const ROLE_MAP = { "User":"user", "ShopOwner":"shop_owner", "NGO":"ngo" };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!form.location.trim()) e.location = "Location is required.";
    if (!form.role) e.role = "Please select a role.";
    if (!terms) e.terms = "You must accept the Terms & Conditions.";
    return e;
  };

  const handleRegister = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true); setStatus(null);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name:     form.fullName,
          email:    form.email,
          password: form.password,
          role:     ROLE_MAP[form.role] || form.role,
          location: form.location,
        }),
      });
      localStorage.setItem("pp_token", data.token);
      localStorage.setItem("pp_user",  JSON.stringify(data.user));
      setStatus({ type:"success", msg:`🐾 Welcome, ${data.user.name}! Account created.` });
      onLoginSuccess(data.user);
      setTimeout(() => setPage("home"), 900);
    } catch (err) {
      setStatus({ type:"error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"calc(100vh - 72px)", display:"flex", background:"var(--bg)" }}>
      <aside style={{ flex:"0 0 50%", background:"linear-gradient(160deg,#d8efca 0%,#f7dce0 60%,#fce9c2 100%)", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:40, textAlign:"center" }}>
        {[8,22,55,72,88].map((t,i) => <span key={i} style={{ position:"absolute", fontSize:"1.6rem", opacity:.18, top:`${t}%`, left:`${[12,70,15,60,30][i]}%`, animation:`drift 6s ease-in-out infinite`, animationDelay:`${[0,1.2,2.4,.8,1.8][i]}s` }}>🐾</span>)}
        <div style={{ fontSize:"6rem", animation:"float 3s ease-in-out infinite" }}>🐾</div>
        <div style={{ fontFamily:"var(--font-script)", fontSize:"2rem", color:"var(--accent-dk)", lineHeight:1.3 }}>Join the family<br/>today 🏡</div>
        <div style={{ fontSize:"1rem", color:"var(--text-muted)", fontWeight:600, maxWidth:280 }}>Create an account to adopt, foster, and connect with pet lovers.</div>
        <div style={{ display:"flex", gap:16, fontSize:"2.2rem", marginTop:8 }}>
          {["🐶","🐱","🐰","🦜"].map((a,i) => <span key={i} style={{ animation:`float ${[2.8,3.2,2.6,3.5][i]}s ease-in-out infinite`, animationDelay:`${[0,.4,.8,.2][i]}s` }}>{a}</span>)}
        </div>
      </aside>
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:500, background:"var(--white)", borderRadius:"var(--radius-lg)", boxShadow:"var(--shadow-card)", padding:"44px 36px 36px" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            <div style={{ width:82, height:82, borderRadius:"50%", background:"linear-gradient(135deg,var(--green),var(--pink))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.6rem", animation:"float 3.5s ease-in-out infinite", border:"3px solid var(--white)", outline:"3px solid var(--accent)" }}>🐾</div>
          </div>
          <h1 style={{ fontFamily:"var(--font-script)", fontSize:"1.7rem", color:"var(--accent-dk)", textAlign:"center", marginBottom:4 }}>Create Account</h1>
          <p style={{ textAlign:"center", fontSize:".85rem", color:"var(--text-muted)", fontWeight:600, marginBottom:28 }}>Join the Paw Patrol family today 🌸</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            <div><label style={labelStyle}>Full Name</label><div style={{ position:"relative" }}><i className="bi bi-person-fill" style={iconStyle}/><input value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" style={inputStyle(!!errors.fullName)}/></div>{errors.fullName&&<span style={errStyle}>{errors.fullName}</span>}</div>
            <div><label style={labelStyle}>Email Address</label><div style={{ position:"relative" }}><i className="bi bi-envelope-fill" style={iconStyle}/><input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" style={inputStyle(!!errors.email)}/></div>{errors.email&&<span style={errStyle}>{errors.email}</span>}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            <div><label style={labelStyle}>Password</label><div style={{ position:"relative" }}><i className="bi bi-lock-fill" style={iconStyle}/><input type={showPwd?"text":"password"} value={form.password} onChange={set("password")} placeholder="••••••••" style={inputStyle(!!errors.password)}/><button type="button" onClick={()=>setShowPwd(v=>!v)} style={pwdToggleStyle} tabIndex={-1}><i className={`bi ${showPwd?"bi-eye-slash-fill":"bi-eye-fill"}`}/></button></div>{errors.password&&<span style={errStyle}>{errors.password}</span>}</div>
            <div><label style={labelStyle}>Confirm Password</label><div style={{ position:"relative" }}><i className="bi bi-shield-lock-fill" style={iconStyle}/><input type={showCPwd?"text":"password"} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" style={inputStyle(!!errors.confirmPassword)}/><button type="button" onClick={()=>setShowCPwd(v=>!v)} style={pwdToggleStyle} tabIndex={-1}><i className={`bi ${showCPwd?"bi-eye-slash-fill":"bi-eye-fill"}`}/></button></div>{errors.confirmPassword&&<span style={errStyle}>{errors.confirmPassword}</span>}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            <div><label style={labelStyle}>Location</label><div style={{ position:"relative" }}><i className="bi bi-geo-alt-fill" style={iconStyle}/><input value={form.location} onChange={set("location")} placeholder="City, Country" style={inputStyle(!!errors.location)}/></div>{errors.location&&<span style={errStyle}>{errors.location}</span>}</div>
            <div><label style={labelStyle}>I am a...</label><div style={{ position:"relative" }}><i className="bi bi-people-fill" style={iconStyle}/><select value={form.role} onChange={set("role")} style={{ ...inputStyle(!!errors.role), appearance:"none" }}><option value="">— Select Role —</option><option value="User">🐾 Pet Adopter (User)</option><option value="ShopOwner">🛒 Shop Owner</option><option value="NGO">🤝 NGO / Rescue</option></select></div>{errors.role&&<span style={errStyle}>{errors.role}</span>}</div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
            <input type="checkbox" checked={terms} onChange={e=>{setTerms(e.target.checked);setErrors(v=>({...v,terms:null}));}} style={{ marginTop:3, accentColor:"var(--accent)", cursor:"pointer" }}/>
            <label style={{ fontSize:".83rem", fontWeight:600, color:"var(--text-mid)", cursor:"pointer", lineHeight:1.5 }}>I agree to the <a href="#" style={{ color:"var(--accent-dk)", fontWeight:800 }}>Terms & Conditions</a> and <a href="#" style={{ color:"var(--accent-dk)", fontWeight:800 }}>Privacy Policy</a>.</label>
          </div>
          {errors.terms && <span style={{ ...errStyle, display:"block", marginBottom:10 }}>{errors.terms}</span>}
          <button onClick={handleRegister} disabled={loading} style={{ ...primaryBtn(loading), marginTop:8 }}>{loading?"Creating account…":"🐾  Create My Account"}</button>
          {status && <span className={`status-msg status-${status.type}`}>{status.msg}</span>}
          <div className="divider"><span>or</span></div>
          <p style={{ textAlign:"center", fontSize:".85rem", color:"var(--text-muted)", fontWeight:600 }}>Already part of the family?{" "}<button onClick={()=>setPage("login")} style={{ color:"var(--accent-dk)", fontWeight:800, border:"none", background:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontSize:".85rem" }}>Sign in here 🐶</button></p>
        </div>
      </main>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  NGO PAGE
// ══════════════════════════════════════════════════════════════════════════════
const NGO_DATA = [
  { id:1, name:"Todd's Welfare Society (TWS)", location:"Lahore", focus:"Animal Rescue", verified:true, website:"https://toddswelfaresociety.pk/", instagram:"https://instagram.com/tws.pk", phone:"0321 4674957", services:["Animal Rescue","Shelter","TNVR","Medical Care","Adoption"], desc:"Provides rescue, treatment, and shelter for injured and abused animals, along with rehabilitation and long-term care. One of Lahore's most active animal welfare organisations running a full TNVR programme alongside their adoption services." },
  { id:2, name:"Edhi Foundation Animal Hostel", location:"Karachi", focus:"Shelter", verified:true, website:"https://www.edhi.org/edhi-animal-hostel", instagram:"https://instagram.com/edhiorg", phone:"+92 21 32413232", services:["Animal Rescue","Shelter","Medical Care","Adoption"], desc:"Backed by the legendary Edhi Foundation, this animal hostel provides care, shelter, and medical treatment for abandoned and injured animals across Karachi." },
  { id:3, name:"ACF Animal Rescue", location:"Karachi", focus:"Animal Rescue", verified:true, website:"https://www.acfanimalrescue.org/", instagram:"https://instagram.com/acfanimalrescue", phone:"021 33409100", services:["Animal Rescue","Shelter","Medical Care","Adoption"], desc:"The Ayesha Chundrigar Foundation rescues abused and injured animals across Karachi and provides full rehabilitation, treatment, and adoption support." },
  { id:4, name:"PAWS – Pakistan Animal Welfare Society", location:"Karachi", focus:"Adoption", verified:true, website:"https://pawspakistan.org/", instagram:null, phone:null, services:["Animal Rescue","Shelter","Adoption","Awareness"], desc:"PAWS works for animal rescue and promotes the adoption and humane treatment of animals throughout Pakistan." },
  { id:5, name:"Animal Care Association Pakistan (ACAP)", location:"Islamabad", focus:"Animal Rescue", verified:false, website:null, instagram:null, phone:null, services:["Animal Rescue","Shelter","Medical Care","Adoption"], desc:"Provides rescue and rehabilitation services for injured and abandoned animals in Islamabad and the surrounding region." },
  { id:6, name:"CDRS Benji Project", location:"Karachi", focus:"TNVR", verified:false, website:null, instagram:null, phone:null, services:["Animal Rescue","TNVR","Emergency Care","Shelter"], desc:"Focused on stray animal population control through Trap-Neuter-Vaccinate-Return (TNVR) and emergency rescue services in Karachi." },
  { id:7, name:"JFK Animal Rescue and Shelter", location:"Lahore", focus:"Animal Rescue", verified:false, website:null, instagram:null, phone:null, services:["Animal Rescue","Shelter","Medical Care","Adoption"], desc:"Rescues injured and street animals across Lahore and provides shelter, veterinary treatment, and adoption support." },
  { id:8, name:"SPCA Lahore", location:"Lahore", focus:"Shelter", verified:true, website:null, instagram:null, phone:null, services:["Animal Rescue","Shelter","Adoption","Medical Care"], desc:"One of Pakistan's oldest animal welfare bodies, SPCA Lahore prevents cruelty and provides rescue, shelter, and adoption services across the city." },
  { id:9, name:"Foster Stray Animal Rescue (FSA)", location:"Islamabad", focus:"Adoption", verified:false, website:null, instagram:null, phone:null, services:["Animal Rescue","Shelter","Adoption"], desc:"FSA focuses on fostering and rehoming stray animals in Islamabad through a network of compassionate volunteer foster families." },
];

const NGOCard = ({ n, idx }) => {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ display:"flex", background:"var(--white)", borderRadius:"var(--radius)", border:"3px solid var(--border)", boxShadow:h?"8px 8px 0 #555":"var(--shadow)", transform:h?"translate(-2px,-2px)":"none", transition:"transform .18s,box-shadow .18s", overflow:"hidden", minHeight:180, animation:"slideIn .38s ease both", animationDelay:`${idx*.07}s` }}>
      <div style={{ flex:"0 0 25%", display:"flex", alignItems:"center", justifyContent:"center", padding:"28px 20px", borderRight:"3px solid var(--border)", background:"var(--bg)" }}>
        <div style={{ width:110, height:110, borderRadius:12, border:"2px solid var(--border)", boxShadow:"var(--shadow-sm)", background:"var(--white)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.6rem" }}>🐾</div>
      </div>
      <div style={{ flex:1, padding:"26px 32px 24px", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
          <div style={{ fontSize:"1.25rem", fontWeight:900, color:"var(--text)", letterSpacing:"-.3px", lineHeight:1.2 }}>{n.name}</div>
          {n.verified && <span className="verified-badge"><i className="bi bi-patch-check-fill" /> Verified</span>}
        </div>
        <div style={{ fontSize:".9rem", color:"var(--text-mid)", fontWeight:600, lineHeight:1.7 }}>{n.desc}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Tag bg="#fdf0f5" color="var(--accent-dk)"><i className="bi bi-geo-alt-fill" /> {n.location}</Tag>
            <Tag bg="#eef7e8" color="#4a7c59">🐾 {n.focus}</Tag>
            <Tag bg="var(--bg)" color="var(--text-muted)">NGO / Rescue</Tag>
            {n.phone    && <Tag bg="var(--bg)" color="var(--text-muted)"><i className="bi bi-telephone-fill" /> {n.phone}</Tag>}
            {n.website  && <a href={n.website}  target="_blank" rel="noopener" style={{ ...tagBase, background:"#f0f4ff", color:"#3a5fd9", textDecoration:"none" }}><i className="bi bi-globe2" /> Website</a>}
            {n.instagram&& <a href={n.instagram} target="_blank" rel="noopener" style={{ ...tagBase, background:"#f0f4ff", color:"#3a5fd9", textDecoration:"none" }}><i className="bi bi-instagram" /> Instagram</a>}
          </div>
          <HoverBtn>View Profile</HoverBtn>
        </div>
      </div>
    </div>
  );
};

const NGOPage = () => {
  const [search, setSearch]     = useState("");
  const [location, setLocation] = useState("");
  const [focus, setFocus]       = useState("");
  const filtered = NGO_DATA.filter(n => {
    const q = search.toLowerCase().trim();
    return (!q||n.name.toLowerCase().includes(q)||n.desc.toLowerCase().includes(q))&&(!location||n.location===location)&&(!focus||n.focus===focus||n.services.includes(focus));
  });
  return (
    <div>
      <div className="listing-hero" style={{ background:"linear-gradient(120deg,#d8efca 0%,#f7dce0 55%,#fce9c2 100%)" }}>
        {["🤝","🏠","🐾","💛"].map((e,i) => <span key={i} className="hero-deco" style={{ top:`${[18,55,18,60][i]}%`, [i<2?"left":"right"]:i%2===0?"6%":"4%", animationDelay:`${[0,1,.5,1.5][i]}s` }}>{e}</span>)}
        <div style={{ position:"relative", zIndex:1 }}>
          <h1>Rescues &amp; NGOs</h1>
          <p>Organisations working tirelessly to give every animal a second chance.</p>
          <div className="search-wrap"><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or description…" /><button type="button"><i className="bi bi-search" /></button></div>
        </div>
      </div>
      <div className="filter-bar">
        <span className="filter-label">Filter:</span>
        <select className="filter-select" value={location} onChange={e=>setLocation(e.target.value)}><option value="">All Cities</option><option>Lahore</option><option>Karachi</option><option>Islamabad</option></select>
        <select className="filter-select" value={focus} onChange={e=>setFocus(e.target.value)}><option value="">All Focus Areas</option><option>Animal Rescue</option><option>Shelter</option><option>TNVR</option><option>Adoption</option></select>
        <span className="result-count">{filtered.length} organisation{filtered.length!==1?"s":""} found</span>
      </div>
      <div style={{ padding:"32px 40px 64px", display:"flex", flexDirection:"column", gap:20 }}>
        {filtered.length===0 ? <div className="empty-state"><div className="e-emoji">🤝</div><h3>No NGOs found</h3><p>Try a different city or search term.</p></div> : filtered.map((n,i)=><NGOCard key={n.id} n={n} idx={i}/>)}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  SHOP PAGE
// ══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = [
  { id:1,  name:"Royal Canin Adult Dog Food (2kg)", shop:"PetZone",     city:"Lahore",    category:"Food & Nutrition",  petType:"Dogs",  price:2800, originalPrice:null, rating:5, badge:"hot",  badgeLabel:"Best Seller", emoji:"🦮" },
  { id:2,  name:"Professional Grooming Kit",        shop:"PawCare",     city:"Karachi",   category:"Grooming",          petType:"Dogs",  price:1500, originalPrice:1850, rating:4, badge:"sale", badgeLabel:"20% OFF",     emoji:"✂️" },
  { id:3,  name:"Interactive Puzzle Toy Set",       shop:"Furry Friends",city:"Islamabad",category:"Toys & Accessories",petType:"Dogs",  price:950,  originalPrice:null, rating:5, badge:"new",  badgeLabel:"New",         emoji:"🎾" },
  { id:4,  name:"Premium Cat Kibble – Persian",     shop:"PetZone",     city:"Lahore",    category:"Food & Nutrition",  petType:"Cats",  price:1900, originalPrice:null, rating:5, badge:null,   badgeLabel:null,          emoji:"🐱" },
  { id:5,  name:"Orthopedic Pet Bed (Large)",       shop:"PawCare",     city:"Karachi",   category:"Bedding & Housing", petType:"Dogs",  price:3200, originalPrice:3800, rating:4, badge:"sale", badgeLabel:"15% OFF",     emoji:"🛏️" },
  { id:6,  name:"Parrot Seed Mix (1kg)",            shop:"Bird World",  city:"Lahore",    category:"Food & Nutrition",  petType:"Birds", price:650,  originalPrice:null, rating:4, badge:null,   badgeLabel:null,          emoji:"🦜" },
  { id:7,  name:"Cat Dental Chews (Pack of 30)",    shop:"VetMart",     city:"Islamabad", category:"Healthcare",        petType:"Cats",  price:800,  originalPrice:null, rating:5, badge:"new",  badgeLabel:"New",         emoji:"🦷" },
  { id:8,  name:"Aquarium Starter Kit (60L)",       shop:"Aqua World",  city:"Karachi",   category:"Bedding & Housing", petType:"Fish",  price:5500, originalPrice:6200, rating:4, badge:"sale", badgeLabel:"Sale",        emoji:"🐟" },
  { id:9,  name:"Dog Anti-Tick Shampoo (500ml)",    shop:"PetZone",     city:"Lahore",    category:"Healthcare",        petType:"Dogs",  price:600,  originalPrice:null, rating:4, badge:null,   badgeLabel:null,          emoji:"🧴" },
  { id:10, name:"Retractable Leash & Harness Set",  shop:"Furry Friends",city:"Islamabad",category:"Toys & Accessories",petType:"Dogs",  price:1250, originalPrice:null, rating:5, badge:"hot",  badgeLabel:"Popular",     emoji:"🦮" },
  { id:11, name:"Feather Wand Cat Toy",             shop:"PawCare",     city:"Karachi",   category:"Toys & Accessories",petType:"Cats",  price:350,  originalPrice:null, rating:4, badge:null,   badgeLabel:null,          emoji:"🪶" },
  { id:12, name:"Cage Parrot Swing & Perch Set",    shop:"Bird World",  city:"Lahore",    category:"Toys & Accessories",petType:"Birds", price:420,  originalPrice:null, rating:5, badge:"new",  badgeLabel:"New",         emoji:"🦜" },
];
const SHOPS = [
  { name:"PetZone",      city:"Lahore",    verified:true,  emoji:"🏪", desc:"Lahore's largest pet retail chain with 150+ products spanning all categories.", categories:["Food & Nutrition","Healthcare","Grooming","Toys & Accessories"], phone:"0300 1234567" },
  { name:"PawCare",      city:"Karachi",   verified:true,  emoji:"🐾", desc:"A premium grooming and accessories store in Karachi.", categories:["Grooming","Bedding & Housing","Toys & Accessories"], phone:"0321 9876543" },
  { name:"Furry Friends", city:"Islamabad", verified:true,  emoji:"🐕", desc:"Islamabad's go-to boutique pet shop specialising in enrichment toys and training accessories.", categories:["Toys & Accessories","Grooming"], phone:null },
  { name:"VetMart",      city:"Islamabad", verified:false, emoji:"💊", desc:"Healthcare-focused pet supply store alongside a registered veterinary clinic.", categories:["Healthcare","Food & Nutrition"], phone:"051 2345678" },
  { name:"Bird World",   city:"Lahore",    verified:false, emoji:"🦜", desc:"The go-to destination for bird enthusiasts in Lahore.", categories:["Food & Nutrition","Toys & Accessories","Bedding & Housing"], phone:null },
  { name:"Aqua World",   city:"Karachi",   verified:false, emoji:"🐟", desc:"Specialist aquatics store offering starter kits, fish tanks, filters, and live fish.", categories:["Bedding & Housing","Food & Nutrition"], phone:"0333 1122334" },
];
const BADGE_STYLES = { sale:{ background:"#fce9c2", color:"#b8860b" }, new:{ background:"var(--green)", color:"#3a5f25" }, hot:{ background:"var(--pink)", color:"var(--accent-dk)" } };

const Chip = ({ active, onClick, children }) => (
  <div onClick={onClick} style={{ fontSize:".78rem", fontWeight:800, padding:"6px 13px", border:"2px solid var(--border)", borderRadius:6, background:active?"var(--accent)":"var(--bg)", color:active?"white":"var(--text-muted)", borderColor:active?"var(--accent-dk)":"var(--border)", cursor:"pointer", transition:"background .15s,color .15s", whiteSpace:"nowrap" }}>{children}</div>
);

const ProductCard = ({ p, idx }) => {
  const [h,setH]=useState(false);
  const [added,setAdded]=useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"3px solid var(--border)", boxShadow:h?"8px 8px 0 #555":"var(--shadow)", transform:h?"translate(-2px,-2px)":"none", transition:"transform .18s,box-shadow .18s", overflow:"hidden", display:"flex", flexDirection:"column", position:"relative", animation:"slideIn .38s ease both", animationDelay:`${idx*.06}s` }}>
      <div style={{ height:170, background:"var(--bg)", borderBottom:"3px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.5rem", position:"relative" }}>
        {p.emoji}
        {p.badge&&<span style={{ position:"absolute", top:10, left:10, fontSize:".68rem", fontWeight:900, padding:"4px 10px", border:"2px solid var(--border)", borderRadius:5, textTransform:"uppercase", letterSpacing:".5px", ...BADGE_STYLES[p.badge] }}>{p.badgeLabel}</span>}
      </div>
      <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", flex:1, gap:6 }}>
        <div style={{ fontSize:".95rem", fontWeight:900, lineHeight:1.25 }}>{p.name}</div>
        <div style={{ fontSize:".78rem", fontWeight:700, color:"var(--text-muted)" }}><i className="bi bi-shop"/> {p.shop}</div>
        <div style={{ fontSize:".8rem", color:"#f0a500", fontWeight:800 }}>{"★".repeat(p.rating)}{"☆".repeat(5-p.rating)}</div>
        <div><span style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--accent-dk)" }}>Rs {p.price.toLocaleString()}</span>{p.originalPrice&&<span style={{ fontSize:".8rem", fontWeight:700, color:"var(--text-muted)", textDecoration:"line-through", marginLeft:4 }}>Rs {p.originalPrice.toLocaleString()}</span>}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:2 }}>
          <Tag bg="#fdf0f5" color="var(--accent-dk)" sm>📍 {p.city}</Tag>
          <Tag bg="#eef7e8" color="#4a7c59" sm>{p.category}</Tag>
          <Tag bg="var(--bg)" color="var(--text-muted)" sm>{p.petType}</Tag>
        </div>
        <button onClick={()=>{setAdded(true);setTimeout(()=>setAdded(false),1500);}} style={{ marginTop:"auto", padding:"10px 0", background:added?"var(--green-dark)":"var(--accent)", color:"var(--white)", border:"2px solid var(--border)", borderRadius:7, fontFamily:"var(--font-body)", fontSize:".85rem", fontWeight:900, cursor:"pointer", width:"100%", transition:"background .2s" }}>
          {added?"✓ Added!":<><i className="bi bi-bag-fill"/> Shop Now</>}
        </button>
      </div>
    </div>
  );
};

const ShopCard = ({ s, idx }) => {
  const [h,setH]=useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ display:"flex", background:"var(--white)", borderRadius:"var(--radius)", border:"3px solid var(--border)", boxShadow:h?"8px 8px 0 #555":"var(--shadow)", transform:h?"translate(-2px,-2px)":"none", transition:"transform .18s,box-shadow .18s", overflow:"hidden", minHeight:150, animation:"slideIn .38s ease both", animationDelay:`${idx*.07}s` }}>
      <div style={{ flex:"0 0 160px", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 18px", borderRight:"3px solid var(--border)", background:"var(--bg)", fontSize:"3.2rem" }}>{s.emoji}</div>
      <div style={{ flex:1, padding:"22px 28px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
          <div style={{ fontSize:"1.2rem", fontWeight:900 }}>{s.name}</div>
          {s.verified&&<span className="verified-badge"><i className="bi bi-patch-check-fill"/> Verified</span>}
        </div>
        <div style={{ fontSize:".88rem", color:"var(--text-mid)", fontWeight:600, lineHeight:1.65 }}>{s.desc}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Tag bg="#fdf0f5" color="var(--accent-dk)">📍 {s.city}</Tag>
            {s.categories.map(c=><Tag key={c} bg="#eef7e8" color="#4a7c59">🛍️ {c}</Tag>)}
            {s.phone&&<Tag bg="var(--bg)" color="var(--text-muted)"><i className="bi bi-telephone-fill"/> {s.phone}</Tag>}
          </div>
          <HoverBtn>View Shop</HoverBtn>
        </div>
      </div>
    </div>
  );
};

const ShopPage = () => {
  const [view, setView]         = useState("grid");
  const [search, setSearch]     = useState("");
  const [city, setCity]         = useState("");
  const [category, setCategory] = useState("");
  const [pet, setPet]           = useState("");

  const filteredProducts = PRODUCTS.filter(p => {
    const q=search.toLowerCase().trim();
    return (!q||p.name.toLowerCase().includes(q)||p.shop.toLowerCase().includes(q))&&(!city||p.city===city)&&(!category||p.category===category)&&(!pet||p.petType===pet);
  });
  const filteredShops = SHOPS.filter(s => {
    const q=search.toLowerCase().trim();
    return (!q||s.name.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q))&&(!city||s.city===city)&&(!category||s.categories.includes(category));
  });
  const resultText=view==="grid"?`${filteredProducts.length} product${filteredProducts.length!==1?"s":""} found`:`${filteredShops.length} shop${filteredShops.length!==1?"s":""} found`;

  const TogBtn=({v,icon})=>(<button onClick={()=>setView(v)} style={{ padding:"7px 13px", border:"2px solid var(--border)", borderRadius:6, background:view===v?"var(--accent)":"var(--bg)", color:view===v?"white":"var(--text)", fontSize:"1rem", cursor:"pointer", boxShadow:"var(--shadow-sm)", transition:"background .15s" }}><i className={`bi ${icon}`}/></button>);

  return (
    <div>
      <div className="listing-hero" style={{ background:"linear-gradient(120deg,#fce9c2 0%,#f7dce0 50%,#d8efca 100%)" }}>
        {["🛒","🐾","🏪","✨"].map((e,i)=><span key={i} className="hero-deco" style={{ top:`${[18,55,18,60][i]}%`, [i<2?"left":"right"]:i%2===0?"6%":"4%", animationDelay:`${[0,1,.5,1.5][i]}s` }}>{e}</span>)}
        <div style={{ position:"relative", zIndex:1 }}>
          <h1>Pet Shop Directory</h1>
          <p>Discover trusted shops and premium products for your furry friends.</p>
          <div className="search-wrap"><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products or shops…"/><button type="button"><i className="bi bi-search"/></button></div>
        </div>
      </div>
      <div className="filter-bar">
        <span className="filter-label">Filter:</span>
        <select className="filter-select" value={city} onChange={e=>setCity(e.target.value)}><option value="">All Cities</option><option>Lahore</option><option>Karachi</option><option>Islamabad</option></select>
        <select className="filter-select" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All Categories</option><option>Food & Nutrition</option><option>Grooming</option><option>Toys & Accessories</option><option>Healthcare</option><option>Bedding & Housing</option></select>
        {view==="grid"&&<select className="filter-select" value={pet} onChange={e=>setPet(e.target.value)}><option value="">All Pets</option><option>Dogs</option><option>Cats</option><option>Birds</option><option>Fish</option></select>}
        <span className="result-count">{resultText}</span>
        <div style={{ display:"flex", gap:6 }}><TogBtn v="grid" icon="bi-grid-3x3-gap-fill"/><TogBtn v="list" icon="bi-list-ul"/></div>
      </div>
      <div style={{ display:"flex" }}>
        <aside style={{ width:240, flexShrink:0, borderRight:"3px solid var(--border)", padding:"28px 24px", background:"var(--white)", minHeight:"calc(100vh - 200px)" }}>
          {[["Category","category",["","Food & Nutrition","Grooming","Toys & Accessories","Healthcare","Bedding & Housing"]],["City","city",["","Lahore","Karachi","Islamabad"]]].map(([title,key,opts])=>(
            <div key={key} style={{ marginBottom:28 }}>
              <div style={{ fontSize:".75rem", fontWeight:900, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:12 }}>{title}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {opts.map(o=>{const active=key==="category"?category===o:city===o;return <Chip key={o||"all"} active={active} onClick={()=>key==="category"?setCategory(o):setCity(o)}>{o||(key==="city"?"All Cities":"All")}</Chip>;})}</div>
            </div>
          ))}
          {view==="grid"&&(
            <div>
              <div style={{ fontSize:".75rem", fontWeight:900, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:12 }}>Pet Type</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {[["","All Pets"],["Dogs","🐕 Dogs"],["Cats","🐱 Cats"],["Birds","🦜 Birds"],["Fish","🐟 Fish"]].map(([v,l])=><Chip key={v||"all"} active={pet===v} onClick={()=>setPet(v)}>{l}</Chip>)}
              </div>
            </div>
          )}
        </aside>
        <div style={{ flex:1, padding:"28px 32px 64px" }}>
          {view==="grid"
            ?filteredProducts.length===0?<div className="empty-state"><div className="e-emoji">🛒</div><h3>No products found</h3><p>Try a different filter.</p></div>:<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:20 }}>{filteredProducts.map((p,i)=><ProductCard key={p.id} p={p} idx={i}/>)}</div>
            :filteredShops.length===0?<div className="empty-state"><div className="e-emoji">🏪</div><h3>No shops found</h3><p>Try a different filter.</p></div>:<div style={{ display:"flex", flexDirection:"column", gap:20 }}>{filteredShops.map((s,i)=><ShopCard key={s.name} s={s} idx={i}/>)}</div>
          }
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");

  // Restore user from localStorage on mount
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pp_user")) || null; }
    catch { return null; }
  });

  const handleLoginSuccess = (user) => setCurrentUser(user);

  const handleLogout = () => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setCurrentUser(null);
    setPage("home");
  };

  useEffect(() => { window.scrollTo({ top:0, behavior:"smooth" }); }, [page]);

  const renderPage = () => {
    switch(page) {
      case "home":     return <HomePage     setPage={setPage} />;
      case "about":    return <AboutPage />;
      case "pets":     return <PetsPage     currentUser={currentUser} setPage={setPage} />;
      case "ngo":      return <NGOPage />;
      case "shop":     return <ShopPage />;
      case "login":    return <LoginPage    setPage={setPage} onLoginSuccess={handleLoginSuccess} />;
      case "register": return <RegisterPage setPage={setPage} onLoginSuccess={handleLoginSuccess} />;
      default:         return <HomePage     setPage={setPage} />;
    }
  };

  return (
    <>
      <StyleTag />
      <Navbar page={page} setPage={setPage} currentUser={currentUser} onLogout={handleLogout} />
      <main>{renderPage()}</main>
      {!["login","register"].includes(page) && <Footer />}
    </>
  );
}
