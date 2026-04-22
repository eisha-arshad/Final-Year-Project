

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import styles from './FileSubmission.module.css';

// function FileSubmission() {
//   const [submission, setSubmission] = useState(null);
//   const [status, setStatus] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const token = localStorage.getItem('access');

//   const steps = [
//     { label: 'Proposal', field: 'proposal' },
//     { label: 'Proposal Presentation', field: 'proposal_presentation' },
//     { label: 'Report', field: 'report' },
//     { label: 'Mid Presentation', field: 'mid_presentation' },
//     { label: 'Final Report', field: 'final_report' },
//     { label: 'Final Presentation', field: 'final_presentation' },
//   ];

//   useEffect(() => {
//     const fetchSubmission = async () => {
//       try {
//         const res = await axios.get('http://127.0.0.1:8000/api/student-submission/', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setSubmission(res.data);
//       } catch (err) {
//         console.error('Failed to fetch submission.');
//       }
//     };
//     fetchSubmission();
//   }, []);

//   const handleUpload = async (e, field) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append(field, file);
//     setUploading(true);
//     setStatus(`Selected: ${file.name}`);
//     setUploadProgress(0);

//     try {
//       await axios.patch('http://127.0.0.1:8000/api/student-submission/', formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percent);
//           setStatus(`Uploading: ${percent}%`);
//         },
//       });

//       setStatus(`${field} uploaded successfully ✅`);
//       setTimeout(() => window.location.reload(), 1200);
//     } catch (err) {
//       setStatus(`❌ Error uploading ${field}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const canUpload = (index) => {
//     if (index === 0) return true;
//     const prevField = steps[index - 1].field;
//     return submission?.[prevField];
//   };

//   const currentStep = submission
//     ? steps.findIndex((step) => !submission[step.field]) === -1
//       ? steps.length
//       : steps.findIndex((step) => !submission[step.field])
//     : 0;

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Upload Your Project Files</h2>

//       {/* Step Progress */}
//       <div className={styles.stepProgress}>
//         {steps.map((step, index) => (
//           <div key={index} className={styles.stepItem}>
//             <div className={`${styles.stepCircle} ${index < currentStep ? styles.active : ''}`}>
//               {index + 1}
//             </div>
//             <p className={styles.stepLabel}>{step.label}</p>
//             {index < steps.length - 1 && (
//               <div className={`${styles.stepLine} ${index < currentStep - 1 ? styles.active : ''}`} />
//             )}
//           </div>
//         ))}
//       </div>

//       {status && <p className={styles.statusMsg}>{status}</p>}

//       {uploading && (
//         <div className={styles.progressBarContainer}>
//           <div className={styles.progressBarFill} style={{ width: `${uploadProgress}%` }}></div>
//         </div>
//       )}

//       {/* Upload Blocks */}
//       {steps.map((step, index) => (
//         <div key={step.field} className={styles.stepCard}>
//           <p className={styles.stepTitle}>
//             {index + 1}. {step.label}:{' '}
//             {submission?.[step.field] ? (
//               <span style={{ color: 'green' }}>Uploaded ✅</span>
//             ) : (
//               <span style={{ color: 'red' }}>Pending ❌</span>
//             )}
//           </p>

//           {submission?.[step.field] && (
//             <a
//               href={submission[step.field]}
//               target="_blank"
//               rel="noopener noreferrer"
//               className={styles.downloadLink}
//             >
//               📥 Download
//             </a>
//           )}

//           {canUpload(index) && (
//             <label className={styles.uploadButton}>
//               📁 Upload File
//               <input
//                 type="file"
//                 onChange={(e) => handleUpload(e, step.field)}
//                 className={styles.hiddenInput}
//               />
//             </label>
//           )}
//         </div>
//       ))}

//       <div className={styles.metaInfo}>
//         <p><strong>Submitted on:</strong> {submission?.created_at?.slice(0, 10) || '---'}</p>
//         <p><strong>Supervisor Approval:</strong> {submission?.is_approved ? '✅ Approved' : '⏳ Pending'}</p>
//       </div>
//     </div>
//   );
// }

