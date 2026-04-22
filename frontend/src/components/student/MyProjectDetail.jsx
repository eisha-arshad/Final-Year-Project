


// // import React, { useEffect, useMemo, useState } from "react";
// // import axios from "axios";
// // import styles from "./MyProjectDetail.module.css";

// // function MyProjectDetail() {
// //   const [project, setProject] = useState(null);
// //   const [comments, setComments] = useState([]);
// //   const [meetings, setMeetings] = useState([]);
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   const token = useMemo(() => localStorage.getItem("access"), []);

// //   const api = axios.create({
// //     baseURL: "http://127.0.0.1:8000",
// //     headers: { Authorization: `Bearer ${token}` },
// //   });

// //   useEffect(() => {
// //     const fetchProjectForStudent = async () => {
// //       if (!token) {
// //         setError("No access token found. Please log in.");
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         // ensure this is a student
// //         const roleRes = await api.get("/api/get-role/");
// //         if (roleRes.data.role !== "student") {
// //           setError("Access denied. You are not a student.");
// //           setLoading(false);
// //           return;
// //         }

// //         // student project
// //         const res = await api.get("/api/student-project/");
// //         const proj = res.data;
// //         setProject(proj);

// //         // fetch comments & meetings (if we have a project id)
// //         if (proj?.id) {
// //           const [cRes, mRes] = await Promise.all([
// //             api.get(`/api/projects/${proj.id}/comments/`).catch(() => ({ data: [] })),
// //             api.get(`/api/projects/${proj.id}/meetings/`).catch(() => ({ data: [] })),
// //           ]);
// //           setComments(cRes.data || []);
// //           setMeetings(mRes.data || []);
// //         }
// //       } catch (err) {
// //         console.error("❌ Failed to fetch student project:", err);
// //         if (err.response?.status === 403) setError("Access forbidden.");
// //         else if (err.response?.status === 404) setError("No project found for this student.");
// //         else setError("Something went wrong while fetching project data.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProjectForStudent();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   if (loading) return <p>Loading project details...</p>;
// //   if (error) return <p style={{ color: "red" }}>{error}</p>;
// //   if (!project) return null;

// //   // Normalize members: support either group_members[] or group_member_1..3
// //   const members =
// //     project.group_members && Array.isArray(project.group_members)
// //       ? project.group_members
// //       : [project.group_member_1, project.group_member_2, project.group_member_3].filter(Boolean);

// //   // Try to read evaluator data if backend embedded it as project.evaluation
// //   const evaluatorName =
// //     project?.evaluation?.evaluator_name ||
// //     project?.evaluation?.evaluator_email ||
// //     null;

// //   return (
// //     <div className={styles.container}>
// //       <h2>📁 My Project Details</h2>

// //       <div className={styles.projectBox}>
// //         <p><strong>Title:</strong> {project.project_title || "N/A"}</p>

// //         <p>
// //           <strong>Supervisor:</strong>{" "}
// //           {project.supervisor?.full_name?.trim() ||
// //             project.supervisor?.email ||
// //             project.supervisor_name || // fallback if serializer only gave name/email strings
// //             "N/A"}
// //         </p>

// //         <p><strong>Co-Supervisor:</strong> {project.co_supervisor_email || "N/A"}</p>

// //         <p>
// //           <strong>Evaluator:</strong>{" "}
// //           {evaluatorName ? (
// //             <span className={styles.badgeSuccess}>{evaluatorName}</span>
// //           ) : (
// //             <span className={styles.badgeInfo}>Not assigned yet</span>
// //           )}
// //         </p>

// //         <p>
// //           <strong>Created At:</strong>{" "}
// //           {project.created_at ? new Date(project.created_at).toLocaleString() : "N/A"}
// //         </p>
// //       </div>

// //       <h3>👥 Group Members</h3>
// //       <div className={styles.groupList}>
// //         {members.length > 0 ? (
// //           members.map((member, index) => (
// //             <div key={member?.id || index} className={styles.memberCard}>
// //               <p><strong>Group Member {index + 1}</strong></p>
// //               <ul>
// //                 <li>
// //                   <strong>Name:</strong>{" "}
// //                   {member?.full_name?.trim?.() || member?.email || "N/A"}
// //                 </li>
// //                 <li><strong>SAP ID:</strong> {member?.registration_id || "N/A"}</li>
// //                 <li><strong>Email:</strong> {member?.email || "N/A"}</li>
// //                 <li><strong>Program:</strong> {member?.program || "N/A"}</li>
// //               </ul>
// //             </div>
// //           ))
// //         ) : (
// //           <p>No group members found.</p>
// //         )}
// //       </div>

