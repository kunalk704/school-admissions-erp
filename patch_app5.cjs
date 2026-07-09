const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Add import
if (!content.includes('ApplicationFormModal')) {
  content = content.replace('import ProfilePage from "./components/ProfilePage.jsx";', 'import ProfilePage from "./components/ProfilePage.jsx";\nimport ApplicationFormModal from "./components/ApplicationFormModal.jsx";');
}

// 2. Add state and submit handler
if (!content.includes('const [isFormModalOpen, setIsFormModalOpen]')) {
  const insertStateIdx = content.indexOf('const [isNotificationsOpen, setIsNotificationsOpen]');
  if (insertStateIdx !== -1) {
    const newStateStr = `
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalData, setFormModalData] = useState(null);
  const [formModalMode, setFormModalMode] = useState("edit");

  const handleFormModalSubmit = (updatedData) => {
    if (formModalMode === "elevate") {
      const enq = formModalData;
      const existingAppId = \`APP-2026-\${enq.id.split("-")[2] || "999"}\`;
      
      const newApp = {
        id: existingAppId,
        studentName: updatedData.studentName,
        grade: updatedData.grade,
        parentName: updatedData.parentName,
        phone: updatedData.phone,
        email: updatedData.email,
        previousSchool: updatedData.source || "Montessori Day Care (Pending Intake Details)",
        status: "Document Verification",
        timestamp: "Today • Just now",
        siblingEnrolled: false,
        score: 85,
      };

      setApplications((prev) => [newApp, ...prev]);

      setEnquiries((prev) =>
        prev.map((e) => (e.id === enq.id ? { ...e, status: "Contacted" } : e)),
      );

      const newLog = {
        id: \`LOG-\${Date.now()}\`,
        type: "status_change",
        title: "Enquiry Promoted",
        description: \`Inquiry for \${updatedData.studentName} has been converted into an Active Application.\`,
        timestamp: "Today • Just now",
        actor: "Admissions Officer",
        tag: "Converted",
      };
      setActivities((prev) => [newLog, ...prev]);

      showToast(\`Converted: official Application dossier \${newApp.id} generated!\`, "success");
      setActiveTab("applications");
      setSelectedDetail(null);
    } else if (formModalMode === "edit") {
      if (selectedDetail && selectedDetail.type === "enquiry") {
        setEnquiries(prev => prev.map(e => e.id === selectedDetail.id ? { ...e, ...updatedData } : e));
      } else if (selectedDetail && (selectedDetail.type === "application" || selectedDetail.type === "enrollment")) {
        setApplications(prev => prev.map(a => a.id === selectedDetail.id ? { ...a, ...updatedData } : a));
      }
      showToast("Details updated successfully", "success");
    }
  };
`;
    content = content.substring(0, insertStateIdx) + newStateStr + content.substring(insertStateIdx);
  }
}

// 3. Update "Elevate to Application" logic
const elevateOldLogic = `convertEnquiryToApplication(detailData);\n                                    setSelectedDetail(null);`;
const elevateNewLogic = `setFormModalData(detailData);\n                                    setFormModalMode("elevate");\n                                    setIsFormModalOpen(true);`;
content = content.replace(elevateOldLogic, elevateNewLogic);

// 4. Update "Edit" logic
const editOldLogicRegex = /showToast\(\s*"Edit details mode"\s*,\s*"info"\s*\)/g;
const editNewLogic = `(() => { setFormModalData(detailData); setFormModalMode("edit"); setIsFormModalOpen(true); })()`;
content = content.replace(editOldLogicRegex, editNewLogic);

// 5. Add Modal to the bottom
if (!content.includes('<ApplicationFormModal')) {
  const lastClosingDiv = content.lastIndexOf('</div>');
  if (lastClosingDiv !== -1) {
    const modalJSX = `
      <ApplicationFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={formModalData}
        mode={formModalMode}
        onSubmit={handleFormModalSubmit}
      />
`;
    content = content.substring(0, lastClosingDiv) + modalJSX + content.substring(lastClosingDiv);
  }
}

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx patched with ApplicationFormModal integration');
