
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./AllProjects.module.css";

// // If you already created a shared axios client (utils/api.js), import that instead:
// // import api from "../../utils/api";

// const useApi = () => {
//   // Local axios with token + refresh (safe if you don't have utils/api)
//   const api = useMemo(() => {
//     const instance = axios.create({ baseURL: "http://127.0.0.1:8000" });
//     instance.interceptors.request.use((config) => {
//       const t = localStorage.getItem("access");
//       if (t) config.headers.Authorization = `Bearer ${t}`;
//       return config;
//     });
//     instance.interceptors.response.use(
//       (r) => r,
//       async (err) => {
//         const orig = err.config;
//         if (err?.response?.status === 401 && !orig._retry) {
//           orig._retry = true;
//           const refresh = localStorage.getItem("refresh");
//           if (!refresh) throw err;
//           const rr = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
//           const newAccess = rr?.data?.access;
//           if (!newAccess) throw err;
//           localStorage.setItem("access", newAccess);
//           orig.headers.Authorization = `Bearer ${newAccess}`;
//           return instance(orig);
//         }
//         throw err;
//       }
//     );
//     return instance;
//   }, []);
//   return api;
// };

// const STEPS = [
//   { key: "proposal",               label: "Proposal" },
//   { key: "proposal_report",        label: "Proposal Report" },
//   { key: "proposal_presentation",  label: "Proposal Presentation" },
//   { key: "final_report",           label: "Final Report" },
//   { key: "final_presentation",     label: "Final Presentation" },
// ];

// export default function AllProjects() {
//   const api = useApi();

//   // list
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [status, setStatus]     = useState("");

//   // drawer
//   const [active, setActive]     = useState(null); // selected project object
//   const [tab, setTab]           = useState("overview"); // overview | assign | meetings | comments | submissions | evaluations
//   const [detailLoading, setDetailLoading] = useState(false);

//   // assign
//   const [supervisors, setSupervisors] = useState([]);
//   const [selectedEvaluator, setSelectedEvaluator] = useState("");

//   // comments / meetings / submissions
//   const [comments, setComments]   = useState([]);
//   const [meetings, setMeetings]   = useState([]);
//   const [subs, setSubs]           = useState([]);
//   const [subsByStep, setSubsByStep] = useState({});

//   // presentation fields (admin-editable)
//   const [presentPlace, setPresentPlace] = useState("");
//   const [presentAt, setPresentAt]       = useState("");

//   // toast
//   const [toast, setToast] = useState({ show: false, type: "info", text: "" });
//   const showToast = (text, type = "info", timeout = 2500) => {
//     setToast({ show: true, type, text });
//     setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
//   };

//   const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";

//   // list loader
//   const loadList = async () => {
//     setLoading(true);
//     setStatus("");
//     try {
//       const r = await api.get("/api/all-projects/");
//       const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
//       setProjects(list);
//     } catch (e) {
//       setStatus("Failed to load projects.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadList(); /* eslint-disable-next-line */ }, []);

//   // helper
//   const normalizeSubs = (list = []) => {
//     const map = {};
//     list.forEach((x) => { if (x?.step) map[x.step] = x; });
//     setSubsByStep(map);
//     setSubs(list);
//   };

//   // open drawer
//   const openProject = async (p, initialTab = "overview") => {
//     setActive(p);
//     setTab(initialTab);
//     setDetailLoading(true);
//     setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
//     setSelectedEvaluator("");
//     setPresentPlace(p.presentation_place || "");
//     setPresentAt(p.presentation_at ? p.presentation_at.slice(0,16) : ""); // for datetime-local

//     try {
//       const reqs = [];
//       // supervisors list (for Assign)
//       if (["assign"].includes(initialTab)) {
//         reqs.push(api.get("/api/supervisors/").catch(() => ({ data: [] })));
//       }
//       // comments + meetings + submissions + evaluation for overview as well
//       if (["overview","comments"].includes(initialTab)) {
//         reqs.push(api.get(`/api/projects/${p.id}/comments/`).catch(() => ({ data: [] })));
//       }
//       if (["overview","meetings"].includes(initialTab)) {
//         reqs.push(api.get(`/api/projects/${p.id}/meetings/`).catch(() => ({ data: [] })));
//       }
//       if (["overview","submissions"].includes(initialTab)) {
//         reqs.push(api.get(`/api/projects/${p.id}/submissions/`).catch(() => ({ data: [] })));
//       }
//       if (["overview","evaluations"].includes(initialTab)) {
//         // single-evaluator backend (current)
//         reqs.push(api.get(`/api/projects/${p.id}/evaluation/`).catch(() => ({ data: null })));
//       }

