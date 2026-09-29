
import React, { useMemo, useRef, useState } from "react";
import ministryLogo from "../../assets/ministry-logo.jpg";
import landingLogo from "../../assets/877d674005f4.png";
import "./AuthFlow.css";

/**
 * E-LMIS style Login / Register page
 * Zero external dependencies beyond React — no lucide-react, no
 * bundler-time asset import, no external logo file to place
 * correctly. The Ministry of Labor and Skills logo is embedded
 * below as a base64 data URI, so it always renders, in any project
 * structure, with no setup step.
 *
 * The blue "E-LMIS" panel logo/arrow/skyline are this app's own
 * generic iconography, rebuilt in SVG to match the reference layout.
 *
 * FLOATING LABELS: every field (Login and Register) sits like a
 * placeholder at rest and floats into the border notch on focus or
 * once it has a value.
 *
 * TRANSITION: the form and the blue panel swap left/right halves on
 * mode change, and the arrow inside the panel redraws itself (a
 * stroke draw-in animation, replayed via a `key` remount) each time.
 *
 * FLOW / ROUTING: this one file holds the whole registration flow, with a
 * tiny built-in router at the bottom (AuthFlow) so it runs anywhere,
 * including the Claude preview (no react-router-dom needed):
 *   /login, /register  -> AuthPage (split login/register layout)
 *   /auth/otp-confirmation -> OtpConfirmationPage (plain centered card)
 * A successful Sign Up calls navigate("/auth/otp-confirmation", { state }).
 * In a real react-router app, swap AuthFlow for <Route>s and pass
 * useNavigate()/useLocation().state into these two components.
 */

const MINISTRY_LOGO_SRC = ministryLogo;

