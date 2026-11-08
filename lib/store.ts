import { randomUUID } from "node:crypto";
import fs from "node:fs";

export type Provider = "google" | "facebook" | "twitter" | "tiktok";

export type Avatar = { from: string; to: string; emoji: string };

export interface User {
  id: string;
  name: string;
  handle: string;
  provider: Provider | "demo";
  email?: string;
  avatar: Avatar;
  coins: number;
  bio: string;
  isHost: boolean;
  createdAt: number;
}

export interface Stream {
  id: string;
  hostId: string;
  title: string;
  category: string;
  tags: string[];
  video: string;
  viewerBase: number;
  startedAt: number;
}

export interface Comment {
  id: string;
  streamId: string;
  userId: string;
  kind: "chat" | "gift" | "join" | "system";
  text: string;
  giftId?: string;
  coins?: number;
  createdAt: number;
}

export interface Txn {
  id: string;
  type: "topup" | "gift";
  label: string;
  coins: number;
  createdAt: number;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  coins: number;
  color: string;
}

interface DB {
  users: User[];
  streams: Stream[];
  comments: Comment[];
  likes: Record<string, string[]>;
  follows: Record<string, string[]>;
  txns: Record<string, Txn[]>;
  presence: Record<string, Record<string, number>>;
}

export interface FeedItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  video: string;
  startedAt: number;
  viewers: number;
  likes: number;
  comments: number;
  liked: boolean;
  following: boolean;
  host: {
    id: string;
    name: string;
    handle: string;
    avatar: Avatar;
    followers: number;
    bio: string;
  };
}

const STATE_FILE = "/tmp/vibelive-state.json";
const PRESENCE_TTL_MS = 45_000;

export const GIFTS: Gift[] = [
  { id: "rose", name: "Mawar", emoji: "🌹", coins: 1, color: "#fe2c55" },
  { id: "donut", name: "Donat", emoji: "🍩", coins: 30, color: "#ffb703" },
  { id: "wave", name: "Hand Wave", emoji: "👋", coins: 100, color: "#25f4ee" },
  { id: "rocket", name: "Roket", emoji: "🚀", coins: 1000, color: "#7a5cff" },
  { id: "crown", name: "Mahkota", emoji: "👑", coins: 5000, color: "#ffd60a" },
  { id: "lion", name: "Singa", emoji: "🦁", coins: 15000, color: "#ff7b00" },
];

export const COIN_PACKAGES = [
  { id: "p1", coins: 100, price: 15000, bonus: 0, label: "Pemula" },
  { id: "p2", coins: 300, price: 45000, bonus: 20, label: "Populer" },
  { id: "p3", coins: 700, price: 99000, bonus: 70, label: "Hemat" },
  { id: "p4", coins: 1500, price: 199000, bonus: 200, label: "Pro" },
  { id: "p5", coins: 5000, price: 649000, bonus: 900, label: "Superfan" },
];

const AVATAR_COLORS: Array<[string, string, string]> = [
  ["#fe2c55", "#7a0bc0", "🎤"],
  ["#25f4ee", "#0b3d91", "🎮"],
  ["#ffb703", "#fb8500", "🍜"],
  ["#06d6a0", "#118ab2", "🎸"],
  ["#ff006e", "#8338ec", "💄"],
  ["#f72585", "#4cc9f0", "🏀"],
  ["#a3e635", "#0f766e", "🌱"],
  ["#f97316", "#7c2d12", "🔥"],
];

function avatar(i: number, emoji?: string): Avatar {
  const [from, to, fallback] = AVATAR_COLORS[i % AVATAR_COLORS.length];
  return { from, to, emoji: emoji ?? fallback };
}

function uid(): string {
  return randomUUID();
}

const GUEST_NAMES = [
  "Andi Wijaya",
  "Putri Salsabila",
  "Kevin Tan",
  "Rina Kartika",
  "Fajar Nugroho",
  "Lina Marlina",
  "Yoga Pratama",
  "Sinta Dewi",
];

