import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive, Bell, Compass, Gamepad2, Globe2, Home, LockKeyhole,
  Menu, MessageCircle, Moon, Search, Settings, Shield, ShoppingBag,
  Sparkles, UserRound, X, Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
            {active === "home" ? <Dashboard t={t} onNavigate={setActive}/> : <Module t={t} section={active} onHome={()=>setActive("home")}/>}
          </motion.div>
        </AnimatePresence>
        <footer><span>AFTERLIFE © 2026</span><span>{t("footer")}</span><span className="mono">FOUNDATION BUILD 0.1.0</span></footer>
      </div>
    </main>
  </div>;
}

function Dashboard({t,onNavigate}:{t:(key:string)=>string;onNavigate:(s:Section)=>void}) {
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
      <article><div>{t("fragments")} <Globe2 size={15}/></div><strong>—</strong><p>{t("virtualCurrency")}</p></article>
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