//       const resps = await Promise.all(reqs);
//       resps.forEach((r) => {
//         const d = r.data;
//         if (Array.isArray(d) && d.length && d[0]?.text !== undefined) setComments(d);
//         else if (Array.isArray(d) && d.length && d[0]?.title !== undefined) setMeetings(d);
//         else if (Array.isArray(d)) normalizeSubs(d);
//         else if (Array.isArray(d) && d.length && (d[0]?.role === "supervisor" || d[0]?.email)) setSupervisors(d);
//         else if (d && d.proposal_decision !== undefined) {
//           // attach evaluation into active
//           setActive((prev) => ({ ...prev, evaluation: d }));
//         } else if (Array.isArray(d) && d.length === 0) {
//           // ignore
//         } else if (d && d.length === undefined && d.role === undefined) {
//           // ignore
//         } else if (Array.isArray(d) && d[0]?.department !== undefined) {
//           setSupervisors(d);
//         }
//       });
//     } catch {
//       showToast("Failed to load details.", "error");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const ensureTab = async (t) => {
//     if (!active) return;
//     try {
//       if (t === "assign" && supervisors.length === 0) {
//         const r = await api.get("/api/supervisors/");
//         setSupervisors(r.data || []);
//       }
//       if (t === "comments" && comments.length === 0) {
//         const r = await api.get(`/api/projects/${active.id}/comments/`);
//         setComments(r.data || []);
//       }
//       if (t === "meetings" && meetings.length === 0) {
//         const r = await api.get(`/api/projects/${active.id}/meetings/`);
//         setMeetings(r.data || []);
//       }
//       if (t === "submissions" && subs.length === 0) {
//         const r = await api.get(`/api/projects/${active.id}/submissions/`);
//         normalizeSubs(r.data || []);
//       }
//       if (t === "evaluations" && !active.evaluation) {
//         const r = await api.get(`/api/projects/${active.id}/evaluation/`).catch(()=>({data:null}));
//         if (r.data) setActive((prev)=>({ ...prev, evaluation:r.data }));
//       }
//     } catch {
//       showToast("Failed to load tab.", "error");
//     }
//   };

//   const closeDrawer = () => {
//     setActive(null);
//     setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
//     setSelectedEvaluator("");
//   };

//   // assign evaluator (current backend = single evaluator per project)
//   const assignEvaluator = async () => {
//     if (!active || !selectedEvaluator) return;
//     try {
//       await api.post("/api/assign-evaluation/", {
//         project_id: active.id,
//         evaluator_id: Number(selectedEvaluator),
//       });
//       showToast("Evaluator assigned.", "success");
//       await loadList();
//       // refresh evaluation panel
//       const r = await api.get(`/api/projects/${active.id}/evaluation/`).catch(()=>({data:null}));
//       if (r.data) setActive((prev)=>({ ...prev, evaluation:r.data }));
//       setSelectedEvaluator("");
//     } catch (e) {
//       const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to assign.";
//       showToast(msg, "error");
//     }
//   };

//   const removeEvaluator = async () => {
//     if (!active) return;
//     if (!window.confirm("Remove evaluator from this project?")) return;
//     try {
//       await api.delete(`/api/assign-evaluation/${active.id}/`);
//       showToast("Evaluator removed.", "success");
//       await loadList();
//       setActive((prev)=> ({ ...prev, evaluation:null }));
//     } catch (e) {
//       const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to remove.";
//       showToast(msg, "error");
//     }
//   };

//   // presentation place/time (admin editable)
//   const savePresentation = async () => {
//     if (!active) return;
//     try {
//       const payload = {
//         presentation_place: presentPlace || null,
//         presentation_at: presentAt || null,
//       };
//       const r = await api.patch(`/api/projects/${active.id}/admin/`, payload);
//       setActive((prev)=>({ ...prev, ...r.data }));
//       showToast("Presentation details saved.", "success");
//     } catch (e) {
//       const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to save.";
//       showToast(msg, "error");
//     }
//   };

//   // submissions helpers
//   const completedCount = STEPS.filter((s)=> !!subsByStep[s.key]).length;
//   const pct = Math.round((completedCount / STEPS.length) * 100);

//   const downloadSub = async (submissionId, fileName = "submission") => {
//     try {
//       const res = await api.get(`/api/student/submissions/download/${submissionId}/`, { responseType: "blob" });
//       const url = URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");
//       a.href = url; a.download = fileName;
//       document.body.appendChild(a); a.click(); a.remove();
//       URL.revokeObjectURL(url);
//     } catch {
//       showToast("Download failed.", "error");
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.title}>All Projects</h2>
//       {status && <div className={styles.status}>{status}</div>}

