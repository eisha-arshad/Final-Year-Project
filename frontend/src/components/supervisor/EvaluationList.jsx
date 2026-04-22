// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./EvaluationList.module.css";

// const STEPS = [
//   { key: "proposal",               label: "Proposal" },
//   { key: "proposal_report",        label: "Proposal Report" },
//   { key: "proposal_presentation",  label: "Proposal Presentation" },
//   { key: "final_report",           label: "Final Report" },
//   { key: "final_presentation",     label: "Final Presentation" },
// ];

// // simple evaluation rubric (you can change labels/weights as needed)
// const RUBRIC = [
//   { key: "proposal",              label: "Proposal",              max: 20 },
//   { key: "proposal_report",       label: "Proposal Report",       max: 20 },
//   { key: "proposal_presentation", label: "Proposal Presentation", max: 20 },
//   { key: "final_report",          label: "Final Report",          max: 20 },
//   { key: "final_presentation",    label: "Final Presentation",    max: 20 },
// ];

// function EvaluationList() {
//   // table
//   const [items, setItems] = useState([]);
//   const [status, setStatus] = useState("");
//   const [loading, setLoading] = useState(true);

//   // drawer
//   const [activeProject, setActiveProject] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview"); // overview | submissions | evaluation

//   // submissions
//   const [subs, setSubs] = useState([]);
//   const [subsByStep, setSubsByStep] = useState({});

//   // evaluation state
//   const [evalLoading, setEvalLoading] = useState(false);
//   const [evalData, setEvalData] = useState({
//     // scores by key in RUBRIC
//     proposal: 0,
//     proposal_report: 0,
//     proposal_presentation: 0,
//     final_report: 0,
//     final_presentation: 0,
//     decision: "pass", // pass | revise | fail
//     remarks: "",
//     last_saved_at: null,
//   });

//   // toast
//   const [toast, setToast] = useState({ show: false, type: "info", text: "" });
//   const showToast = (text, type = "info", timeout = 2500) => {
//     setToast({ show: true, type, text });
//     setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
//   };

//   // api
//   const token = useMemo(() => localStorage.getItem("access"), []);
//   const api = axios.create({
//     baseURL: "http://127.0.0.1:8000",
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   // load assigned-to-me projects
//   const load = async () => {
//     setLoading(true);
//     setStatus("");
//     try {
//       const res = await api.get("/api/evaluations/assigned-to-me/");
//       setItems(res.data || []);
//     } catch {
//       setStatus("Failed to load your evaluation projects.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

//   // helpers
//   const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";
//   const normalizeSubs = (list = []) => {
//     const map = {};
//     list.forEach((x) => { if (x?.step) map[x.step] = x; });
//     setSubsByStep(map);
//     setSubs(list);
//   };

//   // drawer open
//   const openDetails = async (project, tab = "overview") => {
//     setActiveProject(project);
//     setActiveTab(tab);
//     setDetailLoading(true);

//     setSubs([]);
//     setSubsByStep({});
//     setEvalData({
//       proposal: 0,
//       proposal_report: 0,
//       proposal_presentation: 0,
//       final_report: 0,
//       final_presentation: 0,
//       decision: "pass",
//       remarks: "",
//       last_saved_at: null,
//     });

//     try {
//       const reqs = [];
//       if (["overview", "submissions"].includes(tab)) {
//         reqs.push(api.get(`/api/projects/${project.id}/submissions/`).catch(() => ({ data: [] })));
//       }
//       if (["overview", "evaluation"].includes(tab)) {
//         reqs.push(api.get(`/api/projects/${project.id}/evaluation/`).catch(() => ({ data: null })));
//       }
//       const responses = await Promise.all(reqs);
//       responses.forEach((r) => {
//         // Submissions array
//         if (Array.isArray(r.data)) normalizeSubs(r.data);
//         // Evaluation object (nullable/404)
//         if (r.data && !Array.isArray(r.data)) {
//           setEvalData((prev) => ({
//             ...prev,
//             ...r.data, // expecting same keys: scores by key, decision, remarks, last_saved_at
//           }));
//         }
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
//       if (tab === "submissions" && subs.length === 0) {
//         const r = await api.get(`/api/projects/${activeProject.id}/submissions/`);
//         normalizeSubs(r.data || []);
//       }
//       if (tab === "evaluation" && !evalLoading && evalData.last_saved_at === null) {
//         // try fetch if not loaded yet
//         setEvalLoading(true);
//         try {
//           const r = await api.get(`/api/projects/${activeProject.id}/evaluation/`);
//           if (r.data) setEvalData((prev) => ({ ...prev, ...r.data }));
//         } catch {/* ignore 404 */}
//         finally { setEvalLoading(false); }
//       }
//     } catch {
//       showToast("Failed to load data.", "error");
//     }
//   };

