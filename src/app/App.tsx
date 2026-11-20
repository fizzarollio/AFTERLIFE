import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive, Bell, Compass, Gamepad2, Globe2, Home, LockKeyhole,
  Menu, MessageCircle, Moon, Search, Settings, Shield, ShoppingBag,
  Sparkles, UserRound, X, Zap, Trash2, Pencil, Save, ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase, supabaseConfigured } from "../lib/supabase";
import type { Database } from "../types/database.types";

type Section = "home" | "void" | "identity" | "missions" | "market" | "world" | "signal" | "notifications" | "archive" | "settings";
const items: { id: Section; icon: typeof Home }[] = [
  { id: "home", icon: Home }, { id: "void", icon: Moon }, { id: "identity", icon: UserRound },
  { id: "missions", icon: Gamepad2 }, { id: "market", icon: ShoppingBag }, { id: "world", icon: Compass },
  { id: "signal", icon: MessageCircle }, { id: "notifications", icon: Bell },
  { id: "archive", icon: Archive }, { id: "settings", icon: Settings },
];
const languages = ["ru", "en", "fr", "es", "de", "pt", "zh", "ja", "ko", "ar"];

export default function App() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState<Section>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setUserId(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let active = true;
    setWalletBalance(null);
    if (!supabase || !userId) return () => { active = false; };
    void supabase.from("wallets").select("balance").eq("user_id", userId).maybeSingle().then(({ data, error }) => {
      if (active && !error) setWalletBalance(data?.balance ?? 0);
    });
    return () => { active = false; };
  }, [userId]);
  const translate = (key: string) => String(t(key));
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);
  const nav = (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">✳</div>
        <div><b>AFTERLIFE</b><small>YOUR SECOND EXISTENCE</small></div>
        <button className="close-mobile" onClick={() => setMobileOpen(false)} aria-label={t("close")}><X size={18}/></button>
      </div>
      <div className="system"><i/> {t("system")} <span>EU-01</span></div>
      <div className="nav-caption">{t("yourUniverse")}</div>
      <nav>{items.map(({id, icon: Icon}) => (
        <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => {setActive(id);setMobileOpen(false);}}>
          <Icon size={17}/><span>{t(`sections.${id}`)}</span>{id === "notifications" && <i className="unread"/>}
        </button>
      ))}</nav>
      <div className="sidebar-bottom">
        <div className="season"><div><Sparkles size={14}/>{t("season")}</div><strong>{t("seasonTitle")}</strong><p>{t("seasonDescription")}</p><div className="season-bar"/></div>
        <div className="user"><div className="user-avatar"><UserRound size={17}/></div><div><b>{t("guest")}</b><small>{t("notSignedIn")}</small></div><LockKeyhole size={14}/></div>
      </div>
    </aside>
  );
  return <div className="app-shell">
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label={t("close")}/>}
    <div className={`sidebar-wrap ${mobileOpen ? "open" : ""}`}>{nav}</div>
    <main className="main">
      <header className="topbar">
        <div className="crumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label={t("menu")}><Menu size={19}/></button><span>AFTERLIFE</span><i>/</i><b>{t(`sections.${active}`)}</b></div>
        <div className="actions">
          <label className="search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("search")}/><kbd>⌘ K</kbd></label>
          <button className="bell" onClick={()=>setActive("notifications")} aria-label={t("sections.notifications")}><Bell size={18}/><i/></button>
          <div className="lang-wrap">
            <button className="lang-button" onClick={()=>setLangOpen(!langOpen)}><Globe2 size={15}/>{i18n.language.toUpperCase()}</button>
            {langOpen && <div className="lang-menu">{languages.map(l=><button key={l} onClick={()=>{void i18n.changeLanguage(l);setLangOpen(false);}}>{t(`languages.${l}`)}</button>)}</div>}
          </div>
        </div>
      </header>
      <div className="content">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.2}}>
            {active === "home" ? <Dashboard t={translate} onNavigate={setActive} walletBalance={walletBalance}/> : active === "identity" ? <Identity t={translate} userEmail={userEmail}/> : active === "void" ? <VoidJournal t={translate} userId={userId} onIdentity={()=>setActive("identity")}/> : <Module t={translate} section={active} onHome={()=>setActive("home")}/>}
          </motion.div>
        </AnimatePresence>
        <footer><span>AFTERLIFE © 2026</span><span>{t("footer")}</span><span className="mono">FOUNDATION BUILD 0.1.0</span></footer>
      </div>
    </main>
  </div>;
}

