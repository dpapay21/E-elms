import { useState } from "react";
import landingLogo from "../../assets/877d674005f4.png";
import "./EmploymentRegistrationForm.css";

const PERSONAL_FIELDS = [
  ["firstName", "First name", "text", true],
  ["middleName", "Middle name", "text", true],
  ["lastName", "Last name", "text", true],
  ["amSom", "ስም", "text", true, undefined, "am"],
  ["amFatherName", "የአባት ስም", "text", true, undefined, "am"],
  ["amGrandfatherName", "የአያት ስም", "text", true, undefined, "am"],
  ["gender", "Gender", "choice", true, ["Male", "Female"]],
  ["birthDate", "Birth date", "date", true],
  ["maritalStatus", "Marital status", "select", true, ["Single", "Married", "Divorced", "Widowed"]],
  ["disability", "Disability", "select", true, ["No disability", "Visual", "Hearing", "Physical", "Other"]],
  ["nationality", "Nationality", "select", true, ["Ethiopian", "Other"]],
];
const ADDRESS_FIELDS = [
  ["region", "Region", "text", true],
  ["city", "City", "text", true],
  ["kebele", "Kebele", "text", true],
  ["houseNumber", "House number", "text", true],
  ["residence", "Residence", "select", true, ["Owned", "Rented", "Other"]],
];
const CONTACT_FIELDS = [
  ["phoneNumber", "Phone number", "tel", true],
  ["email", "Email address", "email", true],
  ["poBox", "P.O. Box", "text", true],
];