//       {loading ? (
//         <div className={styles.loading}>Loading…</div>
//       ) : projects.length === 0 ? (
//         <div className={styles.empty}>No projects found.</div>
//       ) : (
//         <div className={styles.tableWrap}>
//           <table className={styles.table}>
//             <thead>
//               <tr>
//                 <th>Project Title</th>
//                 <th>Supervisor</th>
//                 <th>Members</th>
//                 <th>Evaluator</th>
//                 <th>Created</th>
//                 <th>Open</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.map((p) => {
//                 const supervisorName = nameOrEmail(p.supervisor);
//                 const members =
//                   [p.group_member_1, p.group_member_2, p.group_member_3]
//                   .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—";
//                 const created = p.created_at ? new Date(p.created_at).toLocaleString() : "—";
//                 const evaluator =
//                   p?.evaluation?.evaluator_name || p?.evaluation?.evaluator_email || "Not assigned";
//                 return (
//                   <tr key={p.id}>
//                     <td className={styles.titleCell}>{p.project_title}</td>
//                     <td>{supervisorName}</td>
//                     <td className={styles.membersCell}>{members}</td>
//                     <td>
//                       {p.evaluation ? (
//                         <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluator}</span>
//                       ) : (
//                         <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned</span>
//                       )}
//                     </td>
//                     <td>{created}</td>
//                     <td>
//                       <div className={styles.inlineBtns}>
//                         <button className={styles.openBtn} onClick={() => openProject(p, "overview")}>Open</button>
//                         <button className={styles.assignBtn} onClick={() => openProject(p, "assign")}>Assign</button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Drawer */}
//       {active && (
//         <div className={styles.drawerBackdrop} onClick={closeDrawer}>
//           <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.drawerHeader}>
//               <h3 className={styles.drawerTitle}>{active.project_title}</h3>
//               <button className={styles.closeBtn} onClick={closeDrawer}>×</button>
//             </div>

//             <div className={styles.tabBar}>
//               {["overview","assign","meetings","comments","submissions","evaluations"].map((t) => (
//                 <button
//                   key={t}
//                   className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}
//                   onClick={async () => { setTab(t); await ensureTab(t); }}
//                 >
//                   {t[0].toUpperCase() + t.slice(1)}
//                 </button>
//               ))}
//             </div>

//             {detailLoading ? (
//               <div className={styles.drawerBody}><div className={styles.loading}>Loading details…</div></div>
//             ) : (
//               <div className={styles.drawerBody}>
//                 {/* OVERVIEW */}
//                 {tab === "overview" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Overview</h4>
//                     <div className={styles.kv}>
//                       <div><b>Supervisor:</b> {nameOrEmail(active.supervisor)}</div>
//                       <div><b>Co-Supervisor:</b> {active.co_supervisor_email || "—"}</div>
//                       <div>
//                         <b>Evaluator:</b>{" "}
//                         {active.evaluation
//                           ? (active.evaluation.evaluator_name || active.evaluation.evaluator_email)
//                           : "Not assigned"}
//                       </div>
//                       <div><b>Created:</b> {active.created_at ? new Date(active.created_at).toLocaleString() : "—"}</div>
//                     </div>

//                     <div className={styles.membersRow}>
//                       <b>Members:</b>{" "}
//                       {[active.group_member_1, active.group_member_2, active.group_member_3]
//                         .filter(Boolean).map(nameOrEmail).join(", ") || "—"}
//                     </div>

//                     <div className={styles.presentationBox}>
//                       <div className={styles.row}>
//                         <label>Presentation Place</label>
//                         <input
//                           className={styles.input}
//                           value={presentPlace}
//                           onChange={(e)=>setPresentPlace(e.target.value)}
//                           placeholder="Auditorium, Room 204, Meet link, etc."
//                         />
//                       </div>
//                       <div className={styles.row}>
//                         <label>Presentation Date/Time</label>
//                         <input
//                           className={styles.input}
//                           type="datetime-local"
//                           value={presentAt}
//                           onChange={(e)=>setPresentAt(e.target.value)}
//                         />
//                       </div>
//                       <button className={styles.primaryBtn} onClick={savePresentation}>Save Presentation</button>
//                     </div>
//                   </section>
//                 )}

//                 {/* ASSIGN */}
//                 {tab === "assign" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Assign Evaluator</h4>

//                     <div className={styles.currentEval}>
//                       <b>Current:</b>{" "}
//                       {active.evaluation
//                         ? (active.evaluation.evaluator_name || active.evaluation.evaluator_email)
//                         : "Unassigned"}
//                       {active.evaluation && (
//                         <button className={styles.removeBtn} onClick={removeEvaluator}>Remove</button>
//                       )}
//                     </div>

//                     <div className={styles.formRow}>
//                       <label>Select Supervisor</label>
//                       <select
//                         className={styles.select}
//                         value={selectedEvaluator}
//                         onChange={(e) => setSelectedEvaluator(e.target.value)}
//                       >
//                         <option value="">Choose…</option>
//                         {(Array.isArray(supervisors) ? supervisors : []).map((s) => (
//                           <option key={s.id} value={s.id}>
//                             {(s.full_name || s.email)} — {s.email}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className={styles.hint}>
//                       Policy: each evaluator can be <b>assigned to max 2</b> projects.
//                     </div>

