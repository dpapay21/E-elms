import { useEffect, useState } from "react";

function display(value) {
  if (value === undefined || value === null || value === "") return "Not provided";
  if (Array.isArray(value)) return value.join(", ") || "Not provided";
  return String(value);
}

function DetailRow({ label, value }) {
  return <div className="admin-detail-row"><span>{label}</span><b>{display(value)}</b></div>;
}

function DetailSection({ title, children }) {
  return <section className="admin-detail-section"><h3>{title}</h3><div>{children}</div></section>;
}

export default function ApplicationDetails({ application, working, onClose, onDecision }) {
  const [previewDocument, setPreviewDocument] = useState(null);
  const person = application.personalInformation || {};
  const name = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ") || "Applicant";
  const documents = application.documents || {};
  const fileEntries = [
    ["Profile photo", documents.profilePhoto],
    ["Address document", documents.addressDocument],
    ["ID card front", documents.idFront],
    ["ID card back", documents.idBack],
    ...(documents.educationCertificates || []).map((file, index) => [`Education certificate ${index + 1}`, file]),
  ].filter(([, file]) => file?.url);

  useEffect(() => {
    if (!previewDocument) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreviewDocument(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewDocument]);

  function renderDocumentPreview(file, label) {
    const fileType = (file.contentType || "").toLowerCase();
    const fileName = (file.fileName || "").toLowerCase();
    const isImage = fileType.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(fileName);
    const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");

    if (isImage) {
      return <img className="admin-document-preview-image" src={file.url} alt={label} />;
    }
    if (isPdf) {
      return <iframe className="admin-document-preview-pdf" src={file.url} title={`${label} document preview`} />;
    }
    return (
      <div className="admin-document-preview-empty">
        <span aria-hidden="true">▤</span>
        <h3>Preview unavailable</h3>
        <p>This file type can’t be previewed here. Open the original file to view it.</p>
      </div>
    );
  }

  return (
    <div className="admin-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !working) onClose(); }}>
      <aside className="admin-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
        <header className="admin-detail-header"><div><p className="admin-eyebrow">APPLICATION REVIEW</p><h2 id="admin-detail-title">Applicant details</h2></div><button type="button" aria-label="Close details" onClick={onClose} disabled={working}>×</button></header>
        <div className="admin-detail-scroll">
          <div className="admin-detail-person"><span className="admin-applicant-avatar large">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><h3>{name}</h3><p>{application.contact?.email || application.ownerEmail || "No email address"}</p><span className={`admin-status ${application.status || "submitted"}`}>{application.status === "submitted" ? "Needs review" : application.status}</span></div></div>

          <DetailSection title="Personal information">
            <DetailRow label="Name (Amharic)" value={[person.amSom, person.amFatherName, person.amGrandfatherName].filter(Boolean).join(" ")} />
            <DetailRow label="Gender" value={person.gender} />
            <DetailRow label="Birth date" value={person.birthDate} />
            <DetailRow label="Marital status" value={person.maritalStatus} />
            <DetailRow label="Nationality" value={person.nationality} />
            <DetailRow label="Disability" value={person.disability} />
            <DetailRow label="Work status" value={application.workStatus} />
          </DetailSection>

          <DetailSection title="Contact & address">
            <DetailRow label="Phone" value={application.contact?.phoneNumber} />
            <DetailRow label="Email" value={application.contact?.email || application.ownerEmail} />
            <DetailRow label="Region / city" value={[application.address?.region, application.address?.city].filter(Boolean).join(" / ")} />
            <DetailRow label="Kebele / house" value={[application.address?.kebele, application.address?.houseNumber].filter(Boolean).join(" / ")} />
            <DetailRow label="Residence" value={application.address?.residence} />
            <DetailRow label="P.O. Box" value={application.contact?.poBox} />
          </DetailSection>

          <DetailSection title="Job preferences">
            <DetailRow label="Job title" value={application.jobPreferences?.jobTitle} />
            <DetailRow label="Target countries" value={application.jobPreferences?.targetCountries} />
            <DetailRow label="Contract" value={application.jobPreferences?.contractType} />
            <DetailRow label="Contract length" value={application.jobPreferences?.contractLength} />
            <DetailRow label="Hours per week" value={application.jobPreferences?.workingHoursPerWeek} />
          </DetailSection>

          <DetailSection title="Salary & benefits">
            <DetailRow label="Expected monthly salary" value={application.salaryBenefits?.monthlySalary} />
            <DetailRow label="Hours per week" value={application.salaryBenefits?.workingHoursPerWeek} />
            <DetailRow label="Accommodation" value={application.salaryBenefits?.accommodation} />
            <DetailRow label="Transport" value={application.salaryBenefits?.transport} />
            <DetailRow label="Food" value={application.salaryBenefits?.food} />
          </DetailSection>

          <DetailSection title={`Documents (${fileEntries.length})`}>
            {fileEntries.length ? <ul className="admin-document-list">{fileEntries.map(([label, file]) => <li key={`${label}-${file.publicId || file.fileName}`}><span className="admin-document-icon">▤</span><span><b>{label}</b><small>{file.fileName || "Uploaded document"}</small></span><button className="admin-document-open" type="button" onClick={() => setPreviewDocument({ label, file })}>Preview <span aria-hidden="true">↗</span></button></li>)}</ul> : <p className="admin-empty-documents">No documents were attached.</p>}
          </DetailSection>
        </div>
        <footer className="admin-detail-actions">
          {application.status === "submitted" ? <>
            <button className="admin-reject-button" type="button" onClick={() => onDecision("rejected")} disabled={working}>{working ? "Updating…" : "Reject"}</button>
            <button className="admin-primary-button" type="button" onClick={() => onDecision("accepted")} disabled={working}>{working ? "Updating…" : "Accept applicant"}</button>
          </> : <button className="admin-secondary-button" type="button" onClick={onClose}>Close review</button>}
        </footer>
      </aside>
      {previewDocument && (
        <div className="admin-document-preview-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewDocument(null); }}>
          <section className="admin-document-preview" role="dialog" aria-modal="true" aria-labelledby="admin-document-preview-title">
            <header className="admin-document-preview-header">
              <div className="admin-document-preview-heading">
                <span className="admin-document-preview-badge" aria-hidden="true">▤</span>
                <div><p className="admin-eyebrow">APPLICATION DOCUMENT</p><h2 id="admin-document-preview-title">{previewDocument.label}</h2><span>{previewDocument.file.fileName || "Uploaded document"}</span></div>
              </div>
              <button className="admin-document-preview-close" type="button" aria-label="Close document preview" onClick={() => setPreviewDocument(null)}>×</button>
            </header>
            <div className="admin-document-preview-body">{renderDocumentPreview(previewDocument.file, previewDocument.label)}</div>
            <footer className="admin-document-preview-footer">
              <span>{previewDocument.file.contentType || "Document"}</span>
              <div><a href={previewDocument.file.url} target="_blank" rel="noreferrer">Open original <span aria-hidden="true">↗</span></a><button className="admin-secondary-button" type="button" onClick={() => setPreviewDocument(null)}>Close preview</button></div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
