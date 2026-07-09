const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Rename Next Steps -> Applicant Actions
content = content.replace(
  '<h4 className="text-xl font-semibold text-slate-800 mb-2">{isEnr ? "Quick Actions" : "Next Steps"}</h4>',
  '<h4 className="text-xl font-semibold text-slate-800 mb-2">{isApp ? "Applicant Actions" : isEnr ? "Quick Actions" : "Next Steps"}</h4>'
);

// 2. Replace isApp buttons
const btnRegex = /\{isApp && \(\s*<>\s*<button[\s\S]*?handleApproveApplication[\s\S]*?ShieldCheck[\s\S]*?<\/button>\s*<button[\s\S]*?VERIFY DOCUMENTS[\s\S]*?<\/button>\s*<button[\s\S]*?SEND TEST RESULTS[\s\S]*?<\/button>\s*<button[\s\S]*?HOLD APPLICATION[\s\S]*?<\/button>\s*<\/>\s*\)\}/;

const newBtns = `{isApp && (
                                    <>
                                      <button
                                        onClick={() => showToast(\`Follow-up logged successfully.\`, "success")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[15px] font-semibold rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
                                      >
                                        <Phone className="w-4 h-4" /> Log Follow-up
                                      </button>
                                      <button
                                        onClick={() => showToast(\`Reassignment panel opened.\`, "info")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[15px] font-semibold rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
                                      >
                                        <User className="w-4 h-4" /> Reassign Counselor
                                      </button>
                                      <button
                                        onClick={() => showToast(\`Internal note editor opened.\`, "success")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[15px] font-semibold rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
                                      >
                                        <Edit2 className="w-4 h-4" /> Add Internal Note
                                      </button>
                                    </>
                                  )}`;

if(content.match(btnRegex)) {
    content = content.replace(btnRegex, newBtns);
    console.log("Buttons replaced successfully.");
} else {
    console.log("Failed to match buttons block.");
}

fs.writeFileSync('src/App.jsx', content);
