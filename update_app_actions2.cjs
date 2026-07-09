const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf-8');

// The block we want to replace is immediately after:
// <h4 className="text-xl font-semibold text-slate-800 mb-2">{isApp ? "Applicant Actions" : isEnr ? "Quick Actions" : "Next Steps"}</h4>
// Let's find it.

const marker = '{isApp ? "Applicant Actions" : isEnr ? "Quick Actions" : "Next Steps"}</h4>';
const markerIdx = content.indexOf(marker);

if (markerIdx !== -1) {
    const isAppStartStr = '{isApp && (';
    const startIdx = content.indexOf(isAppStartStr, markerIdx);
    
    if (startIdx !== -1) {
        // We know it ends with `</>\n                                  )}`
        // Let's find HOLD APPLICATION
        const endIndicator = 'HOLD APPLICATION';
        const endIndicatorIdx = content.indexOf(endIndicator, startIdx);
        
        if (endIndicatorIdx !== -1) {
            const endBlockStr = '</>\n                                  )}';
            const endIdx = content.indexOf(endBlockStr, endIndicatorIdx) + endBlockStr.length;
            
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
            
            content = content.substring(0, startIdx) + newBtns + content.substring(endIdx);
            fs.writeFileSync('src/App.jsx', content);
            console.log("Buttons replaced using index math.");
        } else {
            console.log("Could not find HOLD APPLICATION inside block");
        }
    } else {
        console.log("Could not find {isApp && ( after marker");
    }
} else {
    console.log("Could not find marker");
}