function seed(): DB {
  const now = Date.now();
  const hosts: User[] = [
    {
      id: "u_nadia",
      name: "Nadia Ayu",
      handle: "nadiaayu",
      provider: "tiktok",
      avatar: avatar(0, "💃"),
      coins: 2400,
      bio: "Dance cover tiap malam jam 8 🎶",
      isHost: true,
      createdAt: now - 86_400_000 * 90,
    },
    {
      id: "u_rizky",
      name: "Rizky Pratama",
      handle: "rizkyprt",
      provider: "google",
      avatar: avatar(1, "🎮"),
      coins: 1200,
      bio: "Push rank Mobile Legends bareng penonton",
      isHost: true,
      createdAt: now - 86_400_000 * 60,
    },
    {
      id: "u_sarah",
      name: "Sarah Chen",
      handle: "sarahchen",
      provider: "facebook",
      avatar: avatar(2, "🍜"),
      coins: 900,
      bio: "Kuliner malam & review street food",
      isHost: true,
      createdAt: now - 86_400_000 * 45,
    },
    {
      id: "u_bagas",
      name: "Bagas Saputra",
      handle: "bagassptr",
      provider: "twitter",
      avatar: avatar(3, "🎸"),
      coins: 3100,
      bio: "Akustik request lagu favoritmu",
      isHost: true,
      createdAt: now - 86_400_000 * 120,
    },
    {
      id: "u_maya",
      name: "Maya Larasati",
      handle: "mayalara",
      provider: "tiktok",
      avatar: avatar(4, "💄"),
      coins: 1800,
      bio: "Tutorial makeup glowing under 5 menit",
      isHost: true,
      createdAt: now - 86_400_000 * 30,
    },
    {
      id: "u_dimas",
      name: "Dimas Aditya",
      handle: "dimasadt",
      provider: "google",
      avatar: avatar(5, "🏀"),
      coins: 700,
      bio: "Latihan basket & tips shooting",
      isHost: true,
      createdAt: now - 86_400_000 * 20,
    },
  ];

  const guests: User[] = GUEST_NAMES.map((name, i) => ({
    id: `u_guest${i}`,
    name,
    handle: name.toLowerCase().replace(/[^a-z]/g, ""),
    provider: "demo",
    avatar: avatar(i + 6),
    coins: 0,
    bio: "",
    isHost: false,
    createdAt: now - 86_400_000 * 5,
  }));

  const streams: Stream[] = [
    {
      id: "s_nadia",
      hostId: "u_nadia",
      title: "Dance Cover Request 🎶 malam ini spesial!",
      category: "Dance",
      tags: ["dance", "cover", "musik"],
      video: "/videos/live1.mp4",
      viewerBase: 8420,
      startedAt: now - 1000 * 60 * 26,
    },
    {
      id: "s_rizky",
      hostId: "u_rizky",
      title: "Push Mythic bareng viewers — mabar yuk!",
      category: "Gaming",
      tags: ["gaming", "mobilelegends", "mabar"],
      video: "/videos/live2.mp4",
      viewerBase: 15230,
      startedAt: now - 1000 * 60 * 52,
    },
    {
      id: "s_sarah",
      hostId: "u_sarah",
      title: "Mukbang & review street food Jakarta 🍜",
      category: "Kuliner",
      tags: ["kuliner", "mukbang", "review"],
      video: "/videos/live3.mp4",
      viewerBase: 4120,
      startedAt: now - 1000 * 60 * 12,
    },
    {
      id: "s_bagas",
      hostId: "u_bagas",
      title: "Akustik santai — request lagu di kolom chat",
      category: "Musik",
      tags: ["musik", "akustik", "live"],
      video: "/videos/live4.mp4",
      viewerBase: 6580,
      startedAt: now - 1000 * 60 * 74,
    },
    {
      id: "s_maya",
      hostId: "u_maya",
      title: "Makeup glowing 5 menit ✨ tanya apa aja",
      category: "Beauty",
      tags: ["beauty", "makeup", "tutorial"],
      video: "/videos/live5.mp4",
      viewerBase: 2960,
      startedAt: now - 1000 * 60 * 8,
    },
    {
      id: "s_dimas",
      hostId: "u_dimas",
      title: "Latihan shooting 3 poin — tantangan 100 bola",
      category: "Olahraga",
      tags: ["olahraga", "basket", "latihan"],
      video: "/videos/live6.mp4",
      viewerBase: 1870,
      startedAt: now - 1000 * 60 * 33,
    },
  ];

  const comments: Comment[] = [];
  const chatSeeds: Record<string, string[]> = {
    s_nadia: [
      "Hai Nadia! lagu apa nih nanti?",
      "Kualitas stream jernih banget 🔥",
      "Request lagu dangdut dong kak",
      "Dari Medan nonton terus nih",
    ],
    s_rizky: [
      "Semangat push Mythic-nya bang!",
      "Bisa bantu rank Epic ga?",
      "Item build-nya mantap",
      "GG bang, lanjut terus",
    ],
    s_sarah: [
      "Itu makanan apa kak? kelihatan enak",
      "Pedasnya level berapa tuh?",
      "Lagi diet tapi godaan banget 😭",
      "Review tempatnya dong",
    ],
    s_bagas: [
      "Request lagu Peterpan dong kak",
      "Suara gitar akustiknya enak",
      "Nonton sambil kerja ini mah",
      "Lagu favorit dari 2010 please",
    ],
    s_maya: [
      "Kak produknya merk apa?",
      "Cocok buat kulit berminyak ga?",
      "Tutorialnya jelas banget, makasih",
      "Coba shade yang lebih hangat kak",
    ],
    s_dimas: [
      "Form shooting-nya keren",
      "Berapa skor tadi bang?",
      "Tips buat pemula dong",
      "Latihan terus sampai subuh ya",
    ],
  };

  Object.entries(chatSeeds).forEach(([streamId, texts]) => {
    texts.forEach((text, i) => {
      const guest = guests[(i + streamId.length) % guests.length];
      comments.push({
        id: `c_seed_${streamId}_${i}`,
        streamId,
        userId: guest.id,
        kind: "chat",
        text,
        createdAt: now - 1000 * 60 * 4 + i * 25_000,
      });
    });
  });

  const likes: Record<string, string[]> = {};
  streams.forEach((s, i) => {
    likes[s.id] = guests.filter((_, gi) => (gi + i) % 3 === 0).map((g) => g.id);
  });

  return {
    users: [...hosts, ...guests],
    streams,
    comments,
    likes,
    follows: {},
    txns: {},
    presence: {},
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __vibeliveDB: DB | undefined;
}

function loadFromDisk(): DB | null {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as DB;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.streams)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function db(): DB {
  if (!globalThis.__vibeliveDB) {
    globalThis.__vibeliveDB = loadFromDisk() ?? seed();
    persist();
  }
  return globalThis.__vibeliveDB;
}

function persist(): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(globalThis.__vibeliveDB));
  } catch {
    // Sandbox filesystem may be read-only; the in-memory store still works.
  }
}