function Dashboard({t,onNavigate,walletBalance}:{t:(key:string)=>string;onNavigate:(s:Section)=>void;walletBalance:number|null}) {
  return <>
    <section className="welcome">
      <div className="eyebrow">{t("welcomeEyebrow")}</div>
      <h1>{t("welcome")} <em>{t("stranger")}</em></h1>
      <p>{t("welcomeDescription")}</p>
      <button className="primary" onClick={()=>onNavigate("identity")}>{t("createIdentity")} <span>↗</span></button>
    </section>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><i/> {t("universeLive")}</div><h2>{t("heroTitle")}<br/><em>{t("heroAccent")}</em></h2><p>{t("heroDescription")}</p><button className="outline" onClick={()=>onNavigate("world")}>{t("exploreWorld")} ↗</button></div>
      <div className="planet"><div className="planet-ring ring1"/><div className="planet-ring ring2"/><div className="planet-ring ring3"/><div className="planet-core"><Sparkles size={32}/></div><span className="planet-star star1"/><span className="planet-star star2"/></div>
      <div className="coordinates">VOID SECTOR / 001<br/>SIGNAL: WAITING</div>
    </section>
    <div className="section-head"><div><div className="eyebrow">{t("yourUniverse")}</div><h2>{t("overview")}</h2></div><span className="status"><i/>{t("interfacePreview")}</span></div>
    <section className="stats">
      <article><div>{t("level")} <Zap size={15}/></div><strong>— <small>/ 100</small></strong><p>{t("afterSignup")}</p></article>
      <article><div>{t("experience")} <Sparkles size={15}/></div><strong>— <small>XP</small></strong><p>{t("progressStarts")}</p></article>
      <article><div>{t("fragments")} <Globe2 size={15}/></div><strong>{walletBalance === null ? "—" : walletBalance.toLocaleString()}</strong><p>{t("virtualCurrency")}</p></article>
    </section>
    <section className="lower">
      <article className="panel"><div className="panel-head"><div><div className="eyebrow">{t("community")}</div><h3>{t("voidWhispers")}</h3></div><button onClick={()=>onNavigate("void")}>{t("explore")} ↗</button></div>
        <div className="empty"><div className="empty-icon"><Moon size={24}/></div><b>{t("voidQuiet")}</b><p>{t("voidDescription")}</p><button className="secondary" onClick={()=>onNavigate("void")}>{t("enterVoid")} ↗</button></div>
      </article>
      <article className="panel journey"><div className="panel-head"><div><div className="eyebrow">{t("progression")}</div><h3>{t("firstSteps")}</h3></div><Gamepad2 size={18}/></div>
        <div className="journey-body"><div className="journey-orb"><div/><Sparkles size={24}/></div><b>{t("journeyTitle")}</b><p>{t("journeyDescription")}</p><button onClick={()=>onNavigate("missions")}>{t("viewMissions")} ↗</button></div>
      </article>
    </section>
  </>;
}

