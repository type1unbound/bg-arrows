import { useState, useEffect } from "react";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const storage = {
  get: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
};

const KEYS = {
  settings:  "bgp_settings",
  contacts:  "bgp_contacts",
  name:      "bgp_name",
  confirmed: "bgp_defaults_confirmed",
};

// ─── DEFAULTS ────────────────────────────────────────────────────────────────
const defaultSettings = {
  ranges: [
    { id: "r1", label: "<69",     max: 69  },
    { id: "r2", label: "70–80",   min: 70,  max: 80  },
    { id: "r3", label: "80–100",  min: 80,  max: 100 },
    { id: "r4", label: "100–120", min: 100, max: 120 },
    { id: "r5", label: "120–180", min: 120, max: 180 },
    { id: "r6", label: "180+",    min: 180 },
  ],
  carbAmounts: [
    [-1, null, null, null, null, -2],
    [-1, null, null, null, null, null],
    [-1, -1,   null, null, null, null],
    [8,  4,    2,    null, null, null],
    [12, 8,    4,    2,    null, null],
    [15, 15,   8,    4,    null, null],
    [15, 15,   15,   12,   8,   null],
  ],
  fingerPoke: [
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [true, false,false,false,false,false],
    [true, true, false,false,false,false],
  ],
  retest: [
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [false,false,false,false,false,false],
    [true, true, false,false,false,false],
    [true, true, false,false,false,false],
    [true, true, true, true, true, false],
  ],
};

const defaultContacts = {
  physician: { name: "", practice: "", phone: "", notes: "" },
  nurse:     { name: "", school:   "", phone: "", notes: "" },
  emergency: { phone: "911", notes: "For severe hypoglycemia / unconsciousness" },
};

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const arrows = [
  { symbol: "↑↑", label: "Double Up",    desc: "Rising fast"    },
  { symbol: "↑",  label: "Single Up",    desc: "Rising"         },
  { symbol: "↗",  label: "Diagonal Up",  desc: "Rising slowly"  },
  { symbol: "→",  label: "Flat",         desc: "Steady"         },
  { symbol: "↘",  label: "Diagonal Down",desc: "Falling slowly" },
  { symbol: "↓",  label: "Single Down",  desc: "Falling"        },
  { symbol: "↓↓", label: "Double Down",  desc: "Falling fast"   },
];

function getRangeIndex(bg, ranges) {
  if (bg < ranges[0].max) return 0;
  for (let i = 1; i < ranges.length - 1; i++) {
    if (bg >= ranges[i].min && bg <= ranges[i].max) return i;
  }
  return ranges.length - 1;
}

function getUrgency(carbs, arrowIdx, rangeIdx) {
  if (carbs === -2) return "pump";
  if (carbs === -1 || carbs === null) return "none";
  if (carbs >= 15 || (arrowIdx >= 5 && rangeIdx <= 1)) return "critical";
  if (carbs >= 8) return "high";
  return "low";
}

const urgencyColors = {
  none:     { bg: "#1a2744", border: "#2e4a7a", text: "#aac4ee", label: "No Action Needed" },
  pump:     { bg: "#1a2744", border: "#3366aa", text: "#77b3ff", label: "Check Pump"        },
  low:      { bg: "#1a3320", border: "#2d6640", text: "#77dd99", label: "Mild"              },
  high:     { bg: "#332200", border: "#774d00", text: "#ffbb33", label: "Moderate"          },
  critical: { bg: "#330a0a", border: "#881111", text: "#ff6655", label: "Urgent"            },
};

