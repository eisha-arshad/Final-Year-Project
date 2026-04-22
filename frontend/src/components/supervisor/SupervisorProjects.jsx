

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./SupervisorProjects.module.css";

// const STEPS = [
//   { key: "proposal",               label: "Proposal" },
//   { key: "proposal_report",        label: "Proposal Report" },
//   { key: "proposal_presentation",  label: "Proposal Presentation" },
//   { key: "final_report",           label: "Final Report" },
//   { key: "final_presentation",     label: "Final Presentation" },
// ];

// function SupervisorProjects() {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState("");

//   // Drawer / detail
//   const [activeProject, setActiveProject] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview"); // overview | comments | meetings | submissions

//   // Comments
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");

//   // Meetings
//   const [meetings, setMeetings] = useState([]);
//   const [meetingForm, setMeetingForm] = useState({
//     title: "",
//     starts_at: "",
//     ends_at: "",
//     location: "",
//     notes: "",
//   });

//   // Submissions
//   const [subs, setSubs] = useState([]); // raw
//   const [subsByStep, setSubsByStep] = useState({}); // normalized map by step

//   // Toast
//   const [toast, setToast] = useState({ show: false, type: "info", text: "" });
//   const showToast = (text, type = "info", timeout = 2500) => {
//     setToast({ show: true, type, text });
//     setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
//   };

//   const token = useMemo(() => localStorage.getItem("access"), []);
//   const api = axios.create({
//     baseURL: "http://127.0.0.1:8000",
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   // Load my supervised projects
//   const loadProjects = async () => {
//     setLoading(true);
//     setStatus("");
//     try {
//       const res = await api.get("/api/supervisor-project/");
//       setProjects(res.data || []);
//     } catch (e) {
//       setStatus("Failed to load your projects.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProjects();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Normalize submissions in fixed STEPS order
//   const normalizeSubs = (list = []) => {
//     const map = {};
//     list.forEach((x) => { if (x?.step) map[x.step] = x; });
//     setSubsByStep(map);
//     setSubs(list);
//   };

//   // Open details
//   const openDetails = async (project, tab = "overview") => {
//     setActiveProject(project);
//     setActiveTab(tab);
//     setDetailLoading(true);
//     setComments([]);
//     setMeetings([]);
//     setSubs([]);
//     setSubsByStep({});
//     setNewComment("");
//     setMeetingForm({ title: "", starts_at: "", ends_at: "", location: "", notes: "" });

//     try {
//       const reqs = [];
//       if (["overview", "comments"].includes(tab)) {
//         reqs.push(api.get(`/api/projects/${project.id}/comments/`).catch(() => ({ data: [] })));
//       }
//       if (["overview", "meetings"].includes(tab)) {
//         reqs.push(api.get(`/api/projects/${project.id}/meetings/`).catch(() => ({ data: [] })));
//       }
//       if (["overview", "submissions"].includes(tab)) {
//         reqs.push(api.get(`/api/projects/${project.id}/submissions/`).catch(() => ({ data: [] })));
//       }
//       const responses = await Promise.all(reqs);
//       responses.forEach((r) => {
//         const d = r.data || [];
//         if (Array.isArray(d) && d.length && d[0]?.text !== undefined) setComments(d);
//         else if (Array.isArray(d) && d.length && d[0]?.title !== undefined) setMeetings(d);
//         else if (Array.isArray(d)) normalizeSubs(d);
//       });
//     } catch {
//       showToast("Failed to load details.", "error");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const ensureTabData = async (tab) => {
//     if (!activeProject) return;
//     try {
//       if (tab === "comments" && comments.length === 0) {
//         const r = await api.get(`/api/projects/${activeProject.id}/comments/`);
//         setComments(r.data || []);
//       }
//       if (tab === "meetings" && meetings.length === 0) {
//         const r = await api.get(`/api/projects/${activeProject.id}/meetings/`);
//         setMeetings(r.data || []);
//       }
//       if (tab === "submissions" && subs.length === 0) {
//         const r = await api.get(`/api/projects/${activeProject.id}/submissions/`);
//         normalizeSubs(r.data || []);
//       }
//     } catch {
//       showToast("Failed to load data.", "error");
//     }
//   };

