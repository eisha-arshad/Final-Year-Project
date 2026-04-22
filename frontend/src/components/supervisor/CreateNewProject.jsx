// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./CreateNewProject.module.css";

// const USE_SHARED_API = false;

// let api = axios;
// if (USE_SHARED_API) {
//   api = require("../../api").default; // adjust path to your api.js
// }

// function CreateNewProject() {
//   const [projectTitle, setProjectTitle] = useState("");
//   const [supervisorName, setSupervisorName] = useState("");
//   const [role, setRole] = useState("");
//   const [coSupervisors, setCoSupervisors] = useState([]);
//   const [selectedCoSupervisor, setSelectedCoSupervisor] = useState("");
//   const [groupMembers, setGroupMembers] = useState(["", "", ""]);
//   const [submitted, setSubmitted] = useState(false);
//   const [groupDetails, setGroupDetails] = useState([]);
//   const [status, setStatus] = useState({ kind: "", text: "" });
//   const [loading, setLoading] = useState(false);
//   const [supervisorDepartment, setSupervisorDepartment] = useState("");

//   const authHeaders = useMemo(() => {
//     const token = localStorage.getItem("access");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }, []);

//   useEffect(() => {
//     const fetchProfileAndCoSup = async () => {
//       setStatus({ kind: "", text: "" });
//       try {
//         const roleRes = await api.get("http://127.0.0.1:8000/api/get-role/", {
//           headers: authHeaders,
//         });
//         const { role: r, full_name, department } = roleRes.data || {};
//         setRole(r || "");
//         setSupervisorName(full_name || "Unknown Supervisor");
//         setSupervisorDepartment(department);

//         if (r === "supervisor") {
//           const csRes = await api.get(
//             "http://127.0.0.1:8000/api/co-supervisors/",
//             { headers: authHeaders }
//           );
//           const list = (csRes.data || []).filter(
//             (u) => u.department === department
//           );
//           setCoSupervisors(list);
//         } else {
//           setCoSupervisors([]);
//         }
//       } catch (err) {
//         console.error("Profile/co-supervisors load failed:", err);
//         setStatus({
//           kind: "info",
//           text:
//             "Profile not available. Make sure you are logged in as a supervisor to assign a co-supervisor.",
//         });
//       }
//     };
//     fetchProfileAndCoSup();
//   }, [authHeaders]);

//   const handleGroupChange = (index, value) => {
//     setGroupMembers((prev) => {
//       const updated = [...prev];
//       updated[index] = value;
//       return updated;
//     });
//   };

//   const validatePreview = () => {
//     if (!projectTitle.trim()) return "Project title is required.";
//     return null;
//   };

//   const handlePreview = async () => {
//   const err = validatePreview();
//   if (err) {
//     setStatus({ kind: "err", text: err });
//     return;
//   }

//   setStatus({ kind: "", text: "" });
//   setLoading(true);
//   try {
//     const lookups = groupMembers
//       .map((sap) => (sap || "").trim())
//       .filter(Boolean)
//       .map((sap) =>
//         api.get(`http://127.0.0.1:8000/api/student-info/${sap}`, {
//           headers: authHeaders,
//         }).catch(error => {
//           // Handle error here if 404 or other errors occur
//           return { error: `Student with SAP ID ${sap} not found.` };
//         })
//       );
//     const results = await Promise.all(lookups);
    
//     // Handle errors for any failed lookups
//     const errors = results.filter(result => result.error);
//     if (errors.length) {
//       setStatus({
//         kind: "err",
//         text: errors.map(e => e.error).join(', '),
//       });
//       return;
//     }

//     setGroupDetails(results.map((r) => r.data));

//     // Log department values for supervisor and group members
//     const supervisorDept = supervisorDepartment?.trim().toLowerCase();
//     console.log("Supervisor Department:", supervisorDept);

//     results.forEach((student, index) => {
//       const studentDept = student.department?.trim().toLowerCase();
//       console.log(`Group Member ${index + 1} Department:`, studentDept);
//     });

//     // Handle missing department values
//     const invalidMembers = results.filter((student) => {
//       const studentDept = student.department?.trim().toLowerCase();
//       console.log(`Comparing ${studentDept} with ${supervisorDept}`);
//       // If department is missing, return as invalid
//       if (!studentDept) {
//         return true;
//       }
//       return studentDept !== supervisorDept;
//     });

//     if (invalidMembers.length > 0) {
//       setStatus({
//         kind: "err",
//         text: "All group members must be from the supervisor's department.",
//       });
//       return;
//     }

//     setSubmitted(true);
//   } catch (e) {
//     console.error(e);
//     setStatus({
//       kind: "err",
//       text: "Failed to fetch student details. Please check SAP IDs.",
//     });
//   } finally {
//     setLoading(false);
//   }
// };


