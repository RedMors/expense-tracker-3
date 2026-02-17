import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const FONT = "'Montserrat', sans-serif";

// ─── Supabase ─────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Categories ────────────────────────────────────────────────────────────
const CATEGORIES = {
  "🍔 Food & Dining":  { color: "#F97316", keywords: ["restaurant","cafe","coffee","pizza","burger","sushi","lunch","dinner","breakfast","food","eat","doordash","ubereats","grubhub","mcdonald","starbucks","subway","chipotle","taco","bar","pub","drink","beer","wine","grocery","supermarket","whole foods","trader joe","kroger","walmart","costco"] },
  "🚗 Transport":      { color: "#3B82F6", keywords: ["uber","lyft","taxi","gas","fuel","parking","toll","metro","bus","train","flight","airline","car","auto","mechanic","insurance","registration"] },
  "🏠 Housing":        { color: "#8B5CF6", keywords: ["rent","mortgage","electric","electricity","water","gas bill","internet","wifi","cable","phone","utilities","hoa","maintenance","repair","plumber","cleaner"] },
  "🛍️ Shopping":       { color: "#EC4899", keywords: ["amazon","ebay","shop","store","mall","clothes","clothing","fashion","shoes","apparel","target","h&m","zara","nike","adidas","apple","best buy","ikea"] },
  "🏥 Health":         { color: "#10B981", keywords: ["doctor","hospital","pharmacy","medicine","drug","dental","dentist","vision","gym","fitness","yoga","health","medical","prescription","cvs","walgreens"] },
  "🎬 Entertainment":  { color: "#F59E0B", keywords: ["netflix","spotify","hulu","disney","movie","cinema","concert","ticket","game","steam","playstation","xbox","hobby","book","music","streaming"] },
  "✈️ Travel":         { color: "#06B6D4", keywords: ["hotel","airbnb","vrbo","resort","vacation","travel","trip","tour","booking","expedia","kayak","luggage"] },
  "📚 Education":      { color: "#6366F1", keywords: ["school","university","college","course","tuition","textbook","udemy","coursera","learning","class","workshop"] },
  "💰 Income":         { color: "#22C55E", keywords: ["salary","paycheck","freelance","payment received","deposit","refund","transfer in","income","revenue","dividend","interest"] },
  "📦 Other":          { color: "#94A3B8", keywords: [] },
};

function autoCategory(description, type) {
  if (type === "income") return "💰 Income";
  const desc = description.toLowerCase();
  for (const [cat, { keywords }] of Object.entries(CATEGORIES)) {
    if (cat === "💰 Income" || cat === "📦 Other") continue;
    if (keywords.some(k => desc.includes(k))) return cat;
  }
  return "📦 Other";
}

const fmt = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];

const inputStyle = {
  width: "100%", padding: "11px 14px", background: "#0F172A",
  border: "1px solid #334155", borderRadius: 9, color: "#F1F5F9",
  fontSize: 14, fontFamily: FONT, boxSizing: "border-box", outline: "none", fontWeight: 400,
};
const labelStyle = {
  fontSize: 11, color: "#64748B", textTransform: "uppercase",
  letterSpacing: "0.08em", display: "block", marginBottom: 6, fontFamily: FONT, fontWeight: 600,
};