function save(): void {
  persist();
}

/* ---------------------------------- users --------------------------------- */

export function getUserById(id: string | null | undefined): User | null {
  if (!id) return null;
  return db().users.find((u) => u.id === id) ?? null;
}

export function getUserByHandle(handle: string): User | null {
  return db().users.find((u) => u.handle === handle) ?? null;
}

export function listUsers(): User[] {
  return db().users;
}

export function upsertOAuthUser(input: {
  provider: Provider;
  providerId: string;
  name: string;
  email?: string;
  handle?: string;
}): User {
  const store = db();
  const existing = store.users.find(
    (u) => u.provider === input.provider && u.email && input.email && u.email === input.email,
  );
  if (existing) return existing;

  const baseHandle =
    (input.handle || input.name || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16) || "user";
  let handle = baseHandle;
  let n = 1;
  while (store.users.some((u) => u.handle === handle)) {
    handle = `${baseHandle}${n++}`;
  }

  const user: User = {
    id: `u_${input.provider}_${input.providerId.slice(0, 12)}_${randomUUID().slice(0, 6)}`,
    name: input.name || `Pengguna ${input.provider}`,
    handle,
    provider: input.provider,
    email: input.email,
    avatar: avatar(store.users.length),
    coins: 500,
    bio: `Bergabung lewat ${input.provider}`,
    isHost: false,
    createdAt: Date.now(),
  };
  store.users.push(user);
  save();
  return user;
}