function Module({t,section,onHome}:{t:(key:string)=>string;section:Section;onHome:()=>void}) {
  const Icon = items.find(x=>x.id===section)?.icon ?? Shield;
  return <section className="module"><div className="module-icon"><Icon size={26}/></div><div className="eyebrow">{t("module")}</div><h1>{t(`sections.${section}`)}</h1><p>{t(`descriptions.${section}`)}</p><div className="notice"><Shield size={16}/>{t("notImplemented")}</div><button className="secondary" onClick={onHome}>{t("backHome")} ↗</button></section>;
}
function Identity({t,userEmail}:{t:(key:string)=>string;userEmail:string|null}) {
  const [email,setEmail] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");

  async function sendLink(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMessage(t("auth.sent"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("auth.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    const {error} = await supabase.auth.signOut();
    setMessage(error ? error.message : t("auth.signedOut"));
    setBusy(false);
  }

  return <section className="module identity-module">
    <div className="module-icon"><UserRound size={26}/></div>
    <div className="eyebrow">{t("auth.eyebrow")}</div>
    <h1>{t("sections.identity")}</h1>
    <p>{t("descriptions.identity")}</p>
    {!supabaseConfigured ? <div className="notice">{t("auth.configure")}</div> : userEmail ? <div className="auth-card">
      <span className="eyebrow">{t("auth.signedInAs")}</span>
      <strong className="auth-email">{userEmail}</strong>
      <button className="secondary" type="button" onClick={signOut} disabled={busy}>{busy ? t("auth.working") : t("auth.signOut")}</button>
    </div> : <form className="auth-card" onSubmit={sendLink}>
      <label htmlFor="identity-email">{t("auth.email")}</label>
      <input id="identity-email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@example.com"/>
      <button className="primary" type="submit" disabled={busy}>{busy ? t("auth.sending") : t("auth.sendLink")}</button>
      <p className="auth-note">{t("auth.note")}</p>
    </form>}
    {message && <div className="notice" role="status">{message}</div>}
  </section>;
}

type VoidEntry = Database["public"]["Tables"]["void_entries"]["Row"];

function VoidJournal({t,userId,onIdentity}:{t:(key:string)=>string;userId:string|null;onIdentity:()=>void}) {
  const [entries,setEntries] = useState<VoidEntry[]>([]);
  const [loading,setLoading] = useState(false);
  const [saving,setSaving] = useState(false);
  const [editingId,setEditingId] = useState<string|null>(null);
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [mood,setMood] = useState("");
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");

  async function loadEntries() {
    if (!supabase || !userId) return;
    setLoading(true);
    setError("");
    const {data,error:queryError} = await supabase.from("void_entries").select("*").order("updated_at",{ascending:false});
    if (queryError) setError(queryError.message);
    else setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { void loadEntries(); }, [userId]);

  function resetForm() {
    setEditingId(null); setTitle(""); setBody(""); setMood("");
  }

  function startEdit(entry:VoidEntry) {
    setEditingId(entry.id); setTitle(entry.title); setBody(entry.body); setMood(entry.mood ?? "");
    setNotice(""); setError("");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  async function saveEntry(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !userId) return;
    if (!body.trim()) { setError(t("void.bodyRequired")); return; }
    setSaving(true); setError(""); setNotice("");
    const values = {title:title.trim().slice(0,100),body:body.trim().slice(0,5000),mood:mood || null};
    const result = editingId
      ? await supabase.from("void_entries").update(values).eq("id",editingId).select("*").single()
      : await supabase.from("void_entries").insert({...values,user_id:userId}).select("*").single();
    if (result.error) setError(result.error.message);
    else {
      setNotice(t(editingId ? "void.updated" : "void.saved"));
      resetForm();
      await loadEntries();
    }
    setSaving(false);
  }

  async function deleteEntry(id:string) {
    if (!supabase) return;
    if (!window.confirm(t("void.deleteConfirm"))) return;
    setError(""); setNotice("");
    const {error:deleteError} = await supabase.from("void_entries").delete().eq("id",id);
    if (deleteError) setError(deleteError.message);
    else { setEntries(current=>current.filter(entry=>entry.id!==id)); if (editingId===id) resetForm(); setNotice(t("void.deleted")); }
  }

  if (!userId) return <section className="module void-module">
    <div className="module-icon"><Moon size={26}/></div><div className="eyebrow">{t("void.eyebrow")}</div>
    <h1>{t("sections.void")}</h1><p>{t("void.privateIntro")}</p>
    <div className="notice"><LockKeyhole size={16}/>{t("void.signInRequired")}</div>
    <button className="primary" onClick={onIdentity}>{t("void.goToIdentity")} ↗</button>
  </section>;

  return <section className="void-module">
    <div className="void-heading">
      <div><div className="eyebrow">{t("void.eyebrow")}</div><h1>{t("sections.void")}</h1><p>{t("void.privateIntro")}</p></div>
      <div className="private-label"><LockKeyhole size={14}/>{t("void.privateLabel")}</div>
    </div>
    <form className="void-editor" onSubmit={saveEntry}>
      <div className="void-editor-head"><div><span className="eyebrow">{editingId ? t("void.editing") : t("void.newEntry")}</span><h2>{t("void.writeTitle")}</h2></div>
        {editingId && <button className="text-action" type="button" onClick={resetForm}><ArrowLeft size={14}/>{t("void.cancel")}</button>}
      </div>
      <label htmlFor="void-title">{t("void.titleLabel")}</label>
      <input id="void-title" value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} placeholder={t("void.titlePlaceholder")}/>
      <label htmlFor="void-body">{t("void.bodyLabel")}</label>
      <textarea id="void-body" value={body} maxLength={5000} required rows={7} onChange={e=>setBody(e.target.value)} placeholder={t("void.bodyPlaceholder")}/>
      <div className="void-editor-bottom">
        <label className="mood-select">{t("void.moodLabel")}<select value={mood} onChange={e=>setMood(e.target.value)}><option value="">{t("void.moodNone")}</option><option value="calm">{t("void.moods.calm")}</option><option value="hopeful">{t("void.moods.hopeful")}</option><option value="tired">{t("void.moods.tired")}</option><option value="uncertain">{t("void.moods.uncertain")}</option><option value="grateful">{t("void.moods.grateful")}</option></select></label>
        <span className="char-count">{body.length}/5000</span>
        <button className="primary" type="submit" disabled={saving || !body.trim()}><Save size={15}/>{saving ? t("void.saving") : t(editingId ? "void.update" : "void.save")}</button>
      </div>
    </form>
    {error && <div className="notice void-message" role="alert">{error}</div>}
    {notice && <div className="notice void-message" role="status">{notice}</div>}
    <div className="void-list-head"><div><div className="eyebrow">{t("void.archiveEyebrow")}</div><h2>{t("void.yourEntries")} <span>{entries.length}</span></h2></div><button className="text-action" onClick={()=>void loadEntries()} disabled={loading}>{t("void.refresh")}</button></div>
    {loading ? <div className="void-empty">{t("void.loading")}</div> : entries.length===0 ? <div className="void-empty"><Moon size={22}/><b>{t("void.emptyTitle")}</b><p>{t("void.emptyDescription")}</p></div> : <div className="void-entry-list">
      {entries.map(entry=><article className="void-entry" key={entry.id}>
        <div className="void-entry-top"><div><span className="void-date">{new Date(entry.updated_at).toLocaleString()}</span><h3>{entry.title || t("void.untitled")}</h3></div>
          <div className="void-entry-actions"><button className="icon-action" aria-label={t("void.edit")} onClick={()=>startEdit(entry)}><Pencil size={15}/></button><button className="icon-action danger" aria-label={t("void.delete")} onClick={()=>void deleteEntry(entry.id)}><Trash2 size={15}/></button></div>
        </div>
        {entry.mood && <span className="void-mood">{t("void.moods."+entry.mood)}</span>}
        <p className="void-entry-body">{entry.body}</p>
      </article>)}
    </div>}
    <p className="void-footnote"><LockKeyhole size={13}/>{t("void.privacyNote")}</p>
  </section>;
}
