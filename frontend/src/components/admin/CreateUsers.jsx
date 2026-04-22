


// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import styles from "./CreateUsers.module.css";

// const API = "http://127.0.0.1:8000/api";

// // Strict domain mapping per role
// const ROLE_DOMAIN = {
//   student: "@student.uol.edu.pk",
//   supervisor: "@supervisor.uol.edu.pk",
//   admin: "@admin.uol.edu.pk", // dept admin == admin
// };

// const emailMatchesRoleStrict = (role, email) => {
//   if (!role || !email) return false;
//   const e = String(email).toLowerCase().trim();
//   const domain = ROLE_DOMAIN[role];
//   return !!domain && e.endsWith(domain);
// };

// export default function CreateUsers() {
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     registration_id: "",
//     department: "",
//     program: "",
//     role: "",
//     email: "",
//     password: "",
//   });

//   const [status, setStatus] = useState({ text: "", kind: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [me, setMe] = useState(null);
//   const [meWarning, setMeWarning] = useState("");

//   const token = useMemo(() => localStorage.getItem("access"), []);

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const res = await axios.get(`${API}/get-role/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const info = {
//           role: (res.data?.role || "").toLowerCase(),
//           department: res.data?.department || "",
//           program: res.data?.program || "",
//           is_superuser: !!res.data?.is_superuser,
//         };
//         setMe(info);

//         // Dept admin (admin, not superuser) -> lock dept/program
//         if (info.role === "admin" && !info.is_superuser) {
//           setFormData((s) => ({
//             ...s,
//             department: info.department || "",
//             program: info.program || "",
//           }));
//         }
//       } catch {
//         setMe({ role: "unknown", department: "", program: "", is_superuser: false });
//         setMeWarning("Couldn't verify your role; showing restricted options.");
//       }
//     };

//     if (token) {
//       run();
//     } else {
//       setMe({ role: "unknown", department: "", program: "", is_superuser: false });
//       setMeWarning("No token found; please login.");
//     }
//   }, [token]);

//   const roleOptions = useMemo(() => {
//     if (!me) return [];
//     if (me.is_superuser || me.role === "admin") {
//       return [
//         { value: "admin", label: "Admin" },
//         { value: "supervisor", label: "Supervisor" },
//         { value: "student", label: "Student" },
//       ];
//     }
//     return [];
//   }, [me]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((s) => {
//       const next = { ...s, [name]: value };
//       // Dept admin: lock dept/program to own
//       if (me?.role === "admin" && !me?.is_superuser) {
//         if (name === "department") next.department = me.department || "";
//         if (name === "program") next.program = me.program || "";
//       }
//       return next;
//     });
//   };

//   const validate = () => {
//     const f = formData;

//     if (!f.first_name.trim() || !f.last_name.trim())
//       return "First and last name are required.";

//     if (!f.role) return "Role is required.";
//     if (!["admin", "supervisor", "student"].includes(f.role))
//       return "Invalid role.";

//     if (f.role === "student") {
//       if (!f.registration_id.trim()) return "Registration ID is required.";
//       if (!f.department.trim()) return "Department is required.";
//       if (!f.program.trim()) return "Program is required.";
//     } else if (f.role === "supervisor" || f.role === "admin") {
//       if (!f.department.trim()) return "Department is required.";
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
//       return "Please enter a valid email address.";

//     if (!emailMatchesRoleStrict(f.role, f.email)) {
//       const tip = ROLE_DOMAIN[f.role] || "the correct domain";
//       return `Email must end with ${tip} for the "${f.role}" role.`;
//     }

//     if (!f.password.trim()) return "Password is required for new user.";

//     // Dept admin cannot create outside his dept (FE guard)
//     if (me?.role === "admin" && !me?.is_superuser) {
//       if (f.department !== (me.department || ""))
//         return "You can only create users in your own department.";
//     }

//     return null;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus({ text: "", kind: "" });

//     const err = validate();
//     if (err) return setStatus({ text: err, kind: "err" });

//     const payload = {
//       full_name: `${formData.first_name} ${formData.last_name}`.trim(),
//       username: formData.email.split("@")[0],
//       email: formData.email,
//       role: formData.role,
//       department: formData.department,
//       program: formData.program || null,
//       registration_id: formData.role === "student" ? formData.registration_id : null,
//       password: formData.password,
//     };

//     if (me?.role === "admin" && !me?.is_superuser) {
//       payload.department = me.department || "";
//       if (me.program) payload.program = me.program;
//     }

//     try {
//       const res = await axios.post(`${API}/create-user/`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 201) {
//         setStatus({ text: "User created!", kind: "ok" });
//         setFormData({
//           first_name: "",
//           last_name: "",
//           registration_id: "",
//           department: me?.role === "admin" && !me?.is_superuser ? (me.department || "") : "",
//           program: me?.role === "admin" && !me?.is_superuser ? (me.program || "") : "",
//           role: "",
//           email: "",
//           password: "",
//         });
//       } else {
//         setStatus({ text: "Failed to create user.", kind: "err" });
//       }
//     } catch (error) {
//       const msg =
//         error?.response?.data?.detail ||
//         error?.response?.data?.email ||
//         "Failed to create user.";
//       setStatus({ text: Array.isArray(msg) ? msg.join(", ") : String(msg), kind: "err" });
//     }
//   };

//   const roleHint = (() => {
//     const r = formData.role;
//     if (!r) return "Select a role first.";
//     return `Email must end with ${ROLE_DOMAIN[r] || "the correct domain"} for ${r}.`;
//   })();

//   if (!me) {
//     return (
//       <div className={styles.container}>
//         <h2 className={styles.title}>Create User</h2>
//         <div className={styles.card}>Loading your permissions…</div>
//       </div>
//     );
//   }

//   if (!me.is_superuser && me.role !== "admin") {
//     return (
//       <div className={styles.container}>
//         <h2 className={styles.title}>Create User</h2>
//         <div className={styles.card}>You don’t have permission to create users.</div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.title}>Create User</h2>

//       <form onSubmit={handleSubmit} className={styles.card} autoComplete="on">
//         {!!meWarning && <p className={styles.hint}>{meWarning}</p>}

//         <div className={styles.grid}>
//           <div className={styles.field}>
//             <label htmlFor="first_name">First Name</label>
//             <input
//               id="first_name"
//               name="first_name"
//               value={formData.first_name}
//               onChange={handleChange}
//               placeholder="e.g., Ali"
//               required
//             />
//           </div>
//           <div className={styles.field}>
//             <label htmlFor="last_name">Last Name</label>
//             <input
//               id="last_name"
//               name="last_name"
//               value={formData.last_name}
//               onChange={handleChange}
//               placeholder="e.g., Raza"
//               required
//             />
//           </div>
//         </div>

//         <div className={styles.grid}>
//           <div className={styles.field}>
//             <label htmlFor="registration_id">Registration ID</label>
//             <input
//               id="registration_id"
//               name="registration_id"
//               value={formData.registration_id}
//               onChange={handleChange}
//               placeholder="e.g., FA20-BSE-123"
//               required={formData.role === "student"}
//             />
//           </div>

//           <div className={styles.field}>
//             <label htmlFor="department">Department</label>
//             <input
//               id="department"
//               name="department"
//               value={me.role === "admin" && !me.is_superuser ? (me.department || "") : formData.department}
//               onChange={handleChange}
//               required
//               disabled={me.role === "admin" && !me.is_superuser}
//             />
//           </div>
//         </div>

//         <div className={styles.grid}>
//           <div className={styles.field}>
//             <label htmlFor="program">Program</label>
//             <input
//               id="program"
//               name="program"
//               value={me.role === "admin" && !me.is_superuser ? (me.program || "") : formData.program}
//               onChange={handleChange}
//               required={formData.role === "student"}
//               disabled={me.role === "admin" && !me.is_superuser && !!me.program}
//             />
//           </div>

//           <div className={styles.field}>
//             <label htmlFor="role">Role</label>
//             <select
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Role</option>
//               {roleOptions.map((r) => (
//                 <option key={r.value} value={r.value}>
//                   {r.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className={styles.field}>
//           <label htmlFor="email">Email</label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="e.g., name@student.uol.edu.pk"
//             required
//           />
//         </div>
//         <small className={styles.hint}>{roleHint}</small>

//         <div className={styles.field}>
//           <label htmlFor="password">Password</label>
//           <div className={styles.passwordRow}>
//             <input
//               id="password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter a strong password"
//               required
//             />
//             <button
//               type="button"
//               className={styles.toggleBtn}
//               onClick={() => setShowPassword((s) => !s)}
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>
//         </div>

//         <div className={styles.actions}>
//           <button type="submit" className={styles.primary}>Create User</button>
//         </div>

//         {status.text && (
//           <p
//             className={`${styles.status} ${
//               status.kind === "ok" ? styles.statusOk : status.kind === "err" ? styles.statusErr : ""
//             }`}
//             role="status"
//           >
//             {status.text}
//           </p>
//         )}
//       </form>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./CreateUsers.module.css";

const API = "http://127.0.0.1:8000/api";

// Strict domain mapping per role
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

export default function CreateUsers() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    registration_id: "",
    department: "",
    program: "",
    role: "",
    email: "",
    password: "",
  });

  const [status, setStatus] = useState({ text: "", kind: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [me, setMe] = useState(null);
  const [meWarning, setMeWarning] = useState("");
  const [programOptions, setProgramOptions] = useState([]); // 👈 Programs list

  const token = useMemo(() => localStorage.getItem("access"), []);

  // Get logged-in user role info
  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(`${API}/get-role/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const info = {
          role: (res.data?.role || "").toLowerCase(),
          department: res.data?.department || "",
          program: res.data?.program || "",
          is_superuser: !!res.data?.is_superuser,
        };
        setMe(info);

        // Dept admin (not superuser) -> lock dept/program
        if (info.role === "admin" && !info.is_superuser) {
          setFormData((s) => ({
            ...s,
            department: info.department || "",
            program: info.program || "",
          }));
        }
      } catch {
        setMe({
          role: "unknown",
          department: "",
          program: "",
          is_superuser: false,
        });
        setMeWarning("Couldn't verify your role; showing restricted options.");
      }
    };

    if (token) {
      run();
    } else {
      setMe({
        role: "unknown",
        department: "",
        program: "",
        is_superuser: false,
      });
      setMeWarning("No token found; please login.");
    }
  }, [token]);

  // Fetch programs when department changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!formData.department) return;
      try {
        const res = await axios.get(
          `${API}/degrees/?department=${formData.department}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProgramOptions(res.data);
      } catch (err) {
        console.error("Failed to load programs", err);
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, [formData.department, token]);

  // Roles options
  const roleOptions = useMemo(() => {
    if (!me) return [];
    if (me.is_superuser || me.role === "admin") {
      return [
        { value: "admin", label: "Admin" },
        { value: "supervisor", label: "Supervisor" },
        { value: "student", label: "Student" },
      ];
    }
    return [];
  }, [me]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => {
      const next = { ...s, [name]: value };

      // Dept admin: lock dept/program
      if (me?.role === "admin" && !me?.is_superuser) {
        if (name === "department") next.department = me.department || "";
      }

      return next;
    });
  };

  const validate = () => {
    const f = formData;
    if (!f.first_name.trim() || !f.last_name.trim())
      return "First and last name are required.";
    if (!f.role) return "Role is required.";
    if (!["admin", "supervisor", "student"].includes(f.role))
      return "Invalid role.";

    if (f.role === "student") {
      if (!f.registration_id.trim()) return "Registration ID is required.";
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

    if (!f.password.trim()) return "Password is required for new user.";

    if (me?.role === "admin" && !me?.is_superuser) {
      if (f.department !== (me.department || ""))
        return "You can only create users in your own department.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ text: "", kind: "" });

    const err = validate();
    if (err) return setStatus({ text: err, kind: "err" });

    const payload = {
  full_name: `${formData.first_name} ${formData.last_name}`.trim(),
  username: formData.email.split("@")[0],
  email: formData.email,
  role: formData.role,
  department: formData.department,
  program: formData.program || null,
  registration_id: formData.registration_id || null, // 👈 always send
  password: formData.password,
};


    if (me?.role === "admin" && !me?.is_superuser) {
      payload.department = me.department || "";
      if (me.program) payload.program = me.program;
    }

    try {
      const res = await axios.post(`${API}/create-user/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        setStatus({ text: "User created!", kind: "ok" });
        setFormData({
          first_name: "",
          last_name: "",
          registration_id: "",
          department:
            me?.role === "admin" && !me?.is_superuser ? me.department || "" : "",
          program:
            me?.role === "admin" && !me?.is_superuser ? me.program || "" : "",
          role: "",
          email: "",
          password: "",
        });
      } else {
        setStatus({ text: "Failed to create user.", kind: "err" });
      }
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.email ||
        "Failed to create user.";
      setStatus({
        text: Array.isArray(msg) ? msg.join(", ") : String(msg),
        kind: "err",
      });
    }
  };

  const roleHint = (() => {
    const r = formData.role;
    if (!r) return "Select a role first.";
    return `Email must end with ${
      ROLE_DOMAIN[r] || "the correct domain"
    } for ${r}.`;
  })();

  if (!me) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Create User</h2>
        <div className={styles.card}>Loading your permissions…</div>
      </div>
    );
  }

  if (!me.is_superuser && me.role !== "admin") {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Create User</h2>
        <div className={styles.card}>
          You don’t have permission to create users.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create User</h2>

      <form onSubmit={handleSubmit} className={styles.card} autoComplete="on">
        {!!meWarning && <p className={styles.hint}>{meWarning}</p>}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="e.g., Ali"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="e.g., Raza"
              required
            />
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="registration_id">Registration ID</label>
            <input
              id="registration_id"
              name="registration_id"
              value={formData.registration_id}
              onChange={handleChange}
              placeholder="e.g., FA20-BSE-123"
              required={formData.role === "student"}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={
                me.role === "admin" && !me.is_superuser
                  ? me.department || ""
                  : formData.department
              }
              onChange={handleChange}
              required
              disabled={me.role === "admin" && !me.is_superuser}
            />
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="program">Program</label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required={formData.role === "student"}
              disabled={!formData.department}
            >
              <option value="">Select Program</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.program}>
                  {p.program}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., name@student.uol.edu.pk"
            required
          />
        </div>
        <small className={styles.hint}>{roleHint}</small>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordRow}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              required
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Create User
          </button>
        </div>

        {status.text && (
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
      </form>
    </div>
  );
}