//   const closeDetails = () => {
//     setActiveProject(null);
//     setSubs([]);
//     setSubsByStep({});
//   };

//   // download submission
//   const downloadSub = async (submissionId, fileName = "submission") => {
//     try {
//       const res = await api.get(`/api/student/submissions/download/${submissionId}/`, {
//         responseType: "blob",
//       });
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

//   // progress (ONLY used in Submissions tab)
//   const completedCount = STEPS.filter(s => !!subsByStep[s.key]).length;
//   const pct = Math.round((completedCount / STEPS.length) * 100);
//   const nextAllowedKey = (() => {
//     for (const s of STEPS) if (!subsByStep[s.key]) return s.key;
//     return null;
//   })();
//   const isStepDone = (key) => !!subsByStep[key];
//   const isStepCurrent = (key) => nextAllowedKey === key;

//   // evaluation totals
//   const total = RUBRIC.reduce((sum, r) => sum + (Number(evalData[r.key]) || 0), 0);
//   const maxTotal = RUBRIC.reduce((sum, r) => sum + r.max, 0);

//   const setScore = (key, val) => {
//     const v = Math.max(0, Math.min(Number(val || 0), RUBRIC.find(r => r.key === key)?.max || 100));
//     setEvalData((prev) => ({ ...prev, [key]: v }));
//   };

//   const saveEvaluation = async () => {
//     if (!activeProject) return;
//     setEvalLoading(true);
//     try {
//       // backend should accept POST (create/update) at this endpoint
//       const payload = {
//         proposal: Number(evalData.proposal) || 0,
//         proposal_report: Number(evalData.proposal_report) || 0,
//         proposal_presentation: Number(evalData.proposal_presentation) || 0,
//         final_report: Number(evalData.final_report) || 0,
//         final_presentation: Number(evalData.final_presentation) || 0,
//         decision: evalData.decision,
//         remarks: evalData.remarks || "",
//       };
//       const r = await api.post(`/api/projects/${activeProject.id}/evaluation/`, payload);
//       setEvalData((prev) => ({ ...prev, ...r.data, last_saved_at: new Date().toISOString() }));
//       showToast("Evaluation saved.", "success");
//     } catch (e) {
//       const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to save evaluation.";
//       showToast(msg, "error");
//     } finally {
//       setEvalLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.title}>My Evaluation Projects</h2>

//       {status && <div className={styles.status}>{status}</div>}

//       {loading ? (
//         <div className={styles.loading}>Loading…</div>
//       ) : items.length === 0 ? (
//         <div className={styles.empty}>No evaluation assignments yet.</div>
//       ) : (
//         <div className={styles.tableWrap}>
//           <table className={styles.table}>
//             <thead>
//               <tr>
//                 <th>Project Title</th>
//                 <th>Supervisor</th>
//                 <th>Members</th>
//                 <th>Assigned On</th>
//                 <th>Open</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((row) => {
//                 const supervisorName =
//                   row?.supervisor?.full_name || row?.supervisor?.email || "—";
//                 const members = (row.members || [])
//                   .map(m => m.full_name || m.email || m.registration_id || m.id)
//                   .join(", ") || "—";
//                 const assignedAt = row.assigned_at
//                   ? new Date(row.assigned_at).toLocaleString()
//                   : "—";

