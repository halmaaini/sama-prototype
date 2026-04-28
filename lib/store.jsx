/* Mutable activity store — drives the create → approve → publish → complete flow.
   Lives in localStorage so refreshes preserve the demo state. Reset via window.SAMA_RESET(). */

const STORE_KEY = "sama.store.v1";

const seedFromData = () => ({
  activities: SAMA.ACTIVITIES.map(a => ({
    ...a,
    history: a.history || [
      { stage: "created", by: "Jane Doe", when: "8 days ago" },
      ...(a.status !== "Draft" ? [{ stage: "submitted", by: "Jane Doe", when: "6 days ago" }] : []),
      ...(["Active","Completed"].includes(a.status) ? [{ stage: "approved", by: "Reem Abdulla", when: "5 days ago" }] : []),
      ...(["Active","Completed"].includes(a.status) ? [{ stage: "published", by: "System", when: "5 days ago" }] : []),
      ...(a.status === "Completed" ? [{ stage: "completed", by: "System", when: "1 day ago" }] : []),
      ...(a.status === "Rejected" ? [{ stage: "rejected", by: "Reem Abdulla", when: "2 days ago", reason: "Budget exceeds policy" }] : []),
    ],
  })),
});

const load = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return seedFromData();
};

const save = (state) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch(e) {}
};

window.SAMA_RESET = () => { localStorage.removeItem(STORE_KEY); location.reload(); };

/* React subscription model — every consumer re-renders when store changes */
const listeners = new Set();
let _state = load();

const getState = () => _state;
const setState = (updater) => {
  _state = typeof updater === "function" ? updater(_state) : updater;
  save(_state);
  listeners.forEach(fn => fn());
};

const useStore = () => {
  const [, force] = React.useReducer(x => x+1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => listeners.delete(force);
  }, []);
  return _state;
};

const nowLabel = () => "just now";

/* ---------- Actions ---------- */

const newId = () => "u" + Math.random().toString(36).slice(2, 8);

const createActivity = (draft) => {
  const id = newId();
  const activity = {
    id,
    title: draft.title || "Untitled activity",
    type: draft.type || "Event",
    status: draft.status || "Draft",
    date: draft.date || "Oct 22, 2025",
    dateIso: draft.dateIso || "2025-10-22",
    time: draft.time || "5:00 PM – 7:00 PM",
    venue: draft.venue || "Main Auditorium",
    capacity: draft.capacity || 200,
    registered: 0,
    waitlist: 0,
    owner: draft.owner || "s1",
    category: draft.category || "Academic",
    tags: draft.tags || ["new"],
    qr: draft.qr ?? true,
    public: draft.public ?? true,
    banner: "academic",
    history: [{ stage: "created", by: "Jane Doe", when: nowLabel() }],
    ...draft.extra,
  };
  setState(s => ({ ...s, activities: [activity, ...s.activities] }));
  return activity;
};

const updateActivity = (id, patch, historyEntry) => {
  setState(s => ({
    ...s,
    activities: s.activities.map(a => a.id === id ? {
      ...a,
      ...patch,
      history: historyEntry ? [...(a.history||[]), historyEntry] : a.history,
    } : a),
  }));
};

const submitForApproval = (id) => {
  updateActivity(id, { status: "Pending Approval" }, { stage: "submitted", by: "Jane Doe", when: nowLabel() });
};
const approve = (id) => {
  updateActivity(id, { status: "Active" }, { stage: "approved", by: "Reem Abdulla", when: nowLabel() });
  // Auto-publish on approve in this demo
  updateActivity(id, {}, { stage: "published", by: "System", when: nowLabel() });
};
const reject = (id, reason) => {
  updateActivity(id, { status: "Rejected", rejectReason: reason }, { stage: "rejected", by: "Reem Abdulla", when: nowLabel(), reason });
};
const requestChanges = (id, note) => {
  updateActivity(id, { status: "Draft", changesRequested: note }, { stage: "changes-requested", by: "Reem Abdulla", when: nowLabel(), reason: note });
};
const markComplete = (id) => {
  updateActivity(id, { status: "Completed" }, { stage: "completed", by: "System", when: nowLabel() });
};
const cancel = (id, reason) => {
  updateActivity(id, { status: "Cancelled", cancelReason: reason }, { stage: "cancelled", by: "Jane Doe", when: nowLabel(), reason });
};

/* Convenience selectors */
const useActivities = () => useStore().activities;
const useActivity = (id) => useStore().activities.find(a => a.id === id);

window.SAMAStore = {
  useStore, useActivities, useActivity, getState,
  createActivity, updateActivity,
  submitForApproval, approve, reject, requestChanges, markComplete, cancel,
};
Object.assign(window, window.SAMAStore);