//                     <button className={styles.primaryBtn} onClick={assignEvaluator} disabled={!selectedEvaluator}>
//                       Save Assignment
//                     </button>

//                     <div className={styles.note}>
//                       <u>Need 2 evaluators per project?</u> See the backend patch below (“Multi-evaluator support”).
//                     </div>
//                   </section>
//                 )}

//                 {/* MEETINGS (read-only for admin) */}
//                 {tab === "meetings" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Meetings</h4>
//                     {meetings.length === 0 ? (
//                       <div className={styles.muted}>No meetings yet.</div>
//                     ) : (
//                       <div className={styles.meetingList}>
//                         {meetings.map((m) => (
//                           <div key={m.id || m.starts_at} className={styles.meetingItem}>
//                             <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
//                             <div className={styles.meetingMeta}>
//                               <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
//                               {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
//                               {m.location && <span> · <b>Where:</b> {m.location}</span>}
//                             </div>
//                             {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </section>
//                 )}

//                 {/* COMMENTS (read-only for admin) */}
//                 {tab === "comments" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Comments</h4>
//                     {comments.length === 0 ? (
//                       <div className={styles.muted}>No comments yet.</div>
//                     ) : (
//                       <div className={styles.commentList}>
//                         {comments.map((c) => (
//                           <div key={c.id || c.created_at} className={styles.commentItem}>
//                             <div className={styles.commentMeta}>
//                               <b>{c.author_name || "Supervisor"}</b>
//                               <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
//                             </div>
//                             <div className={styles.commentText}>{c.text}</div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </section>
//                 )}

//                 {/* SUBMISSIONS (student-like cards) */}
//                 {tab === "submissions" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Submissions</h4>

//                     <div className={styles.progressWrap}>
//                       <div className={styles.progressBar}>
//                         <div className={styles.progressFill} style={{ width: `${pct}%` }} />
//                       </div>
//                       <div className={styles.progressCircle}>
//                         <div className={styles.circleInner}><div className={styles.pct}>{pct}%</div></div>
//                       </div>
//                     </div>

//                     <div className={styles.cards}>
//                       {STEPS.map((s) => {
//                         const item = subsByStep[s.key];
//                         return (
//                           <div key={s.key} className={styles.card}>
//                             <div className={styles.cardHead}>
//                               <div className={styles.cardTitle}>{s.label}</div>
//                               <div className={styles.cardStatus}>
//                                 {item ? <span className={styles.badgeDone}>Submitted</span> : <span className={styles.badgeTodo}>Pending</span>}
//                               </div>
//                             </div>
//                             <div className={styles.cardBody}>
//                               {item ? (
//                                 <>
//                                   <div className={styles.meta}>
//                                     <div><b>File:</b> {item.file_name}</div>
//                                     <div><b>Uploaded:</b> {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "—"}</div>
//                                   </div>
//                                   <div className={styles.actions}>
//                                     <button className={styles.downloadBtn} onClick={() => downloadSub(item.id, item.file_name)}>Download</button>
//                                     {item.file_url && <a className={styles.viewLink} href={item.file_url} target="_blank" rel="noreferrer">View</a>}
//                                   </div>
//                                 </>
//                               ) : (
//                                 <div className={styles.metaMuted}>No file uploaded yet.</div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </section>
//                 )}

//                 {/* EVALUATIONS (read-only list) */}
//                 {tab === "evaluations" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Evaluations</h4>
//                     {!active.evaluation ? (
//                       <div className={styles.muted}>No evaluation yet.</div>
//                     ) : (
//                       <div className={styles.evalGrid}>
//                         {[
//                           { key: "proposal", label: "Proposal", marksKey: "proposal_marks", decisionKey: "proposal_decision", remarksKey: "proposal_remarks", max: 10 },
//                           { key: "mid_presentation", label: "Mid Presentation", marksKey: "mid_presentation_marks", decisionKey: "mid_presentation_decision", remarksKey: "mid_presentation_remarks", max: 10 },
//                           { key: "final_presentation", label: "Final Presentation", marksKey: "final_presentation_marks", decisionKey: "final_presentation_decision", remarksKey: "final_presentation_remarks", max: 10 },
//                         ].map((st) => (
//                           <div key={st.key} className={styles.evalCard}>
//                             <div className={styles.evalHead}>
//                               <span className={styles.evalTitle}>{st.label}</span>
//                               <span className={`${styles.badge} ${
//                                 active.evaluation[st.decisionKey] === "pass" ? styles.badgeSuccess :
//                                 active.evaluation[st.decisionKey] === "revise" ? styles.badgeWarn : styles.badgeError
//                               }`}>
//                                 {String(active.evaluation[st.decisionKey] || "").toUpperCase()}
//                               </span>
//                             </div>
//                             {active.evaluation[st.decisionKey] === "pass" && (
//                               <div className={styles.evalMeta}>Marks: <b>{active.evaluation[st.marksKey]} / {st.max}</b></div>
//                             )}
//                             {active.evaluation[st.remarksKey] && (
//                               <div className={styles.evalRemarks}>{active.evaluation[st.remarksKey]}</div>
//                             )}
//                           </div>
//                         ))}
//                         <div className={styles.evalFooter}>
//                           Evaluator: <b>{active.evaluation.evaluator_name || active.evaluation.evaluator_email}</b>
//                           {active.evaluation.assigned_at && <span> · Assigned: {new Date(active.evaluation.assigned_at).toLocaleString()}</span>}
//                         </div>
//                       </div>
//                     )}
//                   </section>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {toast.show && (
//         <div className={`${styles.toast} ${
//           toast.type === "success" ? styles.toastSuccess :
//           toast.type === "error"   ? styles.toastError   : styles.toastInfo}`}>
//           {toast.text}
//         </div>
//       )}
//     </div>
//   );
// }


