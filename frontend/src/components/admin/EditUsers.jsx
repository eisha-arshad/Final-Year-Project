

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import styles from './EditUsers.module.css';

// function EditUsers() {
//   const [users, setUsers] = useState([]);
//   const [status, setStatus] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem('access');
//         const res = await axios.get('http://127.0.0.1:8000/api/manage-users/', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(res.data);
//       } catch (err) {
//         setStatus('Failed to fetch users.');
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm('Are you sure you want to delete this user?');
//     if (!confirmDelete) return;

//     try {
//       const token = localStorage.getItem('access');
//       await axios.delete(`http://127.0.0.1:8000/api/manage-users/${id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUsers(users.filter((user) => user.id !== id));
//       setStatus('User deleted successfully.');
//     } catch (err) {
//       setStatus('Failed to delete user.');
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Manage Users</h2>
//       {status && <p className={styles.status}>{status}</p>}
//       <table className={styles.userTable}>
//         <thead>
//           <tr>
//             <th>Full Name</th>
//             <th>Registration ID</th>
//             <th>Email</th>
//             <th>Department</th>
//             <th>Program</th>
//             <th>Role</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length === 0 ? (
//             <tr>
//               <td colSpan="7" className={styles.noData}>No users found.</td>
//             </tr>
//           ) : (
//             users.map((user) => (
//               <tr key={user.id}>
//                 <td>{user.full_name}</td>
//                 <td>{user.registration_id || '-'}</td>
//                 <td>{user.email}</td>
//                 <td>{user.department || '-'}</td>
//                 <td>{user.program || '-'}</td>
//                 <td>{user.role}</td>
//                 <td>
//                   <button
//                     className={styles.editBtn}
//                     onClick={() => navigate(`/admin-dashboard/edit-user/${user.id}`)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className={styles.deleteBtn}
//                     onClick={() => handleDelete(user.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default EditUsers;


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditUsers.module.css";

const API = "http://127.0.0.1:8000/api";

const ROLE_DOMAIN = {
  student: "@student.uol.edu.pk",
  supervisor: "@supervisor.uol.edu.pk",
  admin: "@admin.uol.edu.pk",
};

const emailMatchesRoleStrict = (role, email) => {
  if (!role || !email) return false;
  const e = String(email).toLowerCase().trim();
  const domain = ROLE_DOMAIN[role];
  return !!domain && e.endsWith(domain);
};

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("access"), []);

  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    full_name: "",
    registration_id: "",
    department: "",
    program: "",
    role: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const boot = async () => {
      try {
        const infoRes = await axios.get(`${API}/get-role/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe({
          role: (infoRes.data?.role || "").toLowerCase(),
          department: infoRes.data?.department || "",
          program: infoRes.data?.program || "",
          is_superuser: !!infoRes.data?.is_superuser,
        });
      } catch {
        setMe({ role: "unknown", department: "", program: "", is_superuser: false });
      }
    };
    boot();
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/manage-users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data || {};
        setData({
          full_name: u.full_name || "",
          registration_id: u.registration_id || "",
          department: u.department || "",
          program: u.program || "",
          role: (u.role || "").toLowerCase(),
          email: u.email || "",
          password: "",
        });
        setStatus("");
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          "Failed to load user.";
        setStatus(msg);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((s) => {
      const next = { ...s, [name]: value };
      if (me?.role === "admin" && !me?.is_superuser) {
        if (name === "department") next.department = me.department || "";
        if (name === "program") next.program = me.program || "";
      }
      return next;
    });
  };

  const validate = () => {
    const f = data;
    if (!f.full_name.trim()) return "Full name is required.";
    if (!f.role) return "Role is required.";
    if (!["admin", "supervisor", "student"].includes(f.role)) return "Invalid role.";

    if (f.role === "student") {
      if (!f.registration_id.trim()) return "Registration ID is required for students.";
      if (!f.department.trim()) return "Department is required.";
      if (!f.program.trim()) return "Program is required.";
    } else if (f.role === "supervisor" || f.role === "admin") {
      if (!f.department.trim()) return "Department is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      return "Please enter a valid email address.";

    if (!emailMatchesRoleStrict(f.role, f.email)) {
      const tip = ROLE_DOMAIN[f.role] || "the correct domain";
      return `Email must end with ${tip} for the "${f.role}" role.`;
    }

    if (me?.role === "admin" && !me?.is_superuser) {
      if (f.department !== (me.department || ""))
        return "You can only update users in your own department.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    const err = validate();
    if (err) return setStatus(err);

    const payload = {
      full_name: data.full_name,
      registration_id: data.role === "student" ? data.registration_id : null,
      department: data.department,
      program: data.program || null,
      role: data.role,
      email: data.email,
    };

    if (data.password?.trim()) payload.password = data.password.trim();

    if (me?.role === "admin" && !me?.is_superuser) {
      payload.department = me.department || "";
      if (me.program) payload.program = me.program;
    }

    try {
      const res = await axios.put(`${API}/manage-users/${id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setStatus("Saved!");
      } else {
        setStatus("Failed to save.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to save.";
      setStatus(msg);
    }
  };

  if (loading || !me) {
    return (
      <div className={styles.editUserWrap}>
        <h2 className={styles.editUserTitle}>Edit User</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (!me.is_superuser && me.role !== "admin") {
    return (
      <div className={styles.editUserWrap}>
        <h2 className={styles.editUserTitle}>Edit User</h2>
        <p>You don’t have permission to edit users.</p>
      </div>
    );
  }

  return (
    <div className={styles.editUserWrap}>
      <h2 className={styles.editUserTitle}>Edit User</h2>

      {!!status && <p className={styles.editStatus}>{status}</p>}

      <form className={styles.editUserForm} onSubmit={handleSubmit}>
        <input
          className={styles.editInput}
          name="full_name"
          placeholder="Full Name"
          value={data.full_name}
          onChange={handleChange}
          required
        />

        <select
          className={styles.editInput}
          name="role"
          value={data.role}
          onChange={handleChange}
          required
        >
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="student">Student</option>
        </select>

        <input
          className={styles.editInput}
          name="email"
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          required
        />

        <input
          className={styles.editInput}
          name="department"
          placeholder="Department"
          value={me.role === "admin" && !me.is_superuser ? (me.department || "") : data.department}
          onChange={handleChange}
          disabled={me.role === "admin" && !me.is_superuser}
          required
        />

        <input
          className={styles.editInput}
          name="program"
          placeholder="Program"
          value={me.role === "admin" && !me.is_superuser ? (me.program || "") : data.program}
          onChange={handleChange}
          disabled={me.role === "admin" && !me.is_superuser && !!me.program}
          required={data.role === "student"}
        />

        {data.role === "student" && (
          <input
            className={styles.editInput}
            name="registration_id"
            placeholder="Registration ID"
            value={data.registration_id}
            onChange={handleChange}
            required
          />
        )}

        <input
          className={styles.editInput}
          name="password"
          type="password"
          placeholder="New Password (optional)"
          value={data.password}
          onChange={handleChange}
        />

        <div className={styles.editUserBtns}>
          <button type="submit" className={styles.editBtnSave}>Save</button>
          <button type="button" className={styles.editBtnBack} onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