//                 return (
//                   <tr key={row.id}>
//                     <td className={styles.titleCell}>{row.project_title}</td>
//                     <td>{supervisorName}</td>
//                     <td className={styles.membersCell}>{members}</td>
//                     <td>{assignedAt}</td>
//                     <td>
//                       <div className={styles.inlineBtns}>
//                         <button className={styles.detailBtn}  onClick={() => openDetails(row, "overview")}>View</button>
//                         <button className={styles.subBtn}     onClick={() => openDetails(row, "submissions")}>Submissions</button>
//                         <button className={styles.evalBtn}    onClick={() => openDetails(row, "evaluation")}>Evaluation</button>
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

//             {/* Tabs */}
//             <div className={styles.tabBar}>
//               {["overview","submissions","evaluation"].map(t => (
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
//                       <div><b>Created:</b> {activeProject.created_at ? new Date(activeProject.created_at).toLocaleString() : "—"}</div>
//                     </div>
//                     <div className={styles.members}>
//                       <b>Members:</b>{" "}
//                       {[activeProject.group_member_1, activeProject.group_member_2, activeProject.group_member_3]
//                         .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—"}
//                     </div>
//                   </section>
//                 )}

//                 {/* SUBMISSIONS (progress header lives here only) */}
//                 {activeTab === "submissions" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Student Submissions</h4>

//                     <div className={styles.progressHeader}>
//                       <div className={styles.progressBar}>
//                         <div className={styles.progressFill} style={{ width: `${pct}%` }} />
//                       </div>
//                       <div className={styles.progressCircle}>
//                         <div className={styles.circleInner}>
//                           <div className={styles.pct}>{pct}%</div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className={styles.stepper}>
//                       {STEPS.map((s, i) => (
//                         <div
//                           key={s.key}
//                           className={`${styles.step} ${isStepDone(s.key) ? styles.done : ""} ${isStepCurrent(s.key) ? styles.current : ""}`}
//                         >
//                           <div className={styles.stepDot}>{isStepDone(s.key) ? "✓" : i + 1}</div>
//                           <div className={styles.stepLabel}>{s.label}</div>
//                           {i < STEPS.length - 1 && <div className={styles.stepLine} />}
//                         </div>
//                       ))}
//                     </div>

//                     <div className={styles.cards}>
//                       {STEPS.map((s) => {
//                         const item = subsByStep[s.key];
//                         return (
//                           <div key={s.key} className={styles.card}>
//                             <div className={styles.cardHead}>
//                               <div className={styles.cardTitle}>{s.label}</div>
//                               <div className={styles.cardStatus}>
//                                 {item ? (
//                                   <span className={styles.badgeDone}>Submitted</span>
//                                 ) : (
//                                   <span className={styles.badgeTodo}>Pending</span>
//                                 )}
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

//                 {/* EVALUATION */}
//                 {activeTab === "evaluation" && (
//                   <section className={styles.section}>
//                     <h4 className={styles.sectionTitle}>Evaluation</h4>

//                     <div className={styles.evalGrid}>
//                       {RUBRIC.map((r) => (
//                         <div key={r.key} className={styles.evalRow}>
//                           <div className={styles.evalLabel}>{r.label}</div>
//                           <div className={styles.evalInputs}>
//                             <input
//                               type="number"
//                               className={styles.input}
//                               min={0}
//                               max={r.max}
//                               value={evalData[r.key]}
//                               onChange={(e) => setScore(r.key, e.target.value)}
//                             />
//                             <span className={styles.maxNote}>/ {r.max}</span>
//                           </div>
//                         </div>
//                       ))}

//                       <div className={styles.evalTotal}>
//                         <div className={styles.evalTotalLabel}>Total</div>
//                         <div className={styles.evalTotalScore}>
//                           {total} / {maxTotal}
//                         </div>
//                       </div>

//                       <div className={styles.evalRow}>
//                         <div className={styles.evalLabel}>Decision</div>
//                         <div className={styles.evalInputs}>
//                           <select
//                             className={styles.select}
//                             value={evalData.decision}
//                             onChange={(e) => setEvalData((p) => ({ ...p, decision: e.target.value }))}
//                           >
//                             <option value="pass">Pass</option>
//                             <option value="revise">Revise</option>
//                             <option value="fail">Fail</option>
//                           </select>
//                         </div>
//                       </div>