const COUNTRY_CODE = "+251";
const PHONE_REGEX = /^9\d{8}$/; // must start with 9, followed by 8 more digits
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePhone(v) {
  if (!v) return "Phone number is required.";
  if (!PHONE_REGEX.test(v)) return "Enter a valid 9-digit number starting with 9.";
  return "";
}
function validateEmail(v) {
  if (!v) return "Email is required.";
  if (!EMAIL_REGEX.test(v)) return "Enter a valid email address.";
  return "";
}
function validatePassword(v) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  return "";
}
function validateConfirm(password, confirm) {
  if (!confirm) return "Confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

const BLUE = "#2E6199";
const BLUE_PANEL_FROM = "#4C86BE";
const BLUE_PANEL_TO = "#2A5686";
const BLUE_BTN = "#3D77B2";
const BLUE_BTN_HOVER = "#33689D";

/* ---------- tiny inline icons (no icon-library dependency) ---------- */

function EyeIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.65 19.65 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

/* ---------- shared bits ---------- */

function ErrorText({ children }) {
  if (!children) return null;
  return <div className="mt-1 text-xs text-red-500">{children}</div>;
}

function MinistryLogo() {
  return (
    <div className="flex items-center justify-center">
      <img src={MINISTRY_LOGO_SRC} alt="Ministry of Labor and Skills" className="h-14 w-auto" />
    </div>
  );
}

/** Animated label: sits inline like a placeholder at rest, floats into
 *  the border notch when `floating` (focused or has a value) is true. */
function FloatLabel({ text, floating, leftPx = 16 }) {
  return (
    <span
      className="pointer-events-none absolute z-10 whitespace-nowrap transition-all duration-150 ease-out"
      style={
        floating
          ? { left: 12, top: -9, fontSize: 11, color: "#94a3b8", background: "#fff", padding: "0 4px" }
          : { left: leftPx, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", padding: 0 }
      }
    >
      {text}
    </span>
  );
}

function FloatField({ label, value, onChange, onBlur, error, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;
  return (
    <div>
      <div className="relative">
        <FloatLabel text={label} floating={floating} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          className={
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors " +
            (error ? "border-red-400" : "border-slate-300 focus:border-blue-500")
          }
        />
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function FloatPasswordField({ label, value, onChange, onBlur, error, show, onToggle }) {
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;
  return (
    <div>
      <div className="relative">
        <FloatLabel text={label} floating={floating} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          className={
            "w-full rounded-lg border bg-white px-4 py-3 pr-11 text-sm text-slate-700 outline-none transition-colors " +
            (error ? "border-red-400" : "border-slate-300 focus:border-blue-500")
          }
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: BLUE_BTN }}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/** Floating phone field. `withFlag` adds the 🇪🇹 flag (Register); Login omits it. */
function FloatPhoneField({ value, onChange, onBlur, error, withFlag = false }) {
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;
  return (
    <div>
      <div
        className={
          "relative flex items-center rounded-lg border bg-white px-3 " +
          (error ? "border-red-400" : "border-slate-300 focus-within:border-blue-500")
        }
      >
        <FloatLabel text="Phone Number" floating={floating} leftPx={withFlag ? 92 : 64} />
        {withFlag && <span className="mr-2 text-xl leading-none">🇪🇹</span>}
        <span className="mr-2 border-r border-slate-300 py-3 pr-3 text-sm text-slate-500">{COUNTRY_CODE}</span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          aria-label="Phone number"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          className="w-full bg-transparent py-3 text-sm text-slate-700 outline-none"
        />
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ---------- info panel (blue) ---------- */

function ElmisLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="auth-brand-mark">
        <img src={landingLogo} alt="" />
      </span>
      <span className="text-2xl font-bold tracking-tight text-white">E-LMIS</span>
    </div>
  );
}

function ArrowSwirl() {
  return (
    <svg viewBox="0 0 160 160" className="auth-arrow mx-auto w-3/4 max-w-[260px] text-white/85" fill="none" aria-hidden="true">
      <circle className="auth-arrow-ring" cx="80" cy="82" r="48" pathLength="1" stroke="currentColor" strokeWidth="3.5" />
      <g className="auth-arrow-dots">
        <circle cx="80" cy="34" r="4" fill="currentColor" />
        <circle cx="80" cy="130" r="4" fill="currentColor" />
      </g>
      <g className="auth-arrow-head" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 65 30 L 80 13 L 95 30 M 80 14 L 80 43" />
      </g>
    </svg>
  );
}

function Skyline() {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-16 w-full text-white/10">
      <path
        fill="currentColor"
        d="M0 60V38h10V26h8v12h10V10h8v28h14V20h6v18h10V30h8v28h16V16h6v6h4V8h8v10h4v-6h6v30h12V22h6v30h16V32h6v8h4V18h8v22h18V24h6v16h12V14h6v10h4v-4h6v40h20V28h6v32h16V22h8v18h6V10h6v40H0z"
      />
    </svg>
  );
}

function InfoPanel({ mode }) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden px-10 py-10 text-white"
      style={{ background: `linear-gradient(160deg, ${BLUE_PANEL_FROM} 0%, ${BLUE_PANEL_TO} 100%)` }}
    >
      <ElmisLogo />

      <h2 className="text-xl font-medium leading-snug text-blue-50">
        Ethiopian Labor Market
        <br />
        Information System
      </h2>

      <ArrowSwirl />

      <div className="relative">
        <p className="max-w-[280px] text-sm text-blue-100">
          Create a free E-LMIS account to visualize your future with the labor market.
        </p>
        <Skyline />
      </div>
    </div>
  );
}

/* Forms are avoided on purpose: the Claude preview sandbox blocks <form>
 * submission, so the Sign In / Sign Up buttons use onClick, and Enter
 * inside an input triggers the same handler. */
function submitOnEnter(handler) {
  return (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      handler(e);
    }
  };
}

/* ---------- forms ---------- */

function LoginForm({ form, update, blur, shown, showPassword, setShowPassword, onSubmit, submitting, switchMode, statusMessage }) {
  return (
    <div onKeyDown={submitOnEnter(onSubmit)} className="px-6 py-10 sm:px-10 md:px-12">
      <h1 className="mb-1 text-center text-3xl font-bold" style={{ color: BLUE }}>
        Login
      </h1>
      <p className="mb-8 text-center text-sm text-slate-400">
        Don&apos;t You Have An Account?{" "}
        <button type="button" onClick={() => switchMode("signup")} className="font-medium hover:underline" style={{ color: BLUE_BTN }}>
          Sign Up
        </button>
      </p>

      <div className="mb-3">
        <FloatPhoneField value={form.phone} onChange={update("phone")} onBlur={blur("phone")} error={shown("phone")} />
      </div>

      <div className="mb-2">
        <FloatPasswordField
          label="Password"
          value={form.password}
          onChange={update("password")}
          onBlur={blur("password")}
          error={shown("password")}
          show={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
        />
      </div>

      <div className="mb-6 text-right">
        <button type="button" className="text-sm font-medium hover:underline" style={{ color: BLUE_BTN }}>
          Forgot Password
        </button>
      </div>

      {statusMessage && (
        <p className="mb-4 text-sm text-red-500" role="status" aria-live="polite">
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: BLUE_BTN }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_BTN_HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE_BTN)}
      >
        {submitting ? "Signing In..." : "Sign In"}
      </button>

      <hr className="my-8 border-slate-200" />
      <MinistryLogo />
      <p className="mt-6 text-left text-[11px] text-slate-400">Version : main</p>
    </div>
  );
}

function RegisterForm({ form, update, blur, shown, showPassword, setShowPassword, showConfirm, setShowConfirm, onSubmit, submitting, switchMode }) {
  return (
    <div onKeyDown={submitOnEnter(onSubmit)} className="px-6 py-10 sm:px-10 md:px-12">
      <h1 className="mb-1 text-center text-3xl font-bold" style={{ color: BLUE }}>
        Register
      </h1>
      <p className="mb-6 text-center text-sm text-slate-400">
        Already Have An Account?{" "}
        <button type="button" onClick={() => switchMode("login")} className="font-medium hover:underline" style={{ color: BLUE_BTN }}>
          Sign In
        </button>
      </p>

      <div className="mb-3">
        <FloatField label="Email" type="email" value={form.email} onChange={update("email")} onBlur={blur("email")} error={shown("email")} />
      </div>

      <div className="mb-3">
        <FloatPhoneField value={form.phone} onChange={update("phone")} onBlur={blur("phone")} error={shown("phone")} withFlag />
      </div>

      <div className="mb-3">
        <FloatPasswordField
          label="Password"
          value={form.password}
          onChange={update("password")}
          onBlur={blur("password")}
          error={shown("password")}
          show={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
        />
      </div>

      <div className="mb-6">
        <FloatPasswordField
          label="Confirm Password"
          value={form.confirm}
          onChange={update("confirm")}
          onBlur={blur("confirm")}
          error={shown("confirm")}
          show={showConfirm}
          onToggle={() => setShowConfirm((s) => !s)}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{ backgroundColor: BLUE_BTN }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BLUE_BTN_HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BLUE_BTN)}
      >
        {submitting ? "Creating..." : "Sign Up"}
      </button>

      <hr className="my-6 border-slate-200" />
      <MinistryLogo />
      <p className="mt-4 text-left text-[11px] text-slate-400">Version : main</p>
    </div>
  );
}