const TARGET_COUNTRIES = [
  "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Bahrain", "Jordan", "Lebanon", "Turkey", "Canada",
  "United States", "United Kingdom", "Germany", "Italy", "France", "Netherlands", "Sweden", "Norway", "Australia", "New Zealand",
  "South Korea", "Japan", "Malaysia", "Singapore", "South Africa", "Israel", "Poland", "Spain", "Portugal", "Greece",
];
const COUNTRY_CITIES = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Al Ain"],
  Qatar: ["Doha", "Al Rayyan", "Al Wakrah", "Lusail"],
  Kuwait: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya"],
  Oman: ["Muscat", "Salalah", "Sohar", "Nizwa"],
  Bahrain: ["Manama", "Riffa", "Muharraq", "Hamad Town"],
  Jordan: ["Amman", "Zarqa", "Irbid", "Aqaba"],
  Lebanon: ["Beirut", "Tripoli", "Sidon", "Tyre"],
  Turkey: ["Istanbul", "Ankara", "Izmir", "Antalya"],
  Canada: ["Toronto", "Ottawa", "Montreal", "Vancouver", "Calgary"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Washington, D.C."],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow"],
  Germany: ["Berlin", "Hamburg", "Munich", "Frankfurt", "Cologne"],
  Italy: ["Rome", "Milan", "Naples", "Turin", "Florence"],
  France: ["Paris", "Lyon", "Marseille", "Nice", "Toulouse"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  Sweden: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"],
  Norway: ["Oslo", "Bergen", "Trondheim", "Stavanger"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Hamilton"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu"],
  Japan: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Kyoto"],
  Malaysia: ["Kuala Lumpur", "George Town", "Johor Bahru", "Kota Kinabalu"],
  Singapore: ["Singapore"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  Israel: ["Tel Aviv", "Jerusalem", "Haifa", "Be'er Sheva"],
  Poland: ["Warsaw", "Kraków", "Wrocław", "Gdańsk"],
  Spain: ["Madrid", "Barcelona", "Valencia", "Seville"],
  Portugal: ["Lisbon", "Porto", "Braga", "Coimbra"],
  Greece: ["Athens", "Thessaloniki", "Patras", "Heraklion"],
};
const JOB_FIELDS = [
  ["jobTitle", "Job title", "select", true, ["Accountant", "Agricultural worker", "Babysitter", "Caregiver", "Chef", "Cleaner", "Construction worker", "Customer service representative", "Delivery driver", "Electrician", "Factory worker", "Farm worker", "Gardener", "General laborer", "Healthcare assistant", "Hotel staff", "Housekeeper", "Machine operator", "Nurse", "Office assistant", "Painter", "Plumber", "Security guard", "Software developer", "Tailor", "Teacher", "Truck driver", "Waiter / waitress", "Welder", "Other"], undefined, true],
  ["contractType", "Contract type", "select", true, ["Full time", "Part time", "Temporary", "Contract"], undefined, true],
  ["contractLength", "Contract length", "select", true, ["Less than 3 months", "3–6 months", "6–12 months", "More than 1 year"], undefined, true],
  ["jobWorkingHours", "Working hours per week", "number", true],
];

const STEP_TITLES = ["Personal information", "Job information", "Documents", "Salary & benefits"];

function getSubmissionMessage(error) {
  const code = error?.code || "";
  const message = error?.message || "";
  if (code === "storage/unauthorized" || code === "permission-denied" || message.toLowerCase().includes("insufficient permissions")) {
    return "Your registration could not be saved because Firebase denied access. Please ask the administrator to check the Firestore and Storage rules.";
  }
  if (code === "storage/bucket-not-found" || code === "storage/unknown") {
    return "Document storage is not available yet. Please ask the administrator to activate the Firebase Storage bucket and check its configuration.";
  }
  if (message.toLowerCase().includes("cloudinary upload is not configured")) {
    return "Document uploads are not configured yet. Set the Cloudinary cloud name and unsigned upload preset, then restart the app.";
  }
  if (code.startsWith("storage/") || message.startsWith("A document could not be uploaded")) {
    return "A document could not be uploaded. Check your connection and try again.";
  }
  if (message.toLowerCase().includes("cloudinary")) {
    return "A document upload failed. Check the Cloudinary upload settings or try again later.";
  }
  if (code === "unauthenticated" || message.toLowerCase().includes("session expired")) {
    return "Your sign-in session has expired. Please sign in again, then submit your registration.";
  }
  if (code === "unavailable" || code === "deadline-exceeded" || code === "network-request-failed") {
    return "We could not reach the service. Check your internet connection and try again.";
  }
  return "Your registration was not completed. Please try again. If the problem continues, contact the administrator.";
}

function Field({ field, value, error, onChange }) {
  const [open, setOpen] = useState(false);
  const [optionSearch, setOptionSearch] = useState("");
  const [name, label, type, required, options, language, searchable] = field;
  const controlId = name.replace(/[^a-zA-Z0-9_-]/g, "-");
  return (
    <div className="registration-field">
      <span id={`${controlId}-label`}>{label}{required ? " *" : ""}</span>
      {type === "choice" ? (
        <div className="registration-choice" role="group" aria-labelledby={`${controlId}-label`}>
          {options.map((option) => <button type="button" key={option} aria-pressed={value === option} className={value === option ? "active" : ""} onClick={() => onChange(name, option)}>{option}</button>)}
        </div>
      ) : type === "select" ? (
        <div className={`registration-select ${open ? "is-open" : ""}`}>
          {searchable ? (
            <div className="registration-combobox">
              <input id={controlId} className="registration-combobox-input" type="search" value={open ? optionSearch : value || ""} placeholder={`Select ${label.toLowerCase()}`} aria-labelledby={`${controlId}-label`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${controlId}-options`} autoComplete="off" onFocus={() => { setOptionSearch(""); setOpen(true); }} onClick={() => { if (!open) { setOptionSearch(""); setOpen(true); } }} onChange={(event) => { setOptionSearch(event.target.value); setOpen(true); }} />
              <span aria-hidden="true">⌄</span>
            </div>
          ) : (
            <button id={controlId} type="button" className="registration-select-trigger" aria-labelledby={`${controlId}-label`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>{value || `Select ${label.toLowerCase()}`}<span aria-hidden="true">⌄</span></button>
          )}
          {open && <div id={`${controlId}-options`} className="registration-select-list" role="listbox" aria-label={`${label} options`}>
            {options.filter((option) => !searchable || option.toLowerCase().includes(optionSearch.toLowerCase())).map((option) => <button type="button" role="option" aria-selected={value === option} className={value === option ? "selected" : ""} key={option} onClick={() => { onChange(name, option); setOpen(false); setOptionSearch(""); }}>{option}</button>)}
            {searchable && !options.some((option) => option.toLowerCase().includes(optionSearch.toLowerCase())) && <p className="registration-select-empty">No matching options.</p>}
          </div>}
        </div>
      ) : (
        <input
          type={type}
          id={controlId}
          value={value}
          aria-labelledby={`${controlId}-label`}
          inputMode={["kebele", "houseNumber", "poBox"].includes(name) ? "numeric" : undefined}
          pattern={["kebele", "houseNumber", "poBox"].includes(name) ? "[0-9]*" : undefined}
          lang={language}
          dir={language ? "auto" : undefined}
          onChange={(event) => onChange(name, event.target.value)}
          min={type === "number" ? "1" : undefined}
        />
      )}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}

function DocumentDropzone({ id, title, description, multiple = false, selectedFiles, error, onSelect, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const files = multiple ? selectedFiles || [] : selectedFiles ? [selectedFiles] : [];
  const acceptFiles = (list) => {
    const incoming = Array.from(list || []);
    if (incoming.length) onSelect(incoming);
  };

  return (
    <section className={`registration-dropzone ${dragging ? "dragging" : ""} ${error ? "has-error" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFiles(event.dataTransfer.files); }}>
      <input id={id} className="registration-dropzone-input" type="file" accept="image/png,image/jpeg,application/pdf" multiple={multiple} onChange={(event) => { acceptFiles(event.target.files); event.target.value = ""; }} />
      <div className="registration-dropzone-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4" /></svg></div>
      <strong>{title}</strong>
      <span className="registration-dropzone-description">{description}</span>
      <label className="registration-dropzone-browse" htmlFor={id}>Browse files</label>
      {files.length > 0 && <ul className="registration-dropzone-files">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)}>×</button></li>)}</ul>}
      {error && <small role="alert">{error}</small>}
    </section>
  );
}

export default function EmploymentRegistrationForm({ workStatus, phone = "", email = "", onBack, onComplete, onFinish }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ phoneNumber: phone, email });
  const [files, setFiles] = useState({});
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [errors, setErrors] = useState({});
  const [complete, setComplete] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [saving, setSaving] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [search, setSearch] = useState("");

  const change = (name, value) => {
    if (name === "phoneNumber") value = value.replace(/\D/g, "").slice(-9);
    if (["kebele", "houseNumber", "poBox"].includes(name)) value = value.replace(/\D/g, "");
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  function saveDocuments(key, incomingFiles, multiple = false) {
    const acceptedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const validFiles = incomingFiles.filter((file) => acceptedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== incomingFiles.length) {
      setErrors((current) => ({ ...current, [key]: "Choose JPG, PNG, or PDF files under 5 MB each." }));
      return;
    }
    setFiles((current) => ({ ...current, [key]: multiple ? [...(current[key] || []), ...validFiles] : validFiles[0] }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateStep() {
    const nextErrors = {};
    if (step === 0) {
      for (const [name, label, , required] of [...PERSONAL_FIELDS, ...ADDRESS_FIELDS, ...CONTACT_FIELDS, ["workingHours", "Working hours per week", "number", true]]) {
        if (required && !values[name]?.trim()) nextErrors[name] = `${label} is required.`;
      }
      if (!/^9\d{8}$/.test(values.phoneNumber || "")) {
        nextErrors.phoneNumber = "Enter 9 digits starting with 9.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || "")) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (Number(values.workingHours) < 1) nextErrors.workingHours = "Enter at least 1 working hour.";
      if (!/^\d+$/.test(values.kebele || "")) nextErrors.kebele = "Enter numbers only.";
      if (!/^\d+$/.test(values.houseNumber || "")) nextErrors.houseNumber = "Enter numbers only.";
      if (!/^\d+$/.test(values.poBox || "")) nextErrors.poBox = "Enter numbers only.";
      if (!files.photo) nextErrors.photo = "Upload a profile photo to continue.";
    }
    if (step === 1) {
      for (const [name, label, , required] of JOB_FIELDS) {
        if (required && !values[name]?.trim()) nextErrors[name] = `${label} is required.`;
      }
      if (!values.targetCountries?.length) nextErrors.targetCountries = "Select at least one target country.";
      for (const country of values.targetCountries || []) {
        if (!values[`city_${country}`]) nextErrors[`city_${country}`] = `Select a city in ${country}.`;
      }
      if (values.jobWorkingHours && Number(values.jobWorkingHours) < 1) nextErrors.jobWorkingHours = "Enter at least 1 working hour.";
    }
    if (step === 2) {
      if (!files.idFront) nextErrors.idFront = "Upload the front of your ID card.";
      if (!files.idBack) nextErrors.idBack = "Upload the back of your ID card.";
    }
    if (step === 3) {
      for (const name of ["monthlySalary", "salaryHours", "accommodation", "transport", "food"]) {
        if (!values[name]) nextErrors[name] = "Please complete this field.";
      }
      for (const name of ["monthlySalary", "salaryHours"]) {
        if (values[name] && Number(values[name]) < 1) nextErrors[name] = "Enter a number greater than zero.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function next() {
    if (!validateStep()) return;
    if (step < STEP_TITLES.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const registration = { ...values, workStatus, documents: files };
    setSaving(true);
    setSubmissionError("");
    try {
      if (!onComplete) throw new Error("Registration saving is not configured.");
      const result = await onComplete(registration);
      setApplicationId(result?.id || "");
      setComplete(true);
    } catch (error) {
      console.error("Employment registration submission failed:", error?.code || error?.message);
      setSubmissionError(getSubmissionMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function previous() {
    if (step > 0) {
      setStep((current) => current - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onBack?.();
    }
  }

  if (complete) {
    return (
      <main className="employment-registration">
        <header className="registration-header">
          <img src={landingLogo} alt="" />
          <strong>E-LMIS</strong>
        </header>
        <section className="registration-card registration-success" role="status">
          <div className="registration-success-mark" aria-hidden="true">✓</div>
          <h1>Registration successful</h1>
          <p>Your registration and documents have been saved successfully.{applicationId ? ` Reference: ${applicationId}` : ""}</p>
          <button type="button" className="registration-primary" onClick={onFinish}>Done</button>
        </section>
      </main>
    );
  }

  return (
    <main className="employment-registration">
      <header className="registration-header">
        <img src={landingLogo} alt="" />
        <strong>E-LMIS</strong>
      </header>
      <section className="registration-blue-panel">
        {step !== 1 && <h1>{STEP_TITLES[step]}</h1>}
        <div className="registration-layout personal-layout">
        <div className="registration-card">
          {step === 0 && <label className="registration-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this form" aria-label="Search registration fields" /></label>}
        {step === 0 && (
          <div className="registration-grid">
            <div className="registration-photo-wrap">
              <label className="registration-photo-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  aria-label="Upload a profile photo"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    if (!["image/jpeg", "image/png"].includes(file.type)) {
                      setPhotoError("Upload a JPG or PNG image.");
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPhotoError("Image must be smaller than 5 MB.");
                      return;
                    }
                    setPhoto(URL.createObjectURL(file));
                    setFiles((current) => ({ ...current, photo: file }));
                    setErrors((current) => ({ ...current, photo: "" }));
                    setPhotoError("");
                  }}
                />
                {photo ? <><img src={photo} alt="Profile preview" /><span className="registration-photo-hover">Change</span></> : <span>Upload a<br />photo</span>}
              </label>
              {photo && <button type="button" className="registration-photo-remove" aria-label="Remove photo" onClick={() => { URL.revokeObjectURL(photo); setPhoto(""); setFiles((current) => ({ ...current, photo: null })); }}>×</button>}
              {photoError && <small role="alert">{photoError}</small>}
              {errors.photo && <small role="alert">{errors.photo}</small>}
            </div>
            {search.trim() ? ([...PERSONAL_FIELDS, ...ADDRESS_FIELDS, ...CONTACT_FIELDS].filter((field) => `${field[0]} ${field[1]}`.toLowerCase().includes(search.trim().toLowerCase())).length ? [...PERSONAL_FIELDS, ...ADDRESS_FIELDS, ...CONTACT_FIELDS].filter((field) => `${field[0]} ${field[1]}`.toLowerCase().includes(search.trim().toLowerCase())).map((field) => <Field key={field[0]} field={field} value={values[field[0]] || ""} error={errors[field[0]]} onChange={change} />) : <p className="registration-no-results">No matching fields found.</p>) : <><div id="personal-section" className="registration-personal-fields">{PERSONAL_FIELDS.map((field) => <Field key={field[0]} field={field} value={values[field[0]] || ""} error={errors[field[0]]} onChange={change} />)}
            <div className="registration-hours-block"><p className="registration-hours-hint">How many hours did you spend in paid work each week?</p><Field field={["workingHours", "Working hours per week", "number", true]} value={values.workingHours || ""} error={errors.workingHours} onChange={change} /><label className="registration-check"><input type="checkbox" checked={Boolean(values.civilServant)} onChange={(event) => change("civilServant", event.target.checked)} /> Are you a civil servant?</label></div>
            </div>
            <h2 id="address-section" className="registration-section-title">Address</h2>
            {ADDRESS_FIELDS.map((field) => <Field key={field[0]} field={field} value={values[field[0]] || ""} error={errors[field[0]]} onChange={change} />)}
            <div className="registration-warning"><b>!</b><span>Submit valid ID (ID card, passport, or driver’s license) to verify your address. Required for upcoming opportunities.</span></div>
            <label className="registration-address-upload">Drag and drop an address document here, or click to select<input type="file" accept="image/*,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) setFiles((current) => ({ ...current, addressDocument: file })); }} />{files.addressDocument && <small>{files.addressDocument.name}</small>}</label>
            <h2 id="contact-section" className="registration-section-title">Contact details <button type="button" onClick={() => change("additionalContact", true)} aria-label="Add another contact">+</button></h2>
            {CONTACT_FIELDS.map((field) => <Field key={field[0]} field={field} value={values[field[0]] || ""} error={errors[field[0]]} onChange={change} />)}
            </>}
          </div>
        )}

        {step === 1 && (
          <div className="registration-job-form">
            <h2 className="registration-job-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>Job information</h2>
            <Field field={JOB_FIELDS[0]} value={values.jobTitle || ""} error={errors.jobTitle} onChange={change} />
            <section className={`registration-country-section ${errors.targetCountries ? "has-error" : ""}`}>
              <div className="registration-country-heading"><strong>Target country</strong><span>Select at least one</span><b>{values.targetCountries?.length || 0} selected</b></div>
              <div className="registration-country-list">{TARGET_COUNTRIES.map((country) => <label className="registration-country-option" key={country}><input type="checkbox" checked={Boolean(values.targetCountries?.includes(country))} onChange={(event) => {
                const selected = new Set(values.targetCountries || []);
                if (event.target.checked) selected.add(country); else selected.delete(country);
                change("targetCountries", [...selected]);
                if (!event.target.checked) {
                  setValues((current) => { const next = { ...current }; delete next[`city_${country}`]; return next; });
                  setErrors((current) => { const next = { ...current }; delete next[`city_${country}`]; return next; });
                }
              }} /><span>{country}</span></label>)}</div>
              {errors.targetCountries && <small role="alert">{errors.targetCountries}</small>}
            </section>
            {(values.targetCountries || []).map((country) => <Field key={country} field={[`city_${country}`, `City or town in ${country}`, "select", true, COUNTRY_CITIES[country] || ["Other"]]} value={values[`city_${country}`] || ""} error={errors[`city_${country}`]} onChange={change} />)}
            {JOB_FIELDS.slice(1).map((field) => <Field key={field[0]} field={field} value={values[field[0]] || ""} error={errors[field[0]]} onChange={change} />)}
          </div>
        )}

        {step === 2 && (
          <div className="registration-grid registration-documents">
            <DocumentDropzone id="id-front-upload" title="ID card front *" description="Drop the front of your ID card here, or browse files" selectedFiles={files.idFront} error={errors.idFront} onSelect={(incoming) => saveDocuments("idFront", incoming)} onRemove={() => setFiles((current) => ({ ...current, idFront: null }))} />
            <DocumentDropzone id="id-back-upload" title="ID card back *" description="Drop the back of your ID card here, or browse files" selectedFiles={files.idBack} error={errors.idBack} onSelect={(incoming) => saveDocuments("idBack", incoming)} onRemove={() => setFiles((current) => ({ ...current, idBack: null }))} />
            <DocumentDropzone id="education-upload" title="Education certificates" description="Upload diplomas or certificates (optional)" multiple selectedFiles={files.educationCertificates} error={errors.educationCertificates} onSelect={(incoming) => saveDocuments("educationCertificates", incoming, true)} onRemove={(index) => setFiles((current) => ({ ...current, educationCertificates: (current.educationCertificates || []).filter((_, fileIndex) => fileIndex !== index) }))} />
          </div>
        )}

        {step === 3 && (
          <div className="registration-grid">
            <Field field={["monthlySalary", "Expected monthly salary", "number", true]} value={values.monthlySalary || ""} error={errors.monthlySalary} onChange={change} />
            <Field field={["salaryHours", "Working hours per week", "number", true]} value={values.salaryHours || ""} error={errors.salaryHours} onChange={change} />
            {[ ["accommodation", "Accommodation provided"], ["transport", "Transport provided"], ["food", "Food provided"] ].map(([name, label]) => (
              <Field key={name} field={[name, label, "select", true, ["Yes", "No"]]} value={values[name] || ""} error={errors[name]} onChange={change} />
            ))}
          </div>
        )}

        <footer className="registration-actions">
          {submissionError && <p className="registration-submit-error" role="alert">{submissionError}</p>}
          <button type="button" className="registration-secondary" onClick={previous} disabled={saving}>Back</button>
          <button type="button" className="registration-primary" onClick={next} disabled={saving}>{saving ? "Saving registration…" : step === 3 ? "Complete registration" : "Continue"}</button>
        </footer>
        </div>
        </div>
      </section>
    </main>
  );
}
