import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ListTodo, Search, CalendarDays } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400", active: "bg-emerald-500 text-white border-emerald-500" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400", active: "bg-amber-500 text-white border-amber-500" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500", active: "bg-rose-500 text-white border-rose-500" },
};

const CATEGORIES = {
  work: { label: "งาน", dot: "bg-blue-500" },
  personal: { label: "ส่วนตัว", dot: "bg-violet-500" },
  shopping: { label: "ช้อปปิ้ง", dot: "bg-cyan-500" },
  health: { label: "สุขภาพ", dot: "bg-fuchsia-500" },
};

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "done", label: "เสร็จแล้ว" },
];

const EMPTY_TEXT = {
  all: "ยังไม่มีงาน เพิ่มงานแรกของคุณด้านบนได้เลย",
  active: "ไม่มีงานที่ค้างอยู่ เยี่ยมมาก!",
  done: "ยังไม่มีงานที่เสร็จแล้ว",
};

/* ---------- date helpers (local time, not UTC) ---------- */
const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toKey(d);
};
const fmtDate = (key) =>
  new Date(key + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" });

function dueInfo(todo, today) {
  if (!todo.due) return null;
  const date = fmtDate(todo.due);
  if (todo.done) return { text: date, cls: "bg-slate-50 text-slate-500 ring-slate-200" };
  if (todo.due < today) return { text: `เกินกำหนด ${date}`, cls: "bg-red-50 text-red-700 ring-red-200" };
  if (todo.due === today) return { text: "วันนี้", cls: "bg-yellow-50 text-yellow-800 ring-yellow-300" };
  return { text: date, cls: "bg-slate-50 text-slate-600 ring-slate-200" };
}

/* ---------- todo row ---------- */
function TodoItem({ todo, today, removing, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];
  const cat = CATEGORIES[todo.category];
  const due = dueInfo(todo, today);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(todo.text);
    setEditing(true);
  };
  const commit = () => {
    const t = draft.trim();
    if (t) onSave(todo.id, t);
    setEditing(false);
  };

  return (
    <li
      className={`todo-item overflow-hidden transition-all duration-300 ease-out ${
        removing ? "max-h-0 opacity-0 -translate-x-6 mb-0" : "max-h-40 opacity-100 translate-x-0 mb-2.5"
      }`}
    >
      <div className="relative flex items-start gap-3 rounded-xl bg-white py-3 pl-5 pr-2 shadow-sm ring-1 ring-slate-100">
        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${p.bar}`} />

        <label className="relative mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => onToggle(todo.id)}
            className="peer sr-only"
            aria-label="ทำเสร็จแล้ว"
          />
          <span className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-300 transition peer-checked:border-indigo-500 peer-checked:bg-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300">
            {todo.done && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
          </span>
        </label>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={commit}
              className="w-full rounded-md border border-indigo-300 bg-indigo-50/40 px-2 py-1 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200"
            />
          ) : (
            <span
              onDoubleClick={startEdit}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className={`block cursor-text break-words text-base transition-colors ${
                todo.done ? "text-slate-400 line-through" : "text-slate-800"
              }`}
            >
              {todo.text}
            </span>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${p.badge}`}>
              {p.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
              {cat.label}
            </span>
            {due && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${due.cls}`}>
                <CalendarDays className="h-3 w-3" />
                {due.text}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {!editing && (
            <button
              onClick={startEdit}
              aria-label="แก้ไข"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onDelete(todo.id)}
            aria-label="ลบ"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

/* ---------- donut chart ---------- */
function Donut({ segments, total, percent }) {
  let acc = 0;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 42 42" className="h-full w-full" role="img" aria-label={`เสร็จแล้ว ${percent}%`}>
        <circle cx="21" cy="21" r="15.9155" fill="none" strokeWidth="5" className="stroke-slate-100" />
        {total > 0 &&
          segments.map((s) => {
            if (s.n === 0) return null;
            const pct = (s.n / total) * 100;
            const el = (
              <circle
                key={s.label}
                cx="21"
                cy="21"
                r="15.9155"
                fill="none"
                strokeWidth="5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={25 - acc}
                className={`${s.stroke} transition-all duration-500`}
              />
            );
            acc += pct;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-800">{percent}%</span>
      </div>
    </div>
  );
}

/* ---------- app ---------- */
export default function TodoApp() {
  const [todos, setTodos] = useState(() => [
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high", category: "work", due: addDays(-2) },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "medium", category: "shopping", due: addDays(0) },
    { id: 3, text: "อ่านหนังสือ 20 หน้า", done: true, priority: "low", category: "personal", due: addDays(-1) },
    { id: 4, text: "นัดตรวจสุขภาพประจำปี", done: false, priority: "medium", category: "health", due: addDays(5) },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("work");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState([]);
  const nextId = useRef(5);

  const today = toKey(new Date());

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId.current++, text: t, done: false, priority, category, due }, ...prev]);
    setText("");
    setDue("");
  };

  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const save = (id, newText) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));

  const removeIds = (ids) => {
    setRemoving((r) => [...r, ...ids]);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => !ids.includes(t.id)));
      setRemoving((r) => r.filter((x) => !ids.includes(x)));
    }, 300);
  };
  const remove = (id) => removeIds([id]);
  const clearDone = () => removeIds(todos.filter((t) => t.done).map((t) => t.id));

  /* derived */
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const remaining = total - doneCount;
  const overdueCount = todos.filter((t) => !t.done && t.due && t.due < today).length;
  const activeCount = remaining - overdueCount;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const segments = [
    { label: "done", name: "เสร็จแล้ว", n: doneCount, stroke: "stroke-indigo-500", dot: "bg-indigo-500" },
    { label: "active", name: "กำลังทำ", n: activeCount, stroke: "stroke-slate-300", dot: "bg-slate-300" },
    { label: "overdue", name: "เกินกำหนด", n: overdueCount, stroke: "stroke-red-500", dot: "bg-red-500" },
  ];

  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "active" ? !t.done : filter === "done" ? t.done : true) &&
      (catFilter === "all" || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  );

  const catCount = (key) => todos.filter((t) => t.category === key).length;

  const catBtn = (active) =>
    `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      active ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14" style={{ fontFamily: "'Noto Sans Thai','Sarabun',system-ui,sans-serif" }}>
      <style>{`
        @keyframes todoIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .todo-item { animation: todoIn .25s ease-out; }
        @media (prefers-reduced-motion: reduce) { .todo-item { animation: none; } }
      `}</style>

      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
            <ListTodo className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายการสิ่งที่ต้องทำ</h1>
            <p className="text-sm text-slate-500">จัดการงานของคุณให้เป็นระเบียบ</p>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[230px_1fr] lg:grid-rows-[auto_1fr]">
          {/* Category sidebar */}
          <nav className="rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-100 lg:col-start-1 lg:row-start-1 lg:self-start" aria-label="หมวดหมู่">
            <div className="flex gap-1 overflow-x-auto lg:flex-col">
              <button onClick={() => setCatFilter("all")} className={catBtn(catFilter === "all")}>
                <span className="flex-1 text-left">ทุกหมวดหมู่</span>
                <span className="text-xs text-slate-400">{total}</span>
              </button>
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <button key={key} onClick={() => setCatFilter(key)} className={catBtn(catFilter === key)}>
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                  <span className="flex-1 whitespace-nowrap text-left">{c.label}</span>
                  <span className="text-xs text-slate-400">{catCount(key)}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main column */}
          <main className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {/* Add form */}
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="เพิ่มงานใหม่..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={add}
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">เพิ่ม</span>
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500">ความสำคัญ:</span>
                {Object.entries(PRIORITIES).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setPriority(key)}
                    className={`rounded-full border px-3.5 py-1 text-sm font-medium transition ${
                      priority === key ? p.active : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-16 shrink-0">หมวดหมู่:</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {Object.entries(CATEGORIES).map(([key, c]) => (
                      <option key={key} value={key}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-16 shrink-0">กำหนดส่ง:</span>
                  <input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหางาน..."
                aria-label="ค้นหางาน"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-base text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="mb-4 flex rounded-xl bg-slate-200/60 p-1" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition ${
                    filter === f.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            {visible.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-10 text-center text-slate-400 shadow-sm ring-1 ring-slate-100">
                {q ? `ไม่พบงานที่ตรงกับ “${query.trim()}”` : catFilter !== "all" && total > 0 && filter === "all" ? "ยังไม่มีงานในหมวดนี้" : EMPTY_TEXT[filter]}
              </div>
            ) : (
              <ul>
                {visible.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    today={today}
                    removing={removing.includes(t.id)}
                    onToggle={toggle}
                    onDelete={remove}
                    onSave={save}
                  />
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <span className="text-sm text-slate-600">เหลือ {remaining} งาน</span>
              <button
                onClick={clearDone}
                disabled={doneCount === 0}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
              >
                <X className="h-4 w-4" />
                ล้างที่เสร็จแล้ว{doneCount > 0 && ` (${doneCount})`}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · Enter เพื่อบันทึก · Esc เพื่อยกเลิก</p>
          </main>

          {/* Stats */}
          <section className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 lg:col-start-1 lg:row-start-2 lg:self-start" aria-label="สถิติ">
            <h2 className="mb-3 text-sm font-medium text-slate-500">สถิติ</h2>
            <div className="mb-4 flex gap-6">
              <div>
                <div className="text-2xl font-bold text-slate-900">{total}</div>
                <div className="text-xs text-slate-500">งานทั้งหมด</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{percent}%</div>
                <div className="text-xs text-slate-500">เสร็จแล้ว</div>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <Donut segments={segments} total={total} percent={percent} />
              <ul className="space-y-1.5 text-sm">
                {segments.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                    {s.name}
                    <span className="ml-1 font-medium text-slate-800">{s.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}