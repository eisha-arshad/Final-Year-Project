// // StudentFileSubmissions.jsx

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import styles from './StudentFileSubmissions.module.css';

// function StudentFileSubmissions() {
//   const [submissions, setSubmissions] = useState([]);
//   const token = localStorage.getItem('access');

//   useEffect(() => {
//     axios
//       .get('http://127.0.0.1:8000/api/supervisor-submissions/', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         setSubmissions(res.data);
//       })
//       .catch((err) => {
//         console.error('Error fetching submissions:', err);
//       });
//   }, []);

//   return (
//     <div className={styles.wrapper}>
//       <h2 className={styles.heading}>Student File Submissions</h2>

//       {submissions.length === 0 ? (
//         <p className={styles.noData}>No submissions found.</p>
//       ) : (
//         submissions.map((submission, index) => (
//           <div key={index} className={styles.card}>
//             <div className={styles.meta}>
//               <p><strong>Student:</strong> {submission.student}</p>
//               <p><strong>Submitted on:</strong> {submission.created_at?.slice(0, 10)}</p>
//               <p>
//                 <strong>Approval:</strong>{' '}
//                 {submission.is_approved ? '✅ Approved' : '⏳ Pending'}
//               </p>
//             </div>

//             <ul className={styles.fileList}>
//               {[
//                 'proposal',
//                 'proposal_presentation',
//                 'report',
//                 'mid_presentation',
//                 'final_report',
//                 'final_presentation',
//               ].map(
//                 (field) =>
//                   submission[field] && (
//                     <li key={field}>
//                       <a
//                         href={submission[field]}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         📄 {field.replace(/_/g, ' ')}
//                       </a>
//                     </li>
//                   )
//               )}
//             </ul>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// export default StudentFileSubmissions;



// src/components/SupervisorDashboard/StudentFileSubmission.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './StudentFileSubmissions.module.css';

function StudentFileSubmission() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/student-submissions/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmissions(response.data);
      } catch (error) {
        console.error('Error fetching student submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Student Submissions</h2>
      {loading ? (
        <p>Loading submissions...</p>
      ) : (
        submissions.map((submission) => (
          <div key={submission.id} className={styles.card}>
            <h3 className={styles.studentName}>{submission.student_name}</h3>
            <ul className={styles.fileList}>
              {['proposal', 'proposal_presentation', 'report', 'mid_presentation', 'final_report', 'final_presentation'].map((field) => (
                submission[field] && (
                  <li key={field}>
                    <strong>{field.replace('_', ' ')}:</strong>{' '}
                    <a href={submission[field]} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
                      📥 Download
                    </a>
                  </li>
                )
              ))}
            </ul>
            <p><strong>Submitted On:</strong> {submission.created_at?.slice(0, 10)}</p>
            <p><strong>Status:</strong> {submission.is_approved ? '✅ Approved' : '⏳ Pending'}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default StudentFileSubmission;
