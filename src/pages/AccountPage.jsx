import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";
import "./AccountPage.css";

function valueText(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === 0 ? "0" : value || "Not provided";
}

function Detail({ label, value }) {
  return <div className="account-detail"><dt>{label}</dt><dd>{valueText(value)}</dd></div>;
}

function Section({ title, children }) {
  return <section className="account-section"><h2>{title}</h2><dl>{children}</dl></section>;
}

function DocumentLink({ label, file }) {
  if (!file?.url) return <Detail label={label} value="Not uploaded" />;
  return <div className="account-detail"><dt>{label}</dt><dd><a href={file.url} target="_blank" rel="noreferrer">View {file.fileName || label}</a></dd></div>;
}

function ApplicationCard({ application }) {
  const person = application.personalInformation || {};
  const address = application.address || {};
  const contact = application.contact || {};
  const job = application.jobPreferences || {};
  const salary = application.salaryBenefits || {};
  const documents = application.documents || {};
  const name = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ") || "Your profile";

  return <article className="account-card">
    <header className="account-profile-header">
      {documents.profilePhoto?.url ? <img src={documents.profilePhoto.url} alt={`${name} profile`} /> : <span className="account-avatar" aria-hidden="true">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>}
      <div><p className="account-eyebrow">Applicant profile</p><h2>{name}</h2><p>{contact.email || application.ownerEmail || ""}</p></div>
      <span className={`account-status ${application.status || "submitted"}`}>{application.status || "Submitted"}</span>
    </header>
    <div className="account-sections">
      <Section title="Personal information">
        <Detail label="First name" value={person.firstName} /><Detail label="Middle name" value={person.middleName} /><Detail label="Last name" value={person.lastName} />
        <Detail label="Amharic name" value={[person.amSom, person.amFatherName, person.amGrandfatherName].filter(Boolean).join(" ")} />
        <Detail label="Gender" value={person.gender} /><Detail label="Birth date" value={person.birthDate} /><Detail label="Marital status" value={person.maritalStatus} />
        <Detail label="Nationality" value={person.nationality} /><Detail label="Disability" value={person.disability} /><Detail label="Civil servant" value={person.civilServant} />
        <Detail label="Current paid work hours per week" value={person.workingHours} />
        <Detail label="Work status" value={application.workStatus} />
      </Section>
      <Section title="Address and contact">
        <Detail label="Region" value={address.region} /><Detail label="City" value={address.city} /><Detail label="Kebele" value={address.kebele} />
        <Detail label="House number" value={address.houseNumber} /><Detail label="Residence" value={address.residence} />
        <Detail label="Phone" value={contact.phoneNumber} /><Detail label="Email" value={contact.email || application.ownerEmail} /><Detail label="P.O. Box" value={contact.poBox} />
      </Section>
      <Section title="Job information">
        <Detail label="Job title" value={job.jobTitle} /><Detail label="Target countries" value={job.targetCountries} />
        <Detail label="Preferred cities" value={Object.entries(job.cities || {}).map(([country, city]) => city ? `${country}: ${city}` : "").filter(Boolean)} />
        <Detail label="Contract type" value={job.contractType} /><Detail label="Contract length" value={job.contractLength} /><Detail label="Hours per week" value={job.workingHoursPerWeek} />
      </Section>
      <Section title="Salary and benefits">
        <Detail label="Expected monthly salary" value={salary.monthlySalary} /><Detail label="Working hours per week" value={salary.workingHoursPerWeek} />
        <Detail label="Accommodation" value={salary.accommodation} /><Detail label="Transport" value={salary.transport} /><Detail label="Food" value={salary.food} />
      </Section>
      <Section title="Documents">
        <DocumentLink label="Profile photo" file={documents.profilePhoto} /><DocumentLink label="Address document" file={documents.addressDocument} />
        <DocumentLink label="ID front" file={documents.idFront} /><DocumentLink label="ID back" file={documents.idBack} />
        {(documents.educationCertificates || []).map((file, index) => <DocumentLink key={file.publicId || index} label={`Education certificate ${index + 1}`} file={file} />)}
      </Section>
    </div>
  </article>;
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, (account) => {
    setUser(account);
    setAuthReady(true);
    if (!account) window.location.replace("/login");
  }), []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getDocs(query(collection(db, "applications"), where("ownerUid", "==", user.uid)))
      .then((snapshot) => {
        if (active) setApplications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      })
      .catch(() => { if (active) setError("We couldn’t load your profile. Check your connection and try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  async function handleSignOut() {
    await signOut(auth);
    window.location.replace("/login");
  }

  if (!authReady || !user) return <div className="account-loading">Checking your account…</div>;

  return <main className="account-page">
    <nav className="account-nav"><a href="/" className="account-brand"><span>E</span> E-LMIS</a><div><span>{user.email}</span><button type="button" onClick={handleSignOut}>Sign out</button></div></nav>
    <div className="account-main"><header className="account-page-heading"><div><p className="account-eyebrow">Personal workspace</p><h1>Your information</h1><p>View your submitted registration details, employment preferences, and documents.</p></div></header>
      {loading && <div className="account-message">Loading your profile…</div>}
      {error && <div className="account-message error" role="alert">{error}</div>}
      {!loading && !error && applications.length === 0 && <div className="account-empty"><h2>No registration found yet</h2><p>Your profile information will appear here after you complete registration.</p><a href="/register">Continue registration</a></div>}
      {!loading && applications.map((application) => <ApplicationCard key={application.id} application={application} />)}
    </div>
  </main>;
}
