export interface Gift {
  id: string;
  name: string;
  emoji: string;
  coins: number;
  color: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus: number;
  label: string;
}

export const GIFTS: Gift[] = [
  { id: "rose", name: "Mawar", emoji: "🌹", coins: 1, color: "#fe2c55" },
  { id: "donut", name: "Donat", emoji: "🍩", coins: 30, color: "#ffb703" },
  { id: "wave", name: "Hand Wave", emoji: "👋", coins: 100, color: "#25f4ee" },
  { id: "rocket", name: "Roket", emoji: "🚀", coins: 1000, color: "#7a5cff" },
  { id: "crown", name: "Mahkota", emoji: "👑", coins: 5000, color: "#ffd60a" },
  { id: "lion", name: "Singa", emoji: "🦁", coins: 15000, color: "#ff7b00" },
];

export const COIN_PACKAGES: CoinPackage[] = [
  { id: "p1", coins: 100, price: 15000, bonus: 0, label: "Pemula" },
  { id: "p2", coins: 300, price: 45000, bonus: 20, label: "Populer" },
  { id: "p3", coins: 700, price: 99000, bonus: 70, label: "Hemat" },
  { id: "p4", coins: 1500, price: 199000, bonus: 200, label: "Pro" },
  { id: "p5", coins: 5000, price: 649000, bonus: 900, label: "Superfan" },
];

export type ChatUser = {
  name: string;
  handle: string;
  avatar: { from: string; to: string; emoji: string };
};

export type ChatMessage = {
  id: string;
  streamId: string;
  userId: string;
  kind: "chat" | "gift" | "join" | "system";
  text: string;
  giftId?: string;
  coins?: number;
  createdAt: number;
  user: ChatUser | null;
};

export type MeLite = {
  id: string;
  name: string;
  handle: string;
  coins: number;
  avatar: { from: string; to: string; emoji: string };
};
