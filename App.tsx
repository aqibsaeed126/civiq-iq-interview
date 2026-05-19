import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer,
} from "react";
import "./App.css";

// ─────────────────────────────────────────────────────
//  REACT DEBUGGING CHALLENGE
//  A user directory fetching from jsonplaceholder.
//  This code has 5 bugs. Find and fix them all.
//  Time: ~30 minutes
// ─────────────────────────────────────────────────────

// ── Reducer ──

function bookmarkReducer(state, action) {
  switch (action.type) {
    case "TOGGLE": {
      debugger;
      const list = state.list;
      const idx = list.findIndex((u) => u.id === action.id);
      if (idx !== -1) {
        list[idx].bookmarked = !list[idx].bookmarked;
      }
      return { ...state, list };
    }
    case "SET":
      return { ...state, list: action.payload };
    default:
      return state;
  }
}

// ── UserCard ──

const UserCard = React.memo(function UserCard({ user, onSelect, onBookmark }) {
  return (
    <div className="card">
      <div className="card-top" onClick={() => onSelect(user.id)}>
        <div className="avatar">{user.name.charAt(0)}</div>
        <div>
          <div className="name">{user.name}</div>
          <div className="email">{user.email.toLowerCase()}</div>
        </div>
      </div>
      <div className="card-bot">
        <span className="meta">📍 {user.address?.city}</span>
        <button
          className="bookmark-btn"
          onClick={() => onBookmark(user.id)}
        >
          {user.bookmarked ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
});

// ── DetailPanel ──

function DetailPanel({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setUser(null);
    setPosts([]);

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((r) => r.json())
      .then(setUser);

    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .then((r) => r.json())
      .then(setPosts);
  }, [userId]);

  if (!user) {
    return (
      <div className="detail">
        <p className="loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="detail">
      <div className="detail-top">
        <div>
          <h2 className="detail-name">{user.name}</h2>
          <p className="detail-sub">
            {user.email} · {user.phone}
          </p>
          <p className="detail-sub">
            🏢 {user.company?.name} · 🌐 {user.website}
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <h3 className="posts-title">Posts ({posts.length})</h3>
      {posts.slice(0, 4).map((p) => (
        <div key={p.id} className="post">
          <strong>{p.title}</strong>
          <p>{p.body.slice(0, 100)}…</p>
        </div>
      ))}
    </div>
  );
}

// ── SearchBar ──

function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  let timer = useRef(null);

  useEffect(()=>{
    return ()=> { 
      timer.current = null; 
      clearTimeout(timer.current)};
  })

  const handle = (e) => {
    const v = e.target.value;
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(v), 300);
  };

  return (
    <input
      value={q}
      onChange={handle}
      placeholder="Search users…"
      className="search"
    />
  );
}

// ── App ──

export default function App() {
  const [state, dispatch] = useReducer(bookmarkReducer, { list: [] });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((r) => r.json())
      .then((data) => {
        const users = data.map((u) => ({ ...u, bookmarked: false }));
        dispatch({ type: "SET", payload: users });
      });
  }, []);

  const handleSelect = useCallback(
    (id) => {
      console.log(`select ${id}, search="${search}"`);
      setSelected(id);
    },
    [search]
  );

  const handleBookmark = useCallback((id) => {
    dispatch({ type: "TOGGLE", id });
  }, []);

  const filtered = useMemo(() => {
    return state.list.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [state.list, search]);

  return (
    <div className="root">
      <header className="header">
        <h1 className="title">User Directory</h1>
        <span className="count">{filtered.length} users</span>
      </header>

      <SearchBar onSearch={setSearch} />

      <div className="grid">
        {filtered.map((user, index) => (
          <UserCard
            key={index}
            user={user}
            onSelect={handleSelect}
            onBookmark={handleBookmark}
          />
        ))}
        {filtered.length === 0 && (
          <p className="empty">No results for "{search}"</p>
        )}
      </div>

      {selected && (
        <DetailPanel
          userId={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