// src/components/admin/AllProjects.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./AllProjects.module.css";

const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: "http://127.0.0.1:8000" });
    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem("access");
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    instance.interceptors.response.use(
      (r) => r,
      async (err) => {
        const orig = err.config;
        if (err?.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          const refresh = localStorage.getItem("refresh");
          if (!refresh) throw err;
          const rr = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });
          const newAccess = rr?.data?.access;
          if (!newAccess) throw err;
          localStorage.setItem("access", newAccess);
          orig.headers.Authorization = `Bearer ${newAccess}`;
          return instance(orig);
        }
        throw err;
      }
    );
    return instance;
  }, []);
  return api;
};

const STEPS = [
  { key: "proposal",               label: "Proposal" },
  { key: "proposal_report",        label: "Proposal Report" },
  { key: "proposal_presentation",  label: "Proposal Presentation" },
  { key: "final_report",           label: "Final Report" },
  { key: "final_presentation",     label: "Final Presentation" },
];

export default function AllProjects() {
  const api = useApi();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState("");

  const [active, setActive]     = useState(null);
  const [tab, setTab]           = useState("overview");
  const [detailLoading, setDetailLoading] = useState(false);

  const [supervisors, setSupervisors] = useState([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState("");

  const [comments, setComments]   = useState([]);
  const [meetings, setMeetings]   = useState([]);
  const [subs, setSubs]           = useState([]);
  const [subsByStep, setSubsByStep] = useState({});

  // ✅ 3x place + 3x datetime
  const [proposalPlace, setProposalPlace] = useState("");
  const [proposalAt, setProposalAt]       = useState("");
  const [midPlace, setMidPlace]           = useState("");
  const [midAt, setMidAt]                 = useState("");
  const [finalPlace, setFinalPlace]       = useState("");
  const [finalAt, setFinalAt]             = useState("");

  const [toast, setToast] = useState({ show: false, type: "info", text: "" });
  const showToast = (text, type = "info", timeout = 2500) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
  };

  const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";

  const loadList = async () => {
    setLoading(true);
    setStatus("");
    try {
      const r = await api.get("/api/all-projects/");
      const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setProjects(list);
    } catch (e) {
      setStatus("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadList(); /* eslint-disable-next-line */ }, []);

  const normalizeSubs = (list = []) => {
    const map = {};
    list.forEach((x) => { if (x?.step) map[x.step] = x; });
    setSubsByStep(map);
    setSubs(list);
  };

  const openProject = async (p, initialTab = "overview") => {
    setActive(p);
    setTab(initialTab);
    setDetailLoading(true);
    setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
    setSelectedEvaluator("");

    // ✅ prefill from payload
    setProposalPlace(p.proposal_presentation_place || "");
    setProposalAt(p.proposal_presentation_at ? p.proposal_presentation_at.slice(0,16) : "");
    setMidPlace(p.mid_presentation_place || "");
    setMidAt(p.mid_presentation_at ? p.mid_presentation_at.slice(0,16) : "");
    setFinalPlace(p.final_presentation_place || "");
    setFinalAt(p.final_presentation_at ? p.final_presentation_at.slice(0,16) : "");

    try {
      const reqs = [];
      if (["assign"].includes(initialTab)) {
        reqs.push(api.get("/api/supervisors/").catch(() => ({ data: [] })));
      }
      if (["overview","comments"].includes(initialTab)) {
        reqs.push(api.get(`/api/projects/${p.id}/comments/`).catch(() => ({ data: [] })));
      }
      if (["overview","meetings"].includes(initialTab)) {
        reqs.push(api.get(`/api/projects/${p.id}/meetings/`).catch(() => ({ data: [] })));
      }
      if (["overview","submissions"].includes(initialTab)) {
        reqs.push(api.get(`/api/projects/${p.id}/submissions/`).catch(() => ({ data: [] })));
      }
      if (["overview","evaluations"].includes(initialTab)) {
        reqs.push(api.get(`/api/projects/${p.id}/evaluation/`).catch(() => ({ data: null })));
      }

      const resps = await Promise.all(reqs);
      resps.forEach((r) => {
        const d = r.data;
        if (Array.isArray(d) && d.length && d[0]?.text !== undefined) setComments(d);
        else if (Array.isArray(d) && d.length && d[0]?.title !== undefined) setMeetings(d);
        else if (Array.isArray(d) && d.length && (d[0]?.role === "supervisor" || d[0]?.email)) setSupervisors(d);
        else if (Array.isArray(d)) normalizeSubs(d);
        else if (d && d.proposal_decision !== undefined) {
          setActive((prev) => ({ ...prev, evaluation: d }));
        }
      });
    } catch {
      showToast("Failed to load details.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const ensureTab = async (t) => {
    if (!active) return;
    try {
      if (t === "assign" && supervisors.length === 0) {
        const r = await api.get("/api/supervisors/");
        setSupervisors(r.data || []);
      }
      if (t === "comments" && comments.length === 0) {
        const r = await api.get(`/api/projects/${active.id}/comments/`);
        setComments(r.data || []);
      }
      if (t === "meetings" && meetings.length === 0) {
        const r = await api.get(`/api/projects/${active.id}/meetings/`);
        setMeetings(r.data || []);
      }
      if (t === "submissions" && subs.length === 0) {
        const r = await api.get(`/api/projects/${active.id}/submissions/`);
        normalizeSubs(r.data || []);
      }
      if (t === "evaluations" && !active.evaluation) {
        const r = await api.get(`/api/projects/${active.id}/evaluation/`).catch(()=>({data:null}));
        if (r.data) setActive((prev)=>({ ...prev, evaluation:r.data }));
      }
    } catch {
      showToast("Failed to load tab.", "error");
    }
  };

  const closeDrawer = () => {
    setActive(null);
    setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
    setSelectedEvaluator("");
  };

  const assignEvaluator = async () => {
    if (!active || !selectedEvaluator) return;
    try {
      await api.post("/api/assign-evaluation/", {
        project_id: active.id,
        evaluator_id: Number(selectedEvaluator),
      });
      showToast("Evaluator assigned.", "success");
      await loadList();
      const r = await api.get(`/api/projects/${active.id}/evaluation/`).catch(()=>({data:null}));
      if (r.data) setActive((prev)=>({ ...prev, evaluation:r.data }));
      setSelectedEvaluator("");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to assign.";
      showToast(msg, "error");
    }
  };

  const removeEvaluator = async () => {
    if (!active) return;
    if (!window.confirm("Remove evaluator from this project?")) return;
    try {
      await api.delete(`/api/assign-evaluation/${active.id}/`);
      showToast("Evaluator removed.", "success");
      await loadList();
      setActive((prev)=> ({ ...prev, evaluation:null }));
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to remove.";
      showToast(msg, "error");
    }
  };

  // ✅ SAVE all 3 places + 3 timings
  const savePresentation = async () => {
    if (!active) return;
    try {
      const payload = {
        proposal_presentation_place: proposalPlace || null,
        proposal_presentation_at: proposalAt || null,
        mid_presentation_place: midPlace || null,
        mid_presentation_at: midAt || null,
        final_presentation_place: finalPlace || null,
        final_presentation_at: finalAt || null,
      };
      const r = await api.patch(`/api/projects/${active.id}/admin/`, payload);
      setActive((prev)=>({ ...prev, ...r.data }));
      showToast("Presentation schedule saved.", "success");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data?.error || "Failed to save.";
      showToast(msg, "error");
    }
  };

  const completedCount = STEPS.filter((s)=> !!subsByStep[s.key]).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  const downloadSub = async (submissionId, fileName = "submission") => {
    try {
      const res = await api.get(`/api/student/submissions/download/${submissionId}/`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Projects</h2>
      {status && <div className={styles.status}>{status}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>No projects found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Supervisor</th>
                <th>Members</th>
                <th>Evaluator</th>
                <th>Created</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const supervisorName = nameOrEmail(p.supervisor);
                const members =
                  [p.group_member_1, p.group_member_2, p.group_member_3]
                  .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—";
                const created = p.created_at ? new Date(p.created_at).toLocaleString() : "—";
                const evaluator =
                  p?.evaluation?.evaluator_name || p?.evaluation?.evaluator_email || "Not assigned";
                return (
                  <tr key={p.id}>
                    <td className={styles.titleCell}>{p.project_title}</td>
                    <td>{supervisorName}</td>
                    <td className={styles.membersCell}>{members}</td>
                    <td>
                      {p.evaluation ? (
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluator}</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned</span>
                      )}
                    </td>
                    <td>{created}</td>
                    <td>
                      <div className={styles.inlineBtns}>
                        <button className={styles.openBtn} onClick={() => openProject(p, "overview")}>Open</button>
                        <button className={styles.assignBtn} onClick={() => openProject(p, "assign")}>Assign</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {active && (
        <div className={styles.drawerBackdrop} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>{active.project_title}</h3>
              <button className={styles.closeBtn} onClick={closeDrawer}>×</button>
            </div>

            <div className={styles.tabBar}>
              {["overview","assign","meetings","comments","submissions","evaluations"].map((t) => (
                <button
                  key={t}
                  className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ""}`}
                  onClick={async () => { setTab(t); await ensureTab(t); }}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {detailLoading ? (
              <div className={styles.drawerBody}><div className={styles.loading}>Loading details…</div></div>
            ) : (
              <div className={styles.drawerBody}>
                {/* OVERVIEW */}
                {tab === "overview" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Overview</h4>
                    <div className={styles.kv}>
                      <div><b>Supervisor:</b> {nameOrEmail(active.supervisor)}</div>
                      <div><b>Co-Supervisor:</b> {active.co_supervisor_email || "—"}</div>
                      <div>
                        <b>Evaluator:</b>{" "}
                        {active.evaluation
                          ? (active.evaluation.evaluator_name || active.evaluation.evaluator_email)
                          : "Not assigned"}
                      </div>
                      <div><b>Created:</b> {active.created_at ? new Date(active.created_at).toLocaleString() : "—"}</div>
                    </div>

                    <div className={styles.membersRow}>
                      <b>Members:</b>{" "}
                      {[active.group_member_1, active.group_member_2, active.group_member_3]
                        .filter(Boolean).map(nameOrEmail).join(", ") || "—"}
                    </div>

                    {/* ✅ 3x presentation blocks */}
                    <div className={styles.presentationBox}>
                      <div className={styles.blockTitle}>Proposal Presentation</div>
                      <div className={styles.row2}>
                        <div className={styles.col}>
                          <label>Place</label>
                          <input
                            className={styles.input}
                            value={proposalPlace}
                            onChange={(e)=>setProposalPlace(e.target.value)}
                            placeholder="Auditorium / Room / Meet link"
                          />
                        </div>
                        <div className={styles.col}>
                          <label>Date & Time</label>
                          <input
                            className={styles.input}
                            type="datetime-local"
                            value={proposalAt}
                            onChange={(e)=>setProposalAt(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.blockTitle}>Mid Presentation</div>
                      <div className={styles.row2}>
                        <div className={styles.col}>
                          <label>Place</label>
                          <input
                            className={styles.input}
                            value={midPlace}
                            onChange={(e)=>setMidPlace(e.target.value)}
                            placeholder="Auditorium / Room / Meet link"
                          />
                        </div>
                        <div className={styles.col}>
                          <label>Date & Time</label>
                          <input
                            className={styles.input}
                            type="datetime-local"
                            value={midAt}
                            onChange={(e)=>setMidAt(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.blockTitle}>Final Presentation</div>
                      <div className={styles.row2}>
                        <div className={styles.col}>
                          <label>Place</label>
                          <input
                            className={styles.input}
                            value={finalPlace}
                            onChange={(e)=>setFinalPlace(e.target.value)}
                            placeholder="Auditorium / Room / Meet link"
                          />
                        </div>
                        <div className={styles.col}>
                          <label>Date & Time</label>
                          <input
                            className={styles.input}
                            type="datetime-local"
                            value={finalAt}
                            onChange={(e)=>setFinalAt(e.target.value)}
                          />
                        </div>
                      </div>

                      <button className={styles.primaryBtn} onClick={savePresentation}>Save Presentation</button>
                    </div>
                  </section>
                )}

                {/* ASSIGN */}
                {tab === "assign" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Assign Evaluator</h4>

                    <div className={styles.currentEval}>
                      <b>Current:</b>{" "}
                      {active.evaluation
                        ? (active.evaluation.evaluator_name || active.evaluation.evaluator_email)
                        : "Unassigned"}
                      {active.evaluation && (
                        <button className={styles.removeBtn} onClick={removeEvaluator}>Remove</button>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <label>Select Supervisor</label>
                      <select
                        className={styles.select}
                        value={selectedEvaluator}
                        onChange={(e) => setSelectedEvaluator(e.target.value)}
                      >
                        <option value="">Choose…</option>
                        {(Array.isArray(supervisors) ? supervisors : []).map((s) => (
                          <option key={s.id} value={s.id}>
                            {(s.full_name || s.email)} — {s.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.hint}>
                      Policy: each evaluator can be <b>assigned to max 2</b> projects.
                    </div>

                    <button className={styles.primaryBtn} onClick={assignEvaluator} disabled={!selectedEvaluator}>
                      Save Assignment
                    </button>
                  </section>
                )}

                {/* MEETINGS */}
                {tab === "meetings" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Meetings</h4>
                    {meetings.length === 0 ? (
                      <div className={styles.muted}>No meetings yet.</div>
                    ) : (
                      <div className={styles.meetingList}>
                        {meetings.map((m) => (
                          <div key={m.id || m.starts_at} className={styles.meetingItem}>
                            <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
                            <div className={styles.meetingMeta}>
                              <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
                              {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
                              {m.location && <span> · <b>Where:</b> {m.location}</span>}
                            </div>
                            {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* COMMENTS */}
                {tab === "comments" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Comments</h4>
                    {comments.length === 0 ? (
                      <div className={styles.muted}>No comments yet.</div>
                    ) : (
                      <div className={styles.commentList}>
                        {comments.map((c) => (
                          <div key={c.id || c.created_at} className={styles.commentItem}>
                            <div className={styles.commentMeta}>
                              <b>{c.author_name || "Supervisor"}</b>
                              <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                            </div>
                            <div className={styles.commentText}>{c.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* SUBMISSIONS */}
                {tab === "submissions" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Submissions</h4>

                    <div className={styles.progressWrap}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={styles.progressCircle}>
                        <div className={styles.circleInner}><div className={styles.pct}>{pct}%</div></div>
                      </div>
                    </div>

                    <div className={styles.cards}>
                      {STEPS.map((s) => {
                        const item = subsByStep[s.key];
                        return (
                          <div key={s.key} className={styles.card}>
                            <div className={styles.cardHead}>
                              <div className={styles.cardTitle}>{s.label}</div>
                              <div className={styles.cardStatus}>
                                {item ? <span className={styles.badgeDone}>Submitted</span> : <span className={styles.badgeTodo}>Pending</span>}
                              </div>
                            </div>
                            <div className={styles.cardBody}>
                              {item ? (
                                <>
                                  <div className={styles.meta}>
                                    <div><b>File:</b> {item.file_name}</div>
                                    <div><b>Uploaded:</b> {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "—"}</div>
                                  </div>
                                  <div className={styles.actions}>
                                    <button className={styles.downloadBtn} onClick={() => downloadSub(item.id, item.file_name)}>Download</button>
                                    {item.file_url && <a className={styles.viewLink} href={item.file_url} target="_blank" rel="noreferrer">View</a>}
                                  </div>
                                </>
                              ) : (
                                <div className={styles.metaMuted}>No file uploaded yet.</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* EVALUATIONS */}
                {tab === "evaluations" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Evaluations</h4>
                    {!active.evaluation ? (
                      <div className={styles.muted}>No evaluation yet.</div>
                    ) : (
                      <div className={styles.evalGrid}>
                        {[
                          { key: "proposal", label: "Proposal", marksKey: "proposal_marks", decisionKey: "proposal_decision", remarksKey: "proposal_remarks", max: 10 },
                          { key: "mid_presentation", label: "Mid Presentation", marksKey: "mid_presentation_marks", decisionKey: "mid_presentation_decision", remarksKey: "mid_presentation_remarks", max: 10 },
                          { key: "final_presentation", label: "Final Presentation", marksKey: "final_presentation_marks", decisionKey: "final_presentation_decision", remarksKey: "final_presentation_remarks", max: 10 },
                        ].map((st) => (
                          <div key={st.key} className={styles.evalCard}>
                            <div className={styles.evalHead}>
                              <span className={styles.evalTitle}>{st.label}</span>
                              <span className={`${styles.badge} ${
                                active.evaluation[st.decisionKey] === "pass" ? styles.badgeSuccess :
                                active.evaluation[st.decisionKey] === "revise" ? styles.badgeWarn : styles.badgeError
                              }`}>
                                {String(active.evaluation[st.decisionKey] || "").toUpperCase()}
                              </span>
                            </div>
                            {active.evaluation[st.decisionKey] === "pass" && (
                              <div className={styles.evalMeta}>Marks: <b>{active.evaluation[st.marksKey]} / {st.max}</b></div>
                            )}
                            {active.evaluation[st.remarksKey] && (
                              <div className={styles.evalRemarks}>{active.evaluation[st.remarksKey]}</div>
                            )}
                          </div>
                        ))}
                        <div className={styles.evalFooter}>
                          Evaluator: <b>{active.evaluation.evaluator_name || active.evaluation.evaluator_email}</b>
                          {active.evaluation.assigned_at && <span> · Assigned: {new Date(active.evaluation.assigned_at).toLocaleString()}</span>}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`${styles.toast} ${
          toast.type === "success" ? styles.toastSuccess :
          toast.type === "error"   ? styles.toastError   : styles.toastInfo}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
