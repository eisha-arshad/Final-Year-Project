// import React, { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import PageTitle from '../components/PageTitle';
// import styles from './ManageUsers.module.css';

// const API = 'http://127.0.0.1:8000';

// function ManageUsers() {
//   const [users, setUsers] = useState([]);               // always store an array
//   const [status, setStatus] = useState({ kind: '', text: '' });
//   const [loading, setLoading] = useState(true);

//   // inline edit state
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [editedData, setEditedData] = useState({});

//   // delete confirm state
//   const [pendingDeleteId, setPendingDeleteId] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);

//   // misc
//   const [savingId, setSavingId] = useState(null);
//   const navigate = useNavigate();
//   const token = useMemo(() => localStorage.getItem('access'), []);

//   // Fetch users
//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API}/api/manage-users/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // accept both array and {results: []}
//       const payload = res.data;
//       const list = Array.isArray(payload) ? payload : (payload?.results || []);
//       setUsers(list);
//       setStatus({ kind: '', text: '' });
//     } catch (err) {
//       setUsers([]); // keep it an array to avoid filter/map crashes
//       setStatus({ kind: 'err', text: 'Failed to load users.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Split into groups
//   const studentUsers = useMemo(() => {
//     const list = Array.isArray(users) ? users : [];
//     return list.filter((u) => (u.email || '').includes('student.uol.edu.pk'));
//   }, [users]);

//   const facultyUsers = useMemo(() => {
//     const list = Array.isArray(users) ? users : [];
//     return list.filter((u) => !(u.email || '').includes('student.uol.edu.pk'));
//   }, [users]);

//   // Edit handlers
//   const handleEdit = (user) => {
//     setEditingUserId(user.id);
//     setEditedData({
//       full_name: user.full_name || '',
//       registration_id: user.registration_id || '',
//       program: user.program || '',
//       email: user.email || '',
//       department: user.department || '',
//     });
//     setStatus({ kind: '', text: '' });
//   };

//   const handleChange = (e) => {
//     setEditedData((s) => ({ ...s, [e.target.name]: e.target.value }));
//   };

//   const handleSave = async (id) => {
//     try {
//       setSavingId(id);
//       await axios.put(`${API}/api/manage-users/${id}/`, editedData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setEditingUserId(null);
//       setStatus({ kind: 'ok', text: 'User updated successfully.' });
//       await fetchUsers(); // refresh list
//     } catch (err) {
//       const msg =
//         err?.response?.data?.error ||
//         err?.response?.data?.detail ||
//         'Failed to update user.';
//       setStatus({ kind: 'err', text: msg });
//     } finally {
//       setSavingId(null);
//     }
//   };

//   // Delete handlers
//   const askDelete = (id) => {
//     setPendingDeleteId(id); // open confirm modal
//     setStatus({ kind: '', text: '' });
//   };

//   const cancelDelete = () => {
//     setPendingDeleteId(null);
//   };

//   const confirmDelete = async () => {
//     if (!pendingDeleteId) return;
//     const id = pendingDeleteId;

//     // optimistic UI
//     const prevUsers = users;
//     const nextUsers = (Array.isArray(prevUsers) ? prevUsers : []).filter((u) => u.id !== id);
//     setUsers(nextUsers);
//     setDeletingId(id);
//     setPendingDeleteId(null);

//     try {
//       const res = await axios.delete(`${API}/api/manage-users/${id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // show server message if any
//       const msg = res?.data?.message || 'User deleted.';
//       setStatus({ kind: 'ok', text: msg });