// ─── Tooltip ──────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", fontFamily: FONT }}>
      <p style={{ color: "#94A3B8", fontSize: 11, margin: "0 0 2px", fontWeight: 500 }}>{payload[0].name}</p>
      <p style={{ color: "#F1F5F9", fontSize: 15, fontWeight: 700, margin: 0 }}>{fmt(payload[0].value)}</p>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [msg, setMsg]           = useState({ text: "", ok: false });
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setMsg({ text: "", ok: false });
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMsg({ text: "✅ Account created! Check your email to confirm, then log in.", ok: true });
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💸</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#F1F5F9" }}>Expense Tracker</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#475569", fontWeight: 500 }}>Your personal finance, in the cloud.</p>
        </div>

        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", background: "#0F172A", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setMsg({ text: "", ok: false }); }} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                background: mode === m ? "#22C55E" : "transparent",
                color: mode === m ? "#0F172A" : "#64748B",
                fontWeight: mode === m ? 700 : 500, fontFamily: FONT, fontSize: 13, transition: "all 0.2s",
              }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Your Name</label>
              <input type="text" value={name} placeholder="e.g. Maria" onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} placeholder="you@example.com" onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputStyle} />
          </div>

          {msg.text && (
            <div style={{ background: msg.ok ? "#052e16" : "#2d0a12", border: `1px solid ${msg.ok ? "#22C55E44" : "#FB718544"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: msg.ok ? "#22C55E" : "#FB7185", fontWeight: 500 }}>{msg.text}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "13px 0",
            background: loading ? "#334155" : "#22C55E",
            border: "none", borderRadius: 10, color: "#0F172A",
            fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT,
          }}>
            {loading ? "Please wait…" : mode === "login" ? "Log In →" : "Create Account →"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 20, fontWeight: 500 }}>
          Each person's data is private and secure.
        </p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                 = useState(null);
  const [authChecked, setAuthChecked]   = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData]   = useState(false);
  const [view, setView]                 = useState("dashboard");
  const [form, setForm]                 = useState({ date: today(), description: "", amount: "", type: "expense", category: "" });
  const [filterCat, setFilterCat]       = useState("All");
  const [saving, setSaving]             = useState(false);

  // ── Auth listener ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data when user logs in ──────────────────────────────────────
  useEffect(() => {
    if (!user) { setTransactions([]); return; }
    setLoadingData(true);
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setTransactions(data);
        setLoadingData(false);
      });
  }, [user]);

  const addTransaction = async () => {
    if (!form.description || !form.amount || isNaN(+form.amount)) return;
    const cat  = form.category || autoCategory(form.description, form.type);
    const newT = { user_id: user.id, date: form.date, description: form.description, amount: +parseFloat(form.amount).toFixed(2), type: form.type, category: cat };
    setSaving(true);
    const { data, error } = await supabase.from("transactions").insert([newT]).select().single();
    if (!error && data) {
      setTransactions(prev => [data, ...prev]);
      setForm({ date: today(), description: "", amount: "", type: "expense", category: "" });
      setView("dashboard");
    }
    setSaving(false);
  };

  const deleteTransaction = async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions(prev => prev.filter(x => x.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setTransactions([]);
    setView("dashboard");
  };

  const stats = useMemo(() => {
    const income   = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;
    const byCat = {};
    transactions.filter(t => t.type === "expense").forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
    const pieData = Object.entries(byCat).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en", { weekday: "short" });
      const spent  = transactions.filter(t => t.date === key && t.type === "expense").reduce((s,t) => s+t.amount, 0);
      const earned = transactions.filter(t => t.date === key && t.type === "income").reduce((s,t)  => s+t.amount, 0);
      days.push({ label, spent: +spent.toFixed(2), earned: +earned.toFixed(2) });
    }
    return { income, expenses, balance, pieData, days };
  }, [transactions]);

  const filtered = useMemo(() =>
    transactions.filter(t => filterCat === "All" || t.category === filterCat)
      .sort((a,b) => b.date.localeCompare(a.date)),
    [transactions, filterCat]
  );

  if (!authChecked) return (
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily: FONT }}>
      <p style={{ color:"#475569", fontSize:14, fontWeight:500 }}>Loading…</p>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  const displayName = user.user_metadata?.full_name || user.email.split("@")[0];

  function Tab({ id, label }) {
    return (
      <button onClick={() => setView(id)} style={{
        background: view === id ? "#0F172A" : "transparent",
        color: view === id ? "#F1F5F9" : "#64748B",
        border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer",
        fontSize: 13, fontWeight: view === id ? 700 : 500, fontFamily: FONT, transition: "all 0.2s",
      }}>{label}</button>
    );
  }

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#0F172A", color: "#F1F5F9", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Personal Finance</p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>Expense Tracker</h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569", fontWeight: 500 }}>
                👋 Welcome back, <span style={{ color: "#94A3B8" }}>{displayName}</span>
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "#22C55E18", borderRadius: 20, border: "1px solid #22C55E44" }}>
                <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 700 }}>☁</span>
                <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>Cloud Saved</span>
              </div>
              <button onClick={() => setView("add")} style={{ background: "#22C55E", color: "#0F172A", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>+ Add</button>
              <button onClick={signOut} style={{ background: "transparent", color: "#64748B", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Sign Out</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <Tab id="dashboard" label="📊 Dashboard" />
            <Tab id="list"      label="📋 Transactions" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        {loadingData && <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}><p style={{ fontSize: 14, fontWeight: 500 }}>Loading your transactions…</p></div>}

        {/* ═══ DASHBOARD ═══ */}
        {!loadingData && view === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Income",   value: stats.income,   color: "#22C55E", bg: "#052e16" },
                { label: "Total Expenses", value: stats.expenses, color: "#F97316", bg: "#1c0a00" },
                { label: "Balance", value: stats.balance, color: stats.balance >= 0 ? "#38BDF8" : "#FB7185", bg: stats.balance >= 0 ? "#0c2a33" : "#2d0a12" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color }}>{fmt(value)}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 14, padding: 20 }}>
                <p style={{ margin: "0 0 16px", fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Spending by Category</p>
                {stats.pieData.length === 0
                  ? <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "30px 0" }}>No expenses yet</p>
                  : <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                            {stats.pieData.map(e => <Cell key={e.name} fill={CATEGORIES[e.name]?.color || "#94A3B8"} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        {[...stats.pieData].sort((a,b) => b.value-a.value).map(({ name, value }) => (
                          <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORIES[name]?.color || "#94A3B8" }} />
                              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{name}</span>
                            </div>
                            <span style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 600 }}>{fmt(value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                }
              </div>
              <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 14, padding: 20 }}>
                <p style={{ margin: "0 0 16px", fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Last 7 Days</p>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={stats.days} barSize={9}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#263148" />
                    <XAxis dataKey="label" tick={{ fill:"#64748B", fontSize:10, fontFamily:FONT }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#64748B", fontSize:10, fontFamily:FONT }} axisLine={false} tickLine={false} width={40} tickFormatter={v=>"$"+v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="earned" name="Income"   fill="#22C55E" radius={[4,4,0,0]} />
                    <Bar dataKey="spent"  name="Expenses" fill="#F97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
                  {[["#22C55E","Income"],["#F97316","Expenses"]].map(([c,l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                      <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 14, padding: 20 }}>
              <p style={{ margin: "0 0 16px", fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Recent Transactions</p>
              {transactions.length === 0 && <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No transactions yet — hit + Add!</p>}
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #0F172A" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: (CATEGORIES[t.category]?.color||"#94A3B8")+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 16 }}>
                      {t.category.split(" ")[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: "#E2E8F0", fontWeight: 500 }}>{t.description}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#475569" }}>{t.date} · {t.category.slice(2)}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.type==="income" ? "#22C55E" : "#FB7185" }}>
                    {t.type==="income" ? "+" : "-"}{fmt(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ADD TRANSACTION ═══ */}
        {!loadingData && view === "add" && (
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 16, padding: 28, maxWidth: 480, margin: "0 auto" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>New Transaction</h2>
            <div style={{ display: "flex", background: "#0F172A", borderRadius: 10, padding: 4, marginBottom: 20 }}>
              {["expense","income"].map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type, category: "" }))} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: form.type===type ? (type==="income" ? "#22C55E" : "#F97316") : "transparent",
                  color: form.type===type ? "#0F172A" : "#64748B",
                  fontWeight: form.type===type ? 700 : 500, fontFamily: FONT, fontSize: 13, transition: "all 0.2s",
                }}>{type==="income" ? "💰 Income" : "💸 Expense"}</button>
              ))}
            </div>
            {[
              { label:"Date",        key:"date",        type:"date",   placeholder:"" },
              { label:"Description", key:"description", type:"text",   placeholder:"e.g. Starbucks, Uber, Amazon…" },
              { label:"Amount ($)",  key:"amount",      type:"number", placeholder:"0.00" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Category <span style={{ textTransform:"none", letterSpacing:0, fontWeight:400, color:"#334155" }}>(auto-detected if blank)</span></label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ ...inputStyle, color: form.category ? "#F1F5F9" : "#475569" }}>
                <option value="">Auto-detect from description</option>
                {Object.keys(CATEGORIES).filter(c => form.type==="income" ? c==="💰 Income" : c!=="💰 Income")
                  .map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {form.description && !form.category && (
              <div style={{ background:"#0F172A", borderRadius:9, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"#475569", fontWeight:500 }}>Will be categorized as:</span>
                <span style={{ fontSize:13, color:"#94A3B8", fontWeight:600 }}>{autoCategory(form.description, form.type)}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setView("dashboard")} style={{ flex:1, padding:"12px 0", background:"transparent", border:"1px solid #334155", borderRadius:10, color:"#64748B", fontSize:14, cursor:"pointer", fontFamily:FONT, fontWeight:500 }}>Cancel</button>
              <button onClick={addTransaction} disabled={saving} style={{ flex:2, padding:"12px 0", background:saving?"#334155":(form.type==="income"?"#22C55E":"#F97316"), border:"none", borderRadius:10, color:"#0F172A", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                {saving ? "Saving…" : "Save Transaction"}
              </button>
            </div>
          </div>
        )}

        {/* ═══ TRANSACTIONS LIST ═══ */}
        {!loadingData && view === "list" && (
          <div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              {["All",...Object.keys(CATEGORIES)].map(cat => {
                const active = filterCat===cat;
                const col = cat==="All" ? "#38BDF8" : (CATEGORIES[cat]?.color||"#38BDF8");
                return (
                  <button key={cat} onClick={() => setFilterCat(cat)} style={{
                    padding:"5px 12px", borderRadius:20,
                    border:`1px solid ${active?col:"#334155"}`,
                    background:active?col+"22":"transparent",
                    color:active?col:"#64748B",
                    fontSize:12, cursor:"pointer", fontFamily:FONT, fontWeight:active?600:400, transition:"all 0.15s",
                  }}>{cat}</button>
                );
              })}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.length===0 && <p style={{ color:"#475569", textAlign:"center", padding:"40px 0", fontSize:14 }}>No transactions found.</p>}
              {filtered.map(t => (
                <div key={t.id} style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:(CATEGORIES[t.category]?.color||"#94A3B8")+"25", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {t.category.split(" ")[0]}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:14, color:"#E2E8F0", fontWeight:500 }}>{t.description}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"#475569" }}>
                        {t.date} · <span style={{ color:CATEGORIES[t.category]?.color||"#94A3B8", fontWeight:600 }}>{t.category.slice(2)}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:t.type==="income"?"#22C55E":"#FB7185" }}>
                      {t.type==="income"?"+":"-"}{fmt(t.amount)}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:18, padding:"2px 4px", lineHeight:1 }} title="Delete">×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