//   const validateFinal = () => {
//     if (role && role !== "supervisor") {
//       return "Only supervisors can create projects.";
//     }
//     if (!projectTitle.trim()) return "Project title is required.";
//     return null;
//   };

//   const handleFinalSubmit = async () => {
//     const err = validateFinal();
//     if (err) {
//       setStatus({ kind: "err", text: err });
//       return;
//     }

//     setLoading(true);
//     setStatus({ kind: "", text: "" });

//     // Prepare the payload and log it to verify correct data
//     const payload = {
//       project_title: projectTitle.trim(),
//       co_supervisor_email: selectedCoSupervisor || null, // Set null instead of empty string
//       group_member_1: groupDetails[0]?.id || null,
//       group_member_2: groupDetails[1]?.id || null,
//       group_member_3: groupDetails[2]?.id || null,
//       group_member_1_department: groupDetails[0]?.department || null,
//       group_member_2_department: groupDetails[1]?.department || null,
//       group_member_3_department: groupDetails[2]?.department || null,
//       supervisor_department: supervisorDepartment,
//     };

//     console.log("Submitting project creation with payload:", payload); // Debugging line to inspect payload

//     try {
//       const response = await api.post(
//         "http://127.0.0.1:8000/api/create-project/",
//         payload,
//         { headers: authHeaders }
//       );
//       console.log(response); // Log the response to debug

//       setStatus({ kind: "ok", text: "🎉 Project successfully created!" });
//       setSubmitted(false);
//       setGroupDetails([]);
//       setProjectTitle("");
//       setSelectedCoSupervisor("");
//       setGroupMembers(["", "", ""]);
//     } catch (error) {
//       console.error("Project creation failed:", error.response?.data || error.message);
//       setStatus({
//         kind: "err",
//         text:
//           error.response?.data?.detail ||
//           error.response?.data?.error ||
//           "Project creation failed.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2>Create New Project</h2>

//       {!submitted ? (
//         <div className={styles.card}>
//           <div className={styles.formGrid}>
//             {/* Full width: Title */}
//             <div className={`${styles.inputGroup} ${styles.full}`}>
//               <label>Project Title:</label>
//               <input
//                 type="text"
//                 value={projectTitle}
//                 onChange={(e) => setProjectTitle(e.target.value)}
//                 required
//                 placeholder="Enter project title"
//               />
//             </div>

//             {/* Full width: Supervisor */}
//             <div className={`${styles.inputGroup} ${styles.full}`}>
//               <label>Supervisor:</label>
//               <input type="text" value={supervisorName} readOnly />
//             </div>

//             {/* Full width: Co-Supervisor (only useful for supervisors) */}
//             <div className={`${styles.inputGroup} ${styles.full}`}>
//               <label>Co-Supervisor:</label>
//               <select
//                 value={selectedCoSupervisor}
//                 onChange={(e) => setSelectedCoSupervisor(e.target.value)}
//                 disabled={role !== "supervisor"}
//               >
//                 <option value="">Select Co-Supervisor</option>
//                 {coSupervisors.map((cs) => (
//                   <option key={cs.id} value={cs.email}>
//                     {cs.full_name || cs.email.split("@")[0]} ({cs.email})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Group Members (flow 2-column on desktop) */}
//             {groupMembers.map((member, index) => (
//               <div key={index} className={styles.inputGroup}>
//                 <label>Group Member {index + 1} (SAP ID):</label>
//                 <input
//                   placeholder="Enter SAP ID"
//                   value={member}
//                   onChange={(e) => handleGroupChange(index, e.target.value)}
//                 />
//               </div>
//             ))}

//             {/* Button row (full width) */}
//             <div className={styles.full}>
//               <button
//                 className={styles.previewBtn}
//                 onClick={handlePreview}
//                 disabled={loading}
//               >
//                 {loading ? "Please wait…" : "Submit"}
//               </button>
//             </div>

//             {!!status.text && (
//               <div
//                 className={`${styles.full}`}
//                 style={{
//                   color:
//                     status.kind === "err"
//                       ? "#cf1322"
//                       : status.kind === "ok"
//                       ? "#389e0d"
//                       : "#555",
//                 }}
//               >
//                 {status.text}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className={styles.summary}>
//           <h3>Project Summary</h3>
//           <p>
//             <strong>Title:</strong> {projectTitle || "—"}
//           </p>
//           <p>
//             <strong>Supervisor:</strong> {supervisorName || "—"}
//           </p>
//           <p>
//             <strong>Co-Supervisor:</strong> {selectedCoSupervisor || "—"}
//           </p>

