
                    variant="modern"
                      placeholder="-- Select City --"
                      options={CITY_OPTIONS[code] || []}
                      value={job.cities[code] || ""}
                      onChange={onCityChange(code)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="job-divider" />

        <div className="job-field" id="job-field-contractType">
          <label className="job-label" htmlFor="contractType">
            Contract Type *
          </label>
          <SelectField
            id="contractType"
            variant="modern"
            placeholder="Select Contract Type"
            options={CONTRACT_TYPES}
            value={job.contractType}
            onChange={onField("contractType")}
            error={errors.contractType}
          />
        </div>

        <div className="job-field" id="job-field-contractLength">
          <label className="job-label" htmlFor="contractLength">
            Contract Length *
          </label>
          <SelectField
            id="contractLength"
            variant="modern"
            placeholder="Select Length"
            options={CONTRACT_LENGTHS}
            value={job.contractLength}
            onChange={onField("contractLength")}
            error={errors.contractLength}
          />
        </div>

        <div className="job-divider" />

        <div className="job-actions">
          <button type="button" className="job-btn job-btn-back" onClick={onBack}>
            <ArrowLeftIcon />
            Back
          </button>
          <button type="button" className="job-btn job-btn-next" onClick={onNext}>
            Next Section
            <ArrowRightIcon />
          </button>
        </div>
      </main>

      <footer className="job-footer">
        Official Employment Agreement Platform &copy; {new Date().getFullYear()}
      </footer>
      <div className="job-tricolor" />
    </>
  );
}

const initialFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  amSom: "",
  amFatherName: "",
  amGrandfatherName: "",
  gender: null,
  birthDate: "",
  maritialStatus: "",
  disablity: "",
  nationality: "",
  workingHours: "",
  civilServant: false,
  region: "",
  city: "",
  kebele: "",
  houseNumber: "",
  residence: "",
  contactType: "",
  phoneNumber: "",
  email: "",
  poBox: "",
};

const REQUIRED_FIELDS = [
  ["firstName", "First Name"],
  ["middleName", "Middle Name"],
  ["lastName", "Last Name"],
  ["amSom", "ስም"],
  ["amFatherName", "የአባት ስም"],
  ["amGrandfatherName", "የአያት ስም"],
  ["gender", "Gender"],
  ["birthDate", "Birth Date"],
  ["maritialStatus", "Marital Status"],
  ["disablity", "Disability"],
  ["nationality", "Nationality"],
  ["workingHours", "Working Hours"],
  ["region", "Region"],
  ["city", "City"],
  ["kebele", "Kebele"],
  ["houseNumber", "House Number"],
  ["residence", "Residence"],
  ["contactType", "Contact Type"],
  ["poBox", "P.O. Box"],
];

// on-screen order of the fields (used to scroll to the first one with an error)
const FIELD_ORDER = [
  ...REQUIRED_FIELDS.map(([key]) => key).filter((key) => key !== "poBox"),
  "phoneNumber",
  "email",
  "poBox",
];