//       // ensure fresh state from server
//       await fetchUsers();
//     } catch (err) {
//       // rollback on fail
//       setUsers(prevUsers);
//       const msg =
//         err?.response?.data?.error ||
//         err?.response?.data?.detail ||
//         'Failed to delete user.';
//       setStatus({ kind: 'err', text: msg });
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const renderUserTable = (userList) => {
//     const safeList = Array.isArray(userList) ? userList : [];
//     return (
//       <div className={styles.tableWrap}>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th>Full Name</th>
//               <th>Registration ID</th>
//               <th>Program</th>
//               <th>Email</th>
//               <th>Department</th>
//               <th style={{ width: 210 }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {safeList.map((user) => {
//               const isEditing = editingUserId === user.id;
//               const isDeleting = deletingId === user.id;
//               const isSaving = savingId === user.id;

//               return (
//                 <tr key={user.id} className={isDeleting ? styles.rowDeleting : ''}>
//                   <td>
//                     {isEditing ? (
//                       <input
//                         className={styles.input}
//                         name="full_name"
//                         value={editedData.full_name}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       user.full_name || 'N/A'
//                     )}
//                   </td>
//                   <td>
//                     {isEditing ? (
//                       <input
//                         className={styles.input}
//                         name="registration_id"
//                         value={editedData.registration_id}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       user.registration_id || 'N/A'
//                     )}
//                   </td>
//                   <td>
//                     {isEditing ? (
//                       <input
//                         className={styles.input}
//                         name="program"
//                         value={editedData.program}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       user.program || 'N/A'
//                     )}
//                   </td>
//                   <td className={styles.clip}>{user.email}</td>
//                   <td>
//                     {isEditing ? (
//                       <input
//                         className={styles.input}
//                         name="department"
//                         value={editedData.department}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       user.department || 'N/A'
//                     )}
//                   </td>
//                   <td>
//                     {isEditing ? (
//                       <div className={styles.actions}>
//                         <button
//                           className={`${styles.btn} ${styles.saveBtn}`}
//                           onClick={() => handleSave(user.id)}
//                           disabled={isSaving}
//                           title="Save"
//                         >
//                           {isSaving ? 'Saving...' : 'Save'}
//                         </button>
//                         <button
//                           className={`${styles.btn} ${styles.cancelBtn}`}
//                           onClick={() => setEditingUserId(null)}
//                           disabled={isSaving}
//                           title="Cancel"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <div className={styles.actions}>
//                         <button
//                           className={`${styles.btn} ${styles.editBtn}`}
//                           onClick={() => handleEdit(user)}
//                           disabled={isDeleting}
//                           title="Edit"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           className={`${styles.btn} ${styles.deleteBtn}`}
//                           onClick={() => askDelete(user.id)}
//                           disabled={isDeleting}
//                           title="Delete"
//                         >
//                           {isDeleting ? 'Deleting...' : 'Delete'}
//                         </button>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//             {safeList.length === 0 && (
//               <tr>
//                 <td colSpan={6} className={styles.empty}>
//                   No users to display.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   return (
//     <div className={styles.container}>
//       {/* Status / Alerts */}
//       {!!status.text && (
//         <p
//           className={`${styles.status} ${
//             status.kind === 'ok'
//               ? styles.statusOk
//               : status.kind === 'err'
//               ? styles.statusErr
//               : ''
//           }`}
//           role="status"
//         >
//           {status.text}
//         </p>
//       )}

//       {loading ? (
//         <div className={styles.loading}>Loading users...</div>
//       ) : (!Array.isArray(users) || users.length === 0) ? (
//         <p className={styles.status}>No users found</p>
//       ) : (
//         <>
//           {studentUsers.length > 0 && (
//             <>
//               <PageTitle title="Student Users" />
//               {renderUserTable(studentUsers)}
//             </>
//           )}

//           {facultyUsers.length > 0 && (
//             <>
//               <PageTitle title="Faculty Users" />
//               {renderUserTable(facultyUsers)}
//             </>
//           )}
//         </>
//       )}

//       {/* Delete Confirm Modal */}
//       {pendingDeleteId && (
//         <div className={styles.modalOverlay} role="dialog" aria-modal="true">
//           <div className={styles.modal}>
//             <h3>Confirm Delete</h3>
//             <p>Are you sure you want to delete this user? This action cannot be undone.</p>
//             <div className={styles.modalActions}>
//               <button
//                 className={`${styles.btn} ${styles.deleteBtn}`}
//                 onClick={confirmDelete}
//               >
//                 Yes, Delete
//               </button>
//               <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={cancelDelete}>
//                 No, Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ManageUsers;


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./ManageUsers.module.css";

const API = "http://127.0.0.1:8000/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ kind: "", text: "" });
  const [loading, setLoading] = useState(true);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [savingId, setSavingId] = useState(null);
  const token = useMemo(() => localStorage.getItem("access"), []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/manage-users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : payload?.results || [];
      setUsers(list);
      setStatus({ kind: "", text: "" });
    } catch (err) {
      setUsers([]);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to load users.";
      setStatus({ kind: "err", text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studentUsers = useMemo(
    () => (Array.isArray(users) ? users : []).filter((u) => (u.role || "").toLowerCase() === "student"),
    [users]
  );
  const facultyUsers = useMemo(
    () => (Array.isArray(users) ? users : []).filter((u) => (u.role || "").toLowerCase() !== "student"),
    [users]
  );

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditedData({
      full_name: user.full_name || "",
      registration_id: user.registration_id || "",
      program: user.program || "",
      email: user.email || "",
      department: user.department || "",
      role: user.role || "",
    });
    setStatus({ kind: "", text: "" });
  };

  const handleChange = (e) => setEditedData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSave = async (id) => {
    try {
      setSavingId(id);
      await axios.put(`${API}/manage-users/${id}/`, editedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUserId(null);
      setStatus({ kind: "ok", text: "User updated successfully." });
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to update user.";
      setStatus({ kind: "err", text: msg });
    } finally {
      setSavingId(null);
    }
  };

  const askDelete = (id) => {
    setPendingDeleteId(id);
    setStatus({ kind: "", text: "" });
  };
  const cancelDelete = () => setPendingDeleteId(null);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;

    const prevUsers = users;
    const nextUsers = (Array.isArray(prevUsers) ? prevUsers : []).filter((u) => u.id !== id);
    setUsers(nextUsers);
    setDeletingId(id);
    setPendingDeleteId(null);

    try {
      const res = await axios.delete(`${API}/manage-users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msg = res?.data?.message || "User deleted.";
      setStatus({ kind: "ok", text: msg });
      await fetchUsers();
    } catch (err) {
      setUsers(prevUsers);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to delete user.";
      setStatus({ kind: "err", text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const renderUserTable = (userList) => {
    const safeList = Array.isArray(userList) ? userList : [];
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Registration ID</th>
              <th>Program</th>
              <th>Email</th>
              <th>Department</th>
              <th style={{ width: 240 }}>Role / Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeList.map((user) => {
              const isEditing = editingUserId === user.id;
              const isDeleting = deletingId === user.id;
              const isSaving = savingId === user.id;

              return (
                <tr key={user.id} className={isDeleting ? styles.rowDeleting : ""}>
                  <td>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        name="full_name"
                        value={editedData.full_name}
                        onChange={handleChange}
                      />
                    ) : (
                      user.full_name || "N/A"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        name="registration_id"
                        value={editedData.registration_id}
                        onChange={handleChange}
                      />
                    ) : (
                      user.registration_id || "N/A"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        name="program"
                        value={editedData.program}
                        onChange={handleChange}
                      />
                    ) : (
                      user.program || "N/A"
                    )}
                  </td>
                  <td className={styles.clip}>{user.email}</td>
                  <td>
                    {isEditing ? (
                      <input
                        className={styles.input}
                        name="department"
                        value={editedData.department}
                        onChange={handleChange}
                      />
                    ) : (
                      user.department || "N/A"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <select
                          className={styles.input}
                          name="role"
                          value={editedData.role}
                          onChange={handleChange}
                        >
                          <option value="admin">Admin</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="student">Student</option>
                        </select>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.btn} ${styles.saveBtn}`}
                            onClick={() => handleSave(user.id)}
                            disabled={isSaving}
                            title="Save"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            className={`${styles.btn} ${styles.cancelBtn}`}
                            onClick={() => setEditingUserId(null)}
                            disabled={isSaving}
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={styles.actions}>
                        <span className={styles.roleTag}>{(user.role || "").toUpperCase()}</span>
                        <button
                          className={`${styles.btn} ${styles.editBtn}`}
                          onClick={() => handleEdit(user)}
                          disabled={isDeleting}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.btn} ${styles.deleteBtn}`}
                          onClick={() => askDelete(user.id)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {safeList.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No users to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Manage Users</h2>

      {!!status.text && (
        <p
          className={`${styles.status} ${
            status.kind === "ok"
              ? styles.statusOk
              : status.kind === "err"
              ? styles.statusErr
              : ""
          }`}
          role="status"
        >
          {status.text}
        </p>
      )}

      {loading ? (
        <div className={styles.loading}>Loading users...</div>
      ) : (!Array.isArray(users) || users.length === 0) ? (
        <p className={styles.status}>No users found</p>
      ) : (
        <>
          {studentUsers.length > 0 && (
            <>
              <h3 className={styles.subheading}>Student Users</h3>
              {renderUserTable(studentUsers)}
            </>
          )}

          {facultyUsers.length > 0 && (
            <>
              <h3 className={styles.subheading}>Faculty & Admin</h3>
              {renderUserTable(facultyUsers)}
            </>
          )}
        </>
      )}

      {pendingDeleteId && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${styles.deleteBtn}`}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={cancelDelete}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