//   const closeDetails = () => {
//     setActiveProject(null);
//     setComments([]);
//     setMeetings([]);
//     setSubs([]);
//     setSubsByStep({});
//   };

//   // Add comment
//   const addComment = async () => {
//     if (!activeProject || !newComment.trim()) return;
//     try {
//       const res = await api.post(`/api/projects/${activeProject.id}/comments/`, {
//         text: newComment.trim(),
//       });
//       setComments([res.data, ...comments]);
//       setNewComment("");
//       showToast("Comment added.", "success");
//     } catch (e) {
//       const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to add comment.";
//       showToast(msg, "error");
//     }
//   };

//   // Add meeting
//   const addMeeting = async () => {
//     const { title, starts_at, ends_at, location, notes } = meetingForm;
//     if (!activeProject || !title.trim() || !starts_at) {
//       showToast("Title and start time are required.", "error");
//       return;
//     }
//     try {
//       const payload = { title: title.trim(), starts_at, ends_at: ends_at || null, location: location || "", notes: notes || "" };
//       const res = await api.post(`/api/projects/${activeProject.id}/meetings/`, payload);
//       setMeetings([res.data, ...meetings]);
//       setMeetingForm({ title: "", starts_at: "", ends_at: "", location: "", notes: "" });
//       showToast("Meeting scheduled.", "success");
//     } catch (e) {
//       const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to schedule meeting.";
//       showToast(msg, "error");
//     }
//   };

//   // Download submission
//   const downloadSub = async (submissionId, fileName = "submission") => {
//     try {
//       const res = await api.get(`/api/student/submissions/download/${submissionId}/`, { responseType: "blob" });
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = fileName;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       showToast("Download failed.", "error");
//     }
//   };

//   const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";

//   // ==== PROGRESS (exact same logic as student) ====
//   const completedCount = STEPS.filter(s => !!subsByStep[s.key]).length;
//   const pct = Math.round((completedCount / STEPS.length) * 100);
//   const nextAllowedKey = (() => {
//     for (const s of STEPS) if (!subsByStep[s.key]) return s.key;
//     return null;
//   })();
//   const isStepDone = (key) => !!subsByStep[key];
//   const isStepCurrent = (key) => nextAllowedKey === key;

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.title}>My Supervised Projects</h2>

//       {status && <div className={styles.status}>{status}</div>}

//       {loading ? (
//         <div className={styles.loading}>Loading…</div>
//       ) : projects.length === 0 ? (
//         <div className={styles.empty}>You have no projects yet.</div>
//       ) : (
//         <div className={styles.tableWrap}>
//           <table className={styles.table}>
//             <thead>
//               <tr>
//                 <th>Project Title</th>
//                 <th>Evaluator</th>
//                 <th>Created</th>
//                 <th>Members</th>
//                 <th>Open</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.map((p) => {
//                 const evaluator =
//                   p?.evaluation?.evaluator_name ||
//                   p?.evaluation?.evaluator_email ||
//                   "Not assigned";
//                 const created = p?.created_at ? new Date(p.created_at).toLocaleString() : "—";
//                 const members =
//                   [p.group_member_1, p.group_member_2, p.group_member_3]
//                     .filter(Boolean)
//                     .map((m) => nameOrEmail(m))
//                     .join(", ") || "—";