// Mock OTP: no code is generated or sent anywhere. Any user can verify
// with this fixed code. Replace with a real verify-code API call later.
const MOCK_OTP = "638417";



function ArrowUpRightIcon(props) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}



function EditPencilIcon(props) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}



/** "Another page" shown right after a successful Sign Up, matching the
 *  lmis.gov.et/auth/otp-confirmation reference design: circular arrow
 *  mark, "We have Sent the Code..." copy, phone number with an edit
 *  affordance, and 6 dash-separated boxes. Uses a fixed mock code
 *  (MOCK_OTP) that auto-fills into the boxes after ~5.5s. Nothing is
 *  generated or sent to the phone. Swap for a real verify-code API
 *  call later. */
function OtpStep({ phone, onVerified, onEditPhone }) {
  const otpCode = MOCK_OTP;
  const [error, setError] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  React.useEffect(() => {
    inputRefs.current[0]?.focus();
    const timers = [];

    // Simulate network delay before the code "arrives" (5-6s).
    timers.push(
      setTimeout(() => {
        otpCode.split("").forEach((digit, i) => {
          timers.push(
            setTimeout(() => {
              setDigits((d) => {
                const next = [...d];
                next[i] = digit;
                return next;
              });
            }, i * 150)
          );
        });
      }, 5500)
    );

    return () => timers.forEach(clearTimeout);
  }, [otpCode]);

  const filled = digits.every((d) => d !== "");

  function handleVerify() {
    if (digits.join("") !== MOCK_OTP) {
      setError("Invalid code. Please try again.");
      return;
    }
    setError("");
    onVerified();
  }

  function updateDigit(i, value) {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
  }

  return (
    <div className="px-6 py-10 sm:px-10 md:px-12">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <ArrowUpRightIcon style={{ color: BLUE_BTN }} />
      </div>

      <p className="mb-1 text-center text-sm text-slate-600">
        We have Sent the Code Verification to your phone number
      </p>
      <div className="mb-8 flex items-center justify-center gap-2">
        <span className="text-sm font-semibold" style={{ color: BLUE_BTN }}>
          {COUNTRY_CODE}
          {phone || "960625242"}
        </span>
        <button
          type="button"
          onClick={onEditPhone}
          aria-label="Edit phone number"
          className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500"
        >
          <EditPencilIcon />
        </button>
      </div>

      <div className="mb-8 flex items-center justify-center gap-1.5 sm:gap-2">
        {digits.map((d, i) => (
          <React.Fragment key={i}>
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              value={d}
              onChange={(e) => updateDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-10 rounded-md border border-slate-300 text-center text-lg font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500 sm:w-11"
            />
            {i < digits.length - 1 && <span className="text-slate-300">-</span>}
          </React.Fragment>
        ))}
      </div>

      {error && <p className="-mt-4 mb-4 text-center text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleVerify}
        disabled={!filled}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
        style={{ backgroundColor: BLUE_BTN }}
        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = BLUE_BTN_HOVER)}
        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = BLUE_BTN)}
      >
        Verify &amp; Continue
      </button>

      <hr className="my-8 border-slate-200" />
      <MinistryLogo />
      <p className="mt-6 text-left text-[11px] text-slate-400">Version : main</p>
    </div>
  );
}



