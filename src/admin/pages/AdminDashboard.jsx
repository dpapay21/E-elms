import { useEffect, useMemo, useRef, useState } from "react";
import { decideApplication, syncApprovedApplicantPhotos, watchApplications } from "../services/applications.js";
import ApplicationDetails from "../components/ApplicationDetails.jsx";

const FILTERS = [
  ["all", "All applications"],
  ["submitted", "Needs review"],
  ["accepted", "Accepted"],
  ["rejected", "Rejected"],
];

function applicantName(application) {
  const person = application.personalInformation || {};
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ") || "Applicant";
}

function formatDate(timestamp) {
  return timestamp?.toDate?.().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) || "—";
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function SignOutIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8.25 3.5H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h3.75M11 6l4 4-4 4m4-4H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function AdminDashboard({ user, onSignOut }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const photosSynced = useRef(false);

  useEffect(() => watchApplications((rows) => {
    setApplications(rows);
    setLoading(false);
    setSelected((current) => current ? rows.find((row) => row.id === current.id) || null : null);
    if (!photosSynced.current) {
      photosSynced.current = true;
      syncApprovedApplicantPhotos(rows).catch((syncError) => {
        console.error("Could not sync accepted applicant photos:", syncError?.code || syncError?.message);
      });
    }
  }, (loadError) => {
    setError(loadError?.code === "permission-denied"
      ? "Firestore denied access to applications. Check that this account is enabled in admins and that the latest rules are published."
      : "Applications could not be loaded. Check your connection and try again.");
    setLoading(false);
  }), []);

  const counts = useMemo(() => applications.reduce((total, application) => {
    const status = application.status || "submitted";
    total[status] = (total[status] || 0) + 1;
    total.all += 1;
    return total;
  }, { all: 0, submitted: 0, accepted: 0, rejected: 0 }), [applications]);

  const visibleApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesFilter = filter === "all" || (application.status || "submitted") === filter;
      const searchable = [
        applicantName(application),
        application.contact?.email,
        application.contact?.phoneNumber,
        application.jobPreferences?.jobTitle,
        ...(application.jobPreferences?.targetCountries || []),
      ].join(" ").toLowerCase();
      return matchesFilter && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [applications, filter, search]);

  async function review(application, decision) {
    setWorkingId(application.id);
    setError("");
    setNotice("");
    try {
      await decideApplication(application, decision);
      setSelected(null);
      setNotice(decision === "accepted" ? "Applicant accepted and added to the public applicant section." : "Application rejected and removed from the public applicant section.");
    } catch (reviewError) {
      setError(reviewError?.code === "permission-denied"
        ? "Firestore denied this change. Confirm the admin entry and publish the admin application rules."
        : "The application could not be updated. Please try again.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-side-brand" href="/admin"><span className="admin-side-mark">E</span><span>E-LMIS <small>ADMIN</small></span></a>
        <p className="admin-sidebar-label">WORKSPACE</p>
        <div className="admin-nav-item active"><span className="admin-nav-icon">▦</span> Overview</div>
        <div className="admin-nav-item"><span className="admin-nav-icon">♧</span> Applicants <span className="admin-nav-count">{counts.submitted}</span></div>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-mini"><span className="admin-user-avatar">{initials(user.email || "Admin")}</span><span><b>{user.email}</b><small>Administrator</small></span></div>
          <button className="admin-signout" type="button" onClick={onSignOut}><SignOutIcon /><span>Sign out</span></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-topbar-mobile-brand">E-LMIS ADMIN</span><span className="admin-breadcrumb">Workspace <b>/</b> Overview</span></div><button className="admin-top-signout" type="button" onClick={onSignOut}><SignOutIcon /><span>Sign out</span></button></header>
        <div className="admin-content">
          <section className="admin-page-heading"><div><p className="admin-eyebrow">APPLICATION MANAGEMENT</p><h1>Applicant dashboard</h1><p>Review submissions and decide who appears in the applicant directory.</p></div><div className="admin-live-pill"><i /> Live data</div></section>

          {error && <div className="admin-alert admin-banner" role="alert">{error}</div>}
          {notice && <div className="admin-notice" role="status">✓ {notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}

          <section className="admin-stats" aria-label="Application totals">
            <article className="admin-stat-card"><span className="admin-stat-icon total">▦</span><span>Total applications</span><b>{counts.all}</b><small>All submissions</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon pending">◷</span><span>Needs review</span><b>{counts.submitted}</b><small>Awaiting a decision</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon accepted">✓</span><span>Accepted</span><b>{counts.accepted}</b><small>Visible in directory</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon rejected">×</span><span>Rejected</span><b>{counts.rejected}</b><small>Hidden from directory</small></article>
          </section>

          <section className="admin-application-panel">
            <div className="admin-panel-heading"><div><h2>Applications</h2><p>Review applicant details, documents, and preferences.</p></div><label className="admin-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, job…" aria-label="Search applications" /></label></div>
            <div className="admin-filter-row" role="tablist" aria-label="Filter applications">
              {FILTERS.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? "selected" : ""} onClick={() => setFilter(key)}>{label}<span>{counts[key] || 0}</span></button>)}
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>APPLICANT</th><th>JOB PREFERENCE</th><th>DESTINATION</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead>
                <tbody>
                  {loading && <tr><td className="admin-table-message" colSpan="6"><span className="admin-spinner" /> Loading applications…</td></tr>}
                  {!loading && visibleApplications.map((application) => {
                    const name = applicantName(application);
                    const status = application.status || "submitted";
                    return <tr key={application.id}>
                      <td><div className="admin-applicant-cell"><span className="admin-applicant-avatar">{initials(name)}</span><span><b>{name}</b><small>{application.contact?.email || application.ownerEmail || "No email"}</small></span></div></td>
                      <td>{application.jobPreferences?.jobTitle || "—"}</td>
                      <td>{application.jobPreferences?.targetCountries?.join(", ") || "—"}</td>
                      <td>{formatDate(application.createdAt)}</td>
                      <td><span className={`admin-status ${status}`}>{status === "submitted" ? "Needs review" : status}</span></td>
                      <td><button className="admin-view-button" type="button" onClick={() => setSelected(application)}>Review <span>→</span></button></td>
                    </tr>;
                  })}
                  {!loading && visibleApplications.length === 0 && <tr><td className="admin-table-message" colSpan="6">{search ? "No applications match your search." : "No applications in this view yet."}</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="admin-table-footer">Showing <b>{visibleApplications.length}</b> of <b>{applications.length}</b> applications</footer>
          </section>
        </div>
      </main>

      {selected && <ApplicationDetails application={selected} working={workingId === selected.id} onClose={() => setSelected(null)} onDecision={(decision) => review(selected, decision)} />}
    </div>
  );
}