const FF = "'DM Sans', 'Segoe UI', sans-serif";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const base = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0d1526 0%, #111e3a 60%, #0d1a30 100%)",
    fontFamily: FF,
    color: "#c8d8f0",
    maxWidth: 480,
    margin: "0 auto",
    padding: "0 0 48px",
  },
  pageHeader: {
    padding: "20px 20px 16px",
    borderBottom: "1px solid #1e3055",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    background: "none",
    border: "1px solid #2e4a7a",
    borderRadius: 8,
    color: "#99bbdd",
    padding: "7px 11px",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    fontFamily: FF,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#7799bb",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    marginBottom: 10,
    fontWeight: 600,
  },
  fieldGroup: {
    background: "#0f1a30",
    border: "1px solid #1a2e50",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 12,
  },
  fieldGroupTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#99bbdd",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 10,
    color: "#6688aa",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 4,
    display: "block",
  },
  fieldInput: {
    width: "100%",
    background: "#111e38",
    border: "1px solid #1e3055",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: "#ddeeff",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
    fontFamily: FF,
  },
  saveBtn: {
    width: "100%",
    background: "#1a3a6e",
    border: "1px solid #3366aa",
    borderRadius: 8,
    color: "#aaccff",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: FF,
    marginBottom: 8,
  },
  cancelBtn: {
    width: "100%",
    background: "#1a2744",
    border: "1px solid #253561",
    borderRadius: 8,
    color: "#99bbdd",
    padding: "11px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: FF,
  },
};

