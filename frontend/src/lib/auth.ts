import { Role } from "@/types";

const STORAGE_KEY = "luxorides_session";
const SESSION_EVENT = "luxorides-session-changed";

export interface AuthSession {
  token: string;
  role: Role;
  name: string;
}

// Browser only: call these from client components
export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function readRawSession(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

// Lets React re-render when someone logs in or out (also across browser tabs)
export function subscribeToSession(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}