//                       <div className={styles.evalRowFull}>
//                         <label className={styles.evalLabel}>Remarks</label>
//                         <textarea
//                           className={styles.textarea}
//                           rows={3}
//                           value={evalData.remarks}
//                           onChange={(e) => setEvalData((p) => ({ ...p, remarks: e.target.value }))}
//                           placeholder="Feedback, strengths, weaknesses, next steps…"
//                         />
//                       </div>
//                     </div>

//                     <div className={styles.evalActions}>
//                       <button className={styles.primaryBtn} onClick={saveEvaluation} disabled={evalLoading}>
//                         {evalLoading ? "Saving…" : "Save Evaluation"}
//                       </button>
//                       {evalData.last_saved_at && (
//                         <div className={styles.savedNote}>
//                           Last saved: {new Date(evalData.last_saved_at).toLocaleString()}
//                         </div>
//                       )}
//                     </div>
//                   </section>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {toast.show && (
//         <div
//           className={`${styles.toast} ${
//             toast.type === "success"
//               ? styles.toastSuccess
//               : toast.type === "error"
//               ? styles.toastError
//               : styles.toastInfo
//           }`}
//         >
//           {toast.text}
//         </div>
//       )}
//     </div>
//   );
// }

// export default EvaluationList;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./EvaluationList.module.css";

/** Must match backend SubmissionFile.STEP_CHOICES */
const SUBMISSION_STEPS = [
  { key: "proposal",               label: "Proposal" },
  { key: "proposal_report",        label: "Proposal Report" },
  { key: "proposal_presentation",  label: "Proposal Presentation" },
  { key: "final_report",           label: "Final Report" },
  { key: "final_presentation",     label: "Final Presentation" },
];

/** Evaluation stages */
const EVAL_STAGES = [
  { key: "proposal",           label: "Proposal",           max: 10 },
  { key: "mid_presentation",   label: "Mid Presentation",   max: 10 },
  { key: "final_presentation", label: "Final Presentation", max: 10 },
];

