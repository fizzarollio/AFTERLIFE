import { useEffect, useState, type FormEvent } from "react";
import { Bell, Compass, Globe2, LockKeyhole, MessageCircle, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database.types";

type T = (key: string) => string;
type World = Database["public"]["Tables"]["worlds"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "username" | "display_name" | "bio">;

export function WorldModule({ t, userId, onSignIn }: { t: T; userId: string | null; onSignIn: () => void }) {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function load() {
    if (!supabase) return;
    const { data, error: e } = await supabase.from("worlds").select("*").eq("is_active", true).order("created_at");
    if (e) setError(e.message); else setWorlds(data ?? []);
    if (userId) {
      const { data: memberships, error: mError } = await supabase.from("world_members").select("world_id").eq("user_id", userId);
      if (mError) setError(mError.message); else setJoined((memberships ?? []).map(x => x.world_id));
    } else setJoined([]);
  }
  useEffect(() => { void load(); }, [userId]);
  async function toggle(worldId: string) {
    if (!userId) { onSignIn(); return; }
    if (!supabase) return;
    setBusy(worldId); setError("");
    const isJoined = joined.includes(worldId);
    const result = isJoined
      ? await supabase.from("world_members").delete().eq("world_id", worldId).eq("user_id", userId)
      : await supabase.from("world_members").insert({ world_id: worldId, user_id: userId });
    if (result.error) setError(result.error.message);
    else setJoined(current => isJoined ? current.filter(id => id !== worldId) : [...current, worldId]);
    setBusy(null);
  }
  return <section className="feature-page">
    <div className="feature-heading"><div><div className="eyebrow">ИССЛЕДОВАНИЕ / МИРЫ</div><h1>{t("sections.world")}</h1><p>Открывай пространства AFTERLIFE и присоединяйся к тем мирам, которые тебе близки.</p></div><span className="feature-count"><Globe2 size={15}/>{worlds.length} МИРОВ</span></div>
    {error && <div className="notice" role="alert">{error}</div>}
    {worlds.length === 0 ? <div className="feature-empty"><Compass size={25}/><b>Первые миры скоро появятся</b><p>Сейчас каталог миров пуст. Когда миры будут опубликованы, они появятся здесь.</p></div> :
      <div className="feature-grid">{worlds.map(world => <article className="feature-card world-card" key={world.id}><div className="feature-card-icon"><Globe2 size={20}/></div><span className="feature-kicker">ОТКРЫТЫЙ МИР</span><h2>{world.name}</h2><p>{world.description || "Пространство для новых историй и встреч."}</p><button className={joined.includes(world.id) ? "secondary" : "primary"} disabled={busy === world.id} onClick={() => void toggle(world.id)}>{busy === world.id ? "Подождите…" : joined.includes(world.id) ? "Покинуть мир" : "Присоединиться"} <span>↗</span></button></article>)}</div>}
  </section>;
}

export function SignalModule({ t, userId, onSignIn }: { t: T; userId: string | null; onSignIn: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, Profile>>({});
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    if (!supabase) return;
    const { data, error: e } = await supabase.from("posts").select("*").eq("visibility", "public").order("created_at", { ascending: false }).limit(40);
    if (e) { setError(e.message); return; }
    const rows = data ?? []; setPosts(rows);
    const ids = [...new Set(rows.map(x => x.author_id))];
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("id,username,display_name,bio").in("id", ids);
      setAuthors(Object.fromEntries((profiles ?? []).map(p => [p.id, p])));
    } else setAuthors({});
    if (userId) {
      const { data: f } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
      setFollowing((f ?? []).map(x => x.following_id));
    }
  }
  useEffect(() => { void load(); }, [userId]);
  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) { onSignIn(); return; }
    if (!supabase || !body.trim()) return;
    setBusy(true); setError("");
    const { error: e } = await supabase.from("posts").insert({ author_id: userId, body: body.trim(), visibility: "public" });
    if (e) setError(e.message); else { setBody(""); await load(); }
    setBusy(false);
  }
  async function searchPeople(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !query.trim()) return;
    const { data, error: e } = await supabase.from("profiles").select("id,username,display_name,bio").ilike("username", `%${query.trim().replace(/^@/, "")}%`).limit(12);
    if (e) setError(e.message); else setPeople((data ?? []).filter(p => p.id !== userId));
  }
  async function toggleFollow(personId: string) {
    if (!userId) { onSignIn(); return; }
    if (!supabase) return;
    const exists = following.includes(personId);
    const { error: e } = exists
      ? await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", personId)
      : await supabase.from("follows").insert({ follower_id: userId, following_id: personId });
    if (e) setError(e.message); else setFollowing(current => exists ? current.filter(id => id !== personId) : [...current, personId]);
  }
  return <section className="feature-page">
    <div className="feature-heading"><div><div className="eyebrow">СООБЩЕСТВО / ЛЕНТА</div><h1>{t("sections.signal")}</h1><p>Короткие мысли, обновления и голоса участников AFTERLIFE.</p></div><span className="feature-count"><MessageCircle size={15}/>СИГНАЛ</span></div>
    {error && <div className="notice" role="alert">{error}</div>}
    <div className="signal-layout">
      <div className="signal-main">
        <form className="post-composer" onSubmit={publish}><div className="eyebrow">ОСТАВИТЬ СЛЕД</div><textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2000} rows={3} placeholder="Что происходит в твоём мире?"/><div className="composer-bottom"><span>{body.length}/2000</span><button className="primary" type="submit" disabled={busy || !body.trim()}>{busy ? "Публикуем…" : "Опубликовать"} <Send size={14}/></button></div></form>
        {posts.length === 0 ? <div className="feature-empty"><MessageCircle size={24}/><b>Сигнал пока тихий</b><p>Здесь появятся публичные публикации участников. Создай первую запись.</p></div> :
          <div className="post-list">{posts.map(post => { const author = authors[post.author_id]; return <article className="post-card" key={post.id}><div className="post-author"><span className="post-avatar">{(author?.display_name || "?").slice(0,1).toUpperCase()}</span><div><b>{author?.display_name || "Участник AFTERLIFE"}</b><small>@{author?.username || "unknown"} · {new Date(post.created_at).toLocaleString()}</small></div>{userId && post.author_id !== userId && <button className="text-action" onClick={() => void toggleFollow(post.author_id)}>{following.includes(post.author_id) ? "Вы подписаны" : "+ Подписаться"}</button>}</div><p>{post.body}</p></article>; })}</div>}
      </div>
      <aside className="people-panel"><div className="eyebrow">НАЙТИ УЧАСТНИКА</div><h2>Новые связи</h2><form onSubmit={searchPeople}><input value={query} onChange={e => setQuery(e.target.value)} placeholder="@username"/><button className="secondary" type="submit">Найти</button></form>{people.map(person => <div className="person-row" key={person.id}><span className="post-avatar">{person.display_name.slice(0,1).toUpperCase()}</span><div><b>{person.display_name}</b><small>@{person.username}</small></div><button className="icon-action" aria-label="Подписаться" onClick={() => void toggleFollow(person.id)}>{following.includes(person.id) ? "✓" : "+"}</button></div>)}</aside>
    </div>
  </section>;
}