export default function ELMISRegistrationForm({ onComplete }) {
  const [form, setForm] = useState(initialFormData);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = General Information, 2 = Job Information
  const [job, setJob] = useState(initialJob);
  const [jobErrors, setJobErrors] = useState({});
  const [documents, setDocuments] = useState(initialDocuments);
  const [documentErrors, setDocumentErrors] = useState({});
  const [salary, setSalary] = useState(initialSalary);
  const [salaryErrors, setSalaryErrors] = useState({});
  const [toast, setToast] = useState("");

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  // strips non-digit characters as the user types - used for number-only fields
  const handleNumericChange = (key) => (val) => set(key)(val.replace(/\D/g, ""));

  const validatePhone = (digits) => {
    if (!digits) return "Phone number is required";
    if (digits[0] !== "9") return "Phone number must start with 9";
    if (digits.length < 9) return "Phone number must be 9 digits";
    return "";
  };

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return "Email is required";
    if (!emailRegex.test(val)) return "Enter a valid email address";
    return "";
  };

  const handlePhoneChange = (val) => {
    // digits only, hard-capped at 9 characters - anything typed past that is dropped
    const digits = val.replace(/\D/g, "").slice(0, 9);
    set("phoneNumber")(digits);
    setErrors((e) => ({ ...e, phoneNumber: digits ? validatePhone(digits) : "" }));
  };

  const handleEmailChange = (val) => {
    set("email")(val);
    setErrors((e) => ({ ...e, email: val ? validateEmail(val) : "" }));
  };

  const scrollToField = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleNextClick = () => {
    const newErrors = {};
    REQUIRED_FIELDS.forEach(([key, label]) => {
      newErrors[key] = form[key] ? "" : `${label} is required`;
    });
    newErrors.phoneNumber = validatePhone(form.phoneNumber);
    newErrors.email = validateEmail(form.email);

    setErrors(newErrors);
    const firstKey = FIELD_ORDER.find((key) => newErrors[key]);
    if (firstKey) {
      scrollToField(firstKey);
      return;
    }
    setShowConfirm(true);
  };

  // ---- step 2 (Job Information) ----
  const setJobField = (key) => (val) => {
    setJob((j) => ({ ...j, [key]: val }));
    setJobErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const toggleCountry = (code) => {
    setJob((j) => {
      if (j.countries.includes(code)) {
        const cities = { ...j.cities };
        delete cities[code];
        return { ...j, countries: j.countries.filter((c) => c !== code), cities };
      }
      if (j.countries.length >= COUNTRY_LIMIT) return j;
      return { ...j, countries: [...j.countries, code], cities: { ...j.cities, [code]: "" } };
    });
    setJobErrors((e) => (e.countries ? { ...e, countries: "" } : e));
  };

  // preferred city is scoped per selected country, so it lives in job.cities[countryCode]
  const setJobCity = (code) => (val) => {
    setJob((j) => ({ ...j, cities: { ...j.cities, [code]: val } }));
  };

  const handleJobNext = () => {
    const errs = {};
    if (!job.jobTitle) errs.jobTitle = "Job Title is required";
    if (job.countries.length === 0) {
      errs.countries = "Please select at least 1 country";
    }
    if (!job.contractType) errs.contractType = "Contract Type is required";
    if (!job.contractLength) errs.contractLength = "Contract Length is required";

    setJobErrors(errs);
    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      scrollToField(`job-field-${firstKey}`);
      return;
    }
    setStep(3);
  };

  // ---- step 3 (Personal Documents) ----
  const handleDocumentChange = (key) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;

    if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
      setDocumentErrors((d) => ({ ...d, [key]: "Only JPG, PNG or PDF files are allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setDocumentErrors((d) => ({ ...d, [key]: "File must be smaller than 5MB" }));
      return;
    }

    setDocuments((docs) => {
      const prev = docs[key];
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return {
        ...docs,
        [key]: {
          file,
          name: file.name,
          type: file.type,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        },
      };
    });
    setDocumentErrors((d) => (d[key] ? { ...d, [key]: "" } : d));
  };

  const handleRemoveDocument = (key) => () => {
    setDocuments((docs) => {
      const prev = docs[key];
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { ...docs, [key]: null };
    });
  };

  const handleDocumentsNext = () => {
    const errs = {};
    if (!documents.idCardFront) errs.idCardFront = "ID Card Front is required";
    if (!documents.idCardBack) errs.idCardBack = "ID Card Back is required";

    setDocumentErrors(errs);
    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      scrollToField(firstKey);
      return;
    }
    setStep(4);
  };

  // ---- step 4 (Salary & Benefits) ----
  const setSalaryField = (key) => (val) => {
    setSalary((sBenefits) => ({ ...sBenefits, [key]: val }));
    setSalaryErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const handleSalaryMoneyChange = (val) => setSalaryField("monthlySalary")(val.replace(/[^\d.]/g, ""));
  const handleSalaryHoursChange = (val) => setSalaryField("workingHours")(val.replace(/\D/g, ""));
  const handleSalaryRadio = (key) => (val) => setSalaryField(key)(val);

  const handleFinalSubmit = () => {
    const errs = {};
    if (!salary.monthlySalary) errs.monthlySalary = "Monthly Salary is required";
    if (!salary.workingHours) errs.workingHours = "Working Hours is required";
    if (!salary.accommodation) errs.accommodation = "Please select an option";
    if (!salary.transport) errs.transport = "Please select an option";
    if (!salary.food) errs.food = "Please select an option";

    setSalaryErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setToast("Application submitted");
    if (onComplete) onComplete({ ...form, ...job, documents, salary });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    // reset so choosing the same file again still fires this handler
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5MB");
      return;
    }

    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPhotoError("");
  };

  const handleRemovePhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoError("");
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = showConfirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  return (
    <div className={`elmis-page ${step > 1 ? "is-job" : ""}`}>
      <style>{css}</style>

      <header className="elmis-header">
        <Logo />
        <button type="button" className="elmis-logout-btn" aria-label="Log out">
          <LogoutIcon />
        </button>
      </header>

      {step === 1 ? (
        <div className="elmis-blue-panel">
          <h2 className="elmis-section-title">General Information</h2>

          <SelectField
            id="topSelect"
            placeholder="Select..."
            options={["Option A", "Option B", "Option C"]}
          />

          <div className="elmis-card">
            <div className="elmis-card-top">
              <button type="button" className="elmis-register-btn">
                Register with National Id
              </button>
            </div>

            <div className="elmis-photo-wrap">
              <label className="elmis-photo-upload">
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                {photo ? (
                  <>
                    <img src={photo} alt="Uploaded" className="elmis-photo-preview" />
                    <span className="elmis-photo-hover">Change</span>
                  </>
                ) : (
                  <span>Upload a photo</span>
                )}
              </label>
              {photo && (
                <button
                  type="button"
                  className="elmis-photo-remove"
                  onClick={handleRemovePhoto}
                  aria-label="Remove photo"
                >
                  &times;
                </button>
              )}
            </div>
            {photoError && <span className="elmis-error-text">{photoError}</span>}

            <FloatingInput
              id="firstName"
              label="First Name"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
            />
            <FloatingInput
              id="middleName"
              label="Middle Name"
              value={form.middleName}
              onChange={set("middleName")}
              error={errors.middleName}
            />
            <FloatingInput
              id="lastName"
              label="Last Name"
              value={form.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
            />

            <FloatingInput id="amSom" label="ስም" value={form.amSom} onChange={set("amSom")} error={errors.amSom} />
            <FloatingInput
              id="amFatherName"
              label="የአባት ስም"
              value={form.amFatherName}
              onChange={set("amFatherName")}
              error={errors.amFatherName}
            />
            <FloatingInput
              id="amGrandfatherName"
              label="የአያት ስም"
              value={form.amGrandfatherName}
              onChange={set("amGrandfatherName")}
              error={errors.amGrandfatherName}
            />

            <div id="gender" className={`elmis-gender-row ${errors.gender ? "has-error" : ""}`}>
              <button
                type="button"
                className={`elmis-gender-option ${form.gender === "male" ? "active" : ""}`}
                onClick={() => set("gender")("male")}
              >
                Male
              </button>
              <button
                type="button"
                className={`elmis-gender-option ${form.gender === "female" ? "active" : ""}`}
                onClick={() => set("gender")("female")}
              >
                Female
              </button>
            </div>
            {errors.gender ? (
              <span className="elmis-error-text" style={{ marginBottom: 18 }}>
                {errors.gender}
              </span>
            ) : (
              <p className="elmis-gender-caption">Select your Gender</p>
            )}

            <FloatingInput
              id="birthDate"
              label="Birth Date"
              type="date"
              value={form.birthDate}
              onChange={set("birthDate")}
              error={errors.birthDate}
            />

            <SelectField
              id="maritialStatus"
              placeholder="Maritial Status"
              options={["Single", "Married", "Divorced", "Widowed"]}
              value={form.maritialStatus}
              onChange={set("maritialStatus")}
              error={errors.maritialStatus}
            />
            <SelectField
              id="disablity"
              placeholder="Disablity"
              options={["None", "Visual", "Hearing", "Physical", "Other"]}
              value={form.disablity}
              onChange={set("disablity")}
              error={errors.disablity}
            />
            <SelectField
              id="nationality"
              placeholder="Nationality"
              options={["Ethiopian", "Other"]}
              value={form.nationality}
              onChange={set("nationality")}
              error={errors.nationality}
            />

            <div className="elmis-half-row">
              <div className="elmis-half-col">
                <p className="elmis-hint-text">
                  How many hours did you spend in your job per week? (Total
                  hours worked for all paid job or productive activity)
                </p>
                <FloatingInput
                  id="workingHours"
                  label="Working Hours"
                  type="number"
                  value={form.workingHours}
                  onChange={set("workingHours")}
                  error={errors.workingHours}
                />

                <label className="elmis-checkbox-row">
                  <input
                    type="checkbox"
                    className="elmis-checkbox"
                    checked={form.civilServant}
                    onChange={(e) => set("civilServant")(e.target.checked)}
                  />
                  <span>Are you a civil servant?</span>
                </label>
              </div>
            </div>

            <h3 className="elmis-subsection-title">Address</h3>

            <FloatingInput id="region" label="Region" value={form.region} onChange={set("region")} error={errors.region} />
            <FloatingInput id="city" label="City" value={form.city} onChange={set("city")} error={errors.city} />

            <FloatingInput
              id="kebele"
              label="Kebele"
              value={form.kebele}
              onChange={handleNumericChange("kebele")}
              error={errors.kebele}
              inputMode="numeric"
            />
            <FloatingInput
              id="houseNumber"
              label="House Number"
              value={form.houseNumber}
              onChange={handleNumericChange("houseNumber")}
              error={errors.houseNumber}
              inputMode="numeric"
            />

            <SelectField
              id="residence"
              placeholder="Residence"
              options={["Owned", "Rented", "Other"]}
              value={form.residence}
              onChange={set("residence")}
              error={errors.residence}
            />

            <div className="elmis-warning">
              <span className="elmis-warning-icon">!</span>
              <p>
                Submit valid ID (e.g., ID card, passport, driver's license) to
                verify address. Required for any upcoming opportunities.
              </p>
            </div>

            <div className="elmis-dropzone">
              Drag 'n' drop some files here, or click to select files
            </div>

            <div className="elmis-subsection-row">
              <h3 className="elmis-subsection-title">Contact Details</h3>
              <button type="button" className="elmis-add-btn" aria-label="Add another contact">
                +
              </button>
            </div>

            <SelectField
              id="contactType"
              placeholder="Contact Type"
              options={["Mobile", "Home", "Work", "Emergency"]}
              value={form.contactType}
              onChange={set("contactType")}
              error={errors.contactType}
            />
            <PhoneField id="phoneNumber" value={form.phoneNumber} onChange={handlePhoneChange} error={errors.phoneNumber} />
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              error={errors.email}
            />
            <FloatingInput
              id="poBox"
              label="P.O. BOX"
              value={form.poBox}
              onChange={handleNumericChange("poBox")}
              error={errors.poBox}
              inputMode="numeric"
            />

            <div className="elmis-next-row">
              <button type="button" className="elmis-next-btn" onClick={handleNextClick}>
                Next
              </button>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        <JobInformation
          job={job}
          errors={jobErrors}
          onField={setJobField}
          onToggleCountry={toggleCountry}
          onCityChange={setJobCity}
          onBack={() => setStep(1)}
          onNext={handleJobNext}
        />
      ) : step === 3 ? (
        <PersonalDocuments
          documents={documents}
          errors={documentErrors}
          onChange={handleDocumentChange}
          onRemove={handleRemoveDocument}
          onBack={() => setStep(2)}
          onNext={handleDocumentsNext}
        />
      ) : (
        <SalaryBenefits
          salary={salary}
          errors={salaryErrors}
          onMoneyChange={handleSalaryMoneyChange}
          onHoursChange={handleSalaryHoursChange}
          onRadio={handleSalaryRadio}
          onBack={() => setStep(3)}
          onNext={handleFinalSubmit}
        />
      )}

      {showConfirm && (
        <ConfirmationModal
          data={form}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            setStep(2);
          }}
        />
      )}

      {toast && (
        <div className="job-toast" role="status">
          &#10003; {toast}
        </div>
      )}
    </div>
  );
}

