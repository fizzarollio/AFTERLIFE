import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive, Bell, Compass, Gamepad2, Globe2, Home, LockKeyhole,
  Menu, MessageCircle, Moon, Search, Settings, Shield, ShoppingBag,
  Sparkles, UserRound, X, Zap, Trash2, Pencil, Save, ArrowLeft, Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase, supabaseConfigured } from "../lib/supabase";
import type { Database } from "../types/database.types";
import { ArchiveModule, NotificationsModule, SettingsModule, SignalModule, WorldModule } from "./FunctionalModules";

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
  const [installHelp, setInstallHelp] = useState(false);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null);
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
    setProfile(null);
    if (!supabase || !userId) return () => { active = false; };
    void supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data, error }) => {
      if (active && !error) setProfile(data);
    });
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
        <button className="brand-home" type="button" onClick={() => {setActive("home");setMobileOpen(false);}} aria-label="AFTERLIFE — home"><BrandMark className="brand-mark"/><span><b>AFTERLIFE</b><small>YOUR SECOND EXISTENCE</small></span></button>
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
        <div className="user"><div className="user-avatar">{profile?.display_name?.slice(0,1).toUpperCase() || <UserRound size={17}/>}</div><div><b>{profile?.display_name || t("guest")}</b><small>{profile ? "@"+profile.username : t("notSignedIn")}</small></div>{profile ? <Sparkles size={14}/> : <LockKeyhole size={14}/>}</div>
      </div>
    </aside>
  );
  return <div className="app-shell">
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label={t("close")}/>}
    <div className={`sidebar-wrap ${mobileOpen ? "open" : ""}`}>{nav}</div>
    <main className="main">
      <header className="topbar">
        <div className="crumb"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label={t("menu")}><Menu size={19}/></button><button className="topbar-brand" type="button" onClick={()=>setActive("home")} aria-label="AFTERLIFE — home"><BrandMark/><span>AFTERLIFE</span></button><i>/</i><b>{t(`sections.${active}`)}</b></div>
        <div className="actions">
          <button className="install-button" type="button" onClick={()=>setInstallHelp(v=>!v)} aria-expanded={installHelp}><Share2 size={15}/><span>На экран</span></button>
          <label className="search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("search")}/><kbd>⌘ K</kbd></label>
          <button className="bell" onClick={()=>setActive("notifications")} aria-label={t("sections.notifications")}><Bell size={18}/><i/></button>
          <div className="lang-wrap">
            <button className="lang-button" onClick={()=>setLangOpen(!langOpen)}><Globe2 size={15}/>{i18n.language.toUpperCase()}</button>
            {installHelp && <div className="install-help"><button className="install-help-close" onClick={()=>setInstallHelp(false)} aria-label={t("close")}><X size={14}/></button><b>Добавить AFTERLIFE на экран</b><p><strong>iPhone:</strong> открой сайт в Safari → нажми «Поделиться» → «На экран Домой» → «Добавить».</p><p><strong>Компьютер:</strong> используй значок установки в адресной строке браузера (если доступен).</p></div>}
            {langOpen && <div className="lang-menu">{languages.map(l=><button key={l} onClick={()=>{void i18n.changeLanguage(l);setLangOpen(false);}}>{t(`languages.${l}`)}</button>)}</div>}
          </div>
        </div>
      </header>
      <div className="content">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.2}}>
            {active === "home" ? <Dashboard t={translate} onNavigate={setActive} walletBalance={walletBalance} profile={profile}/> : active === "identity" ? <Identity t={translate} userEmail={userEmail} userId={userId} profile={profile} onProfileSaved={setProfile}/> : active === "void" ? <VoidJournal t={translate} userId={userId} onIdentity={()=>setActive("identity")}/> : active === "missions" ? <Missions t={translate} userId={userId} onIdentity={()=>setActive("identity")}/> : active === "world" ? <WorldModule t={translate} userId={userId} onSignIn={()=>setActive("identity")}/> : active === "signal" ? <SignalModule t={translate} userId={userId} onSignIn={()=>setActive("identity")}/> : active === "notifications" ? <NotificationsModule t={translate} userId={userId} onSignIn={()=>setActive("identity")}/> : active === "archive" ? <ArchiveModule t={translate} userId={userId} onSignIn={()=>setActive("identity")}/> : active === "settings" ? <SettingsModule t={translate} userId={userId} onSignIn={()=>setActive("identity")} language={i18n.language} onLanguageChange={language=>{void i18n.changeLanguage(language);}}/> : <Module t={translate} section={active} onHome={()=>setActive("home")}/>}
          </motion.div>
        </AnimatePresence>
        <footer><span>AFTERLIFE © 2026</span><span>{t("footer")}</span><span className="mono">FOUNDATION BUILD 0.1.0</span></footer>
      </div>
    </main>
  </div>;
}

