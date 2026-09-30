import { useState } from "react";

const BLUE = "#2E6199";
const BLUE_BTN = "#3D77B2";

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

export default function WorkStatusStep({ onDone }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleContinue() {
    if (!selected) return;
    setSaving(true);
    onDone(selected);
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