export default function EvaluationList() {
  // list
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // drawer
  const [activeProject, setActiveProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // submissions
  const [subs, setSubs] = useState([]);
  const [subsByStep, setSubsByStep] = useState({});

  // evaluation
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalData, setEvalData] = useState({
    proposal:           { marks: 0, decision: "pass", remarks: "" },
    mid_presentation:   { marks: 0, decision: "pass", remarks: "" },
    final_presentation: { marks: 0, decision: "pass", remarks: "" },
    last_saved_at: null,
  });

  // toast
  const [toast, setToast] = useState({ show: false, type: "info", text: "" });
  const showToast = (text, type = "info", timeout = 2500) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: "info", text: "" }), timeout);
  };

  // api
  const token = useMemo(() => localStorage.getItem("access"), []);
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // load list
  useEffect(() => {
    (async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await api.get("/api/evaluations/assigned-to-me/");
        setItems(res.data || []);
      } catch {
        setStatus("Failed to load your evaluation projects.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  // helpers
  const nameOrEmail = (u) => u?.full_name?.trim?.() || u?.email || "—";
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

    setSubs([]); setSubsByStep({});
    setEvalData({
      proposal:           { marks: 0, decision: "pass", remarks: "" },
      mid_presentation:   { marks: 0, decision: "pass", remarks: "" },
      final_presentation: { marks: 0, decision: "pass", remarks: "" },
      last_saved_at: null,
    });

    try {
      const reqs = [];
      if (["overview", "submissions"].includes(tab)) {
        reqs.push(api.get(`/api/projects/${project.id}/submissions/`).catch(() => ({ data: [] })));
      }
      if (["overview", "evaluation"].includes(tab)) {
        reqs.push(api.get(`/api/projects/${project.id}/evaluation/`).catch(() => ({ data: null })));
      }
      const responses = await Promise.all(reqs);
      responses.forEach((r) => {
        if (Array.isArray(r.data)) normalizeSubs(r.data);
        if (r.data && !Array.isArray(r.data)) {
          const d = r.data;
          setEvalData((prev) => ({
            ...prev,
            proposal: {
              marks: Number(d.proposal_marks ?? 0),
              decision: d.proposal_decision ?? "pass",
              remarks: d.proposal_remarks ?? "",
            },
            mid_presentation: {
              marks: Number(d.mid_presentation_marks ?? 0),
              decision: d.mid_presentation_decision ?? "pass",
              remarks: d.mid_presentation_remarks ?? "",
            },
            final_presentation: {
              marks: Number(d.final_presentation_marks ?? 0),
              decision: d.final_presentation_decision ?? "pass",
              remarks: d.final_presentation_remarks ?? "",
            },
            last_saved_at: d.assigned_at ?? null,
          }));
        }
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
      if (tab === "submissions" && subs.length === 0) {
        const r = await api.get(`/api/projects/${activeProject.id}/submissions/`);
        normalizeSubs(r.data || []);
      }
      if (tab === "evaluation" && !evalLoading && evalData.last_saved_at === null) {
        setEvalLoading(true);
        try {
          const r = await api.get(`/api/projects/${activeProject.id}/evaluation/`);
          if (r.data) {
            const d = r.data;
            setEvalData((prev) => ({
              ...prev,
              proposal: {
                marks: Number(d.proposal_marks ?? 0),
                decision: d.proposal_decision ?? "pass",
                remarks: d.proposal_remarks ?? "",
              },
              mid_presentation: {
                marks: Number(d.mid_presentation_marks ?? 0),
                decision: d.mid_presentation_decision ?? "pass",
                remarks: d.mid_presentation_remarks ?? "",
              },
              final_presentation: {
                marks: Number(d.final_presentation_marks ?? 0),
                decision: d.final_presentation_decision ?? "pass",
                remarks: d.final_presentation_remarks ?? "",
              },
              last_saved_at: d.assigned_at ?? new Date().toISOString(),
            }));
          }
        } catch {/* ignore */}
        finally { setEvalLoading(false); }
      }
    } catch {
      showToast("Failed to load tab data.", "error");
    }
  };

  const closeDetails = () => {
    setActiveProject(null);
    setSubs([]); setSubsByStep({});
  };

  /** ---------- Submissions helpers (UI like screenshot) ---------- */
  const completedCount = SUBMISSION_STEPS.filter(s => !!subsByStep[s.key]).length;
  const pct = Math.round((completedCount / SUBMISSION_STEPS.length) * 100);
  const isStepDone = (key) => !!subsByStep[key];

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

  const triggerReplace = (stepKey) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const fd = new FormData();
        fd.append("step", stepKey);
        fd.append("file", file);
        // NOTE: This endpoint only works for the student who owns the project.
        const resp = await api.post("/api/student/submissions/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // refresh only that step
        const r = await api.get(`/api/projects/${activeProject.id}/submissions/`);
        normalizeSubs(r.data || []);
        showToast("File replaced.", "success");
      } catch (err) {
        const msg = err?.response?.status === 403
          ? "Only the student of this project can replace files."
          : "Replace failed.";
        showToast(msg, "error");
      }
    };
    input.click();
  };

  /** ---------- Evaluation helpers ---------- */
  const setScore = (stageKey, value) => {
    const max = EVAL_STAGES.find(s => s.key === stageKey)?.max ?? 10;
    const v = Math.max(0, Math.min(Number(value || 0), max));
    setEvalData((prev) => ({ ...prev, [stageKey]: { ...prev[stageKey], marks: v } }));
  };
  const total = EVAL_STAGES.reduce((sum, s) => sum + (Number(evalData[s.key]?.marks) || 0), 0);
  const maxTotal = EVAL_STAGES.reduce((sum, s) => sum + s.max, 0);

  const saveEvaluation = async () => {
    if (!activeProject) return;
    setEvalLoading(true);
    try {
      const payload = {
        proposal_marks:             evalData.proposal.marks,
        proposal_decision:          evalData.proposal.decision,
        proposal_remarks:           evalData.proposal.remarks,
        mid_presentation_marks:     evalData.mid_presentation.marks,
        mid_presentation_decision:  evalData.mid_presentation.decision,
        mid_presentation_remarks:   evalData.mid_presentation.remarks,
        final_presentation_marks:   evalData.final_presentation.marks,
        final_presentation_decision:evalData.final_presentation.decision,
        final_presentation_remarks: evalData.final_presentation.remarks,
      };
      const r = await api.post(`/api/projects/${activeProject.id}/evaluation/`, payload);
      setEvalData((prev) => ({
        ...prev,
        proposal: {
          marks: Number(r.data.proposal_marks ?? 0),
          decision: r.data.proposal_decision ?? "pass",
          remarks: r.data.proposal_remarks ?? "",
        },
        mid_presentation: {
          marks: Number(r.data.mid_presentation_marks ?? 0),
          decision: r.data.mid_presentation_decision ?? "pass",
          remarks: r.data.mid_presentation_remarks ?? "",
        },
        final_presentation: {
          marks: Number(r.data.final_presentation_marks ?? 0),
          decision: r.data.final_presentation_decision ?? "pass",
          remarks: r.data.final_presentation_remarks ?? "",
        },
        last_saved_at: new Date().toISOString(),
      }));
      showToast("Evaluation saved.", "success");
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.error || "Failed to save evaluation.";
      showToast(msg, "error");
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Evaluation Projects</h2>

      {status && <div className={styles.status}>{status}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No evaluation assignments yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Supervisor</th>
                <th>Members</th>
                <th>Assigned On</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const supervisorName = row?.supervisor?.full_name || row?.supervisor?.email || "—";
                const members = (row.members || [])
                  .map(m => m.full_name || m.email || m.registration_id || m.id)
                  .join(", ") || "—";
                const assignedAt = row.assigned_at ? new Date(row.assigned_at).toLocaleString() : "—";
                return (
                  <tr key={row.id}>
                    <td className={styles.titleCell}>{row.project_title}</td>
                    <td>{supervisorName}</td>
                    <td className={styles.membersCell}>{members}</td>
                    <td>{assignedAt}</td>
                    <td>
                      <div className={styles.inlineBtns}>
                        <button className={styles.detailBtn} onClick={() => openDetails(row, "overview")}>View</button>
                        <button className={styles.subBtn}    onClick={() => openDetails(row, "submissions")}>Submissions</button>
                        <button className={styles.evalBtn}   onClick={() => openDetails(row, "evaluation")}>Evaluation</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeProject && (
        <div className={styles.drawerBackdrop} onClick={closeDetails}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>{activeProject.project_title}</h3>
              <button className={styles.closeBtn} onClick={closeDetails}>×</button>
            </div>

            <div className={styles.tabBar}>
              {["overview", "submissions", "evaluation"].map(t => (
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
              <div className={styles.drawerBody}><div className={styles.loading}>Loading details…</div></div>
            ) : (
              <div className={styles.drawerBody}>
                {/* -------- Overview -------- */}
                {activeTab === "overview" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Overview</h4>
                    <div className={styles.kv}>
                      <div><b>Supervisor:</b> {nameOrEmail(activeProject.supervisor)}</div>
                      <div><b>Co-Supervisor:</b> {activeProject.co_supervisor_email || "—"}</div>
                      <div><b>Created:</b> {activeProject.created_at ? new Date(activeProject.created_at).toLocaleString() : "—"}</div>
                    </div>
                    <div className={styles.members}>
                      <b>Members:</b>{" "}
                      {[activeProject.group_member_1, activeProject.group_member_2, activeProject.group_member_3]
                        .filter(Boolean).map((m) => nameOrEmail(m)).join(", ") || "—"}
                    </div>
                  </section>
                )}

                {/* -------- Submissions (screenshot-like UI) -------- */}
                {activeTab === "submissions" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>File Submissions</h4>

                    {/* progress bar + right circular percentage */}
                    <div className={styles.progressRow}>
                      <div className={styles.progressBarBig}>
                        <div className={styles.progressFillBig} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={styles.pctRing}>
                        <div className={styles.pctValue}>{pct}%</div>
                      </div>
                    </div>

                    {/* horizontal stepper */}
                    <div className={styles.stepper}>
                      {SUBMISSION_STEPS.map((s, idx) => {
                        const done = isStepDone(s.key);
                        const isLast = idx === SUBMISSION_STEPS.length - 1;
                        return (
                          <div key={s.key} className={styles.stepItem}>
                            <div className={`${styles.stepIcon} ${done ? styles.stepDone : styles.stepPending}`}>
                              {done ? "✓" : idx + 1}
                            </div>
                            <div className={styles.stepLabel}>{s.label}</div>
                            {!isLast && <div className={styles.stepLine} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* cards (2-column) */}
                    <div className={styles.cardsGrid}>
                      {SUBMISSION_STEPS.map((s) => {
                        const item = subsByStep[s.key];
                        return (
                          <div key={s.key} className={styles.subCard}>
                            <div className={styles.subCardHead}>
                              <div className={styles.subCardTitle}>{s.label}</div>
                              {item ? <span className={styles.badgeSubmitted}>Submitted</span> : null}
                            </div>

                            <div className={styles.subCardBody}>
                              {item ? (
                                <>
                                  <div className={styles.meta}>
                                    <div><b>File:</b> {item.file_name}</div>
                                    <div><b>Uploaded:</b>{" "}
                                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "—"}
                                    </div>
                                  </div>

                                  <div className={styles.actionRow}>
                                    <button
                                      className={styles.btnPrimary}
                                      onClick={() => triggerReplace(s.key)}
                                    >
                                      Replace
                                    </button>
                                    <button
                                      className={styles.btnGhost}
                                      onClick={() => downloadSub(item.id, item.file_name)}
                                    >
                                      Download
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={styles.metaMuted}>No file uploaded yet.</div>
                                  <div className={styles.actionRow}>
                                    <button
                                      className={styles.btnPrimary}
                                      onClick={() => triggerReplace(s.key)}
                                    >
                                      Upload
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* -------- Evaluation -------- */}
                {activeTab === "evaluation" && (
                  <section className={styles.section}>
                    <h4 className={styles.sectionTitle}>Evaluation</h4>

                    <div className={styles.evalGrid}>
                      {EVAL_STAGES.map((st) => (
                        <div key={st.key} className={styles.evalRowFull}>
                          <div className={styles.evalRow}>
                            <div className={styles.evalLabel}>{st.label} — Decision</div>
                            <div className={styles.evalInputs}>
                              <select
                                className={styles.select}
                                value={evalData[st.key].decision}
                                onChange={(e) =>
                                  setEvalData((p) => ({
                                    ...p,
                                    [st.key]: { ...p[st.key], decision: e.target.value },
                                  }))
                                }
                              >
                                <option value="pass">Pass</option>
                                <option value="revise">Revise</option>
                                <option value="fail">Fail</option>
                              </select>
                            </div>
                          </div>

                          {evalData[st.key].decision === "pass" && (
                            <div className={styles.evalRow}>
                              <div className={styles.evalLabel}>{st.label} — Marks</div>
                              <div className={styles.evalInputs}>
                                <input
                                  type="number"
                                  className={styles.input}
                                  min={0}
                                  max={st.max}
                                  value={evalData[st.key].marks}
                                  onChange={(e) => setScore(st.key, e.target.value)}
                                />
                                <span className={styles.maxNote}>/ {st.max}</span>
                              </div>
                            </div>
                          )}

                          <div className={styles.evalRowFull}>
                            <label className={styles.evalLabel}>{st.label} — Remarks</label>
                            <textarea
                              className={styles.textarea}
                              rows={3}
                              value={evalData[st.key].remarks}
                              onChange={(e) =>
                                setEvalData((p) => ({
                                  ...p,
                                  [st.key]: { ...p[st.key], remarks: e.target.value },
                                }))
                              }
                              placeholder="Feedback, strengths, weaknesses, next steps…"
                            />
                          </div>
                        </div>
                      ))}

                      <div className={styles.evalTotal}>
                        <div className={styles.evalTotalLabel}>Total</div>
                        <div className={styles.evalTotalScore}>{total} / {maxTotal}</div>
                      </div>
                    </div>

                    <div className={styles.evalActions}>
                      <button className={styles.primaryBtn} onClick={saveEvaluation} disabled={evalLoading}>
                        {evalLoading ? "Saving…" : "Save Evaluation"}
                      </button>
                      {evalData.last_saved_at && (
                        <div className={styles.savedNote}>
                          Last saved: {new Date(evalData.last_saved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
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
