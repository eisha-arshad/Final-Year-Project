
import React from 'react';
import bannerImg from '../../../../assets/images/banner-img.png'; // ✅ Import image
import styles from './AdminDashboardHome.module.css';

const AdminDashboardHome = () => {
  const systemHealth = 82;
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fullDate = today.toLocaleDateString('en-US', dateOptions);
  const adminName = 'Admin Eisha';

  let healthLabel = '';
  if (systemHealth <= 20) healthLabel = '🔴 Critical';
  else if (systemHealth <= 40) healthLabel = '🟠 Unstable';
  else if (systemHealth <= 60) healthLabel = '🟡 Moderate';
  else if (systemHealth <= 80) healthLabel = '🟢 Stable';
  else healthLabel = '✅ Optimal';

  const needleAngle = (systemHealth / 100) * 180;

  return (
    <div className={styles.dashboardHome}>
      {/* Banner */}
       <div
        className={styles.banner}
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className={styles.bannerContent}>
          <p className={styles.date}>{fullDate}</p>
          <h2>Welcome back, {adminName}!</h2>
          <p>Monitor and manage your academic system efficiently</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoContainer}>
        <div className={styles.personalInfoCard}>
          <h3>System Overview</h3>
          <div className={styles.grid}>
            <p>Total Students: 1,240</p>
            <p>Supervisors: 85</p>
            <p>Pending Requests: 12</p>
            <p>Active Sessions: 34</p>
          </div>
        </div>
        <div className={styles.studentInfoCard}>
          <h3>Admin Tasks</h3>
          <div className={styles.grid}>
            <p>Review Reports</p>
            <p>Approve Registrations</p>
            <p>Update Guidelines</p>
            <p>Manage Feedback</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsWrapper}>
        <div className={styles.chartCard}>
          <h3>System Health</h3>
          <div className={styles.progressWrapper}>
            <div className={styles.percentCircle}>
              <span>{systemHealth}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${systemHealth}%` }}></div>
            </div>
          </div>
          <p className={styles.scoreLabel}><strong>Overall Status</strong></p>
        </div>

        <div className={styles.chartCard}>
          <h3>Performance Rating</h3>
          <div className={styles.feedbackGauge}>
            <svg viewBox="0 0 200 120" className={styles.gaugeSvg}>
              <path d="M10 100 A90 90 0 0 1 190 100" stroke="#e5e7eb" strokeWidth="14" fill="none" />
              <path d="M10 100 A90 90 0 0 1 60 35" stroke="#ef4444" strokeWidth="14" fill="none" />
              <path d="M60 35 A90 90 0 0 1 90 25" stroke="#f97316" strokeWidth="14" fill="none" />
              <path d="M90 25 A90 90 0 0 1 120 25" stroke="#facc15" strokeWidth="14" fill="none" />
              <path d="M120 25 A90 90 0 0 1 150 35" stroke="#4ade80" strokeWidth="14" fill="none" />
              <path d="M150 35 A90 90 0 0 1 190 100" stroke="#22c55e" strokeWidth="14" fill="none" />
              <line x1="100" y1="100" x2="100" y2="30" stroke="#2563eb" strokeWidth="4" transform={`rotate(${needleAngle}, 100, 100)`} />
              <circle cx="100" cy="100" r="5" fill="#2563eb" />
            </svg>
            <div className={styles.feedbackLabel}>
              <strong>{healthLabel}</strong>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default AdminDashboardHome;