//           <h4>Group Members</h4>
//           {groupDetails?.length ? (
//             groupDetails.map((m, i) => (
//               <div key={i} className={styles.memberCard}>
//                 <p>
//                   <strong>Group {i + 1}:</strong>
//                 </p>
//                 <ul>
//                   <li>
//                     <strong>Name:</strong> {m.full_name || "—"}
//                   </li>
//                   <li>
//                     <strong>SAP ID:</strong> {m.registration_id || "—"}
//                   </li>
//                   <li>
//                     <strong>Email:</strong> {m.email || "—"}
//                   </li>
//                   <li>
//                     <strong>Program:</strong> {m.program || "—"}
//                   </li>
//                 </ul>
//               </div>
//             ))
//           ) : (
//             <p>No group members resolved.</p>
//           )}

//           <button
//             className={styles.submitBtn}
//             onClick={handleFinalSubmit}
//             disabled={loading}
//           >
//             {loading ? "Creating…" : "Create Project"}
//           </button>

//           {!!status.text && (
//             <div
//               style={{
//                 marginTop: 10,
//                 color:
//                   status.kind === "err"
//                     ? "#cf1322"
//                     : status.kind === "ok"
//                     ? "#389e0d"
//                     : "#555",
//               }}
//             >
//               {status.text}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default CreateNewProject;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./CreateNewProject.module.css";

const API = "http://127.0.0.1:8000/api";

const USE_SHARED_API = false;
let api = axios;
if (USE_SHARED_API) {
  // Vite ESM me require available nahi hota; agar use karna ho to dynamic import karein:
  // api = (await import("../../api")).default;
}

const norm = (s) => (s || "").trim().toLowerCase();

