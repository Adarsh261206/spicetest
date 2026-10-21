import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserCollection = { id: string; name: string; slugs: string[] };

type SavedState = {
  saved: string[];
  recent: string[];
  collections: UserCollection[];
  followed: string[];
};

const STORAGE_KEY = "verdant-kitchen-state-v1";

const initial: SavedState = {
  saved: ["dal-makhani", "besan-ladoos"],
  recent: ["aloo-paratha", "paneer-tikka-bbq-skewers-and-refreshing"],
  followed: [],
  collections: [
    {
      id: "c1",
      name: "My Weeknight Recipes",
      slugs: ["dal-makhani", "besan-ladoos"],
    },
    { id: "c2", name: "Things I Want To Try", slugs: ["paneer-tikka-bbq-skewers-and-refreshing"] },
    { id: "c3", name: "Sunday Baking", slugs: ["pineapple-upside-down-cake"] },
    { id: "c4", name: "High Protein", slugs: ["hara-bhara-kebabs"] },
  ],
};

type Ctx = SavedState & {
  toggleSave: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  markViewed: (slug: string) => void;
  toggleFollow: (handle: string) => void;
  isFollowing: (handle: string) => boolean;
  createCollection: (name: string) => void;
  renameCollection: (id: string, name: string) => void;
  removeFromCollection: (id: string, slug: string) => void;
  addToCollection: (id: string, slug: string) => void;
  deleteCollection: (id: string) => void;
};

const SavedContext = createContext<Ctx | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const toggleSave = useCallback((slug: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(slug) ? s.saved.filter((x) => x !== slug) : [slug, ...s.saved],
    }));
  }, []);

  const markViewed = useCallback((slug: string) => {
    setState((s) =>
      s.recent[0] === slug
        ? s
        : { ...s, recent: [slug, ...s.recent.filter((x) => x !== slug)].slice(0, 8) },
    );
  }, []);

  const toggleFollow = useCallback((handle: string) => {
    setState((s) => ({
      ...s,
      followed: s.followed.includes(handle)
        ? s.followed.filter((x) => x !== handle)
        : [...s.followed, handle],
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      toggleSave,
      markViewed,
      isSaved: (slug) => state.saved.includes(slug),
      toggleFollow,
      isFollowing: (handle) => state.followed.includes(handle),
      createCollection: (name) =>
        setState((s) => ({
          ...s,
          collections: [...s.collections, { id: crypto.randomUUID(), name, slugs: [] }],
        })),
      renameCollection: (id, name) =>
        setState((s) => ({
          ...s,
          collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)),
        })),
      deleteCollection: (id) =>
        setState((s) => ({ ...s, collections: s.collections.filter((c) => c.id !== id) })),
      removeFromCollection: (id, slug) =>
        setState((s) => ({
          ...s,
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, slugs: c.slugs.filter((x) => x !== slug) } : c,
          ),
        })),
      addToCollection: (id, slug) =>
        setState((s) => ({
          ...s,
          collections: s.collections.map((c) =>
            c.id === id && !c.slugs.includes(slug) ? { ...c, slugs: [...c.slugs, slug] } : c,
          ),
        })),
    }),
    [state, toggleSave, markViewed, toggleFollow],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