//                 return (
//                   <tr key={p.id}>
//                     <td className={styles.titleCell}>{p.project_title}</td>
//                     <td>
//                       {p.evaluation ? (
//                         <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluator}</span>
//                       ) : (
//                         <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned yet</span>
//                       )}
//                     </td>
//                     <td>{created}</td>
//                     <td className={styles.membersCell}>{members}</td>
//                     <td>
//                       <div className={styles.inlineBtns}>
//                         <button className={styles.detailBtn}  onClick={() => openDetails(p, "overview")}>View</button>
//                         <button className={styles.commentBtn} onClick={() => openDetails(p, "comments")}>Comments</button>
//                         <button className={styles.meetingBtn} onClick={() => openDetails(p, "meetings")}>Meetings</button>
//                         <button className={styles.subBtn}     onClick={() => openDetails(p, "submissions")}>Submissions</button>
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
//       {activeProject && (
//         <div className={styles.drawerBackdrop} onClick={closeDetails}>
//           <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.drawerHeader}>
//               <h3 className={styles.drawerTitle}>{activeProject.project_title}</h3>
//               <button className={styles.closeBtn} onClick={closeDetails}>×</button>
//             </div>

//             {/* Tab bar */}
//             <div className={styles.tabBar}>
//               {["overview","comments","meetings","submissions"].map(t => (
//                 <button
//                   key={t}
//                   className={`${styles.tabBtn} ${activeTab === t ? styles.tabBtnActive : ""}`}
//                   onClick={async () => { setActiveTab(t); await ensureTabData(t); }}
//                 >
//                   {t[0].toUpperCase()+t.slice(1)}
//                 </button>
//               ))}
//             </div>

//             {detailLoading ? (
//               <div className={styles.loading}>Loading details…</div>
//             ) : (
//               <div className={styles.drawerBody}>
//                 {/* OVERVIEW */}
//                 {activeTab === "overview" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Overview</h4>
//                     <div className={styles.kv}>
//                       <div><b>Supervisor:</b> {nameOrEmail(activeProject.supervisor)}</div>
//                       <div><b>Co-Supervisor:</b> {activeProject.co_supervisor_email || "—"}</div>
//                       <div><b>Evaluator:</b> {activeProject.evaluation ? (activeProject.evaluation.evaluator_name || activeProject.evaluation.evaluator_email) : "Not assigned yet"}</div>
//                       <div><b>Created:</b> {activeProject.created_at ? new Date(activeProject.created_at).toLocaleString() : "—"}</div>
//                     </div>
//                     <div className={styles.members}>
//                       <b>Members:</b>{" "}
//                       {[activeProject.group_member_1, activeProject.group_member_2, activeProject.group_member_3]
//                         .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—"}
//                     </div>
//                   </section>
//                 )}

//                 {/* COMMENTS */}
//                 {activeTab === "comments" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Comments</h4>
//                     <div className={styles.commentForm}>
//                       <textarea className={styles.textarea} placeholder="Write a comment for the student (visible in MyProjectDetail)…"
//                                 value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} />
//                       <button className={styles.primaryBtn} onClick={addComment} disabled={!newComment.trim()}>Post Comment</button>
//                     </div>
//                     <div className={styles.commentList}>
//                       {comments.length === 0 ? <div className={styles.muted}>No comments yet.</div> : comments.map((c) => (
//                         <div key={c.id || c.created_at} className={styles.commentItem}>
//                           <div className={styles.commentMeta}><b>{c.author_name || "Supervisor"}</b><span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span></div>
//                           <div className={styles.commentText}>{c.text}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {/* MEETINGS */}
//                 {activeTab === "meetings" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Schedule Meeting</h4>
//                     <div className={styles.meetingForm}>
//                       <div className={styles.formRow}><label>Title</label><input className={styles.input} value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="e.g., Milestone review" /></div>
//                       <div className={styles.formRow}><label>Start</label><input className={styles.input} type="datetime-local" value={meetingForm.starts_at} onChange={(e) => setMeetingForm({ ...meetingForm, starts_at: e.target.value })} /></div>
//                       <div className={styles.formRow}><label>End</label><input className={styles.input} type="datetime-local" value={meetingForm.ends_at} onChange={(e) => setMeetingForm({ ...meetingForm, ends_at: e.target.value })} /></div>
//                       <div className={styles.formRow}><label>Location / Link</label><input className={styles.input} value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} placeholder="Room 204 or Google Meet link" /></div>
//                       <div className={styles.formRow}><label>Notes</label><textarea className={styles.textarea} rows={2} value={meetingForm.notes} onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} placeholder="What to prepare, agenda, etc." /></div>
//                       <button className={styles.primaryBtn} onClick={addMeeting}>Create Meeting</button>
//                     </div>
//                     <div className={styles.meetingList}>
//                       <h5 className={styles.subTitle}>Upcoming & Past Meetings</h5>
//                       {meetings.length === 0 ? <div className={styles.muted}>No meetings yet.</div> : meetings.map((m) => (
//                         <div key={m.id || m.starts_at} className={styles.meetingItem}>
//                           <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
//                           <div className={styles.meetingMeta}>
//                             <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
//                             {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
//                             {m.location && <span> · <b>Where:</b> {m.location}</span>}
//                           </div>
//                           {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
//                         </div>
//                       ))}
//                     </div>
//                   </section>
//                 )}