export function createDemoUser(name: string, provider: Provider | "demo" = "demo"): User {
  const store = db();
  const baseHandle =
    (name || "penonton")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 16) || "penonton";
  let handle = baseHandle;
  let n = 1;
  while (store.users.some((u) => u.handle === handle)) {
    handle = `${baseHandle}${n++}`;
  }
  const user: User = {
    id: `u_demo_${randomUUID().slice(0, 8)}`,
    name: name || "Penonton Baru",
    handle,
    provider,
    avatar: avatar(store.users.length),
    coins: 500,
    bio: "Akun demo VibeLive",
    isHost: false,
    createdAt: Date.now(),
  };
  store.users.push(user);
  save();
  return user;
}

/* --------------------------------- streams -------------------------------- */

function activeViewers(streamId: string): number {
  const store = db();
  const map = store.presence[streamId] ?? {};
  const now = Date.now();
  let count = 0;
  for (const [key, ts] of Object.entries(map)) {
    if (now - ts > PRESENCE_TTL_MS) delete map[key];
    else count++;
  }
  store.presence[streamId] = map;
  return count;
}

export function viewerCount(stream: Stream): number {
  const minute = Math.floor(Date.now() / 60_000);
  const wobble = Math.round(Math.sin(minute / 3 + stream.viewerBase) * Math.max(20, stream.viewerBase * 0.03));
  return Math.max(1, stream.viewerBase + wobble + activeViewers(stream.id));
}

export function touchPresence(streamId: string, sessionId: string): void {
  const store = db();
  store.presence[streamId] = store.presence[streamId] ?? {};
  store.presence[streamId][sessionId] = Date.now();
  save();
}

export function followerCount(hostId: string): number {
  const store = db();
  let count = 0;
  for (const list of Object.values(store.follows)) {
    if (list.includes(hostId)) count++;
  }
  return count + hostSeedFollowers(hostId);
}

function hostSeedFollowers(hostId: string): number {
  const seeds: Record<string, number> = {
    u_nadia: 128_400,
    u_rizky: 96_200,
    u_sarah: 54_800,
    u_bagas: 212_700,
    u_maya: 38_900,
    u_dimas: 21_400,
  };
  return seeds[hostId] ?? 0;
}

function toFeedItem(stream: Stream, viewerId: string | null): FeedItem | null {
  const store = db();
  const host = getUserById(stream.hostId);
  if (!host) return null;
  const likes = store.likes[stream.id] ?? [];
  const comments = store.comments.filter((c) => c.streamId === stream.id && c.kind !== "system");
  return {
    id: stream.id,
    title: stream.title,
    category: stream.category,
    tags: stream.tags,
    video: stream.video,
    startedAt: stream.startedAt,
    viewers: viewerCount(stream),
    likes: likes.length + seedLikes(stream.id),
    comments: comments.length,
    liked: viewerId ? likes.includes(viewerId) : false,
    following: viewerId ? (store.follows[viewerId] ?? []).includes(host.id) : false,
    host: {
      id: host.id,
      name: host.name,
      handle: host.handle,
      avatar: host.avatar,
      followers: followerCount(host.id),
      bio: host.bio,
    },
  };
}

function seedLikes(streamId: string): number {
  const seeds: Record<string, number> = {
    s_nadia: 18_420,
    s_rizky: 24_130,
    s_sarah: 7_980,
    s_bagas: 31_540,
    s_maya: 5_240,
    s_dimas: 3_120,
  };
  return seeds[streamId] ?? 0;
}

export function listStreams(viewerId: string | null, tab: "foryou" | "following" = "foryou"): FeedItem[] {
  const store = db();
  let items = store.streams
    .map((s) => toFeedItem(s, viewerId))
    .filter((x): x is FeedItem => Boolean(x));
  if (tab === "following" && viewerId) {
    const followed = new Set(store.follows[viewerId] ?? []);
    items = items.filter((i) => followed.has(i.host.id));
  }
  return items.sort((a, b) => b.viewers - a.viewers);
}

export function getFeedItem(streamId: string, viewerId: string | null): FeedItem | null {
  const stream = db().streams.find((s) => s.id === streamId);
  return stream ? toFeedItem(stream, viewerId) : null;
}

export function getStream(streamId: string): Stream | null {
  return db().streams.find((s) => s.id === streamId) ?? null;
}