export default function CreateNewProject() {
  const [projectTitle, setProjectTitle] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [role, setRole] = useState("");
  const [coSupervisors, setCoSupervisors] = useState([]);
  const [selectedCoSupervisor, setSelectedCoSupervisor] = useState("");
  const [groupMembers, setGroupMembers] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [groupDetails, setGroupDetails] = useState([]);
  const [status, setStatus] = useState({ kind: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [supervisorDepartment, setSupervisorDepartment] = useState("");

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchProfileAndCoSup = async () => {
      setStatus({ kind: "", text: "" });
      try {
        const roleRes = await api.get(`${API}/get-role/`, { headers: authHeaders });
        const { role: r, full_name, department } = roleRes.data || {};
        setRole(r || "");
        setSupervisorName(full_name || "Unknown Supervisor");
        setSupervisorDepartment(department || "");

        if ((r || "").toLowerCase() === "supervisor") {
          const csRes = await api.get(`${API}/co-supervisors/`, { headers: authHeaders });
          const list = (csRes.data || []).filter((u) => norm(u.department) === norm(department));
          setCoSupervisors(list);
        } else {
          setCoSupervisors([]);
        }
      } catch (err) {
        console.error("Profile/co-supervisors load failed:", err);
        setStatus({
          kind: "info",
          text: "Profile not available. Make sure you are logged in as a supervisor to assign a co-supervisor.",
        });
      }
    };
    fetchProfileAndCoSup();
  }, [authHeaders]);

  const handleGroupChange = (index, value) => {
    setGroupMembers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const validatePreview = () => {
    if (!projectTitle.trim()) return "Project title is required.";
    return null;
  };

  const handlePreview = async () => {
  const err = validatePreview();
  if (err) {
    setStatus({ kind: "err", text: err });
    return;
  }

  setStatus({ kind: "", text: "" });
  setLoading(true);
  try {
    const saps = groupMembers.map((v) => (v || "").trim()).filter(Boolean);

    const settled = await Promise.allSettled(
      saps.map((sap) =>
        api.get(`${API}/student-info/${encodeURIComponent(sap)}/`, {
          headers: authHeaders,
        })
      )
    );

    const errors = [];
    const details = [];

    settled.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        const data = res.value?.data;
        if (!data) {
          errors.push(`Student #${idx + 1} not found.`);
        } else if (data.already_assigned) {
          errors.push(`Student with SAP ID "${data.registration_id}" is already assigned to another project.`);
        } else {
          details.push(data);
        }
      } else {
        const code = res.reason?.response?.status;
        if (code === 404) {
          errors.push(`Student with SAP ID "${saps[idx]}" not found.`);
        } else {
          errors.push(`Lookup failed for SAP "${saps[idx]}".`);
        }
      }
    });

    if (errors.length) {
      setStatus({ kind: "err", text: errors.join(" ") });
      setGroupDetails([]);
      return;
    }

    const supervisorDept = norm(supervisorDepartment);
    const invalidMembers = details.filter((d) => !d?.department || norm(d.department) !== supervisorDept);

    if (invalidMembers.length > 0) {
      setStatus({
        kind: "err",
        text: "All group members must be from the supervisor's department.",
      });
      setGroupDetails([]);
      return;
    }

    setGroupDetails(details);
    setSubmitted(true);
  } catch (e) {
    console.error(e);
    setStatus({
      kind: "err",
      text: "Failed to fetch student details. Please check SAP IDs.",
    });
  } finally {
    setLoading(false);
  }
};

  const validateFinal = () => {
    if (role && norm(role) !== "supervisor") {
      return "Only supervisors can create projects.";
    }
    if (!projectTitle.trim()) return "Project title is required.";
    return null;
  };

  const handleFinalSubmit = async () => {
    const err = validateFinal();
    if (err) {
      setStatus({ kind: "err", text: err });
      return;
    }

    setLoading(true);
    setStatus({ kind: "", text: "" });

    const payload = {
      project_title: projectTitle.trim(),
      co_supervisor_email: selectedCoSupervisor || null,
      group_member_1: groupDetails[0]?.id || null,
      group_member_2: groupDetails[1]?.id || null,
      group_member_3: groupDetails[2]?.id || null,
      group_member_1_department: groupDetails[0]?.department || null,
      group_member_2_department: groupDetails[1]?.department || null,
      group_member_3_department: groupDetails[2]?.department || null,
      supervisor_department: supervisorDepartment || null,
    };

    console.log("Submitting project creation with payload:", payload);

    try {
      const response = await api.post(`${API}/create-project/`, payload, {
        headers: authHeaders,
      });
      console.log("Create project response:", response?.status);

      setStatus({ kind: "ok", text: "🎉 Project successfully created!" });
      setSubmitted(false);
      setGroupDetails([]);
      setProjectTitle("");
      setSelectedCoSupervisor("");
      setGroupMembers(["", "", ""]);
    } catch (error) {
      console.error("Project creation failed:", error?.response?.data || error?.message);
      setStatus({
        kind: "err",
        text:
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          "Project creation failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create New Project</h2>

      {!submitted ? (
        <div className={styles.card}>
          <div className={styles.formGrid}>
            <div className={`${styles.inputGroup} ${styles.full}`}>
              <label>Project Title:</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                placeholder="Enter project title"
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.full}`}>
              <label>Supervisor:</label>
              <input type="text" value={supervisorName} readOnly />
            </div>

            <div className={`${styles.inputGroup} ${styles.full}`}>
              <label>Co-Supervisor:</label>
              <select
                value={selectedCoSupervisor}
                onChange={(e) => setSelectedCoSupervisor(e.target.value)}
                disabled={norm(role) !== "supervisor"}
              >
                <option value="">Select Co-Supervisor</option>
                {coSupervisors.map((cs) => (
                  <option key={cs.id} value={cs.email}>
                    {(cs.full_name || cs.email.split("@")[0])} ({cs.email})
                  </option>
                ))}
              </select>
            </div>

            {groupMembers.map((member, index) => (
              <div key={index} className={styles.inputGroup}>
                <label>Group Member {index + 1} (SAP ID):</label>
                <input
                  placeholder="Enter SAP ID"
                  value={member}
                  onChange={(e) => handleGroupChange(index, e.target.value)}
                />
              </div>
            ))}

            <div className={styles.full}>
              <button className={styles.previewBtn} onClick={handlePreview} disabled={loading}>
                {loading ? "Please wait…" : "Submit"}
              </button>
            </div>

            {!!status.text && (
              <div
                className={styles.full}
                style={{
                  color:
                    status.kind === "err" ? "#cf1322" : status.kind === "ok" ? "#389e0d" : "#555",
                }}
              >
                {status.text}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.summary}>
          <h3>Project Summary</h3>
          <p>
            <strong>Title:</strong> {projectTitle || "—"}
          </p>
          <p>
            <strong>Supervisor:</strong> {supervisorName || "—"}
          </p>
          <p>
            <strong>Co-Supervisor:</strong> {selectedCoSupervisor || "—"}
          </p>

          <h4>Group Members</h4>
          {groupDetails?.length ? (
            groupDetails.map((m, i) => (
              <div key={i} className={styles.memberCard}>
                <p>
                  <strong>Group {i + 1}:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Name:</strong> {m.full_name || "—"}
                  </li>
                  <li>
                    <strong>SAP ID:</strong> {m.registration_id || "—"}
                  </li>
                  <li>
                    <strong>Email:</strong> {m.email || "—"}
                  </li>
                  <li>
                    <strong>Program:</strong> {m.program || "—"}
                  </li>
                </ul>
              </div>
            ))
          ) : (
            <p>No group members resolved.</p>
          )}

          <button className={styles.submitBtn} onClick={handleFinalSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create Project"}
          </button>

          {!!status.text && (
            <div
              style={{
                marginTop: 10,
                color:
                  status.kind === "err" ? "#cf1322" : status.kind === "ok" ? "#389e0d" : "#555",
              }}
            >
              {status.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
