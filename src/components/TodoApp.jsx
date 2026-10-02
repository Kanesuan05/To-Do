import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X, ListTodo } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400", active: "bg-emerald-500 text-white border-emerald-500" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400", active: "bg-amber-500 text-white border-amber-500" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500", active: "bg-rose-500 text-white border-rose-500" },
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

function TodoItem({ todo, removing, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];

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
  const cancel = () => setEditing(false);

  return (
    <li
      className={`todo-item overflow-hidden transition-all duration-300 ease-out ${
        removing ? "max-h-0 opacity-0 -translate-x-6 mb-0" : "max-h-32 opacity-100 translate-x-0 mb-2.5"
      }`}
    >
      <div className="relative flex items-center gap-3 rounded-xl bg-white py-3 pl-5 pr-3 shadow-sm ring-1 ring-slate-100">
        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${p.bar}`} />

        <label className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">
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
                if (e.key === "Escape") cancel();
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
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${p.badge}`}>
          {p.label}
        </span>

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

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high" },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "medium" },
    { id: 3, text: "อ่านหนังสือ 20 หน้า", done: true, priority: "low" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState([]);
  const nextId = useRef(4);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId.current++, text: t, done: false, priority }, ...prev]);
    setText("");
  };

  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const save = (id, newText) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));

  const remove = (id) => {
    setRemoving((r) => [...r, id]);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setRemoving((r) => r.filter((x) => x !== id));
    }, 300);
  };

  const clearDone = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    setRemoving((r) => [...r, ...ids]);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => !t.done));
      setRemoving((r) => r.filter((x) => !ids.includes(x)));
    }, 300);
  };

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  const visible = todos.filter((t) => (filter === "active" ? !t.done : filter === "done" ? t.done : true));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14" style={{ fontFamily: "'Noto Sans Thai','Sarabun',system-ui,sans-serif" }}>
      <style>{`
        @keyframes todoIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .todo-item { animation: todoIn .25s ease-out; }
        @media (prefers-reduced-motion: reduce) { .todo-item { animation: none; } }
      `}</style>

      <div className="mx-auto w-full max-w-xl">
        <header className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
            <ListTodo className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">รายการสิ่งที่ต้องทำ</h1>
            <p className="text-sm text-slate-500">จัดการงานของคุณให้เป็นระเบียบ</p>
          </div>
        </header>

        {/* Add form */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
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
          <div className="mt-3 flex items-center gap-2">
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
        </div>

        {/* Filter tabs */}
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
            {EMPTY_TEXT[filter]}
          </div>
        ) : (
          <ul>
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
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
      </div>
    </div>
  );
}