// //       <div className={styles.split}>
// //         {/* Comments (read-only for student) */}
// //         <section className={styles.panel}>
// //           <h3>💬 Supervisor Comments</h3>
// //           {comments.length === 0 ? (
// //             <p className={styles.muted}>No comments yet.</p>
// //           ) : (
// //             <div className={styles.commentList}>
// //               {comments.map((c) => (
// //                 <div key={c.id || c.created_at} className={styles.commentItem}>
// //                   <div className={styles.commentMeta}>
// //                     <b>{c.author_name || "Supervisor"}</b>
// //                     <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
// //                   </div>
// //                   <div className={styles.commentText}>{c.text}</div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //           <p className={styles.note}>* Comments are posted by your supervisor and visible to you here.</p>
// //         </section>

// //         {/* Meetings */}
// //         <section className={styles.panel}>
// //           <h3>📅 Meetings</h3>
// //           {meetings.length === 0 ? (
// //             <p className={styles.muted}>No meetings scheduled yet.</p>
// //           ) : (
// //             <div className={styles.meetingList}>
// //               {meetings.map((m) => (
// //                 <div key={m.id || m.starts_at} className={styles.meetingItem}>
// //                   <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
// //                   <div className={styles.meetingMeta}>
// //                     <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
// //                     {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
// //                     {m.location && <span> · <b>Where:</b> {m.location}</span>}
// //                   </div>
// //                   {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //           <p className={styles.note}>* Meetings are created by your supervisor and appear here automatically.</p>
// //         </section>
// //       </div>
// //     </div>
// //   );
// // }

// // export default MyProjectDetail;

// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./MyProjectDetail.module.css";

