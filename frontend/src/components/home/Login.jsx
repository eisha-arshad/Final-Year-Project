
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import styles from './Login.module.css';

// function Login() {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // If already logged in, redirect based on saved role
//   useEffect(() => {
//     const access = localStorage.getItem('access');
//     const role = localStorage.getItem('role');
//     if (access && role) {
//       if (role === 'admin') navigate('/admin-dashboard', { replace: true });
//       else if (role === 'student') navigate('/student-dashboard', { replace: true });
//       else if (role === 'supervisor') navigate('/supervisor-dashboard', { replace: true });
//     }
//   }, [navigate]);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const res = await axios.post('http://127.0.0.1:8000/api/token/', formData);
//       localStorage.setItem('refresh', res.data.refresh);

//       const refreshRes = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
//         refresh: res.data.refresh,
//       });

//       const access = refreshRes.data.access;
//       localStorage.setItem('access', access);

//       const roleRes = await axios.get('http://127.0.0.1:8000/api/get-role/', {
//         headers: { Authorization: `Bearer ${access}` },
//       });

//       const role = roleRes.data.role;
//       localStorage.setItem('role', role);

//       // IMPORTANT: replace:true so login page is removed from history
//       if (role === 'admin') navigate('/admin-dashboard', { replace: true });
//       else if (role === 'student') navigate('/student-dashboard', { replace: true });
//       else if (role === 'supervisor') navigate('/supervisor-dashboard', { replace: true });
//       else navigate('/login', { replace: true });
//     } catch (err) {
//       setError('Login failed. Please check your credentials.');
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <form onSubmit={handleSubmit} className={styles.card}>
//         <h2 className={styles.heading}>Login to Your Account</h2>

//         {error && <div className={styles.error}>{error}</div>}

//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className={styles.input}
//           required
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           className={styles.input}
//           required
//         />

//         <button type="submit" className={styles.button}>
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Login;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Flag to indicate if the check is complete
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const access = localStorage.getItem('access');
      const role = localStorage.getItem('role');
      
      if (access && role) {
        // If the user is already logged in, redirect to the appropriate dashboard
        if (role === 'admin') navigate('/admin-dashboard', { replace: true });
        else if (role === 'student') navigate('/student-dashboard', { replace: true });
        else if (role === 'supervisor') navigate('/supervisor-dashboard', { replace: true });
      } else {
        // Allow the login form to be displayed
        setIsLoading(false); // Stop the loading state
      }
    };

    checkLoginStatus(); // Run the login check on component mount
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1) Get refresh token
      const res = await axios.post('http://127.0.0.1:8000/api/token/', formData);
      localStorage.setItem('refresh', res.data.refresh);

      // 2) Exchange refresh token for access token
      const refreshRes = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: res.data.refresh,
      });
      const access = refreshRes.data.access;
      localStorage.setItem('access', access);

      // 3) Fetch user role and profile data
      const roleRes = await axios.get('http://127.0.0.1:8000/api/get-role/', {
        headers: { Authorization: `Bearer ${access}` },
      });

      const { role, full_name, name: username, email } = roleRes.data || {};
      localStorage.setItem('role', role || '');

      // Set a display name for the user
      const displayName =
        (full_name && full_name.trim()) ||
        (username && username.trim()) ||
        (email ? email.split('@')[0] : 'User');
      localStorage.setItem('displayName', displayName);
      localStorage.setItem('email', email || '');

      // 4) Route to the appropriate dashboard based on role
      if (role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (role === 'student') navigate('/student-dashboard', { replace: true });
      else if (role === 'supervisor') navigate('/supervisor-dashboard', { replace: true });
      else navigate('/login', { replace: true });

    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  // If the page is still loading (checking login status), show loading state
  if (isLoading) {
    return <div>Loading...</div>; // Show a loading message until the check is done
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.card}>
        <h2 className={styles.heading}>Login to Your Account</h2>

        {error && <div className={styles.error}>{error}</div>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
