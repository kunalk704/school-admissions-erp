import React from "react";

export function WorkflowTab({
  activeSubTab,
  isApp,
  progressPercentage,
  docs,
  appId,
  setApplicationDocs,
  showToast,
}) {
  if (activeSubTab !== "workflow" || !isApp) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-750">
          Required Documents Checklist
        </h4>

        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="space-y-2 text-xs">
          {Object.keys(docs).map((docName) => {
            const status = docs[docName] || "pending";
            return (
              <div
                key={docName}
                className="flex items-center justify-between py-1 border-b border-slate-100/40 last:border-0"
              >
                <span className="font-medium text-slate-750">{docName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold text-slate-500">
                    {status}
                  </span>
                  <button
                    onClick={() => {
                      setApplicationDocs((prev) => ({
                        ...prev,
                        [appId]: {
                          ...(prev[appId] || {}),
                          [docName]: "verified",
                        },
                      }));
                      showToast(`Verified: ${docName}`, "success");
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