const css = `
  .elmis-page {
    width: 100%;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    min-height: 100vh;
  }

  .elmis-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #ffffff;
    border-bottom: 1px solid #eef0f3;
  }

  .elmis-logo { display: flex; align-items: center; gap: 6px; }
  .elmis-logo-icon { height: 42px; width: auto; display: block; flex-shrink: 0; }
  .elmis-logo-text {
    font-size: 20px;
    font-weight: 800;
    color: #2e3192;
    letter-spacing: 0.2px;
  }

  .elmis-logout-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
  }

  .elmis-blue-panel {
    background: #3170b5;
    padding: 16px 12px 22px;
    border-radius: 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .elmis-section-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px;
  }

  .elmis-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 14px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .elmis-card-top {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 18px;
  }

  .elmis-register-btn {
    background: #3170b5;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 9px 14px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .elmis-register-btn:hover { background: #285f96; }

  .elmis-photo-wrap { position: relative; width: 88px; margin: 0 0 20px 0; }
  .elmis-photo-upload {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 1.5px dashed #4a6d93;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: 0;
    cursor: pointer;
    overflow: hidden;
    color: #3170b5;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
    padding: 0 8px;
  }
  .elmis-photo-preview { width: 100%; height: 100%; object-fit: cover; }
  .elmis-photo-hover {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(17, 24, 39, 0.5);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .elmis-photo-upload:hover .elmis-photo-hover,
  .elmis-photo-upload:focus-within .elmis-photo-hover { opacity: 1; }
  .elmis-photo-remove {
    position: absolute;
    top: -2px;                                           right: -2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #e0524f;                                 color: #ffffff;
    border: 2px solid #ffffff;
    font-size: 14px;                                     line-height: 1;
    display: flex;                                       align-items: center;
    justify-content: center;                             cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);         }
  .elmis-photo-remove:hover { background: #c8433f; } 
  .elmis-field { position: relative; margin-bottom: 16px; }
  .elmis-field label {                                   position: absolute;
    top: -8px;                                           left: 10px;
    background: #ffffff;                                 padding: 0 5px;
    font-size: 12px;                                     color: #444;
  }
  .elmis-field input {                                   width: 100%;
    box-sizing: border-box;                              padding: 10px 10px;
    border: 1.2px solid #4a6d93;
    border-radius: 7px;
    font-size: 14px;
    color: #222;
    background: #ffffff;
  }                                                    .elmis-field input:focus {
    outline: none;                                       border-color: #2e3192;
  }
  .elmis-field input.has-error {
    border-color: #e0524f;
  }
  .elmis-error-text {
    display: block;
    color: #e0524f;                                      font-size: 12px;
    margin-top: 4px;
    margin-bottom: 6px;                                }

  .elmis-gender-row {
    display: flex;
    box-sizing: border-box;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  .elmis-gender-option {
    flex: 1;
    padding: 11px 0;
    background: #f1f1f1;
    border: none;
    font-size: 14px;
    color: #333;
    cursor: pointer;
  }
  .elmis-gender-option.active { background: #3170b5; color: #ffffff; }
  .elmis-gender-row.has-error { border: 1.5px solid #e0524f; }
  .elmis-gender-caption {
    font-size: 12px;
    color: #555;
    margin: 3px 0 18px 2px;
  }

  .elmis-dropdown {
    position: relative;
    margin-bottom: 14px;
  }
  .elmis-dropdown-box { position: relative; }
  .elmis-dropdown-trigger {                              appearance: none;
    -webkit-appearance: none;
    width: 100%;
    box-sizing: border-box;
    display: block;
    padding: 10px 38px 10px 10px;
    border: 1.2px solid #ccc;
    border-radius: 7px;
    font-size: 14px;
    font-family: inherit;
    text-align: left;
    background: #ffffff;
    cursor: pointer;                                   }
  .elmis-dropdown-trigger:focus {
    outline: 2px solid #a8c8ea;
    outline-offset: 1px;
  }
  .elmis-dropdown-placeholder { color: #cccccc; }
  .elmis-dropdown-value { color: #222222; }
  .elmis-dropdown.open .elmis-dropdown-trigger {
    border-color: #3170b5;
  }
  .elmis-dropdown-divider {                              position: absolute;
    right: 32px;
    top: 7px;
    bottom: 7px;                                         width: 1px;
    background: #ddd;
  }
  .elmis-dropdown-chevron {
    position: absolute;
    right: 10px;                                         top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex;                                     }
  .elmis-dropdown-chevron svg { transition: transform 0.16s ease; }
  .elmis-dropdown.open .elmis-dropdown-chevron svg { transform: rotate(180deg); }
  .elmis-dropdown.disabled .elmis-dropdown-trigger {
    background: #f0f0f0;
    color: #aaa;
    cursor: not-allowed;
  }
  .elmis-dropdown.has-error .elmis-dropdown-trigger {                                                         border-color: #e0524f;
  }

  .elmis-dropdown-panel {                                position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid #e6e9ed;                           border-radius: 10px;                                 box-shadow: 0 12px 28px rgba(20, 45, 80, 0.16), 0 2px 8px rgba(20, 45, 80, 0.08);
    padding: 6px;
    max-height: 230px;
    overflow-y: auto;
    z-index: 30;
    animation: elmisDropIn 0.15s ease;                 }
  @keyframes elmisDropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }       }
  .elmis-dropdown-panel::-webkit-scrollbar { width: 6px; }
  .elmis-dropdown-panel::-webkit-scrollbar-thumb { background: #cfd8e3; border-radius: 3px; }
  .elmis-dropdown-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 14px;
    color: #333333;
    cursor: pointer;
    transition: background 0.12s ease;
  }
  .elmis-dropdown-option:hover { background: #eef4fa; }                                                     .elmis-dropdown-option.selected {                      background: #e8f0fa;
    color: #2e3192;
    font-weight: 600;                                  }                                                  
  .elmis-half-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }
  .elmis-half-col { width: 55%; min-width: 200px; }
  .elmis-hint-text {
    font-size: 13px;
    color: #767676;
    line-height: 1.5;
    margin: 0 0 10px;                                  }

  .elmis-checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 24px 0 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: #222;                                       }
  .elmis-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid #cfd0d4;
    background: #f3f4f6;                                 accent-color: #3170b5;
    margin: 0;
  }

  .elmis-subsection-title {
    color: #5f87ab;
    font-size: 16px;
    font-weight: 700;
    margin: 22px 0 12px;
  }
                                                       .elmis-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 14px 0 16px;
  }
  .elmis-warning-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f2676a;
    color: #ffffff;                                      font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .elmis-warning p {                                     margin: 0;
    color: #f2676a;                                      font-size: 13px;
    line-height: 1.5;
    text-align: justify;
  }

  .elmis-dropzone {                                      border: 1.5px dashed #4a6d93;
    border-radius: 8px;                                  padding: 20px 12px;
    text-align: center;                                  color: #9aa0a6;
    font-size: 13px;
  }

  .elmis-subsection-row {
    display: flex;
    align-items: center;                                 justify-content: space-between;
    margin: 22px 0 12px;
  }
  .elmis-subsection-row .elmis-subsection-title { margin: 0; }
  .elmis-add-btn {                                       width: 26px;
    height: 26px;
    border-radius: 50%;                                  background: #111111;
    color: #ffffff;                                      border: none;
    font-size: 16px;                                     line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;                             cursor: pointer;
    flex-shrink: 0;
  }                                                  
  .elmis-phone-field {
    display: flex;
    align-items: center;
    box-sizing: border-box;                              border: 1.2px solid #4a6d93;
    border-radius: 7px;
    background: #ffffff;                               }
  .elmis-phone-field:focus-within { border-color: #2e3192; }
  .elmis-phone-field.has-error { border-color: #e0524f; }
  .elmis-phone-code {
    padding: 10px 12px;
    font-size: 14px;                                     font-weight: 600;
    color: #222222;
    white-space: nowrap;                               }
  .elmis-phone-divider {                                 width: 1px;
    align-self: stretch;                                 margin: 8px 0;
    background: #ddd;                                  }
  .elmis-phone-field input {
    flex: 1;
    min-width: 0;
    border: none;                                        outline: none;
    padding: 10px 12px;
    font-size: 14px;
    color: #222222;                                      background: transparent;
  }
  .elmis-phone-field input::placeholder { color: #cccccc; }

  .elmis-next-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 26px;
  }                                                    .elmis-next-btn {
    background: #3170b5;                                 color: #ffffff;
    border: none;                                        border-radius: 8px;
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
  .elmis-next-btn:hover { background: #285f96; }

  .elmis-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 30, 55, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 14px;
    z-index: 200;
  }
  .elmis-modal-card {
    background: #ffffff;                                 border-radius: 14px;
    padding: 24px 20px 20px;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    animation: elmisDropIn 0.18s ease;
  }
  .elmis-modal-title {
    color: #2f5fa8;
    font-size: 21px;
    font-weight: 800;
    text-align: center;
    margin: 0 0 16px;
    line-height: 1.3;
  }
  .elmis-modal-divider {
    height: 1px;
    background: #e8e8e8;
    margin: 0 0 18px;
  }                                                    .elmis-modal-section-label {
    color: #8a8a8a;                                      font-size: 14px;
    font-weight: 700;
    margin: 0 0 8px;                                   }
  .elmis-modal-box {
    background: #eef0f2;                                 border-radius: 8px;
    padding: 14px;                                       margin-bottom: 18px;
  }                                                    .elmis-modal-grid {
    display: grid;                                       grid-template-columns: 1fr 1fr;
    gap: 4px 10px;                                     }
  .elmis-confirm-row {                                   margin-bottom: 8px;
    font-size: 13.5px;
    line-height: 1.4;
  }                                                    .elmis-confirm-row:last-child { margin-bottom: 0; }
  .elmis-confirm-label { color: #8a8a8a; }
  .elmis-confirm-value { color: #2757a0; font-weight: 700; }
  .elmis-modal-contact-type {
    color: #2757a0;
    font-weight: 700;
    font-size: 13.5px;
    margin: 0 0 10px;
  }                                                    .elmis-modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 6px;
  }
  .elmis-modal-cancel {
    flex: 1;                                             background: #ffffff;
    border: 1.5px solid #3170b5;
    color: #3170b5;                                      border-radius: 8px;
    padding: 12px 0;                                     font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }
  .elmis-modal-confirm {
    flex: 1;
    background: #3170b5;
    border: none;
    color: #ffffff;
    border-radius: 8px;
    padding: 12px 0;                                     font-size: 15px;
    font-weight: 700;
    cursor: pointer;
  }                                                    .elmis-modal-cancel:hover { background: #f3f8fd; }
  .elmis-modal-confirm:hover { background: #285f96; }

  /* ================= Step 2: Job Information ================= */
  .elmis-page.is-job { display: flex; flex-direction: column; }
  .job-main {
    flex: 1;
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    box-sizing: border-box;                              padding: 20px 12px 8px;
    animation: elmisFadeUp 0.28s ease both;
  }
  @keyframes elmisFadeUp {
    from { opacity: 0; transform: translateY(10px); }                                                         to { opacity: 1; transform: translateY(0); }
  }
  .job-head { display: flex; align-items: center; gap: 10px; color: #2563eb; }
  .job-head svg { width: 22px; height: 22px; flex-shrink: 0; }
  .job-head h2 {
    margin: 0;
    font-size: 18px;                                     font-weight: 700;
    color: #1f2937;                                      letter-spacing: -0.01em;
  }                                                    .job-divider { height: 1px; background: #e8ebf0; margin: 14px 0 18px; }                                   .job-field { margin-bottom: 20px; }
  .job-field .elmis-dropdown { margin-bottom: 0; }
  .job-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }                                                    .job-count { font-weight: 400; color: #6b7280; margin-left: 6px; transition: color 0.15s; }               .job-count.done { color: #2563eb; font-weight: 600; }

  /* modern select variant (used on this step) */
  .elmis-dropdown.modern .elmis-dropdown-trigger {
    padding: 11px 40px 11px 14px;
    border: 1px solid #e3e6eb;                           border-radius: 14px;
    font-size: 14px;                                     box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    transition: border-color 0.15s, box-shadow 0.15s;
  }                                                    .elmis-dropdown.modern .elmis-dropdown-trigger:hover { border-color: #cfd5dd; }
  .elmis-dropdown.modern .elmis-dropdown-trigger:focus,
  .elmis-dropdown.modern.open .elmis-dropdown-trigger {
    outline: none;                                       border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);     }
  .elmis-dropdown.modern .elmis-dropdown-placeholder { color: #6b7280; }
  .elmis-dropdown.modern .elmis-dropdown-value { color: #111827; }
  .elmis-dropdown.modern .elmis-dropdown-divider { display: none; }                                         .elmis-dropdown.modern .elmis-dropdown-chevron { right: 14px; }
  .elmis-dropdown.modern .elmis-dropdown-panel { border-radius: 14px; }
  .elmis-dropdown.modern .elmis-dropdown-option { border-radius: 10px; }
  .elmis-dropdown.modern .elmis-dropdown-option:hover { background: #f3f6fd; }
  .elmis-dropdown.modern .elmis-dropdown-option.selected { background: #eff4ff; color: #2563eb; }
  .elmis-dropdown.modern.has-error .elmis-dropdown-trigger { border-color: #ef4444; }
  .elmis-dropdown.modern.has-error .elmis-dropdown-trigger:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14); }

  /* target countries card */                          .job-countries {
    display: grid;                                       grid-template-columns: 1fr 1fr;
    gap: 2px 4px;
    background: #f8fafc;
    border: 1px solid #edf0f4;
    border-radius: 18px;
    padding: 8px 8px;
    transition: border-color 0.15s, background 0.15s;                                                       }
  .job-countries.has-error { border-color: #f87171; background: #fffafa; }                                
  .job-label.pin-label { display: flex; align-items: center; gap: 6px; }
  .job-label.pin-label svg { width: 15px; height: 15px; color: #6b7280; flex-shrink: 0; }

  .pref-cities { display: flex; flex-direction: column; gap: 14px; }
  .pref-city-card {
    background: #ffffff;
    border: 1px solid #e3e6eb;
    border-radius: 16px;
    padding: 14px;
  }
  .pref-city-head {
    display: flex;
    align-items: center;
    justify-content: space-between;                      margin-bottom: 10px;
  }
  .pref-city-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;                                    color: #2563eb;
    font-size: 14.5px;                                 }
  .pref-city-name .job-flag { width: 24px; height: 16px; }
  .pref-city-head svg { width: 18px; height: 18px; color: #93c5fd; flex-shrink: 0; }

  /* ---- Personal Documents: dashed upload boxes ---- */
  .doc-field { margin-bottom: 22px; }
  .doc-box {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    border: 1.5px dashed #d7dbe3;                        border-radius: 16px;
    background: #f8fafc;
    padding: 34px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .doc-box:hover { border-color: #93c5fd; background: #f4f8ff; }
  .doc-box:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.3); outline-offset: 2px; }
  .doc-box.has-error { border-color: #f87171; background: #fffafa; }                                        .doc-box.filled { border-style: solid; border-color: #bfdbfe; background: #f8fbff; }
  .doc-icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #e9edf2;
    color: #8b93a1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .doc-icon-circle svg { width: 24px; height: 24px; }
  .doc-box.filled .doc-icon-circle { background: #dbeafe; color: #2563eb; }
  .doc-thumb {                                           width: 64px;
    height: 64px;                                        border-radius: 12px;
    object-fit: cover;
    margin-bottom: 14px;
  }
  .doc-text {
    font-weight: 700;
    color: #1f2937;
    font-size: 14.5px;                                   margin-bottom: 4px;                                  max-width: 100%;
    overflow-wrap: anywhere;
  }
  .doc-hint { font-size: 12px; color: #9aa1ac; }
  .doc-remove {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;                                        border-radius: 50%;                                  background: #e0524f;
    color: #ffffff;
    border: 2px solid #ffffff;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);          }                                                    .doc-remove:hover { background: #c8433f; }
                                                       /* ---- Salary & Benefits ---- */
  .prefix-field {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    border: 1px solid #e3e6eb;
    border-radius: 14px;
    padding: 11px 14px;                                  background: #ffffff;                                 transition: border-color 0.15s, box-shadow 0.15s;
  }
  .prefix-field:focus-within {                           border-color: #2563eb;                               box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }
  .prefix-field.has-error { border-color: #ef4444; }
  .prefix-icon { color: #9aa1ac; display: flex; flex-shrink: 0; }
  .prefix-icon svg { width: 18px; height: 18px; }
  .prefix-field input {
    flex: 1;                                             min-width: 0;                                        border: none;
    outline: none;                                       font-size: 14.5px;
    font-family: inherit;
    background: transparent;
    color: #111827;
  }

  .radio-row { display: flex; gap: 26px; }
  .radio-option {
    position: relative;
    display: flex;
    align-items: center;                                 gap: 8px;                                            font-size: 14.5px;
    color: #1f2937;                                      cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .radio-option input { position: absolute; opacity: 0; width: 0; height: 0; }
  .radio-dot {
    width: 19px;
    height: 19px;
    border-radius: 50%;
    border: 1.5px solid #9ca3af;                         display: inline-flex;                                align-items: center;
    justify-content: center;
    flex-shrink: 0;                                      transition: border-color 0.15s;
  }
  .radio-dot::after {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #2563eb;                                 transform: scale(0);                                 transition: transform 0.12s ease;
  }
  .radio-option input:checked + .radio-dot { border-color: #2563eb; }
  .radio-option input:checked + .radio-dot::after { transform: scale(1); }
  .radio-option input:focus-visible + .radio-dot { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.28); }         .job-country {
    position: relative;                                  display: flex;
    align-items: center;                                 gap: 8px;
    padding: 9px 6px;
    border-radius: 12px;                                 font-size: 13px;
    line-height: 1.25;                                   color: #4b5563;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .job-country:hover { background: #eef2f9; }
  .job-country.checked { background: #eaf1ff; color: #1f2937; font-weight: 500; }
  .job-country.disabled { opacity: 0.45; cursor: not-allowed; }
  .job-country.disabled:hover { background: transparent; }
  .job-country input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .job-check {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid #9ca3af;
    background: #ffffff;                                 color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
  }
  .job-check svg {
    width: 12px;
    height: 12px;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.12s, transform 0.14s;
  }
  .job-country input:checked + .job-check { background: #2563eb; border-color: #2563eb; }
  .job-country input:checked + .job-check svg { opacity: 1; transform: scale(1); }
  .job-country input:focus-visible + .job-check { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3); }
  .job-flag {
    flex-shrink: 0;                                      display: block;
    width: 26px;
    height: 18px;                                        line-height: 0;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12);
  }
  .job-flag svg { display: block; width: 100%; height: 100%; }
  .job-country-name { min-width: 0; }
                                                       /* buttons + footer */
  .job-actions { display: flex; flex-direction: column; gap: 10px; }
  .job-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    padding: 13px 16px;
    border: none;
    border-radius: 14px;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .job-btn svg { width: 18px; height: 18px; transition: transform 0.15s; }
  .job-btn:active { transform: scale(0.99); }
  .job-btn:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.35); outline-offset: 2px; }
  .job-btn-back { background: #f3f4f6; color: #374151; }
  .job-btn-back:hover { background: #e9ecf0; }
  .job-btn-back:hover svg { transform: translateX(-3px); }
  .job-btn-next {
    background: #2563eb;
    color: #ffffff;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28);
  }
  .job-btn-next:hover { background: #1d4ed8; box-shadow: 0 10px 24px rgba(37, 99, 235, 0.34); }
  .job-btn-next:hover svg { transform: translateX(3px); }
  .job-footer {                                          text-align: center;
    color: #6b7280;
    font-size: 12.5px;
    letter-spacing: 0.01em;
    padding: 22px 12px 16px;
  }
  .job-tricolor {
    height: 4px;                                         background: linear-gradient(90deg, #078930 0%, #fcdd09 50%, #da121a 100%);
  }
  .job-toast {
    position: fixed;                                     left: 50%;
    bottom: 28px;
    transform: translateX(-50%);
    background: #111827;
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 999px;                                box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
    white-space: nowrap;
    z-index: 300;
    animation: elmisToastIn 0.22s ease both;
  }
  @keyframes elmisToastIn {
    from { opacity: 0; transform: translate(-50%, 10px); }                                                    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

// E-LMIS logo mark (gear + bar chart), embedded so this file needs no extra assets.                      // Same image is also saved as elmis-logo.png if you would rather import it as a file.
const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALEAAACoCAMAAACYLv+kAAAAkFBMVEX///////7//v3+///+/v/9/v/9/v78/f76+vby9/vX5ezl03aix+RoraZfod1Vm9xQmd5Pmt5Pmd5Pmd1PmdxOmt5Omd1RmNtPmN5PmN1PmNxOmN5OmN1OmNxNmN1NmNxMmN1Ol9xNl91Nl9xNl9tMl9xLlttGlNtzd6cbaa4UZKoTY6kSYqkRYqkQYKgEWaQcCowWAAAh30lEQVR42uV9DX+iyPK1Gd9G1kVCuyjYDUEEFo36/b/dc051o6iYSWb/s3fn97i5M3tzYzwUp6pOvTR3MPj/7TWaTKb2NRkNJtP/Nlai/J2M68DOPG8+n/u+v6rrppoPBsObn+JVDf8rgGfAWTVNczq3L/zb4hbgyMEe/hcAe41FeXo/7Pk68K/mPB/ccBk3wBv+F0CPRrPm3BDo++kI0Kd39zo1M2dY8GMy9XlNje9N/+egp4P5uTkc3o/EezodLVz8t/ezdzGy/BCuqQN68j8kRX3eHwWtID6+409Aft9facH7cMJFkS2nFvTofxT/hoMpwFwAO9g08+G8ahHTxLiqg7xo6TNADy6c+ZdpPKD5jscbzEKMw6mZ2gAnJrbfOxzfgXx/gKXr+eBfYsZoeBcpDqfjxbQSLA7ieGCGZzFZEwtgsEXugFj6Lpj8Itbee8104J3fGSFgujYcn/Yw85XIo4k1MRiBqzhaxzwd9wwmk18fGJDapoPOB4n9xKaH075pat+fzxtCPgGxL29wJj68C+AjwMM/8dr/eiPDu2c+Upt/DVtXxIdz7c1curas3Z/roQijWXPcv4vT7fcuVhPz4Vz9Yhvjt88bprZz0420/nnP+32AxYYDUW+Md9b17CX47poQ2c7HK+j3c+uav4wRyFsnuNVhf7xCnlo8wHyeO4U5HVmI+F69AknmJ8vi/bmZV7hkXIqNKN2s+AviLlyMphMKwmlayNORGBQRq40MHaK8W0888haAEkiCUBf16fxuc/npV9p4MhnM9xYw3WdviQGaMoHsEWUPx4vnI+BRZJxcrNtbe4PWCxtlPP/kmN9MfhniKcmICHARDYA8s5FDaHy0pB1dk8q7o8Lh4FLH4f3kDScgOkA354P1zF/meYgRuPcHl8xosPdGIM99WPidIRZEGXalxvvd68BYNxm48OwQ+78quk2pgPfdj5fPa/yGvg9CMHAhVN3ED/dj9g8iPnrDqSPN+5F58Qni0f+Fz80P573IMnoMowWtTBVGksqdB+KL7hlMht5eqHq6MKIDj1lS4mF/BhlChvzTChmuL0msFTgQMnsB4RTE8f3+FktZYjMGf4hfhzNZfBNKnuQ8xPB/JPiHkgDaCAoDn8Hc/aFDkaP8s+/od7Fjfa35eCuuF9Qixm3xpveIxwPvr/mMf/+8hacELGISdxmmns/wgV3EhLu/5yT+3bOl9appDrhHPpsYtzlHLnLyUNHU9eKfYJ4MFudG+Gi1TcNU7F/d8CDCEdn3iqjl8vU2A7vXBbU6HyRYMw/d8YKIF2Xtz6eD0fjnosRc0gYNeTpR7CDJiZGcPDi0ZVDPe93r4Qom4Ljl/ul8/0YiDl4DYMb/MB79DGKfUUIMfDjCkANboPksRg9CaxZA4xtEPczq3HzJL+4e7XnTZqN7xKHWpraYhz+F2FHicJw7YQzI4IqYd7+a23L+C748qV2Wxq9FKbIYTu4Q67Is46Su597XwwbC1Ml6GSgB33LmGI2nyGonW19+tZCXTsA1FTbe4B5xmhZFWqi4Tn7CBa2RWdJ3UwR+y8zfN/x9P9EsmUxW53erUA+MyZN7VkSRxleWBlu44FcxT0aOdS4YdVIpq6cfmXc87u0iTX0ozt5E7RBH0UYXaZrSBefjr4WNq9iFl3QMyv7IdPSZgD7sy0qefzyzN1dPbn9Ji3iDr02apVFQfTVsQALXLvzeZdXPtFYlDj9+GiWRt0IyhP4bP0a3lICJONVRFgb1FzEj4Z5sjqMEnnzh/gwHs6CWhtUjOVhgoWj07oWFIN5EeqNJDU3kYRDUldB5+AXna97fvy5ogdjf1tZ5HhmEqmbmPSh6Fyvoe1prsbVSMTAHX3DBiShwqylP3hcgA/GiCkBEPe819E3f4w5xutnA+aJM61CFYaSCVDL3JzGL84koZoSbfBGxyZPyiaFHk8ETxKnmF4zMMBeFGsglcw8/FzZo5KMr5/fe5yGTFVVszG5HQy/m3uhJuLtH/AbI8L5Uh+tYkxzCENW64PhzNmbEf9/3+MrHiEtTFGVmdBCUTxl9jzgE4jeaOIrBjFjHkTa5kV/yQdiYTDt61oNsc6XPavolVvhVUuyKWEXGmEBR+XqDD63EUiAsSxBZIkWMsBErFenCgCM6j5dWbTxgdtpExnSjbkD+UhPHsqLIocS2JuOnJtWPDE3EwVuRSkheg8FgA6BmOs+00VmRKV2Xj2FjaAdDMych7JwDdj413lcaDIIYH1ekeWZCpbOyLMzuY0MTsXI8DuWlgHit5ZVnRfn2FmQ21N20tCFzzuf3BvbwvKl3ctXn12KbQ5wXeQ77IEIZ/VaUZba8MronawriNN2kJopeXwNC3qh1CNeLQGTyuyi0+HG3ATaZrs77RmohlBfN/tTqii+2ex3iojAqihGo8GFFBiVplpqYxdDDPlakBdxug9ShkPFUuImjcE1yRDB9lpZZrpdVPb9WaTb8trU7tPzBdVTq0deUpWVFUYLIyqQmy0DHLEuzrEg7oaMPcca3xCE4jPShQg1mKFJaI3Iw9qRZkkdXl7p0dA5Wwbq6+bT3vtglE8SIbvx8wE2Fi0WxZXrIisQl8OEjYlLWMASDxGvJIooqA8gR6LKsxD+q9C9vHdo67GSp6zp9h8NPjAAs4tyYrfh5RsBbxC3Ymbe3eA3eav8uaFgby9WlYlcFDsegRLRWEcOczgxMXCwr/0JkR4q2/3RoOVG5kms4+horcrMF2sJI3kKE470FQ+D2cMPKvzOyRWwhqxCmVTqOmamBPgyRAQ1umDaRukG8cuH3cGnzvV8nXXSX6egrWRqeJ/eYOFPyUxtSBW6YRrBxH48FcajjUHyOLicuqCKwGu/GN4Ir4ok0f9kTPB1cY02aek5nAsVMJPknxKqNFabIMzGvVvkWlCQxDfEW2+wJYkd5qmNIN1obf/ON/Bt2pl9eEV+nXRLdzoKbLfmJK/z9YG59fDwZfSq67WBh2MtoxifYakN+IEibIjW1P+xBzB9gll5v+B64ALTFBo7HL14yvhd3bbxzpDjt53O/tlsebbKjgKyRtXxRvDT1DxEjIPM2Kuvs+ANQYig6sxPEg35WAPLGGlobydLQReAEriLSW110WMEZxulScEjTDLjn7YhD5JgEU6YAa+qnBZizMcBlmh8VykdSOir4Iy4lSz5AfHkxzPCakavXCv9LkcH7roinQ2m0SR/Pm047HeEriKxE4IkAOnCmHvWz2tkYH2Lg3PHaxtSNJAIizrV6iji9mhdpGX+blKlaF/hGutVdxIwUXEU5cDzommbTS3AQEEiWb+U2NTmUWHUx9SOrrdrMhRTAS//R1Luixih5nyIWsCEB5sUWjoY3bgtr8XQrCfGC+Dom6q9CbYgF4LcSX3ij6bB6NB0/KvokYTQCTmVNJjVF7P7+ADECBfKjYUwxepsZmAl2FuMT+yVWuO6rIPaeIn4rmbTe3kpE1UhYXThTDx8QL0HjWG6r6TAztPCDfsRbEkmnRufbYldW8NAiT+F8RboVkgF2cEUs3dcjSTEbDPsLoUi/bXl30rRESGV9vs6dqQc9iJOEAdk4E7fYSUoVPLOxgX9BwUU6L2lkqQpS2Odtawqdq2485gqNTDv7WxMWsdS6mfuDxoZKCCASUNF01Z1FHMfghaGnid2IOLOmXkfBc1YgI6KuC5I4iPFWqpMCcmJbWpdMW8Qs6Y42FrO7PZz2F5sZw01KxUtJlrHIyTLks2VZd6sq/nCxwMcGmaH74WPhR+S0zmni+BnibcHWpgk2tbySJSEX2+KNTVqEY+j94IIYNHZbMadm/rgvZXkMI2XG2BAUmaJMce0QrWlWLe4QL+QjKxDDmETnhc7a/EtDZeoZ4hxUq8gzzn7qOk/EBbcgcqElWl8R+5c50uF8rol59Cgg4RJF5hwJxQyIsS2BO4vKe8TcaJn7i7pamYTFU1ZI+yEiXNz5uB8xKFEE1aIV/N68iuOqAqPxFrPdgiWbG8ScwMqaT3MUzMMHxJmmN4vODkNQQm+3aYlfp24R4/fZz5zBTgHTNS3MtLe2tn5m4yhKkQ1ng5epaxx5qyrf0chgX0ndp1tdwfEsjWzF/J5zmdWsa2UXj0HkjJoVkEFkynMkIhOF94gHL5MxXi/AXCdFBSNtQpEzLsg9QaxeAwKeymBtar9ZJqwY+TlgdJZ143HDabOtPQC6Oa+63TFXViBAFuJ2cSTGghfDEeHAd4hfBoPv379LT3Bem4ruBw3HfjYL+rzoR5xky0gAe3/y9cd3O+WL86wst7iduujEY8pjv7ks84jQ7GYSm6VRQODO5GlkO3ksNTWBPCAefP+DLw85fOzXS01NBDbTzHKhT3icGc4NB/M/3cuz7ThEZKTsdLvVd/pYMKPSO1xGK7eISyWOW9jIyDDEDBGhtrnl8cu3lz/a17fJi7daJijRcihf6UJErEceEE+IGJwYtRaW1wx0rRmSJLHkKBbDTtXEgOb5+/PJLiE0D4jfFPIl+W/YmmKPd2tNdo948Mf19UIrreh9CG2hDRfRMx4HcPjR7M/OC1fi1xGKLqlnQIxunddilg0IsuLRxuStuIFhg8nIbZJ2aRfxi6OEfX0fTryl2e1ExdjWg35mY1X+NXu5csLygrTI8jRH2N9CIKjav9mKmkztjoK0WO55XCJpZOyOZtoFqdQWckq9dRB/65r4jz8Qqvw6kUrYsXht0iesAJqXwZ93iPF90SaowYtHxBwsUsQxwh27jRVnYzZ2Ui0yl7WNSW19fmPjwbcbxN+HuK8BZW4eWfn11MaLCt+d3CCeD168OhZ5j+Ra3LPiuir4znWVe8QVx4P2hfAWyowl2mxQ9XYR35ICiMe8r6g9trmdFhB18lCZjp8jrhJqT7wKaRb22pi0ODb3ibeKNtBh8HmTSh6R1knEjs2PERuqcmhc1pnIlMvan/QgLntYARsH5Q6pmqlA3yMesREvOxSIyz2ICyb+TJsokg4PVVy0Ro38ehsrelmR8lrTDeyMQBf0Ig50fe95M/G8QuyLsi813S6W3TxAfLOvRxuXtq2a6bYRggirJWDdRLcHz5stUKbi4rZW9Bmrjx8RV8GiJ7qN/DouoILAYlRANxmEM/L5an8+2IMdPTbWbEGJQLdhjUURZ263iO+iG42X7IiYSkSab1I1TXtY8bbgatz8LoPkRWkraRbTcSdLw7zN+bxvj6L0IEZWBhXZiMioxkJUvDEbp3cZ5FsHss2zC+jUbOsKPmMr0+ljrKAKGnNR9DZLq5LiDZUelJC5RLcR3nCyUsidnemzcUpZkbEgoKkVTJ2EnLLcIB5Or5C9wbfJaAYe47Nc8mD9ZGv4BxvPZbeH4LtKCD6QoWhKAVpv89ghtst4rj3I2EbtNnjQbiDxFgVBJW6gWYaxOFY3iEcSIi1kfiSwIIUEKup0e/oRz2XVeS5q8/vsu0vd0EBbWKgEYgSZwrFCznbsbQ8WfICmb857bzh5GB9lBmGxYpuVdM6lJR3e6Ar7mS+2gTGesCM6HUxgKZXaQnrdj9h2e/EpHDW+TOybB/MwVWREmkNssjwrnOfZsx12Rd8dj4HsG9/XIOyxwwtK/IKCzdZEesPFRqvMIR5yK6deQI2/vPBr4C0oeEe4uXFkey3SGe5FPIWdg3pxGYGNvHmtA9b+iIy55oenl1p6xA34w2U/u/Hnd+N5GY5TAuHtb5n0gE2sNLuBCBlJ5gtiXON8EcJMM282HYxnnl++cm4xlSwSKFt/RCg1ehDzzVUVp0HWVqaVdJRTN9JLaaq05fH0si64P72v7MztYZxfb610o97MIFWh3mgzTgCKiojJiDoP3iD61oHvozAFTCQyz0IOA/ZioZuYJB8QT1lhLQKU3WGwtdW/DqKNa2BFcB8q84sScnsJfDVe3xqbIOYQsKBCRkAPgjAIgqWJwyBa4tegKhQWBrXhsppf4RUFQQyZVG88/kLv7S0oS9wakD+I7hCDTh7oFIRQtDG3V/hixzlKbaeQRaXTUFfELPL2p2Y66Rl3CCtQ5xVEnJqYzYiKfdkABosYl8YM6NWiljMjQJwkSw4wuAtW1xZyjezFcQhYEd7qGTIiKAMmpNAuV0gH1zahdN5pK1+jG1edDw/l3S1iir4KiJNSxsBcgV3VuO0Lz8aIerUoGVOHgrjYGVYceZmp7XYukAMU+LECUxabm1mTZcQiYPUauiIyZY+Bsxtz7YMzS18yyJiud7gvPR6H40VZJdabGQp4K6Ved4wIuFAwEMQBgolBCDVZrqUckthVBYkRji6uiHl+w69XVfD6atdXOGC14ZuXzMgmvqc3yCFh3e1tfrDEZBFvizTLl7zx39gZHI5Z3c8lFvAzhRHDdjoWIwQimLBPbWwFJ5dVu/vT3fnzcJ9qv7Tzfn1BbNoiS/YIWOZtrzVIuxLEowfT0XA4Yov+vsOSsm8QV7YH8h2f+n0w+WbL8HlK4TW7TNKAGIDZT0UQpAzZ1fOhEFw2Pl+6FAadYPg56rxN+Lq2BQP/EMApWx2xkaInZz3eIgaReeCPMfnUPbt0w+MUCW/3Ji0Fry2VBxOXNV4X83Zdwwm9YlcYqHiTcMEiW1rZAP58Gw+Hw/HLS0thvJkBxqtD9geQG12lAx9FAgAvCheR2TS7IGaePsvg8SDLxjPuZ3ecQ6IbLJzigwXw3wL47z++Qep4CxaV3mUFwU5udttC+oMch8Fd1UKkGRP49+8eG0Yv8qN4swSYsczzOHtkxyuK2buFnTm2yY0MJ5BCsuxambr9be4EHRu+9ie2ZScdVtRQFJl5nU0m3kVN/v2HlZOuXdZBjII/N3lsEqjojBNfNuZno8mlcP0OWToez2tERLG+dAo3W1vzIsy9clMoDFsm56y2Ojy+5hDG5DPnCzdxQxC/lRVHhzdFxt/e8MVbBovZfcsrR3TTJsY/3G6iQC5XINTkqp2tmNTlX3NZxSHiTcqtF1g0fA1elbKDwHhjV8kyBI1MXxBTDB1FCLWnOaiILhrZel5ZkhTjbo0BI3+b+cbvdkLdLhZMnMSciSnDdJ49XO13eE8aWDoJ4hDhi/PKKOTizSvn0rIyxPKf0QO601z7FVYM2QOu8s9NX8hmkAL+470MHYnb1toApdhDx7tK8pyESABaAXCGovL+am33xUZTIn6VUf9riCSNP9VrGKNY4H+zQ3SphTsdFksLOSdz2by5HvKy7l+WCRDfVp62WL5DjAwSIxjFURwHQKyWOWcoFa/2rjPg15WTfYwV0kyEfV8DRV3BWWQIeoQqdFtZJugi9tjX3F83hfhXG+ocK3bLJ4j9e8RlnCCuxXGcqFAGY9GSLdvBYy+jEiU+tlPekPsfFFn4Q4FSeRwqMXMY2VWy4Ka32ZzkwQMSKdrnJKwus3+/ikyG3PUy9G5YgfzXw4pyCZwJHI8mVhxGSpN58oj4rytiy1rBGyixcBy7b4QMd8aoLmLUeqfz5UEUp7ZtYY3sdEUaPHARZPSC6hFxwi6B4AU3DEcv/KHhI+K6g5ixQVyNNg7VWqbEjHEbwa/z254QPHfVcATKCqA6NpbJ1shtLc3gcttCgcNDxj8iDkDjcA0bKeh4fKE2jGYvP0DMdUJ4Ht7nQoQMs0Mu4dh5oLntYk06eZl7vEIRqz4tj5EkX5mkv12jhTecws0ep2NlzPYExHscL2PZEILTeL2xQlKrYwWkRSirbs7EgjjWDjz+7a7eYunhHlvDjXQXLrh2Y3kMIcK6bdKmgb9dB2X1yIoKVV3CWAHXEyMXGQelk5t4PB56WTkXNSKIN5toTUcLhRQRtSe3i9gaQSYs9GOn8DrDGw1njTsVKDG55fE2E2ExdFLoux1gmT7EcBVkLy6BMWRwQp085jyfpJi0iFOmGyJWgWxurlOOW1M7tmTr7Nbzes7c2AAH+dnamEWTqucX9oy/obCool31GI/h7LFsVCBEKQ7VC6QQfzoZfusA9qrat8s7jsesO0KuMq1DoW6aF1tbOsmQ10RPEQ+nk/psD17uDx6XWa2N0yLLXimEB9/wehmM52/VMkseEZdBLNsVdBcEjFiWtRlpJqLdPBn2edVq5foiDrGsQIIPGyWXCsPmZovKcgs5L9P4p4idlKOR2ZYdOkWfQviVEY88cA9kyiluGkBA9CHOdag3G8VVbdxN6XkpQgZm6uPxC+u+eu40tUWcpjwPgoAWx1bZF0jwBSdVKOO5f/PUxra2ltODtoyyPaFUKJWlqqorHy98Iuhqil1PPA4YKxCXQhhYRRRxxC6VFUrEF2n91lULuLVxJMsBcnOiKLUCOweZZVKs265o7/pys7f5ujlXfKCRtbHMdckrEyjW/qV004pq1+95lObcE0W0cKog2yWyE8UyfAG811bZBTFCQtFpKrKDtc23srLAOVW/jeXxKY2o5fZ5Hu0uFqdqXAZJM6oyo9M3XP4TxCFvbcgWUMyKPuYySlbw3AFfyFJeZyteEP+15no1yzygNDJPI/xcOpMm455fP+LpcOWC8Z7Lx9Pr9pjsgxhZ5clks7iUGVBvdAtUFK/XjFZwo3gdk4ccScRJku8q35rmdg7yGl33CQ2Do15yRY7dasNlcVx5L2KnOy3ieUe7WZQkBefEWc7m95ZDlbyfFRJZUUjgP3BAxNNsu80ZIc2y8GfTm50zm0GEFuwZML6sWd4xM9Npme5VtO5FLNVIq+j9q6L3KyP3i0Nx41qGtl2/K/qjm8g2pdaKvS5jhwqyXs+J0d3Gl1NCkVMTFFBrXGgs5mYC4h6y7mcFhXLjQvEtYqhNmBgx3XCDspAeXIUavyz6eazwxb4cAVsdI/1m3JykH/ErCCRCwl4tJSf/hYV0KF4RhX2I+aCg90sRcsMK7n5ylKCzPNVZkVvQu+oJYk518BWIpdsYKxu9Vnn22FhOrjAesjMeU9ZT2Mu37LZcL48nXOFsy1NH5HaZ32yN1Fw6NUKIQsaZeV88jqM1e7EWcaxs0JDwap7ZGLljowWj/Q+vmP1mbS39NLqN+eAiZjsOcPb2wSvcCaiL3U7WHFAkw8qWxzLN7IkVUJtshlOKCWRCl9UKDoqzuN/GktBFCoXkcYhYTvdVTIJRzGXVsD+D8JkOR2fjRp4VAzTznQZl4cW5lk2/PM3z1v36ohvHZ6FlY2BBc70i5NuRrp+wgoRtActtoa2VXtPA/Bth51nOm7dVk4UMDXyqVSEbjTmCcW7jMjMR5KB5hji2n0wD0+3JDS5vPkVMVGqz4QVCvPEoi+IePT0g5F4tYklQP9cVzRXyfHU8NXVaIMrwnjID8VXsGNwL3WtjfICSMwZWoRO5Ues1D8/k+RMei9BT8YZRAuBDHq8IOatXvDvMRdGH2q2FvD9KnVqpIsm4OUpiZDLu5R1+xoogh33DNUKVCmyXRP47K3pUgP02Dm1tpOQSFVKlcHhNGvPIBdfxX+un+rgLmc2ApgqLPMu2srCasznM02HakrvPxuxWKJmza4uA7sMDB+xuPfM8W9mtUUuDFlpmgKBTKAWjRL7wGWIeKlxdIRM1bGxsY5RAaWmIbMOMZ3pjRSw/rDa8vRtxJ8aBNX1BP4nHqZRGkPMhz7tJAFcspSWusYERPlOb9uT5rO5APuyrqMi2eWwb5iSzJPwdbZz06mNAoyamgMEn4QYDsZx/i58hLuwWhA1wcnQaH7eWskSODjHYPEfMLcMu5H3NM6o6QZZnhJL5Dzdhcrhf3q/ona4I5VCIZBAOOtj260ccyq48LMtNng3P5/HeROSyjTmded4zyK6vRXGPWLGLpWjjZ2YiqIpC+trI08kjYtZL9B8EWJnOaZsMWP6luh8xhFvK+xIzX9pLZHeFtYzexJEsGnyEWEoRB7k5neH98stYzkvIYJjY4ZUvV65BeZulEafkZKCWA/FaPJ+uxB7t05znatlIrZlKAhGsa6G0HIB5XpneQm6O58ZfVPa8RITAmrcRAzQ2iRxmvhtMlWytrCP2HSKeZOT2vOLJEFwx+F0+ySBrdujFLEo6nDQ0AjKjhZTZsfoYsX0wFp+dh4Dv12YHkZuwSWoyCcSgRCJ4x4/r1bw86UgxwDHvRXKCRVRY1D3JeBOP+RNKSzXNgbsVQ+0ohPfpBzYWyH4jTzGZ+W88XSf9SiRpJr7dbhnXcij/9hSzm+cZcph+Hq4pDJQcucEl4ypZg/Qh3kRUD6GVxxRPEmEogIyWg/Xqh4jb7uF0JFuQVBbEmxNuLue2vcHDgw9clmYsBgJ+/Jp2pscn0v2Ol7pf0YPrsXQr8BKdug5krUfLoxZYh/0YsSyfTkc28UbaSAwG6jxfbqV873lQg5vyxoI3Em0c0/1ISoqoJAn6ESOosA/ryhYR1MJlOd0nZcwnbOy6h3ZyY3TC/Mz7uqrqhHj7HtLQ2lhKHeIWsSARmTkhSVSQ9iLmOExL6/iVp3mVQA+kCy6ciu/7xz96JAXkuCTl2D7kYfbsRLzTFTIncuMA6QnDVOzPJvwFvbEiVtZXJUkrGYYEgSTszUbahuZLiN2ouciJ13+O93pKSCwUJNzbsucbbJFs8iVV7rCHFaGy8UW6sYpoQQ8CZyODpY/6GuKyqso8WLpD5c+fQWMRS8pa08vddEDqvAgGjuvb2dS1BlnbkeOrXKqlsxhdcW7KrkUYPMTFDxGXpeGTtuS5KKMfPHEjoKwQtWV7DrLTxPCkbIAZ9u3GyhpouAmlMgwDIYYgDrU0svCNfPG5B1PYWjrgkwb4jJKPHynkKlNpZmo558zj9Pg8fGBRZ+Kwo0EvYimgyf4gtENIKRJB5JxdfvyaBfn0uUPbHIPWy/4HI/TaOKbK0zHE3lZOzeSGZxDlGRbDRwdoEXMrJHA8Di1kBA0t8TTWSeDGf594jZCld08+7cnJWDneHGvx12pXxKv6A4e1iC1MN4JcS9JjNyvOraILMhLqk895mAy8+eeeN3NFLH2CHHVVVe2SvP4wwLh4HEhgE/ra8h+8j6nKuSTH2cDoaw8kG3/upx1i6lFNyb/bJWzqU388Pc7ubBxcptIMFRLh5FQ4fJcPZJh95hZfeTH+7A+7bQX2CtibS5ZVvRIH+MBhbTy2Oc4ijqUxI3o8pg/Ui/ngVz28VRCrOOE6Vp4Ejg4fP3RJTrAoSwsLW1lKJGJi+Cx+x+hXPTTZzUxZqiyTj+l7l0FicTaBHIvWYyPMFBDhC++fPD30c6xI4Nsi96cf0Pe+7xatbY4LrDw2kE1IkhUNPP6Fz92Xs7yUlHVpn8D4iXh07W3aprNidlQUi6DVrzWwQxws0jrsl8/PeQztsdFSYkmXgLfpXzBwK00/424PZ3nZSomkQS+dHJOrwD7CazD4xYin/uIz7vb4jJBISqZIntki+v1fMLBbKJl98emv9imstijkMw7YDYn/HQNfXOlrhrGIUaPIPgazT7H69ww8GHw91tvTNdLTT6hP+VDFf9PAX39ZxLFsu6DajoN/1cA/jxjhzCS5+e8b+IKYy7RJkq/+8wa+IGb3Ra2S/76BW8QmWSK5WwMPB78HYvU7MPgG8eI3MbBDvAji38XALeKy+l0M7BD/RgaWfsjM/40M7PTeb2Rgp6pHv5WBB4Ov/H/1/D+ZlPCLSA2RigAAAABJRU5ErkJggg==";