// export default FileSubmission;


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./FileSubmission.module.css";

const STEPS = [
  { key: "proposal",               label: "Proposal" },
  { key: "proposal_report",        label: "Proposal Report" },
  { key: "proposal_presentation",  label: "Proposal Presentation" },
  { key: "final_report",           label: "Final Report" },
  { key: "final_presentation",     label: "Final Presentation" },
];

function FileSubmission() {
  const [items, setItems] = useState([]); // [{step, id, file_name, file_url, uploaded_at}]
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [activeUpload, setActiveUpload] = useState(null); // step.key currently uploading

  const token = useMemo(() => localStorage.getItem("access"), []);
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  const load = async () => {
    setLoading(true);
    setStatus("");
    try {
      // returns array with any submitted files for the student’s current project
      const res = await api.get("/api/student/submissions/");
      setItems(res.data || []);
    } catch (e) {
      setStatus("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const byStep = Object.fromEntries(items.map(x => [x.step, x]));
  const completedCount = STEPS.filter(s => byStep[s.key]).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  // next allowed step is the first not-submitted
  const nextAllowedKey = (()=>{
    for (const s of STEPS) if (!byStep[s.key]) return s.key;
    return null; // all done
  })();

  const canInteract = (stepKey) =>
    // allow upload/replace only for the next required step; already submitted steps can be replaced
    stepKey === nextAllowedKey || !!byStep[stepKey];

  const uploadOrReplace = async (stepKey, file) => {
    if (!file) return;
    setActiveUpload(stepKey);
    setStatus("");

    try {
      const form = new FormData();
      form.append("step", stepKey);
      form.append("file", file);

      // Same endpoint handles create/replace
      const res = await api.post("/api/student/submissions/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local list
      const saved = res.data; // {id, step, file_name, file_url, uploaded_at}
      const others = items.filter(i => i.step !== saved.step);
      setItems([saved, ...others]);
    } catch (e) {
      const msg = e.response?.data?.detail || e.response?.data?.error || "Upload failed.";
      setStatus(msg);
    } finally {
      setActiveUpload(null);
    }
  };

  const download = async (submissionId) => {
    try {
      const res = await api.get(`/api/student/submissions/download/${submissionId}/`, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      // fetch filename from API list
      const item = items.find(i => i.id === submissionId);
      a.download = item?.file_name || "submission";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setStatus("Download failed.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>File Submissions</h2>
      {status && <div className={styles.status}>{status}</div>}

      {/* Top progress like sample */}
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

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => {
          const done = !!byStep[s.key];
          const current = nextAllowedKey === s.key;
          const disabled = !canInteract(s.key);
          return (
            <div key={s.key} className={`${styles.step} ${done ? styles.done : ""} ${current ? styles.current : ""}`}>
              <div className={styles.stepDot}>
                {done ? "✓" : i + 1}
              </div>
              <div className={styles.stepLabel}>{s.label}</div>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <div className={styles.cards}>
          {STEPS.map((s) => {
            const item = byStep[s.key];
            const disabled = !canInteract(s.key);

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
                    <div className={styles.meta}>
                      <div><b>File:</b> {item.file_name}</div>
                      <div><b>Uploaded:</b> {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "—"}</div>
                    </div>
                  ) : (
                    <div className={styles.metaMuted}>No file uploaded yet.</div>
                  )}

                  <div className={styles.actions}>
                    <label className={`${styles.uploadBtn} ${disabled ? styles.btnDisabled : ""}`}>
                      {item ? (activeUpload === s.key ? "Replacing…" : "Replace") : (activeUpload === s.key ? "Uploading…" : "Upload")}
                      <input
                        type="file"
                        style={{ display: "none" }}
                        disabled={disabled || !!activeUpload}
                        onChange={(e) => uploadOrReplace(s.key, e.target.files?.[0])}
                      />
                    </label>

                    {item && (
                      <button className={styles.downloadBtn} onClick={() => download(item.id)}>
                        Download
                      </button>
                    )}
                  </div>

                  {!item && disabled && (
                    <div className={styles.hint}>Complete the previous step to unlock this upload.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileSubmission;