export function toggleLike(streamId: string, userId: string): { liked: boolean; likes: number } {
  const store = db();
  const stream = getStream(streamId);
  if (!stream) return { liked: false, likes: 0 };
  const list = store.likes[streamId] ?? [];
  const idx = list.indexOf(userId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(userId);
  store.likes[streamId] = list;
  save();
  return { liked: idx < 0, likes: list.length + seedLikes(streamId) };
}

export function toggleFollow(hostId: string, userId: string): { following: boolean; followers: number } {
  const store = db();
  const list = store.follows[userId] ?? [];
  const idx = list.indexOf(hostId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(hostId);
  store.follows[userId] = list;
  save();
  return { following: idx < 0, followers: followerCount(hostId) };
}

export function isFollowing(hostId: string, userId: string | null): boolean {
  if (!userId) return false;
  return (db().follows[userId] ?? []).includes(hostId);
}

/* -------------------------------- comments -------------------------------- */

export function listComments(streamId: string, after = 0): Comment[] {
  return db()
    .comments.filter((c) => c.streamId === streamId && c.createdAt > after)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-80);
}

export function addComment(streamId: string, userId: string, text: string): Comment | null {
  const clean = text.trim().slice(0, 200);
  if (!clean) return null;
  const comment: Comment = {
    id: `c_${randomUUID().slice(0, 8)}`,
    streamId,
    userId,
    kind: "chat",
    text: clean,
    createdAt: Date.now(),
  };
  db().comments.push(comment);
  save();
  return comment;
}

export function addSystemComment(streamId: string, text: string): Comment {
  const comment: Comment = {
    id: `c_${randomUUID().slice(0, 8)}`,
    streamId,
    userId: "system",
    kind: "system",
    text,
    createdAt: Date.now(),
  };
  db().comments.push(comment);
  save();
  return comment;
}

/* ---------------------------------- gifts --------------------------------- */

export function sendGift(
  streamId: string,
  userId: string,
  giftId: string,
): { ok: true; coins: number; balance: number } | { ok: false; error: string } {
  const store = db();
  const user = getUserById(userId);
  const gift = GIFTS.find((g) => g.id === giftId);
  if (!user || !gift) return { ok: false, error: "Gift tidak ditemukan" };
  if (user.coins < gift.coins) return { ok: false, error: "Koin tidak cukup. Top up dulu ya!" };

  user.coins -= gift.coins;
  store.comments.push({
    id: `c_${randomUUID().slice(0, 8)}`,
    streamId,
    userId,
    kind: "gift",
    text: `mengirim ${gift.name}`,
    giftId: gift.id,
    coins: gift.coins,
    createdAt: Date.now(),
  });
  store.txns[userId] = store.txns[userId] ?? [];
  store.txns[userId].unshift({
    id: `t_${randomUUID().slice(0, 8)}`,
    type: "gift",
    label: `${gift.emoji} ${gift.name}`,
    coins: -gift.coins,
    createdAt: Date.now(),
  });
  save();
  return { ok: true, coins: gift.coins, balance: user.coins };
}

/* --------------------------------- wallet --------------------------------- */

export function listTxns(userId: string): Txn[] {
  return db().txns[userId] ?? [];
}

export function topUp(userId: string, packageId: string): { ok: boolean; balance?: number; error?: string } {
  const store = db();
  const user = getUserById(userId);
  const pack = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!user || !pack) return { ok: false, error: "Paket tidak ditemukan" };
  const total = pack.coins + pack.bonus;
  user.coins += total;
  store.txns[userId] = store.txns[userId] ?? [];
  store.txns[userId].unshift({
    id: `t_${randomUUID().slice(0, 8)}`,
    type: "topup",
    label: `Top up ${total.toLocaleString("id-ID")} koin`,
    coins: total,
    createdAt: Date.now(),
  });
  save();
  return { ok: true, balance: user.coins };
}

/* --------------------------------- helpers -------------------------------- */

export function publicUser(user: User | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    provider: user.provider,
    avatar: user.avatar,
    coins: user.coins,
    bio: user.bio,
    isHost: user.isHost,
    createdAt: user.createdAt,
  };
}

export function userMap(): Record<string, { name: string; handle: string; avatar: Avatar }> {
  const map: Record<string, { name: string; handle: string; avatar: Avatar }> = {};
  for (const u of db().users) map[u.id] = { name: u.name, handle: u.handle, avatar: u.avatar };
  return map;
}
