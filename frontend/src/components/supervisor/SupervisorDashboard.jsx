import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, Outlet, useOutlet } from 'react-router-dom';
import styles from './SupervisorDashboard.module.css';

import { FaBell, FaChevronDown } from 'react-icons/fa';
import { FiPlus, FiList, FiFolder, FiUsers } from 'react-icons/fi';

import ProfileImg from '../../assets/images/profile.png';

const SupervisorDashboard = () => {
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [displayName, setDisplayName] = useState('Supervisor');

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const outlet = useOutlet();

  // ===== AUTH CHECK =====
  useEffect(() => {
    const access = localStorage.getItem('access');
    const role = localStorage.getItem('role');

    setDisplayName(localStorage.getItem('displayName') || 'Supervisor');

    if (!access || role !== 'supervisor') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ===== OUTSIDE CLICK CLOSE =====
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ===== LOGOUT =====
  const handleLogout = () => {
    setShowLogoutDialog(true);
    setShowProfileOptions(false);
  };

  const confirmLogout = () => {
    localStorage.clear();
    setShowLogoutDialog(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.dashboard}>

      {/* ================= SIDEBAR ================= */}
      <aside className={styles.sidebar}>

        {/* PROFILE SECTION */}
        <div className={styles.sidebarTop} ref={dropdownRef}>

          <button className={styles.bellInSidebar}>
            <FaBell />
          </button>

          <div
            className={styles.profileCard}
            onClick={() => setShowProfileOptions((p) => !p)}
          >
            <img src={ProfileImg} alt="Profile" />

            <div className={styles.profileMeta}>
              <strong className={styles.profileName}>{displayName}</strong>
              <span className={styles.profileRole}>Supervisor</span>
            </div>

            <FaChevronDown className={styles.chev} />
          </div>

          {showProfileOptions && (
            <div className={styles.dropdown}>
              <button onClick={() => navigate('/view-supervisor-profile')}>
                👤 View Profile
              </button>

              <button onClick={() => navigate('/edit-supervisor-profile')}>
                ✏️ Edit Profile
              </button>

              <button onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className={styles.nav}>
          <Link to="createnewproject">
            <FiPlus /> Create New Project
          </Link>

          <Link to="evaluation">
            <FiList /> Evaluation List
          </Link>

          <Link to="supervisor-projects">
            <FiFolder /> Supervisor Projects
          </Link>

          <Link to="cosupervisor-projects">
            <FiUsers /> Co-Supervisor Projects
          </Link>
        </nav>

        {/* LOGOUT BUTTON */}
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className={styles.main}>

        {/* HERO ONLY ON HOME */}
        {!outlet && (
          <div className={styles.hero}>
            <div className={styles.heroOverlay}>
              <h1>Welcome to Supervisor Dashboard</h1>
              <p>
                Manage projects, evaluations and academic supervision tasks
                efficiently from your control panel.
              </p>
            </div>
          </div>
        )}

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3>⚠️ Confirm Logout</h3>
            <p>Do you want to logout?</p>

            <div className={styles.dialogActions}>
              <button onClick={confirmLogout}>Yes</button>
              <button onClick={() => setShowLogoutDialog(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;