export function NotificationsModule({ t, userId, onSignIn }: { t: T; userId: string | null; onSignIn: () => void }) {
  const [rows, setRows] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  async function load() {
    if (!supabase || !userId) return;
    const { data, error: e } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(80);
    if (e) setError(e.message); else setRows(data ?? []);
  }
  useEffect(() => { void load(); }, [userId]);
  async function markRead(id: string) {
    if (!supabase || !userId) return;
    const { error: e } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
    if (e) setError(e.message); else setRows(current => current.map(x => x.id === id ? { ...x, read_at: new Date().toISOString() } : x));
  }
  if (!userId) return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">СИСТЕМА / СОБЫТИЯ</div><h1>{t("sections.notifications")}</h1></div></div><div className="notice"><LockKeyhole size={15}/>Войди в аккаунт, чтобы видеть свои уведомления.</div><button className="primary" onClick={onSignIn}>Перейти ко входу</button></section>;
  const unread = rows.filter(x => !x.read_at).length;
  return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">СИСТЕМА / СОБЫТИЯ</div><h1>{t("sections.notifications")}</h1><p>Важные события и обновления твоего аккаунта.</p></div><span className="feature-count"><Bell size={15}/>{unread} НЕПРОЧИТАНО</span></div>{error && <div className="notice">{error}</div>}{rows.length === 0 ? <div className="feature-empty"><Bell size={24}/><b>Пока нет уведомлений</b><p>Когда появятся события, они будут собраны здесь.</p></div> : <div className="notification-list">{rows.map(row => <article className={`notification-card ${row.read_at ? "read" : "unread"}`} key={row.id}><span className="notification-dot"/><div><b>{row.title}</b><p>{row.body}</p><small>{new Date(row.created_at).toLocaleString()}</small></div>{!row.read_at && <button className="secondary" onClick={() => void markRead(row.id)}>Прочитано</button>}</article>)}</div>}</section>;
}