function BrandMark({className=""}:{className?:string}) {
  return <svg className={className} viewBox="0 0 64 64" role="img" aria-label="AFTERLIFE">
    <defs><linearGradient id="afterlifeGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2b4ff"/><stop offset=".55" stopColor="#b45cff"/><stop offset="1" stopColor="#ff4fa3"/></linearGradient></defs>
    <circle cx="32" cy="32" r="29" fill="#160d20" stroke="url(#afterlifeGlow)" strokeWidth="1.8"/>
    <path d="M18 27c0-10 6-17 14-17s14 7 14 17l-2 15-7 8H27l-7-8z" fill="none" stroke="url(#afterlifeGlow)" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M22 29l8-4v12l-8-2zM42 29l-8-4v12l8-2z" fill="#c77aff"/>
    <path d="M28 43h8m-4-6-4 6 4 5 4-5zM25 17l-5-5m19 5 5-5" fill="none" stroke="#f2b4ff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 31l-5-3m43 3 5-3M18 47l-4 4m36-4 4 4" stroke="#ff80d0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>;
}

function Dashboard({t,onNavigate,walletBalance,profile}:{t:(key:string)=>string;onNavigate:(s:Section)=>void;walletBalance:number|null;profile:Database["public"]["Tables"]["profiles"]["Row"]|null}) {
  return <>
    <section className="welcome">
      <div className="eyebrow">{t("welcomeEyebrow")}</div>
      <h1>{t("welcome")} <em>{t("stranger")}</em></h1>
      <p>{t("welcomeDescription")}</p>
      <button className="primary" onClick={()=>onNavigate("identity")}>{t("createIdentity")} <span>↗</span></button>
    </section>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><i/> {t("universeLive")}</div><h2>{t("heroTitle")}<br/><em>{t("heroAccent")}</em></h2><p>{t("heroDescription")}</p><button className="outline" onClick={()=>onNavigate("world")}>{t("exploreWorld")} ↗</button></div>
      <button className="hero-emblem" type="button" onClick={()=>onNavigate("home")} aria-label="AFTERLIFE — главное меню"><BrandMark className="hero-logo-mark"/></button>
      <div className="coordinates">VOID SECTOR / 001<br/>SIGNAL: WAITING</div>
    </section>
    <div className="section-head"><div><div className="eyebrow">{t("yourUniverse")}</div><h2>{t("overview")}</h2></div><span className="status"><i/>{t("interfacePreview")}</span></div>
    <section className="stats">
      <article><div>{t("level")} <Zap size={15}/></div><strong>{profile ? Math.min(100,Math.floor(Math.sqrt(profile.experience/100))+1) : "—"} <small>/ 100</small></strong><p>{profile ? t("missions.levelProgress") : t("afterSignup")}</p></article>
      <article><div>{t("experience")} <Sparkles size={15}/></div><strong>{profile ? profile.experience.toLocaleString() : "—"} <small>XP</small></strong><p>{profile ? t("missions.totalExperience") : t("progressStarts")}</p></article>
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
function Identity({t,userEmail,userId,profile,onProfileSaved}:{t:(key:string)=>string;userEmail:string|null;userId:string|null;profile:Database["public"]["Tables"]["profiles"]["Row"]|null;onProfileSaved:(profile:Database["public"]["Tables"]["profiles"]["Row"])=>void}) {
  const [email,setEmail] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [code,setCode] = useState("");
  const [codeSent,setCodeSent] = useState(false);
  const [resendCooldown,setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function sendCode(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setCodeSent(true);
      setResendCooldown(60);
      setMessage("Код отправлен на почту. Введи 6 цифр ниже.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("auth.failed"));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const {error} = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      setMessage("Почта подтверждена. Вход выполнен.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось подтвердить код.");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (!supabase || resendCooldown > 0) return;
    setBusy(true);
    setMessage("");
    try {
      const {error} = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setResendCooldown(60);
      setMessage("Новый код отправлен.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось отправить код.");
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
      {userId && <ProfileEditor t={t} userId={userId} profile={profile} onSaved={onProfileSaved}/>}
      <button className="secondary" type="button" onClick={signOut} disabled={busy}>{busy ? t("auth.working") : t("auth.signOut")}</button>
    </div> : <div className="auth-card">
      <form onSubmit={codeSent ? verifyCode : sendCode}>
        <label htmlFor="identity-email">{t("auth.email")}</label>
        <input id="identity-email" type="email" autoComplete="email" required disabled={codeSent} value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@example.com"/>
        {codeSent && <>
          <label htmlFor="identity-code">Код из письма</label>
          <input id="identity-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event=>setCode(event.target.value.replace(/\\D/g,"").slice(0,6))} placeholder="123456"/>
        </>}
        <button className="primary" type="submit" disabled={busy}>{busy ? "Подождите…" : codeSent ? "Подтвердить код" : "Отправить код"}</button>
      </form>
      {codeSent && <><button className="secondary" type="button" onClick={resendCode} disabled={busy || resendCooldown > 0}>{resendCooldown > 0 ? `Повторная отправка через ${resendCooldown} сек.` : "Отправить код ещё раз"}</button><button className="text-action" type="button" onClick={()=>{setCodeSent(false);setCode("");setMessage("");setResendCooldown(0);}}>Изменить адрес почты</button></>}
      <p className="auth-note">{codeSent ? "Проверь входящие и папку «Спам». Код состоит из 6 цифр." : "На почту придёт одноразовый код подтверждения из 6 цифр."}</p>
    </div>}
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

function ProfileEditor({t,userId,profile,onSaved}:{t:(key:string)=>string;userId:string;profile:Database["public"]["Tables"]["profiles"]["Row"]|null;onSaved:(profile:Database["public"]["Tables"]["profiles"]["Row"])=>void}) {
  const [displayName,setDisplayName]=useState(profile?.display_name ?? "");
  const [username,setUsername]=useState(profile?.username ?? "");
  const [bio,setBio]=useState(profile?.bio ?? "");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{
    setDisplayName(profile?.display_name ?? "");
    setUsername(profile?.username ?? "");
    setBio(profile?.bio ?? "");
  },[profile?.id,profile?.updated_at]);
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const cleanUsername=username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {setError(t("profile.usernameInvalid"));return;}
    if (!displayName.trim() || displayName.trim().length>40) {setError(t("profile.nameInvalid"));return;}
    if (bio.length>240) {setError(t("profile.bioInvalid"));return;}
    setBusy(true);setError("");setMessage("");
    const {data,error:saveError}=await supabase.from("profiles").update({
      display_name:displayName.trim(),username:cleanUsername,bio:bio.trim(),updated_at:new Date().toISOString()
    }).eq("id",userId).select("*").single();
    if(saveError) {
      setError(saveError.code==="23505"?t("profile.usernameTaken"):saveError.message);
    } else if(data) {
      onSaved(data);setMessage(t("profile.saved"));
    }
    setBusy(false);
  }
  return <form className="profile-editor" onSubmit={save}>
    <div className="profile-preview">
      <div className="profile-avatar">{displayName.trim().slice(0,1).toUpperCase() || <UserRound size={25}/>}</div>
      <div><span className="eyebrow">{t("profile.preview")}</span><strong>{displayName || t("profile.defaultName")}</strong><small>@{username || "username"}</small></div>
    </div>
    <div className="profile-fields">
      <label htmlFor="profile-display">{t("profile.displayName")}</label>
      <input id="profile-display" value={displayName} maxLength={40} required onChange={e=>setDisplayName(e.target.value)} />
      <label htmlFor="profile-username">{t("profile.username")}</label>
      <input id="profile-username" value={username} maxLength={24} required autoCapitalize="none" autoCorrect="off" onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}/>
      <small className="profile-hint">{t("profile.usernameHint")}</small>
      <label htmlFor="profile-bio">{t("profile.bio")}</label>
      <textarea id="profile-bio" value={bio} maxLength={240} rows={4} onChange={e=>setBio(e.target.value)} placeholder={t("profile.bioPlaceholder")}/>
      <div className="profile-form-bottom"><span className="char-count">{bio.length}/240</span><button className="primary" type="submit" disabled={busy || !profile}>{busy?t("profile.saving"):t("profile.save")}</button></div>
    </div>
    {error && <div className="notice" role="alert">{error}</div>}
    {message && <div className="notice" role="status">{message}</div>}
    {!profile && <p className="profile-hint">{t("profile.loading")}</p>}
    <p className="profile-hint">{t("profile.privacyNote")}</p>
  </form>;
}

type Mission = Database["public"]["Tables"]["missions"]["Row"];
type UserMission = Database["public"]["Tables"]["user_missions"]["Row"];
function Missions({t,userId,onIdentity}:{t:(key:string)=>string;userId:string|null;onIdentity:()=>void}) {
 const [missions,setMissions]=useState<Mission[]>([]);
 const [progress,setProgress]=useState<UserMission[]>([]);
 const [balance,setBalance]=useState<number|null>(null);
 const [experience,setExperience]=useState<number|null>(null);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [loading,setLoading]=useState(true);
 async function load() {
  if(!supabase||!userId){setLoading(false);return;}
  setLoading(true);setError("");
  const [m,p,w,profile]=await Promise.all([
   supabase.from("missions").select("*").eq("is_active",true).order("created_at"),
   supabase.from("user_missions").select("*").eq("user_id",userId),
   supabase.from("wallets").select("balance").eq("user_id",userId).maybeSingle(),
   supabase.from("profiles").select("experience").eq("id",userId).maybeSingle()
  ]);
  if(m.error||p.error||w.error||profile.error) setError(m.error?.message||p.error?.message||w.error?.message||profile.error?.message||t("missions.loadFailed"));
  else {setMissions(m.data??[]);setProgress(p.data??[]);setBalance(w.data?.balance??0);setExperience(profile.data?.experience??0);}
  setLoading(false);
 }
 useEffect(()=>{void load();},[userId]);
 async function start(missionId:string) {
  if(!supabase||!userId)return;
  setBusy(missionId);setError("");setNotice("");
  const {error:e}=await supabase.from("user_missions").insert({mission_id:missionId,user_id:userId,status:"started"});
  if(e) setError(e.code==="23505"?t("missions.alreadyStarted"):e.message);
  else {setNotice(t("missions.started"));await load();}
  setBusy(null);
 }
 async function complete(item:UserMission) {
  if(!supabase)return;
  setBusy(item.id);setError("");setNotice("");
  const {data,error:e}=await supabase.rpc("complete_mission",{p_user_mission_id:item.id});
  if(e) setError(e.message);
  else {
   const result=data?.[0];
   if(result){setNotice(t("missions.rewardReceived").replace("{reward}",String(result.reward)));setBalance(result.new_balance);setExperience(result.new_experience);}
   await load();
  }
  setBusy(null);
 }
 if(!userId)return <section className="module"><div className="module-icon"><Gamepad2 size={26}/></div><div className="eyebrow">{t("missions.eyebrow")}</div><h1>{t("sections.missions")}</h1><p>{t("missions.signIn")}</p><button className="primary" onClick={onIdentity}>{t("missions.goSignIn")}</button></section>;
 const done=progress.filter(x=>x.status==="completed").length;
 const level=experience===null?1:Math.min(100,Math.floor(Math.sqrt(experience/100))+1);
 const levelStart=(level-1)*(level-1)*100;
 const nextLevel=level*level*100;
 const pct=experience===null?0:Math.min(100,Math.round((experience-levelStart)/(nextLevel-levelStart)*100));
 return <section className="missions-page">
  <div className="missions-heading"><div><div className="eyebrow">{t("missions.eyebrow")}</div><h1>{t("sections.missions")}</h1><p>{t("missions.intro")}</p></div><button className="text-action" onClick={()=>void load()} disabled={loading}>{t("missions.refresh")}</button></div>
  <div className="mission-stats"><article><span>{t("missions.level")}</span><strong>{level}</strong><div className="xp-track"><i style={{width:pct+"%"}}/></div><small>{experience??0} / {nextLevel} XP</small></article><article><span>{t("missions.completed")}</span><strong>{done}</strong><small>{t("missions.completedCaption")}</small></article><article><span>{t("missions.fragments")}</span><strong>{balance??"—"}</strong><small>{t("missions.virtualOnly")}</small></article></div>
  {error&&<div className="notice" role="alert">{error}</div>}{notice&&<div className="notice" role="status">{notice}</div>}
  <div className="mission-list-head"><div><div className="eyebrow">{t("missions.available")}</div><h2>{t("missions.yourPath")}</h2></div><span className="mission-count">{missions.length}</span></div>
  {loading?<div className="void-empty">{t("missions.loading")}</div>:missions.length===0?<div className="void-empty">{t("missions.empty")}</div>:<div className="mission-grid">{missions.map(m=>{
   const item=progress.find(x=>x.mission_id===m.id);
   const completed=item?.status==="completed";
   return <article className="mission-card" key={m.id}><div className="mission-card-top"><span className="mission-symbol"><Sparkles size={18}/></span><span className="mission-reward">+{m.points} {t("missions.fragmentsShort")}</span></div><h3>{m.title}</h3><p>{m.description}</p>
   {completed?<span className="mission-done"><Shield size={14}/>{t("missions.completedStatus")}</span>:item?<button className="primary" disabled={busy===item.id} onClick={()=>void complete(item)}>{busy===item.id?t("missions.processing"):t("missions.complete")}</button>:<button className="outline" disabled={busy===m.id} onClick={()=>void start(m.id)}>{busy===m.id?t("missions.processing"):t("missions.start")}</button>}
   </article>;
  })}</div>}
  <p className="void-footnote"><LockKeyhole size={13}/>{t("missions.rewardSecurity")}</p>
 </section>;
}
