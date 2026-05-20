import { useCallback, useEffect, useState } from "react";

const KEY = "direct-benefit.favorites";

function readAll(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<(ids: string[]) => void>();

function broadcast(ids: string[]) {
  listeners.forEach((l) => l(ids));
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() => readAll());

  useEffect(() => {
    const handler = (next: string[]) => setIds(next);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const cur = readAll();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    broadcast(next);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { favorites: ids, toggle, has };
}