export function ArchiveModule({ t, userId, onSignIn }: { t: T; userId: string | null; onSignIn: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [entries, setEntries] = useState<Database["public"]["Tables"]["void_entries"]["Row"][]>([]);
  const [tab, setTab] = useState<"posts" | "void">("posts");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase || !userId) return;
    void Promise.all([
      supabase.from("posts").select("*").eq("author_id", userId).order("created_at", { ascending: false }),
      supabase.from("void_entries").select("*").eq("user_id", userId).order("updated_at", { ascending: false })
    ]).then(([p, v]) => { if (p.error || v.error) setError(p.error?.message || v.error?.message || "Не удалось загрузить архив."); else { setPosts(p.data ?? []); setEntries(v.data ?? []); } });
  }, [userId]);
  if (!userId) return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">ЛЕТОПИСЬ / АРХИВ</div><h1>{t("sections.archive")}</h1></div></div><div className="notice"><LockKeyhole size={15}/>Войди в аккаунт, чтобы открыть личный архив.</div><button className="primary" onClick={onSignIn}>Перейти ко входу</button></section>;
  return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">ЛЕТОПИСЬ / АРХИВ</div><h1>{t("sections.archive")}</h1><p>Твои публикации и личные записи, собранные в одном месте.</p></div></div>{error && <div className="notice">{error}</div>}<div className="feature-tabs"><button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>Публикации · {posts.length}</button><button className={tab === "void" ? "active" : ""} onClick={() => setTab("void")}>Записи VOID · {entries.length}</button></div>{tab === "posts" ? posts.length ? <div className="archive-list">{posts.map(p => <article className="archive-card" key={p.id}><small>{new Date(p.created_at).toLocaleString()}</small><p>{p.body}</p><span>{p.visibility === "public" ? "Публичная публикация" : "Для подписчиков"}</span></article>)}</div> : <div className="feature-empty">Публикаций пока нет.</div> : entries.length ? <div className="archive-list">{entries.map(e => <article className="archive-card" key={e.id}><small>{new Date(e.updated_at).toLocaleString()}</small><h3>{e.title || "Без заголовка"}</h3><p>{e.body}</p><span>Личная запись · Только ты</span></article>)}</div> : <div className="feature-empty">Личных записей пока нет.</div>}</section>;
}

export function SettingsModule({ t, userId, onSignIn, language, onLanguageChange }: { t: T; userId: string | null; onSignIn: () => void; language: string; onLanguageChange: (language: string) => void }) {
  const [theme, setTheme] = useState("dark");
  const [visibility, setVisibility] = useState("public");
  const [messages, setMessages] = useState("following");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase || !userId) return;
    void supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle().then(({ data, error: e }) => {
      if (e) setError(e.message);
      if (data) { setTheme(data.theme); setVisibility(data.profile_visibility); setMessages(data.allow_messages); }
    });
  }, [userId]);
  async function save() {
    if (!supabase || !userId) return;
    setBusy(true); setError(""); setNotice("");
    const { error: e } = await supabase.from("user_settings").upsert({ user_id: userId, language, theme, profile_visibility: visibility, allow_messages: messages, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (e) setError(e.message); else setNotice("Настройки сохранены.");
    setBusy(false);
  }
  if (!userId) return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">АККАУНТ / ПРЕДПОЧТЕНИЯ</div><h1>{t("sections.settings")}</h1></div></div><div className="notice"><LockKeyhole size={15}/>Войди в аккаунт, чтобы сохранять настройки.</div><button className="primary" onClick={onSignIn}>Перейти ко входу</button></section>;
  return <section className="feature-page settings-page"><div className="feature-heading"><div><div className="eyebrow">АККАУНТ / ПРЕДПОЧТЕНИЯ</div><h1>{t("sections.settings")}</h1><p>Управляй приватностью и поведением своего пространства.</p></div></div>{error && <div className="notice">{error}</div>}{notice && <div className="notice" role="status">{notice}</div>}
    <div className="settings-card"><label>Язык интерфейса<select value={language} onChange={e => onLanguageChange(e.target.value)}><option value="ru">Русский</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="de">Deutsch</option><option value="pt">Português</option><option value="zh">中文</option><option value="ja">日本語</option><option value="ko">한국어</option><option value="ar">العربية</option></select></label><label>Тема<select value={theme} onChange={e => setTheme(e.target.value)}><option value="dark">Тёмная</option><option value="light">Светлая (скоро)</option><option value="system">Как в системе (скоро)</option></select></label><label>Видимость профиля<select value={visibility} onChange={e => setVisibility(e.target.value)}><option value="public">Публичный</option><option value="private">Приватный</option></select></label><label>Кто может писать тебе<select value={messages} onChange={e => setMessages(e.target.value)}><option value="nobody">Никто</option><option value="following">Те, на кого ты подписан</option><option value="everyone">Все участники</option></select></label><button className="primary" onClick={() => void save()} disabled={busy}>{busy ? "Сохраняем…" : "Сохранить настройки"}</button></div>
  </section>;
}
