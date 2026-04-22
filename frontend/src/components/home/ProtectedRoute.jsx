

// import React, { useEffect, useState, useRef } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';

// const API_BASE = 'http://127.0.0.1:8000';

// const isTokenValid = (token) => {
//   if (!token) return false;
//   try {
//     const { exp } = jwtDecode(token); // seconds since epoch
//     return exp * 1000 > Date.now();
//   } catch {
//     return false;
//   }
// };

// const ProtectedRoute = ({ allowedRole, children }) => {
//   const [authorized, setAuthorized] = useState(null); // null=loading, true/false
//   const location = useLocation();
//   const mounted = useRef(true);

//   useEffect(() => {
//     mounted.current = true;
//     const validate = async () => {
//       let access = localStorage.getItem('access');
//       const refresh = localStorage.getItem('refresh');

//       // 1) If access missing/expired -> try refresh (only if refresh exists)
//       if (!isTokenValid(access)) {
//         if (!refresh) {
//           if (mounted.current) setAuthorized(false);
//           return;
//         }
//         try {
//           const res = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
//           access = res?.data?.access;
//           if (!access) throw new Error('No access in refresh response');
//           localStorage.setItem('access', access);
//         } catch {
//           // refresh failed -> unauth
//           localStorage.removeItem('access');
//           localStorage.removeItem('refresh');
//           localStorage.removeItem('role');
//           if (mounted.current) setAuthorized(false);
//           return;
//         }
//       }

//       // 2) Verify role from server using fresh/valid access
//       try {
//         const roleRes = await axios.get(`${API_BASE}/api/get-role/`, {
//           headers: { Authorization: `Bearer ${access}` },
//         });
//         const serverRole = roleRes?.data?.role;
//         // optionally keep local copy in sync
//         localStorage.setItem('role', serverRole || '');

//         if (allowedRole && serverRole !== allowedRole) {
//           if (mounted.current) setAuthorized(false);
//         } else {
//           if (mounted.current) setAuthorized(true);
//         }
//       } catch {
//         if (mounted.current) setAuthorized(false);
//       }
//     };

//     validate();
//     return () => {
//       mounted.current = false;
//     };
//   }, [allowedRole]);

//   // Loading UI
//   if (authorized === null) return <div>Loading...</div>;

//   // Deny -> go to /login, replace so back button won't return here
//   if (!authorized) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//         state={{ from: location.pathname + location.search }}
//       />
//     );
//   }

//   return children;
// };

// export default ProtectedRoute;

import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE = 'http://127.0.0.1:8000';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token); // seconds since epoch
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const dashByRole = {
  admin: '/admin-dashboard',
  dept_admin: '/admin-dashboard', // dept admin same UI, scoped data
  supervisor: '/supervisor-dashboard',
  student: '/student-dashboard',
};

const ProtectedRoute = ({ allowedRole, allowedRoles, children }) => {
  const [authorized, setAuthorized] = useState(null); // null=loading
  const [serverRole, setServerRole] = useState('');
  const location = useLocation();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const validate = async () => {
      let access = localStorage.getItem('access');
      const refresh = localStorage.getItem('refresh');

      // 1) Access token missing/expired -> try refresh
      if (!isTokenValid(access)) {
        if (!refresh) {
          if (mounted.current) setAuthorized(false);
          return;
        }
        try {
          const res = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
          access = res?.data?.access;
          if (!access) throw new Error('No access in refresh response');
          localStorage.setItem('access', access);
        } catch {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('role');
          if (mounted.current) setAuthorized(false);
          return;
        }
      }

      // 2) Verify role from server
      try {
        const roleRes = await axios.get(`${API_BASE}/api/get-role/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const r = roleRes?.data?.role || '';
        setServerRole(r);
        localStorage.setItem('role', r || '');
        if (roleRes?.data?.department)
          localStorage.setItem('department', roleRes.data.department || '');

        // support both allowedRole (string) & allowedRoles (array)
        const list = Array.isArray(allowedRoles)
          ? allowedRoles
          : allowedRole
          ? [allowedRole]
          : [];

        const ok = list.length === 0 || list.includes(r);
        if (mounted.current) setAuthorized(ok);
      } catch {
        if (mounted.current) setAuthorized(false);
      }
    };

    validate();
  }, [allowedRole, allowedRoles]);

  // Loading UI
  if (authorized === null) return <div>Loading...</div>;

  // Not authorized:
  if (!authorized) {
    // If we know user's role (i.e., logged-in but wrong route), send to their dashboard
    if (serverRole && dashByRole[serverRole]) {
      return <Navigate to={dashByRole[serverRole]} replace />;
    }
    // Otherwise (not logged-in), go to login
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