/* ---------- work-status modal ----------
 * Matches the "Tell us about your current work status" screenshot.
 * The Amharic copy below is transcribed by eye from that screenshot —
 * please double-check it against your actual CMS/translation strings
 * before shipping, since screenshot transcription of Amharic script
 * can introduce small errors. */

const WORK_STATUS_OPTIONS = [
  {
    id: "working_open",
    title: "Working & Open to work",
    desc: "Currently employed or engaged in a specific job or project and I am actively seeking or considering new work opportunities.",
    amTitle: "አየሰራሁ ነው እና ለአዲስ ስራ ክፍት ነኝ",
    amDesc:
      "በአሁኑ ጊዜ ተቀጥሬ ወይም በአንድ የተወሰነ ስራ ወይም ፕሮጀክት ላይ የተሰማራሁ እና አዲስ የስራ እድሎችን በንቃት የፈልጋለሁ ወይም እያሰብኩ ነው።",
  },
  {
    id: "working_not_open",
    title: "Working but not open to work",
    desc: "Currently employed or engaged in a specific job or project and I am not actively seeking or considering new work opportunities.",
    amTitle: "አየሰራሁ ነው እና ለአዲስ ስራ ክፍት አይደለሁም",
    amDesc:
      "በአሁኑ ጊዜ ተቀጥሬ ወይም በአንድ የተወሰነ ስራ ወይም ፕሮጀክት ላይ የተሰማራሁ እና አዲስ የስራ እድሎችን በንቃት የማልፈልግ ወይም አላስብም።",
  },
  {
    id: "not_working_open",
    title: "Not Working & Open to work",
    desc: "Currently not employed or engaged in a specific job or project and I am actively seeking or considering new work opportunities.",
    amTitle: "የስራ አይደለም እና ለአዲስ ስራ ክፍት ነኝ",
    amDesc:
      "በአሁኑ ጊዜ ተቀጥሬ ወይም በአንድ የተወሰነ ስራ ወይም ፕሮጀክት ላይ ያልተሰማራሁ እና አዲስ የስራ እድሎችን በንቃት የፈልጋለሁ ወይም እያሰብኩ ነው።",
  },
  {
    id: "not_working_not_open",
    title: "Not Working but not open to work",
    desc: "currently not employed or engaged in a specific job or project and I am not actively seeking or considering new work opportunities.",
    amTitle: "የስራ አይደለም እና ለአዲስ ስራ ክፍት አይደለሁም",
    amDesc:
      "በአሁኑ ጊዜ ተቀጥሬ ወይም በአንድ የተወሰነ ስራ ወይም ፕሮጀክት ላይ ያልተሰማራሁ እና አዲስ የስራ እድሎችን በንቃት የማልፈልግ ወይም አላስብም።",
  },
];

function BriefcaseIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <path d="M2 13h20" />
    </svg>
  );
}