// function MyProjectDetail() {
//   const [project, setProject] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [meetings, setMeetings] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const token = useMemo(() => localStorage.getItem("access"), []);
//   const api = axios.create({
//     baseURL: "http://127.0.0.1:8000",
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   useEffect(() => {
//     const fetchProjectForStudent = async () => {
//       if (!token) {
//         setError("No access token found. Please log in.");
//         setLoading(false);
//         return;
//       }
//       try {
//         // role must be student
//         const roleRes = await api.get("/api/get-role/");
//         if (roleRes.data.role !== "student") {
//           setError("Access denied. You are not a student.");
//           setLoading(false);
//           return;
//         }

//         // project with nested evaluation via ProjectDetailSerializer
//         const res = await api.get("/api/student-project/");
//         const proj = res.data;
//         setProject(proj);

//         if (proj?.id) {
//           const [cRes, mRes] = await Promise.all([
//             api.get(`/api/projects/${proj.id}/comments/`).catch(() => ({ data: [] })),
//             api.get(`/api/projects/${proj.id}/meetings/`).catch(() => ({ data: [] })),
//           ]);
//           setComments(cRes.data || []);
//           setMeetings(mRes.data || []);
//         }
//       } catch (err) {
//         if (err.response?.status === 403) setError("Access forbidden.");
//         else if (err.response?.status === 404) setError("No project found for this student.");
//         else setError("Something went wrong while fetching project data.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProjectForStudent();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   if (loading) return <p>Loading project details...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;
//   if (!project) return null;

//   const members =
//     project.group_members && Array.isArray(project.group_members)
//       ? project.group_members
//       : [project.group_member_1, project.group_member_2, project.group_member_3].filter(Boolean);

//   const evaluatorName =
//     project?.evaluation?.evaluator_name ||
//     project?.evaluation?.evaluator_email ||
//     null;

//   return (
//     <div className={styles.container}>
//       <h2>📁 My Project Details</h2>

//       <div className={styles.projectBox}>
//         <p><strong>Title:</strong> {project.project_title || "N/A"}</p>

//         <p>
//           <strong>Supervisor:</strong>{" "}
//           {project.supervisor?.full_name?.trim() ||
//             project.supervisor?.email ||
//             project.supervisor_name ||
//             "N/A"}
//         </p>

//         <p><strong>Co-Supervisor:</strong> {project.co_supervisor_email || "N/A"}</p>

//         <p>
//           <strong>Evaluator:</strong>{" "}
//           {evaluatorName ? (
//             <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluatorName}</span>
//           ) : (
//             <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned yet</span>
//           )}
//         </p>

//         <p>
//           <strong>Created At:</strong>{" "}
//           {project.created_at ? new Date(project.created_at).toLocaleString() : "N/A"}
//         </p>
//       </div>

//       {/* ==== EVALUATION CARD ==== */}
//       <h3>📝 Evaluation</h3>
//       {project.evaluation ? (
//         <div className={styles.evalCard}>
//           <div className={styles.evalRow}>
//             {/* Proposal */}
//             <div className={styles.evalCol}>
//               <div className={styles.evalHead}>
//                 <span className={styles.evalTitle}>Proposal</span>
//                 <span
//                   className={`${styles.badge} ${
//                     project.evaluation.proposal_decision === "pass"
//                       ? styles.badgeSuccess
//                       : project.evaluation.proposal_decision === "revise"
//                       ? styles.badgeWarn
//                       : styles.badgeError
//                   }`}
//                 >
//                   {project.evaluation.proposal_decision?.toUpperCase()}
//                 </span>
//               </div>
//               {project.evaluation.proposal_decision === "pass" && (
//                 <div className={styles.evalMeta}>
//                   Marks: <b>{project.evaluation.proposal_marks}</b>
//                 </div>
//               )}
//               {project.evaluation.proposal_remarks && (
//                 <div className={styles.evalRemarks}>
//                   {project.evaluation.proposal_remarks}
//                 </div>
//               )}
//             </div>

//             {/* Mid */}
//             <div className={styles.evalCol}>
//               <div className={styles.evalHead}>
//                 <span className={styles.evalTitle}>Mid Presentation</span>
//                 <span
//                   className={`${styles.badge} ${
//                     project.evaluation.mid_presentation_decision === "pass"
//                       ? styles.badgeSuccess
//                       : project.evaluation.mid_presentation_decision === "revise"
//                       ? styles.badgeWarn
//                       : styles.badgeError
//                   }`}
//                 >
//                   {project.evaluation.mid_presentation_decision?.toUpperCase()}
//                 </span>
//               </div>
//               {project.evaluation.mid_presentation_decision === "pass" && (
//                 <div className={styles.evalMeta}>
//                   Marks: <b>{project.evaluation.mid_presentation_marks}</b>
//                 </div>
//               )}
//               {project.evaluation.mid_presentation_remarks && (
//                 <div className={styles.evalRemarks}>
//                   {project.evaluation.mid_presentation_remarks}
//                 </div>
//               )}
//             </div>

//             {/* Final */}
//             <div className={styles.evalCol}>
//               <div className={styles.evalHead}>
//                 <span className={styles.evalTitle}>Final Presentation</span>
//                 <span
//                   className={`${styles.badge} ${
//                     project.evaluation.final_presentation_decision === "pass"
//                       ? styles.badgeSuccess
//                       : project.evaluation.final_presentation_decision === "revise"
//                       ? styles.badgeWarn
//                       : styles.badgeError
//                   }`}
//                 >
//                   {project.evaluation.final_presentation_decision?.toUpperCase()}
//                 </span>
//               </div>
//               {project.evaluation.final_presentation_decision === "pass" && (
//                 <div className={styles.evalMeta}>
//                   Marks: <b>{project.evaluation.final_presentation_marks}</b>
//                 </div>
//               )}
//               {project.evaluation.final_presentation_remarks && (
//                 <div className={styles.evalRemarks}>
//                   {project.evaluation.final_presentation_remarks}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className={styles.evalFooter}>
//             <span>
//               Evaluator:{" "}
//               <b>{project.evaluation.evaluator_name || project.evaluation.evaluator_email}</b>
//             </span>
//             {project.evaluation.assigned_at && (
//               <span> · Assigned: {new Date(project.evaluation.assigned_at).toLocaleString()}</span>
//             )}
//           </div>
//         </div>
//       ) : (
//         <p className={styles.muted}>No evaluation yet.</p>
//       )}

//       {/* ==== MEMBERS ==== */}
//       <h3>👥 Group Members</h3>
//       <div className={styles.groupList}>
//         {members.length > 0 ? (
//           members.map((member, index) => (
//             <div key={member?.id || index} className={styles.memberCard}>
//               <p><strong>Group Member {index + 1}</strong></p>
//               <ul>
//                 <li>
//                   <strong>Name:</strong>{" "}
//                   {member?.full_name?.trim?.() || member?.email || "N/A"}
//                 </li>
//                 <li><strong>SAP ID:</strong> {member?.registration_id || "N/A"}</li>
//                 <li><strong>Email:</strong> {member?.email || "N/A"}</li>
//                 <li><strong>Program:</strong> {member?.program || "N/A"}</li>
//               </ul>
//             </div>
//           ))
//         ) : (
//           <p>No group members found.</p>
//         )}
//       </div>

//       {/* ==== TWO PANELS ==== */}
//       <div className={styles.split}>
//         <section className={styles.panel}>
//           <h3>💬 Supervisor Comments</h3>
//           {comments.length === 0 ? (
//             <p className={styles.muted}>No comments yet.</p>
//           ) : (
//             <div className={styles.commentList}>
//               {comments.map((c) => (
//                 <div key={c.id || c.created_at} className={styles.commentItem}>
//                   <div className={styles.commentMeta}>
//                     <b>{c.author_name || "Supervisor"}</b>
//                     <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
//                   </div>
//                   <div className={styles.commentText}>{c.text}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//           <p className={styles.note}>* Comments are posted by your supervisor and visible to you here.</p>
//         </section>

//         <section className={styles.panel}>
//           <h3>📅 Meetings</h3>
//           {meetings.length === 0 ? (
//             <p className={styles.muted}>No meetings scheduled yet.</p>
//           ) : (
//             <div className={styles.meetingList}>
//               {meetings.map((m) => (
//                 <div key={m.id || m.starts_at} className={styles.meetingItem}>
//                   <div className={styles.meetingTitle}>{m.title || "Meeting"}</div>
//                   <div className={styles.meetingMeta}>
//                     <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
//                     {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
//                     {m.location && <span> · <b>Where:</b> {m.location}</span>}
//                   </div>
//                   {m.notes && <div className={styles.meetingNotes}>{m.notes}</div>}
//                 </div>
//               ))}
//             </div>
//           )}
//           <p className={styles.note}>* Meetings are created by your supervisor and appear here automatically.</p>
//         </section>
//       </div>
//     </div>
//   );
// }

// export default MyProjectDetail;


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./MyProjectDetail.module.css";

const API = "http://127.0.0.1:8000/api";

function safeTrim(v) {
  return (typeof v === "string" ? v : "").trim();
}
function emailLocal(email) {
  if (!email) return "";
  const i = String(email).indexOf("@");
  return i > 0 ? email.slice(0, i) : email;
}

function MyProjectDetail() {
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [me, setMe] = useState(null); // ← logged-in user's meta (program fallback)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("access"), []);
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Compute a nice supervisor display string from serializer payload
const supervisorDisplay = (p) => {
  if (p?.supervisor_name) return safeTrim(p.supervisor_name);

  const sup = p?.supervisor || null;
  const full = safeTrim(sup?.full_name);
  if (full) return full;

  const uname = safeTrim(sup?.username);
  if (uname) return uname;

  const email = safeTrim(sup?.email);
  if (email) return emailLocal(email);

  return "Unknown";
};


  // Member program display with me-based fallback for the logged-in student
  const memberProgram = (member) => {
    const program = safeTrim(member?.program);
    if (program) return program;

    // if this member is the logged-in student, use me.program fallback
    if (me && member?.email && me.email && String(member.email).toLowerCase() === String(me.email).toLowerCase()) {
      const myProg = safeTrim(me.program);
      if (myProg) return myProg;
    }

    return "Not set";
  };

  useEffect(() => {
    const fetchProjectForStudent = async () => {
      if (!token) {
        setError("No access token found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        // Load who-am-I first (also gives us program fallback)
        const roleRes = await api.get(`${API}/get-role/`);
        setMe(roleRes.data || null);
        if (roleRes.data?.role !== "student") {
          setError("Access denied. You are not a student.");
          setLoading(false);
          return;
        }

        // Fetch student's project with nested evaluation + members
        const res = await api.get(`${API}/student-project/`);
        const proj = res.data;
        setProject(proj);

        if (proj?.id) {
          const [cRes, mRes] = await Promise.all([
            api.get(`${API}/projects/${proj.id}/comments/`).catch(() => ({ data: [] })),
            api.get(`${API}/projects/${proj.id}/meetings/`).catch(() => ({ data: [] })),
          ]);
          setComments(cRes.data || []);
          setMeetings(mRes.data || []);
        }
      } catch (err) {
        if (err.response?.status === 403) setError("Access forbidden.");
        else if (err.response?.status === 404) setError("No project found for this student.");
        else setError("Something went wrong while fetching project data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectForStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p>Loading project details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!project) return null;

  // Normalize members list from serializer
  const members =
    project.group_members && Array.isArray(project.group_members)
      ? project.group_members
      : [project.group_member_1, project.group_member_2, project.group_member_3].filter(Boolean);

  const evaluatorName =
    project?.evaluation?.evaluator_name ||
    project?.evaluation?.evaluator_email ||
    null;

  return (
    <div className={styles.container}>
      <h2>📁 My Project Details</h2>

      <div className={styles.projectBox}>
        <p><strong>Title:</strong> {safeTrim(project.project_title) || "—"}</p>

        <p>
          <strong>Supervisor:</strong>{" "}
          {supervisorDisplay(project)}
        </p>

        <p><strong>Co-Supervisor:</strong> {safeTrim(project.co_supervisor_email) || "—"}</p>

        <p>
          <strong>Evaluator:</strong>{" "}
          {evaluatorName ? (
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>{evaluatorName}</span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeInfo}`}>Not assigned yet</span>
          )}
        </p>

        <p>
          <strong>Created At:</strong>{" "}
          {project.created_at ? new Date(project.created_at).toLocaleString() : "—"}
        </p>
      </div>

      {/* ==== EVALUATION CARD ==== */}
      <h3>📝 Evaluation</h3>
      {project.evaluation ? (
        <div className={styles.evalCard}>
          <div className={styles.evalRow}>
            {/* Proposal */}
            <div className={styles.evalCol}>
              <div className={styles.evalHead}>
                <span className={styles.evalTitle}>Proposal</span>
                <span
                  className={`${styles.badge} ${
                    project.evaluation.proposal_decision === "pass"
                      ? styles.badgeSuccess
                      : project.evaluation.proposal_decision === "revise"
                      ? styles.badgeWarn
                      : styles.badgeError
                  }`}
                >
                  {(project.evaluation.proposal_decision || "").toUpperCase() || "—"}
                </span>
              </div>
              {project.evaluation.proposal_decision === "pass" && (
                <div className={styles.evalMeta}>
                  Marks: <b>{project.evaluation.proposal_marks}</b>
                </div>
              )}
              {safeTrim(project.evaluation.proposal_remarks) && (
                <div className={styles.evalRemarks}>
                  {project.evaluation.proposal_remarks}
                </div>
              )}
            </div>

            {/* Mid */}
            <div className={styles.evalCol}>
              <div className={styles.evalHead}>
                <span className={styles.evalTitle}>Mid Presentation</span>
                <span
                  className={`${styles.badge} ${
                    project.evaluation.mid_presentation_decision === "pass"
                      ? styles.badgeSuccess
                      : project.evaluation.mid_presentation_decision === "revise"
                      ? styles.badgeWarn
                      : styles.badgeError
                  }`}
                >
                  {(project.evaluation.mid_presentation_decision || "").toUpperCase() || "—"}
                </span>
              </div>
              {project.evaluation.mid_presentation_decision === "pass" && (
                <div className={styles.evalMeta}>
                  Marks: <b>{project.evaluation.mid_presentation_marks}</b>
                </div>
              )}
              {safeTrim(project.evaluation.mid_presentation_remarks) && (
                <div className={styles.evalRemarks}>
                  {project.evaluation.mid_presentation_remarks}
                </div>
              )}
            </div>

            {/* Final */}
            <div className={styles.evalCol}>
              <div className={styles.evalHead}>
                <span className={styles.evalTitle}>Final Presentation</span>
                <span
                  className={`${styles.badge} ${
                    project.evaluation.final_presentation_decision === "pass"
                      ? styles.badgeSuccess
                      : project.evaluation.final_presentation_decision === "revise"
                      ? styles.badgeWarn
                      : styles.badgeError
                  }`}
                >
                  {(project.evaluation.final_presentation_decision || "").toUpperCase() || "—"}
                </span>
              </div>
              {project.evaluation.final_presentation_decision === "pass" && (
                <div className={styles.evalMeta}>
                  Marks: <b>{project.evaluation.final_presentation_marks}</b>
                </div>
              )}
              {safeTrim(project.evaluation.final_presentation_remarks) && (
                <div className={styles.evalRemarks}>
                  {project.evaluation.final_presentation_remarks}
                </div>
              )}
            </div>
          </div>

          <div className={styles.evalFooter}>
            <span>
              Evaluator:{" "}
              <b>{project.evaluation.evaluator_name || project.evaluation.evaluator_email || "—"}</b>
            </span>
            {project.evaluation.assigned_at && (
              <span> · Assigned: {new Date(project.evaluation.assigned_at).toLocaleString()}</span>
            )}
          </div>
        </div>
      ) : (
        <p className={styles.muted}>No evaluation yet.</p>
      )}

      {/* ==== MEMBERS ==== */}
      <h3>👥 Group Members</h3>
      <div className={styles.groupList}>
        {members.length > 0 ? (
          members.map((member, index) => (
            <div key={member?.id || index} className={styles.memberCard}>
              <p><strong>Group Member {index + 1}</strong></p>
              <ul>
                <li>
                  <strong>Name:</strong>{" "}
                  {safeTrim(member?.full_name) || member?.email || emailLocal(member?.email) || "—"}
                </li>
                <li><strong>SAP ID:</strong> {safeTrim(member?.registration_id) || "—"}</li>
                <li><strong>Email:</strong> {safeTrim(member?.email) || "—"}</li>
                <li><strong>Program:</strong> {memberProgram(member)}</li>
              </ul>
            </div>
          ))
        ) : (
          <p>No group members found.</p>
        )}
      </div>

      {/* ==== TWO PANELS ==== */}
      <div className={styles.split}>
        <section className={styles.panel}>
          <h3>💬 Supervisor Comments</h3>
          {comments.length === 0 ? (
            <p className={styles.muted}>No comments yet.</p>
          ) : (
            <div className={styles.commentList}>
              {comments.map((c) => (
                <div key={c.id || c.created_at} className={styles.commentItem}>
                  <div className={styles.commentMeta}>
                    <b>{safeTrim(c.author_name) || "Supervisor"}</b>
                    <span> · {c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                  </div>
                  <div className={styles.commentText}>{c.text}</div>
                </div>
              ))}
            </div>
          )}
          <p className={styles.note}>* Comments are posted by your supervisor and visible to you here.</p>
        </section>

        <section className={styles.panel}>
          <h3>📅 Meetings</h3>
          {meetings.length === 0 ? (
            <p className={styles.muted}>No meetings scheduled yet.</p>
          ) : (
            <div className={styles.meetingList}>
              {meetings.map((m) => (
                <div key={m.id || m.starts_at} className={styles.meetingItem}>
                  <div className={styles.meetingTitle}>{safeTrim(m.title) || "Meeting"}</div>
                  <div className={styles.meetingMeta}>
                    <span><b>Start:</b> {m.starts_at ? new Date(m.starts_at).toLocaleString() : "—"}</span>
                    {m.ends_at && <span> · <b>End:</b> {new Date(m.ends_at).toLocaleString()}</span>}
                    {safeTrim(m.location) && <span> · <b>Where:</b> {m.location}</span>}
                  </div>
                  {safeTrim(m.notes) && <div className={styles.meetingNotes}>{m.notes}</div>}
                </div>
              ))}
            </div>
          )}
          <p className={styles.note}>* Meetings are created by your supervisor and appear here automatically.</p>
        </section>
      </div>
    </div>
  );
}

export default MyProjectDetail;
