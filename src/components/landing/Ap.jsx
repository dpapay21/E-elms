import { useEffect, useMemo, useState } from 'react';
import { watchApprovedApplicants } from '../../services/approvedApplicants.js';
import '../../styles/landing.css';

const colors = [
  ['#38bdf8', '#2563eb'], ['#34d399', '#059669'], ['#fbbf24', '#ea580c'],
  ['#a78bfa', '#7c3aed'], ['#f472b6', '#db2777'], ['#60a5fa', '#4f46e5'],
];

function ApplicantCard({ applicant, expanded, onToggle }) {
  const initials = applicant.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  const colorIndex = typeof applicant.id === 'number'
    ? applicant.id
    : [...String(applicant.id)].reduce((total, character) => total + character.charCodeAt(0), 0);
  const hue = colors[colorIndex % colors.length];
  return (
    <article className="ap-card">
      <div className="ap-main">
        <div className="ap-avatar">
          {applicant.photoUrl
            ? <img className="ap-profile-photo" src={applicant.photoUrl} alt={`${applicant.name} profile`} loading="lazy" />
            : <span className="ap-ini" style={{ background: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})` }}>{initials}</span>}
          <span className="ap-check" aria-hidden="true">✓</span>
        </div>
        <div className="ap-info">
          <h3 className="ap-name">{applicant.name}</h3>
          <ul className="ap-meta"><li>▣ <span>{applicant.job}</span></li><li>⌖ <span>{applicant.country}</span></li><li className="ap-pay">$ <span>{applicant.pay.toLocaleString('en-US')}</span></li></ul>
          <div className="ap-foot"><span className="ap-status">Accepted</span><button className="ap-view" type="button" aria-expanded={expanded} onClick={onToggle}>View Details</button></div>
          {expanded && <div className="ap-details">
            {applicant.photoUrl && <img className="ap-detail-photo" src={applicant.photoUrl} alt={`${applicant.name} profile`} />}
            <div><b>Accepted applicant</b><span>Placed: {applicant.placed}</span><span>Reference: {applicant.reference}</span></div>
          </div>}
        </div>
      </div>
    </article>
  );
}

export default function Ap() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [shown, setShown] = useState(9);
  const [expanded, setExpanded] = useState(() => new Set());
  const [approvedApplicants, setApprovedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => watchApprovedApplicants((rows) => {
    setApprovedApplicants(rows);
    setLoading(false);
    setLoadError(false);
  }, (error) => {
    console.error('Could not load approved applicants:', error?.code || error?.message);
    setLoading(false);
    setLoadError(true);
  }), []);

  const rows = useMemo(() => {
    const filtered = approvedApplicants.filter(({ name, country, job }) => `${name} ${country} ${job}`.toLowerCase().includes(query.trim().toLowerCase()));
    if (sort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'salary') return filtered.sort((a, b) => b.pay - a.pay || a.name.localeCompare(b.name));
    return filtered;
  }, [approvedApplicants, query, sort]);
  const visible = rows.slice(0, shown);
  const toggle = (id) => setExpanded((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <section className="ap" id="applicants" aria-labelledby="apTitle">
      <h2 className="ap-title" id="apTitle">Applicant Status Directory</h2>
      <p className="ap-copy">Browse accepted applicant profiles. This directory updates when an administrator approves an application.</p>
      <div className="ap-inner">
        <div className="ap-search-card"><label className="sr-only" htmlFor="apSearch">Search applicants by name or country</label><div className="ap-search"><input id="apSearch" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShown(9); }} placeholder="Search by name, country" autoComplete="off" /></div></div>
        <div className="ap-bar"><p className="ap-count" aria-live="polite">Showing <b>{visible.length}</b> of <b>{rows.length}</b> accepted applicants</p><div className="ap-sort"><label htmlFor="apSort">Sort by:</label><select id="apSort" value={sort} onChange={(event) => { setSort(event.target.value); setShown(9); }}><option value="recent">Most Recent</option><option value="name">Name (A–Z)</option><option value="salary">Highest Salary</option></select></div></div>
        <div className="ap-list">{visible.map((applicant) => <ApplicantCard key={applicant.id} applicant={applicant} expanded={expanded.has(applicant.id)} onToggle={() => toggle(applicant.id)} />)}</div>
        {loading && <p className="ap-empty" role="status">Loading accepted applicants…</p>}
        {!loading && loadError && <p className="ap-empty" role="alert">Accepted applicants could not be loaded. Please try again later.</p>}
        {!loading && !loadError && rows.length === 0 && <p className="ap-empty">{query ? 'No accepted applicants match your search.' : 'No accepted applicants are available yet.'}</p>}
        {visible.length < rows.length && <button className="ap-more" type="button" onClick={() => setShown((count) => count + 9)}>Load More Applicants <span aria-hidden="true">→</span></button>}
      </div>
    </section>
  );
}