function WorkStatusModal({ onDone }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleContinue() {
    if (!selected) return;
    setSaving(true);
    setTimeout(onDone, 700); // demo only — wire to your real "save profile" call
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span style={{ color: BLUE_BTN }}>
            <BriefcaseIcon />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Tell us about your current work status</h2>
            <div className="mt-1 h-0.5 w-40 rounded-full" style={{ backgroundColor: "#5ED9C0" }} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {WORK_STATUS_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={
                  "rounded-xl border p-4 text-left transition-colors " +
                  (isSelected ? "border-blue-500 ring-1 ring-blue-200" : "border-slate-200 hover:border-slate-300")
                }
              >
                <div className="font-semibold" style={{ color: BLUE }}>
                  {opt.title}
                </div>
                <p className="mt-1 text-sm text-slate-500">{opt.desc}</p>
                <div className="my-2 h-px w-24 bg-slate-200" />
                <div className="text-sm font-medium" style={{ color: BLUE }}>
                  {opt.amTitle}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{opt.amDesc}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || saving}
          className="mt-6 w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: BLUE_BTN }}
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}




/* ---------- page ---------- */

function AuthPage({ navigate, routeState, initialMode }) {

  // When the OTP page's "edit phone" button sends the user back here, it
  // passes { fromOtp, email, phone } so they land on Register with those
  // fields restored. Passwords are deliberately NOT carried in router
  // state (it lives in browser history), so those are re-entered.
  const returning = routeState?.fromOtp === true;

  const [mode, setMode] = useState(returning ? "signup" : initialMode); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [form, setForm] = useState(() => ({
    email: returning ? routeState.email || "" : "",
    phone: returning ? routeState.phone || "" : "",
    password: "",
    confirm: "",
  }));
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => {
    const e = { phone: validatePhone(form.phone), password: validatePassword(form.password) };
    if (mode === "signup") {
      e.email = validateEmail(form.email);
      e.confirm = validateConfirm(form.password, form.confirm);
    }
    return e;
  }, [form, mode]);

  const isValid = Object.values(errors).every((m) => !m);

  const update = (field) => (ev) => {
    let value = ev.target.value;
    if (field === "phone") {
      value = value.replace(/\D/g, "");
      if (value.startsWith("251")) value = value.slice(3);
      value = value.slice(0, 9);
    }
    setForm((f) => ({ ...f, [field]: value }));
  };
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field) => (touched[field] || submitted ? errors[field] : "");

  function switchMode(next) {
    setMode(next);
    setTouched({});
    setSubmitted(false);
    setLoginMessage("");
    setForm({ email: "", phone: "", password: "", confirm: "" });
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, phone: true, password: true, confirm: true });
    if (!isValid) return;
    setSubmitting(true);

    if (mode === "signup") {
      // Simulate account creation, then route to the OTP confirmation
      // page. Wire this to your real "create account" API call instead.
      setTimeout(() => {
        setSubmitting(false);
        navigate("/auth/otp-confirmation", { state: { phone: form.phone, email: form.email } });
      }, 900);
    } else {
      // There is no authentication API in this project yet. Keep the
      // validated form in place and tell the user why it cannot continue.
      setSubmitting(false);
      setLoginMessage("Sign-in is not available yet. Please try again later.");
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:flex md:items-stretch">
        {/* Form panel: normal flex flow (so it always has real height), just
            slides via transform. Sits left for Login, right for Register. */}
        <div
          className={
            "w-full md:w-1/2 md:transition-transform md:duration-500 md:ease-in-out " +
            (isLogin ? "md:translate-x-0" : "md:translate-x-full")
          }
        >
          {isLogin ? (
            <LoginForm
              form={form}
              update={update}
              blur={blur}
              shown={shown}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={handleSubmit}
              submitting={submitting}
              switchMode={switchMode}
              statusMessage={loginMessage}
            />
          ) : (
            <RegisterForm
              form={form}
              update={update}
              blur={blur}
              shown={shown}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
              onSubmit={handleSubmit}
              submitting={submitting}
              switchMode={switchMode}
            />
          )}
        </div>

        {/* Info panel: hidden on mobile, otherwise slides the opposite way. */}
        <div
          className={
            "hidden md:block md:w-1/2 md:transition-transform md:duration-500 md:ease-in-out " +
            (isLogin ? "md:translate-x-0" : "md:-translate-x-full")
          }
        >
          <InfoPanel mode={mode} />
        </div>
      </div>
    </div>
  );
}

/* ---------- OTP route ---------- */

function OtpConfirmationPage({ navigate, routeState }) {
  const phone = routeState?.phone || "";
  const email = routeState?.email || "";
  const [showWorkStatus, setShowWorkStatus] = useState(false);

  function handleEditPhone() {
    // carry email + phone back so the Register form isn't wiped
    navigate("/register", { state: { fromOtp: true, email, phone } });
  }

  function handleWorkStatusDone() {
    setShowWorkStatus(false);
    navigate("/login"); // adjust to your app's post-signup destination
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <OtpStep phone={phone} onVerified={() => setShowWorkStatus(true)} onEditPhone={handleEditPhone} />
      </div>
      {showWorkStatus && <WorkStatusModal onDone={handleWorkStatusDone} />}
    </div>
  );
}

/* ---------- built-in mini router (default export) ---------- */

export default function AuthFlow({ onExit, initialMode = "login" }) {
  const [route, setRoute] = useState({ path: "/login", state: null });
  const navigate = (path, opts) => setRoute({ path, state: (opts && opts.state) || null });

  return (
    <div className="auth-flow">
      {route.path === "/auth/otp-confirmation"
        ? <OtpConfirmationPage navigate={navigate} routeState={route.state} />
        : <AuthPage navigate={navigate} routeState={route.state} initialMode={initialMode} />}
    </div>
  );
}