// ─── DEFAULTS WARNING MODAL ───────────────────────────────────────────────────
function DefaultsWarningModal({ onCustomize, onDismiss }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(5,10,22,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 24,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#111e38",
        border: "1px solid #3a5577",
        borderRadius: 20,
        padding: 28,
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"#2a1a00", border:"2px solid #774d00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:20 }}>⚠️</div>
        <div style={{ fontSize:20, fontWeight:800, color:"#f0d080", marginBottom:10, letterSpacing:"-0.4px" }}>Using Default Settings</div>
        <p style={{ fontSize:14, color:"#99bbcc", lineHeight:1.65, margin:"0 0 12px" }}>
          This app is currently running with <strong style={{ color:"#ffcc55" }}>generic default values</strong> — not a personalized protocol.
        </p>
        <p style={{ fontSize:14, color:"#99bbcc", lineHeight:1.65, margin:"0 0 24px" }}>
          Before using this as a treatment guide, please customize the carb amounts and contact info to match the care plan prescribed by your physician.
        </p>
        <div style={{ borderTop:"1px solid #1e3055", marginBottom:20 }} />
        <button style={{ width:"100%", background:"#1a3a6e", border:"1px solid #3366aa", borderRadius:10, color:"#aaccff", padding:"13px 16px", cursor:"pointer", fontSize:15, fontWeight:700, fontFamily:FF, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          onClick={onCustomize}>⚙ Customize Now</button>
        <button style={{ width:"100%", background:"transparent", border:"1px solid #253561", borderRadius:10, color:"#7799bb", padding:"12px 16px", cursor:"pointer", fontSize:13, fontFamily:FF, lineHeight:1.4 }}
          onClick={onDismiss}>I understand — continue with defaults</button>
        <p style={{ fontSize:10, color:"#3a5577", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
          This notice will reappear each visit until the protocol has been customized and saved.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady]                   = useState(false);
  const [screen, setScreen]                 = useState("main");
  const [settingsTab, setSettingsTab]       = useState("protocol");
  const [selectedArrow, setSelectedArrow]   = useState(null);
  const [bgInput, setBgInput]               = useState("");
  const [settings, setSettings]             = useState(defaultSettings);
  const [contacts, setContacts]             = useState(defaultContacts);
  const [contactsDraft, setContactsDraft]   = useState(null);
  const [personName, setPersonName]         = useState("Adelaide");
  const [editingName, setEditingName]       = useState(false);
  const [nameDraft, setNameDraft]           = useState("Adelaide");
  const [editCells, setEditCells]           = useState(null);
  const [editValue, setEditValue]           = useState("");
  const [showDefaultsWarning, setShowDefaultsWarning] = useState(false);
  const [isCustomized, setIsCustomized]     = useState(false);

  // ── Load from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const savedSettings  = storage.get(KEYS.settings);
    const savedContacts  = storage.get(KEYS.contacts);
    const savedName      = storage.get(KEYS.name);
    const confirmed      = storage.get(KEYS.confirmed);
    const hasCustomData  = savedSettings || savedContacts || savedName;

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedName)     { setPersonName(savedName); setNameDraft(savedName); }

    if (!hasCustomData || confirmed !== "true") {
      setShowDefaultsWarning(true);
      setIsCustomized(false);
    } else {
      setIsCustomized(true);
    }
    setReady(true);
  }, []);

  // ── Persist to localStorage on change ───────────────────────────
  useEffect(() => { if (ready) storage.set(KEYS.settings, JSON.stringify(settings)); }, [settings, ready]);
  useEffect(() => { if (ready) storage.set(KEYS.contacts, JSON.stringify(contacts)); }, [contacts, ready]);
  useEffect(() => { if (ready) storage.set(KEYS.name, personName); }, [personName, ready]);

  // ── Computed ─────────────────────────────────────────────────────
  const bgNum    = parseInt(bgInput, 10);
  const rangeIdx = !isNaN(bgNum) && bgNum > 0 ? getRangeIndex(bgNum, settings.ranges) : null;
  const result   = selectedArrow !== null && rangeIdx !== null ? {
    carbs:      settings.carbAmounts[selectedArrow][rangeIdx],
    fingerPoke: settings.fingerPoke[selectedArrow][rangeIdx],
    retest:     settings.retest[selectedArrow][rangeIdx],
    range:      settings.ranges[rangeIdx],
  } : null;
  const urgency = result ? getUrgency(result.carbs, selectedArrow, rangeIdx) : null;
  const uc      = urgency ? urgencyColors[urgency] : null;

  function buildActionText(r) {
    if (!r) return null;
    if (r.carbs === null) return { main: "No Action Needed",   sub: "Blood sugar is in acceptable range" };
    if (r.carbs === -2)   return { main: "Check Insulin Pump", sub: "High correction may be needed"      };
    if (r.carbs === -1)   return { main: "Observe & Recheck",  sub: "Monitor for ~15 minutes"            };
    const fp = r.fingerPoke ? "Do a finger poke · " : "";
    return { main: `Take ${r.carbs}g Carbs`, sub: `${fp}${r.retest ? "Retest" : "Recheck"} ~15 min` };
  }
  const actionText = buildActionText(result);

  // ── Protocol editing ─────────────────────────────────────────────
  function updateCarbs(aIdx, rIdx, val) {
    const next = settings.carbAmounts.map((row, i) =>
      i === aIdx ? row.map((c, j) => j === rIdx ? val : c) : row
    );
    setSettings({ ...settings, carbAmounts: next });
  }

  function handleCellClick(aIdx, rIdx) {
    setEditCells({ aIdx, rIdx });
    const cur = settings.carbAmounts[aIdx][rIdx];
    setEditValue(cur === null ? "" : cur === -1 ? "obs" : cur === -2 ? "pump" : String(cur));
  }

  function handleModalSave() {
    const { aIdx, rIdx } = editCells;
    const v = editValue.toLowerCase().trim();
    let val = null;
    if      (v === "" || v === "none" || v === "-") val = null;
    else if (v === "obs" || v === "observe")        val = -1;
    else if (v === "pump")                          val = -2;
    else { const n = parseInt(v, 10); if (!isNaN(n)) val = n; }
    updateCarbs(aIdx, rIdx, val);
    setEditCells(null);
  }

  function getCellDisplay(val) {
    if (val === null) return "–";
    if (val === -1)   return "Obs";
    if (val === -2)   return "Pump";
    return `${val}g`;
  }

  // ── Navigation ───────────────────────────────────────────────────
  function openContacts() {
    setContactsDraft(JSON.parse(JSON.stringify(contacts)));
    setSettingsTab("contacts");
    setScreen("settings");
  }

  function markConfirmed() {
    storage.set(KEYS.confirmed, "true");
    setIsCustomized(true);
  }

  function handleSaveContacts() {
    setContacts(contactsDraft);
    markConfirmed();
    setScreen("main");
  }

  function handleProtocolSaved() {
    markConfirmed();
    setScreen("main");
  }

  const hasPhysician  = contacts.physician.name || contacts.physician.phone;
  const hasNurse      = contacts.nurse.name     || contacts.nurse.phone;
  const hasAnyContact = hasPhysician || hasNurse;

  if (!ready) {
    return (
      <div style={{ ...base.app, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#3a5577", fontSize:14 }}>Loading…</div>
      </div>
    );
  }

  const tabStyle = (active) => ({
    padding: "10px 18px", fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? "#aaccff" : "#5577aa",
    background: "none", border: "none",
    borderBottom: active ? "2px solid #5588ee" : "2px solid transparent",
    cursor: "pointer", marginBottom: -1, fontFamily: FF,
  });

  // ════════════════════════════════════════════════════════════════
  // SETTINGS SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === "settings") {
    const cd = contactsDraft;
    const warnBanner = !isCustomized && (
      <div style={{ background:"#2a1800", border:"1px solid #774d00", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#ffbb55", display:"flex", alignItems:"flex-start", gap:8 }}>
        <span style={{ fontSize:14, flexShrink:0 }}>⚠️</span>
        <span>These are default values. Make your changes and tap <strong>Save Changes</strong> to personalize.</span>
      </div>
    );

    return (
      <div style={base.app}>
        <div style={base.pageHeader}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"#e8f0ff" }}>Customize</div>
            <div style={{ fontSize:11, color:"#7799cc", marginTop:2, textTransform:"uppercase", letterSpacing:"1px" }}>Protocol & Contacts</div>
          </div>
          <button style={base.iconBtn} onClick={() => setScreen("main")}>← Back</button>
        </div>

        <div style={{ display:"flex", borderBottom:"1px solid #1e3055", padding:"0 20px" }}>
          <button style={tabStyle(settingsTab === "protocol")} onClick={() => setSettingsTab("protocol")}>Protocol</button>
          <button style={tabStyle(settingsTab === "contacts")} onClick={() => setSettingsTab("contacts")}>Contacts</button>
        </div>

        {/* PROTOCOL TAB */}
        {settingsTab === "protocol" && (
          <div style={{ padding:"16px 20px 0" }}>
            {warnBanner}
            <p style={{ fontSize:12, color:"#7799bb", lineHeight:1.6, margin:"0 0 16px" }}>
              Tap any cell to edit. Enter a number (grams), "obs" for Observe, "pump" for Check Pump, or leave blank for No Action.
            </p>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, fontSize:11 }}>
                <thead>
                  <tr>
                    <th style={{ background:"#0f1a30", color:"#7799aa", padding:"8px 4px 8px 8px", textAlign:"left", fontWeight:600, fontSize:10 }}>Arrow</th>
                    {settings.ranges.map(r => <th key={r.id} style={{ background:"#0f1a30", color:"#7799aa", padding:"8px 4px", textAlign:"center", fontWeight:600, fontSize:10 }}>{r.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {arrows.map((a, aIdx) => (
                    <tr key={aIdx}>
                      <td style={{ background:"#0f1a30", color:"#99bbdd", padding:"8px 4px 8px 8px", textAlign:"left", fontSize:18 }}>{a.symbol}</td>
                      {settings.ranges.map((_, rIdx) => {
                        const val = settings.carbAmounts[aIdx][rIdx];
                        return (
                          <td key={rIdx}
                            style={{ background:val===null?"#0d1626":val===-1?"#131f38":val===-2?"#111e38":val>=15?"#330a0a":val>=8?"#2b1e00":"#0f2016", color:val===null?"#3a5570":val===-1?"#6699cc":val===-2?"#77b3ff":val>=15?"#ff6655":val>=8?"#ffaa33":"#77dd99", padding:"6px 3px", textAlign:"center", cursor:"pointer", fontSize:10, fontWeight:600, border:"1px solid #0d1626" }}
                            onClick={() => handleCellClick(aIdx, rIdx)}>
                            {getCellDisplay(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button style={{ ...base.saveBtn, marginTop:16 }} onClick={handleProtocolSaved}>Save Changes</button>
            <button style={base.cancelBtn} onClick={() => setSettings(defaultSettings)}>Reset to Defaults</button>
            <div style={{ marginTop:12, padding:"12px 14px", background:"#0f1a30", borderRadius:12, fontSize:11, color:"#7799bb", lineHeight:1.7 }}>
              <strong style={{ color:"#99bbdd" }}>Legend:</strong> Numbers = grams · <span style={{ color:"#6699cc" }}>Obs</span> = Observe · <span style={{ color:"#77b3ff" }}>Pump</span> = Check Pump · <span style={{ color:"#445f7a" }}>–</span> = No Action
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {settingsTab === "contacts" && cd && (
          <div style={{ padding:"16px 20px 0" }}>
            {warnBanner}

            <div style={base.fieldGroup}>
              <div style={base.fieldGroupTitle}>👤 Patient Name</div>
              <label style={base.fieldLabel}>First Name (shown in header)</label>
              <input style={{ ...base.fieldInput, marginBottom:0 }} value={personName} onChange={e => setPersonName(e.target.value)} placeholder="e.g. Adelaide" />
            </div>

            <div style={base.fieldGroup}>
              <div style={{ ...base.fieldGroupTitle, color:"#77b3ff" }}>🩺 Physician / Endocrinologist</div>
              <label style={base.fieldLabel}>Doctor Name</label>
              <input style={base.fieldInput} value={cd.physician.name} onChange={e => setContactsDraft({ ...cd, physician:{...cd.physician,name:e.target.value} })} placeholder="Dr. Smith" />
              <label style={base.fieldLabel}>Practice / Clinic</label>
              <input style={base.fieldInput} value={cd.physician.practice} onChange={e => setContactsDraft({ ...cd, physician:{...cd.physician,practice:e.target.value} })} placeholder="e.g. OHSU Diabetes Clinic" />
              <label style={base.fieldLabel}>Phone</label>
              <input style={base.fieldInput} type="tel" value={cd.physician.phone} onChange={e => setContactsDraft({ ...cd, physician:{...cd.physician,phone:e.target.value} })} placeholder="(503) 555-0100" />
              <label style={base.fieldLabel}>Notes</label>
              <input style={{ ...base.fieldInput, marginBottom:0 }} value={cd.physician.notes} onChange={e => setContactsDraft({ ...cd, physician:{...cd.physician,notes:e.target.value} })} placeholder="After-hours line, on-call pager, etc." />
            </div>

            <div style={base.fieldGroup}>
              <div style={{ ...base.fieldGroupTitle, color:"#77dd99" }}>🏫 School Nurse</div>
              <label style={base.fieldLabel}>Nurse Name</label>
              <input style={base.fieldInput} value={cd.nurse.name} onChange={e => setContactsDraft({ ...cd, nurse:{...cd.nurse,name:e.target.value} })} placeholder="Nurse Johnson" />
              <label style={base.fieldLabel}>School</label>
              <input style={base.fieldInput} value={cd.nurse.school} onChange={e => setContactsDraft({ ...cd, nurse:{...cd.nurse,school:e.target.value} })} placeholder="e.g. Lincoln Elementary" />
              <label style={base.fieldLabel}>Phone</label>
              <input style={base.fieldInput} type="tel" value={cd.nurse.phone} onChange={e => setContactsDraft({ ...cd, nurse:{...cd.nurse,phone:e.target.value} })} placeholder="(503) 555-0200" />
              <label style={base.fieldLabel}>Notes</label>
              <input style={{ ...base.fieldInput, marginBottom:0 }} value={cd.nurse.notes} onChange={e => setContactsDraft({ ...cd, nurse:{...cd.nurse,notes:e.target.value} })} placeholder="Office hours, best time to call, etc." />
            </div>

            <div style={base.fieldGroup}>
              <div style={{ ...base.fieldGroupTitle, color:"#ff6655" }}>🚨 Emergency</div>
              <label style={base.fieldLabel}>Emergency Number</label>
              <input style={base.fieldInput} type="tel" value={cd.emergency.phone} onChange={e => setContactsDraft({ ...cd, emergency:{...cd.emergency,phone:e.target.value} })} placeholder="911" />
              <label style={base.fieldLabel}>Notes</label>
              <input style={{ ...base.fieldInput, marginBottom:0 }} value={cd.emergency.notes} onChange={e => setContactsDraft({ ...cd, emergency:{...cd.emergency,notes:e.target.value} })} placeholder="When to call, what to say" />
            </div>

            <button style={base.saveBtn} onClick={handleSaveContacts}>Save Changes</button>
            <button style={base.cancelBtn} onClick={() => setScreen("main")}>Cancel</button>
          </div>
        )}

        {/* Cell edit modal */}
        {editCells && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }} onClick={() => setEditCells(null)}>
            <div style={{ background:"#111e38", border:"1px solid #253561", borderRadius:16, padding:24, width:"100%", maxWidth:320 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize:14, fontWeight:700, color:"#e8f0ff", marginBottom:4 }}>{arrows[editCells.aIdx].symbol} · {settings.ranges[editCells.rIdx].label} mg/dL</div>
              <div style={{ fontSize:11, color:"#7799bb", marginBottom:14 }}>Enter carb amount, obs, pump, or leave blank</div>
              <input style={{ width:"100%", background:"#0d1626", border:"1px solid #253561", borderRadius:8, padding:"10px 12px", fontSize:16, color:"#e8f0ff", outline:"none", boxSizing:"border-box", marginBottom:10, fontFamily:FF }} value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="e.g. 8, obs, pump, or blank" autoFocus onKeyDown={e => e.key==="Enter" && handleModalSave()} />
              <div style={{ fontSize:11, color:"#5577aa", marginBottom:16 }}>Number = grams · "obs" = observe · "pump" = check pump · blank = no action</div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:10, borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:"#1a2744", color:"#99bbdd", fontFamily:FF }} onClick={() => setEditCells(null)}>Cancel</button>
                <button style={{ flex:1, padding:10, borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:"#1a4a8c", color:"#aaccff", fontFamily:FF }} onClick={handleModalSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN SCREEN
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={base.app}>
      {showDefaultsWarning && (
        <DefaultsWarningModal
          onCustomize={() => { setShowDefaultsWarning(false); setContactsDraft(JSON.parse(JSON.stringify(contacts))); setSettingsTab("contacts"); setScreen("settings"); }}
          onDismiss={() => setShowDefaultsWarning(false)}
        />
      )}

      {!isCustomized && !showDefaultsWarning && (
        <div style={{ background:"#2a1800", borderBottom:"1px solid #774d00", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#ffbb55" }}>
            <span>⚠️</span><span>Running with default settings</span>
          </div>
          <button style={{ background:"#774d00", border:"none", borderRadius:6, color:"#ffdd99", padding:"5px 10px", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:FF }} onClick={() => setShowDefaultsWarning(true)}>Review</button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid #1e3055", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#e8f0ff", letterSpacing:"-0.3px", display:"flex", alignItems:"center", gap:6 }}>
            {editingName ? (
              <input style={{ background:"transparent", border:"none", borderBottom:"1.5px solid #3a5a99", color:"#e8f0ff", fontSize:18, fontWeight:700, outline:"none", width:150, padding:"0 0 1px", fontFamily:FF }} value={nameDraft} autoFocus onChange={e => setNameDraft(e.target.value)} onBlur={() => { setPersonName(nameDraft); setEditingName(false); }} onKeyDown={e => { if(e.key==="Enter"){setPersonName(nameDraft);setEditingName(false);}}} />
            ) : (
              <>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{personName}'s BG Protocol</span>
                <button style={{ background:"none", border:"none", cursor:"pointer", color:"#4a6a99", fontSize:14, padding:"2px 3px", lineHeight:1, flexShrink:0 }} onClick={() => { setNameDraft(personName); setEditingName(true); }}>✎</button>
              </>
            )}
          </div>
          <div style={{ fontSize:11, color:"#7799cc", marginTop:2, textTransform:"uppercase", letterSpacing:"1px" }}>Dexcom · Treatment Guide</div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button style={base.iconBtn} onClick={openContacts}>👥</button>
          <button style={base.iconBtn} onClick={() => { setSettingsTab("protocol"); setScreen("settings"); }}>⚙</button>
        </div>
      </div>

      {/* Arrow Selector */}
      <div style={{ padding:"20px 20px 0" }}>
        <div style={base.sectionLabel}>Dexcom Arrow</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6 }}>
          {arrows.map((a, idx) => (
            <button key={idx} style={{ background:selectedArrow===idx?"#1a3a6e":"#111e38", border:selectedArrow===idx?"2px solid #5588ee":"2px solid #2a4070", borderRadius:10, padding:"10px 4px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }} onClick={() => setSelectedArrow(selectedArrow===idx?null:idx)}>
              <span style={{ fontSize:22, lineHeight:1, color:selectedArrow===idx?"#aaccff":"#8aaedd" }}>{a.symbol}</span>
              <span style={{ fontSize:8, color:"#7799bb", textAlign:"center", lineHeight:1.2 }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BG Input */}
      <div style={{ padding:"20px 20px 0" }}>
        <div style={base.sectionLabel}>Blood Sugar (mg/dL)</div>
        <div style={{ position:"relative" }}>
          <input style={{ width:"100%", background:"#111e38", border:"2px solid #1e3055", borderRadius:12, padding:"16px 52px 16px 20px", fontSize:28, fontWeight:700, color:"#e8f0ff", outline:"none", boxSizing:"border-box", letterSpacing:"-0.5px", fontFamily:FF }} type="number" inputMode="numeric" value={bgInput} onChange={e => setBgInput(e.target.value)} placeholder="e.g. 85" />
          <span style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#7799aa", fontWeight:600 }}>mg/dL</span>
        </div>
      </div>

      {/* Result */}
      {result && actionText ? (
        <div style={{ margin:"20px 20px 0", background:uc.bg, border:`2px solid ${uc.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"inline-block", background:uc.border, color:uc.text, fontSize:10, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, marginBottom:10 }}>{uc.label}</div>
          <div style={{ fontSize:24, fontWeight:800, color:uc.text, lineHeight:1.2, letterSpacing:"-0.5px" }}>{actionText.main}</div>
          <div style={{ fontSize:14, color:"#99bbdd", marginTop:6 }}>{actionText.sub}</div>
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:20 }}>
            <div>
              <span style={{ fontSize:10, color:"#7799bb", textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:2 }}>Trend</span>
              <span style={{ fontSize:20, color:"#ccddf0", fontWeight:600 }}>{arrows[selectedArrow].symbol} {arrows[selectedArrow].label}</span>
            </div>
            <div>
              <span style={{ fontSize:10, color:"#7799bb", textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:2 }}>Range</span>
              <span style={{ fontSize:13, color:"#ccddf0", fontWeight:600 }}>{result.range.label} mg/dL</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ margin:"20px 20px 0", background:"#0f1a30", border:"2px dashed #2a4a77", borderRadius:16, padding:24, textAlign:"center", color:"#6688aa", fontSize:14 }}>
          {selectedArrow===null&&!bgInput?"Select a Dexcom arrow and enter a blood sugar reading":selectedArrow===null?"Now select a Dexcom arrow direction":"Enter a blood sugar reading above"}
        </div>
      )}

      {/* Contacts */}
      {hasAnyContact && (
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={base.sectionLabel}>Care Team</div>
            <button style={{ background:"none", border:"none", color:"#4a6a99", fontSize:11, cursor:"pointer", fontFamily:FF }} onClick={openContacts}>Edit ✎</button>
          </div>
          <div style={{ background:"#0f1a30", border:"1px solid #1e3055", borderRadius:16, overflow:"hidden" }}>
            {hasPhysician && (
              <div style={{ padding:"14px 16px", borderBottom:hasNurse?"1px solid #172440":"none", display:"flex", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#0f1e40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🩺</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:"#6688aa", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:2 }}>Physician</div>
                  {contacts.physician.name     && <div style={{ fontSize:14, fontWeight:700, color:"#ddeeff" }}>{contacts.physician.name}</div>}
                  {contacts.physician.practice && <div style={{ fontSize:12, color:"#99aabb", marginTop:2 }}>{contacts.physician.practice}</div>}
                  {contacts.physician.notes    && <div style={{ fontSize:11, color:"#7788aa", marginTop:2 }}>{contacts.physician.notes}</div>}
                  {contacts.physician.phone    && <a href={`tel:${contacts.physician.phone}`} style={{ display:"inline-block", marginTop:5, fontSize:14, fontWeight:700, color:"#77b3ff", textDecoration:"none" }}>{contacts.physician.phone}</a>}
                </div>
              </div>
            )}
            {hasNurse && (
              <div style={{ padding:"14px 16px", display:"flex", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"#0f2a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏫</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:"#6688aa", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:2 }}>School Nurse</div>
                  {contacts.nurse.name   && <div style={{ fontSize:14, fontWeight:700, color:"#ddeeff" }}>{contacts.nurse.name}</div>}
                  {contacts.nurse.school && <div style={{ fontSize:12, color:"#99aabb", marginTop:2 }}>{contacts.nurse.school}</div>}
                  {contacts.nurse.notes  && <div style={{ fontSize:11, color:"#7788aa", marginTop:2 }}>{contacts.nurse.notes}</div>}
                  {contacts.nurse.phone  && <a href={`tel:${contacts.nurse.phone}`} style={{ display:"inline-block", marginTop:5, fontSize:14, fontWeight:700, color:"#77dd99", textDecoration:"none" }}>{contacts.nurse.phone}</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasAnyContact && (
        <div style={{ padding:"20px 20px 0" }}>
          <button style={{ width:"100%", background:"#0f1a30", border:"1px dashed #2a4a77", borderRadius:12, color:"#5577aa", padding:"14px 16px", cursor:"pointer", fontSize:13, textAlign:"left", display:"flex", alignItems:"center", gap:10, fontFamily:FF }} onClick={openContacts}>
            <span style={{ fontSize:18 }}>👥</span><span>Add physician &amp; school nurse contacts…</span>
          </button>
        </div>
      )}

      {/* Quick Reference */}
      <div style={{ padding:"20px 20px 0" }}>
        <div style={base.sectionLabel}>Quick Reference</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[
            { bg:"#330a0a", border:"#881111", text:"#ff6655", label:"Urgent",             desc:"15g carbs + finger poke"  },
            { bg:"#2b1e00", border:"#774d00", text:"#ffbb33", label:"Moderate",           desc:"8–12g carbs, recheck"     },
            { bg:"#0f2016", border:"#2d6640", text:"#77dd99", label:"Mild",               desc:"2–4g carbs, recheck"      },
            { bg:"#1a2744", border:"#3366aa", text:"#77b3ff", label:"No Action / Monitor",desc:"Observe or check pump"    },
          ].map((item,i) => (
            <div key={i} style={{ background:item.bg, border:`1px solid ${item.border}`, borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:item.text, marginBottom:2 }}>{item.label}</div>
              <div style={{ fontSize:10, color:"#8899aa" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin:"16px 20px 0", fontSize:10, color:"#4a6080", textAlign:"center", lineHeight:1.6 }}>
        This app is a digital reference only. Always follow your care team's guidance. When in doubt, do a finger poke.
      </div>
    </div>
  );
}