//                 {/* SUBMISSIONS — EXACT same sequence & UI (read‑only) */}
//                 {activeTab === "submissions" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Student Submissions</h4>

//                     {/* Progress */}
//                     <div className={styles.progressWrap}>
//                       <div className={styles.progressBar}>
//                         <div className={styles.progressFill} style={{ width: `${pct}%` }} />
//                       </div>
//                       <div className={styles.progressCircle}>
//                         <div className={styles.circleInner}>
//                           <div className={styles.pct}>{pct}%</div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Stepper */}
//                     <div className={styles.stepper}>
//                       {STEPS.map((s, i) => (
//                         <div key={s.key} className={`${styles.step} ${isStepDone(s.key) ? styles.done : ""} ${isStepCurrent(s.key) ? styles.current : ""}`}>
//                           <div className={styles.stepDot}>{isStepDone(s.key) ? "✓" : i + 1}</div>
//                           <div className={styles.stepLabel}>{s.label}</div>
//                           {i < STEPS.length - 1 && <div className={styles.stepLine} />}
//                         </div>
//                       ))}
//                     </div>

//                     {/* Cards (View/Download only) */}
//                     <div className={styles.cards}>
//                       {STEPS.map((s) => {
//                         const item = subsByStep[s.key]; // exactly by sequence
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
//                                   <div className={styles.subActions}>
//                                     <button className={styles.downloadBtn} onClick={() => downloadSub(item.id, item.file_name)}>
//                                       Download
//                                     </button>
//                                     {item.file_url && (
//                                       <a href={item.file_url} target="_blank" rel="noreferrer" className={styles.viewLink}>
//                                         View
//                                       </a>
//                                     )}
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
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {toast.show && (
//         <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : toast.type === "error" ? styles.toastError : styles.toastInfo}`}>
//           {toast.text}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SupervisorProjects;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./SupervisorProjects.module.css";

const STEPS = [
  { key: "proposal",               label: "Proposal" },
  { key: "proposal_report",        label: "Proposal Report" },
  { key: "proposal_presentation",  label: "Proposal Presentation" },
  { key: "final_report",           label: "Final Report" },
  { key: "final_presentation",     label: "Final Presentation" },
];

function SupervisorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [activeProject, setActiveProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | comments | meetings | submissions

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [meetings, setMeetings] = useState([]);
  const [meetingForm, setMeetingForm] = useState({
    title: "", starts_at: "", ends_at: "", location: "", notes: "",
  });

  const [subs, setSubs] = useState([]);
  const [subsByStep, setSubsByStep] = useState({});

  const [toast, setToast] = useState({ show: false, type: "info", text: "" });
  const showToast = (text, type = "info", timeout = 2500) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
  };

  const token = useMemo(() => localStorage.getItem("access"), []);
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadProjects = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await api.get("/api/supervisor-project/");
      setProjects(res.data || []);
    } catch {
      setStatus("Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); /* eslint-disable-next-line */ }, []);

  const normalizeSubs = (list = []) => {
    const map = {};
    list.forEach((x) => { if (x?.step) map[x.step] = x; });
    setSubsByStep(map);
    setSubs(list);
  };

  const openDetails = async (project, tab = "overview") => {
    setActiveProject(project);
    setActiveTab(tab);
    setDetailLoading(true);

    setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
    setNewComment(""); setMeetingForm({ title: "", starts_at: "", ends_at: "", location: "", notes: "" });

    try {
      const reqs = [];
      if (["overview", "comments"].includes(tab)) {
        reqs.push(api.get(`/api/projects/${project.id}/comments/`).catch(() => ({ data: [] })));
      }
      if (["overview", "meetings"].includes(tab)) {
        reqs.push(api.get(`/api/projects/${project.id}/meetings/`).catch(() => ({ data: [] })));
      }
      if (["overview", "submissions"].includes(tab)) {
        reqs.push(api.get(`/api/projects/${project.id}/submissions/`).catch(() => ({ data: [] })));
      }
      const responses = await Promise.all(reqs);
      responses.forEach((r) => {
        const d = r.data || [];
        if (Array.isArray(d) && d.length && d[0]?.text !== undefined) setComments(d);
        else if (Array.isArray(d) && d.length && d[0]?.title !== undefined) setMeetings(d);
        else if (Array.isArray(d)) normalizeSubs(d);
      });
    } catch {
      showToast("Failed to load details.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const ensureTabData = async (tab) => {
    if (!activeProject) return;
    try {
      if (tab === "comments" && comments.length === 0) {
        const r = await api.get(`/api/projects/${activeProject.id}/comments/`);
        setComments(r.data || []);
      }
      if (tab === "meetings" && meetings.length === 0) {
        const r = await api.get(`/api/projects/${activeProject.id}/meetings/`);
        setMeetings(r.data || []);
      }
      if (tab === "submissions" && subs.length === 0) {
        const r = await api.get(`/api/projects/${activeProject.id}/submissions/`);
        normalizeSubs(r.data || []);
      }
    } catch {
      showToast("Failed to load data.", "error");
    }
  };

  const closeDetails = () => {
    setActiveProject(null);
    setComments([]); setMeetings([]); setSubs([]); setSubsByStep({});
  };

  const addComment = async () => {
    if (!activeProject || !newComment.trim()) return;
    try {
      const res = await api.post(`/api/projects/${activeProject.id}/comments/`, { text: newComment.trim() });
      setComments([res.data, ...comments]);
      setNewComment("");
      showToast("Comment added.", "success");
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to add comment.";
      showToast(msg, "error");
    }
  };

  const addMeeting = async () => {
    const { title, starts_at, ends_at, location, notes } = meetingForm;
    if (!activeProject || !title.trim() || !starts_at) {
      showToast("Title and start time are required.", "error");
      return;
    }
    try {
      const payload = { title: title.trim(), starts_at, ends_at: ends_at || null, location: location || "", notes: notes || "" };
      const res = await api.post(`/api/projects/${activeProject.id}/meetings/`, payload);
      setMeetings([res.data, ...meetings]);
      setMeetingForm({ title: "", starts_at: "", ends_at: "", location: "", notes: "" });
      showToast("Meeting scheduled.", "success");
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to schedule meeting.";
      showToast(msg, "error");
    }
  };

  const downloadSub = async (submissionId, fileName = "submission") => {
    try {
      const res = await api.get(`/api/student/submissions/download/${submissionId}/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed.", "error");
    }
  };

  const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";

  // progress (for submissions tab)
  const completedCount = STEPS.filter(s => !!subsByStep[s.key]).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);
  const nextAllowedKey = (() => {
    for (const s of STEPS) if (!subsByStep[s.key]) return s.key;
    return null;
  })();
  const isStepDone = (key) => !!subsByStep[key];
  const isStepCurrent = (key) => nextAllowedKey === key;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Supervised Projects</h2>

      {status && <div className={styles.status}>{status}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>You have no projects yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Evaluator</th>
                <th>Created</th>
                <th>Members</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const evaluator =
                  p?.evaluation?.evaluator_name ||
                  p?.evaluation?.evaluator_email ||
                  "Not assigned";
                const created = p?.created_at ? new Date(p.created_at).toLocaleString() : "—";
                const members =
                  [p.group_member_1, p.group_member_2, p.group_member_3]
                    .filter(Boolean)
                    .map((m) => nameOrEmail(m))
                    .join(", ") || "—";
                return (
                  <tr key={p.id}>
                    <td className={styles.titleCell}>{p.project_title}</td>
                    <td>
                      {p.evaluation ? (
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluator}</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned yet</span>
                      )}
                    </td>
                    <td>{created}</td>
                    <td className={styles.membersCell}>{members}</td>
                    <td>
                      <div className={styles.inlineBtns}>
                        <button className={styles.detailBtn}  onClick={() => openDetails(p, "overview")}>View</button>
                        <button className={styles.commentBtn} onClick={() => openDetails(p, "comments")}>Comments</button>
                        <button className={styles.meetingBtn} onClick={() => openDetails(p, "meetings")}>Meetings</button>
                        <button className={styles.subBtn}     onClick={() => openDetails(p, "submissions")}>Submissions</button>
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
      {activeProject && (
        <div className={styles.drawerBackdrop} onClick={closeDetails}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>{activeProject.project_title}</h3>
              <button className={styles.closeBtn} onClick={closeDetails}>×</button>
            </div>

            <div className={styles.tabBar}>
              {["overview","comments","meetings","submissions"].map(t => (
                <button
                  key={t}
                  className={`${styles.tabBtn} ${activeTab === t ? styles.tabBtnActive : ""}`}
                  onClick={async () => { setActiveTab(t); await ensureTabData(t); }}
                >
                  {t[0].toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {detailLoading ? (
              <div className={styles.loading}>Loading details…</div>
            ) : (
              <div className={styles.drawerBody}>
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Overview</h4>
                    <div className={styles.kv}>
                      <div><b>Supervisor:</b> {nameOrEmail(activeProject.supervisor)}</div>
                      <div><b>Co-Supervisor:</b> {activeProject.co_supervisor_email || "—"}</div>
                      <div><b>Evaluator:</b> {activeProject.evaluation ? (activeProject.evaluation.evaluator_name || activeProject.evaluation.evaluator_email) : "Not assigned yet"}</div>
                      <div><b>Created:</b> {activeProject.created_at ? new Date(activeProject.created_at).toLocaleString() : "—"}</div>
                    </div>

                    {/* quick evaluation summary */}
                    {activeProject.evaluation && (
                      <div className={styles.evalSummaryBox}>
                        <div>
                          <b>Proposal:</b> {activeProject.evaluation.proposal_decision}
                          {activeProject.evaluation.proposal_decision === "pass" ? ` (${activeProject.evaluation.proposal_marks})` : ""}
                        </div>
                        <div>
                          <b>Mid:</b> {activeProject.evaluation.mid_presentation_decision}
                          {activeProject.evaluation.mid_presentation_decision === "pass" ? ` (${activeProject.evaluation.mid_presentation_marks})` : ""}
                        </div>
                        <div>
                          <b>Final:</b> {activeProject.evaluation.final_presentation_decision}
                          {activeProject.evaluation.final_presentation_decision === "pass" ? ` (${activeProject.evaluation.final_presentation_marks})` : ""}
                        </div>
                      </div>
                    )}

                    <div className={styles.members}>
                      <b>Members:</b>{" "}
                      {[activeProject.group_member_1, activeProject.group_member_2, activeProject.group_member_3]
                        .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—"}
                    </div>
                  </section>
                )}

                {/* COMMENTS */}
                {activeTab === "comments" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Comments</h4>
                    <div className={styles.commentForm}>
                      <textarea
                        className={styles.textarea}
                        placeholder="Write a comment for the student (visible in MyProjectDetail)…"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <button className={styles.primaryBtn} onClick={addComment} disabled={!newComment.trim()}>
                        Post Comment
                      </button>
                    </div>
                    <div className={styles.commentList}>
                      {comments.length === 0 ? (
                        <div className={styles.muted}>No comments yet.</div>
                      ) : (
                        comments.map((c) => (
                          <div key={c.id || c.created_at} className={styles.commentItem}>
                            <div className={styles.commentMeta}>
                              <b>{c.author_name || "Supervisor"}</b>
                              <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                            </div>
                            <div className={styles.commentText}>{c.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {/* MEETINGS */}
                {activeTab === "meetings" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Schedule Meeting</h4>
                    <div className={styles.meetingForm}>
                      <div className={styles.formRow}>
                        <label>Title</label>
                        <input className={styles.input} value={meetingForm.title}
                               onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="e.g., Milestone review" />
                      </div>
                      <div className={styles.formRow}>
                        <label>Start</label>
                        <input className={styles.input} type="datetime-local" value={meetingForm.starts_at}
                               onChange={(e) => setMeetingForm({ ...meetingForm, starts_at: e.target.value })} />
                      </div>
                      <div className={styles.formRow}>
                        <label>End</label>
                        <input className={styles.input} type="datetime-local" value={meetingForm.ends_at}
                               onChange={(e) => setMeetingForm({ ...meetingForm, ends_at: e.target.value })} />
                      </div>
                      <div className={styles.formRow}>
                        <label>Location / Link</label>
                        <input className={styles.input} value={meetingForm.location}
                               onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} placeholder="Room 204 or Google Meet link" />
                      </div>
                      <div className={styles.formRow}>
                        <label>Notes</label>
                        <textarea className={styles.textarea} rows={2} value={meetingForm.notes}
                                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} placeholder="What to prepare, agenda, etc." />
                      </div>
                      <button className={styles.primaryBtn} onClick={addMeeting}>Create Meeting</button>
                    </div>

                    <div className={styles.meetingList}>
                      <h5 className={styles.subTitle}>Upcoming & Past Meetings</h5>
                      {meetings.length === 0 ? (
                        <div className={styles.muted}>No meetings yet.</div>
                      ) : (
                        meetings.map((m) => (
                          <div key={m.id || m.starts_at} className={styles.meetingItem}>
                            <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
                            <div className={styles.meetingMeta}>
                              <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
                              {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
                              {m.location && <span> · <b>Where:</b> {m.location}</span>}
                            </div>
                            {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {/* SUBMISSIONS */}
                {activeTab === "submissions" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Student Submissions</h4>

                    <div className={styles.progressWrap}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={styles.progressCircle}>
                        <div className={styles.circleInner}>
                          <div className={styles.pct}>{pct}%</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.stepper}>
                      {STEPS.map((s, i) => (
                        <div key={s.key} className={`${styles.step} ${isStepDone(s.key) ? styles.done : ""} ${isStepCurrent(s.key) ? styles.current : ""}`}>
                          <div className={styles.stepDot}>{isStepDone(s.key) ? "✓" : i + 1}</div>
                          <div className={styles.stepLabel}>{s.label}</div>
                          {i < STEPS.length - 1 && <div className={styles.stepLine} />}
                        </div>
                      ))}
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
                                  <div className={styles.subActions}>
                                    <button className={styles.downloadBtn} onClick={() => downloadSub(item.id, item.file_name)}>Download</button>
                                    {item.file_url && (
                                      <a href={item.file_url} target="_blank" rel="noreferrer" className={styles.viewLink}>View</a>
                                    )}
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
              </div>
            )}
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : toast.type === "error" ? styles.toastError : styles.toastInfo}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default SupervisorProjects;
