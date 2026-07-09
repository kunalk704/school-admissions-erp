import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Search,
  Bell,
  User,
  Calendar,
  Sparkles,
  Clock,
  X,
  Phone,
  Mail,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Building,
  ShieldCheck,
  Loader2,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CreditCard,
  MoreHorizontal,
  CalendarClock,
  Bus,
  LogOut,
  Menu,
  Edit2,
} from "lucide-react";
import {
  initialEnquiries,
  initialApplications,
  initialActions,
  initialActivities,
} from "./data.js";
import NotificationsPanel from "./components/NotificationsPanel.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import ApplicationFormModal from "./components/ApplicationFormModal.jsx";

export default function App() {
  // Primary States
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [applications, setApplications] = useState(initialApplications);
  const [actions, setActions] = useState(initialActions);
  const [activities, setActivities] = useState(initialActivities);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const [stats, setStats] = useState({
    enrolled: 458,
    target: 500,
    totalEnquiries: 612,
    activeApplications: 184,
  });

  // UI Interactive States
  const [activeSlideOver, setActiveSlideOver] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isProcessing, setIsProcessing] = useState(null); // State for loading visual clicks

  // Table Pagination States
  const [enquiriesPage, setEnquiriesPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(14);

  // Datatable Switched Tabs state
  const [activeTab, setActiveTab] = useState("enquiries");
  const [activePage, setActivePage] = useState("dashboard");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalData, setFormModalData] = useState(null);
  const [formModalMode, setFormModalMode] = useState("edit");
  const [isAppEditDrawerOpen, setIsAppEditDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState({});

  const handleFormModalSubmit = (updatedData) => {
    if (formModalMode === "elevate") {
      const enq = formModalData;
      const existingAppId = `APP-2026-${enq.id.split("-")[2] || "999"}`;

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
        id: `LOG-${Date.now()}`,
        type: "status_change",
        title: "Enquiry Promoted",
        description: `Inquiry for ${updatedData.studentName} has been converted into an Active Application.`,
        timestamp: "Today • Just now",
        actor: "Admissions Officer",
        tag: "Converted",
      };
      setActivities((prev) => [newLog, ...prev]);

      showToast(`Converted: official Application dossier ${newApp.id} generated!`, "success");
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailSubTab, setDetailSubTab] = useState("profile");

  // Column Visibility States
  const [enquiryVisibleColumns, setEnquiryVisibleColumns] = useState([
    "id",
    "studentName",
    "grade",
    "parentName",
    "phone",
    "parentEmail",
    "source",
    "status",
  ]);
  const [applicationVisibleColumns, setApplicationVisibleColumns] = useState([
    "id",
    "studentName",
    "grade",
    "parentName",
    "phone",
    "previousSchool",
    "score",
    "status",
    "actions",
  ]);
  const [enrollmentVisibleColumns, setEnrollmentVisibleColumns] = useState([
    "id",
    "studentName",
    "grade",
    "parentName",
    "phone",
    "timestamp",
    "homeroom",
    "status",
  ]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState("studentName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filters
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("All");
  const [enquirySourceFilter, setEnquirySourceFilter] = useState("All");

  const [appStatusFilter, setAppStatusFilter] = useState("All");
  const [appSiblingFilter, setAppSiblingFilter] = useState("All");

  const [enrollStatusFilter, setEnrollStatusFilter] = useState("All");
  const [enrollGradeFilter, setEnrollGradeFilter] = useState("All");

  // Custom Dossier States
  const [customNotes, setCustomNotes] = useState({});
  const [onboardingChecks, setOnboardingChecks] = useState({});
  const [assignedHomerooms, setAssignedHomerooms] = useState({});
  const [noteInput, setNoteInput] = useState("");

  // Dedicated Application Detail States
  const [applicationDocs, setApplicationDocs] = useState({});
  const [assessments, setAssessments] = useState({});
  const [interviews, setInterviews] = useState({});
  const [financials, setFinancials] = useState({});

  const ONBOARDING_STEPS = [
    { id: "tuition", label: "First Installment Paid" },
    { id: "medical", label: "Immunization Records Verified" },
    { id: "uniform", label: "Uniform Fitting Complete" },
    { id: "transport", label: "Transport / Bus Route Assigned" },
    { id: "kit", label: "Welcome Portal Activated" },
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const addCustomNote = (itemId) => {
    if (!noteInput.trim()) return;
    setCustomNotes((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), noteInput.trim()],
    }));

    // Add activity log
    const newLog = {
      id: `LOG-${Date.now()}`,
      type: "document",
      title: "Dossier Comment Logged",
      description: `Note appended to candidate ID ${itemId}: "${noteInput.trim().substring(0, 30)}..."`,
      timestamp: "Today • Just now",
      actor: "Principal Office",
    };
    setActivities((prev) => [newLog, ...prev]);

    setNoteInput("");
    showToast("Dossier note appended successfully", "success");
  };

  const toggleOnboarding = (enrollId, stepId) => {
    setOnboardingChecks((prev) => {
      const current = prev[enrollId] || {};
      const updated = { ...current, [stepId]: !current[stepId] };

      const totalCount = Object.values(updated).filter(Boolean).length;
      if (totalCount === ONBOARDING_STEPS.length) {
        showToast(
          "Onboarding complete: Seat fully secured and onboarded!",
          "success",
        );
      }
      return { ...prev, [enrollId]: updated };
    });
  };

  const convertEnquiryToApplication = (enq) => {
    const existingAppId = `APP-2026-${enq.id.split("-")[2] || "999"}`;
    if (applications.some((app) => app.id === existingAppId)) {
      showToast("This enquiry has already been converted!", "info");
      return;
    }

    const newApp = {
      id: existingAppId,
      studentName: enq.studentName,
      grade: enq.grade,
      parentName: enq.parentName,
      phone: enq.phone,
      previousSchool: "Montessori Day Care (Pending Intake Details)",
      status: "Document Verification",
      timestamp: "Today • Just now",
      siblingEnrolled: false,
      score: 85,
    };

    setApplications((prev) => [newApp, ...prev]);

    // Mark original enquiry as contacted/processed
    setEnquiries((prev) =>
      prev.map((e) => (e.id === enq.id ? { ...e, status: "Contacted" } : e)),
    );

    // Append real-time activity log
    const newLog = {
      id: `LOG-${Date.now()}`,
      type: "status_change",
      title: "Enquiry Promoted",
      description: `Inquiry for ${enq.studentName} has been converted into an Active Application.`,
      timestamp: "Today • Just now",
      actor: "Admissions Officer",
      tag: "Converted",
    };
    setActivities((prev) => [newLog, ...prev]);

    showToast(
      `Converted: official Application dossier ${newApp.id} generated!`,
      "success",
    );
    setActiveTab("applications");
  };

  // Urgent Tasks / Actions Log state
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionPriority, setNewActionPriority] = useState("high");
  const [newActionMeta, setNewActionMeta] = useState("");

  // Important Graph interactive states
  const [activeGraphTab, setActiveGraphTab] = useState("line");
  const [hoveredDataIdx, setHoveredDataIdx] = useState(null);


  // Show premium success toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ERP Actions: Approve Application
  const handleApproveApplication = (appId, studentName) => {
    setIsProcessing(appId);

    setTimeout(() => {
      // Update application state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: "Approved" } : app,
        ),
      );

      // Dynamically update dashboard statistics
      setStats((prev) => ({
        ...prev,
        enrolled: prev.enrolled + 1,
        activeApplications: Math.max(0, prev.activeApplications - 1),
      }));

      // Append real-time activity log
      const newLog = {
        id: `LOG-${Date.now()}`,
        type: "status_change",
        title: "Application Approved",
        description: `Principal Evelyn Vance officially approved admission file for ${studentName}.`,
        timestamp: "Today • Just now",
        actor: "Principal Office",
        tag: "Official Sign-off",
      };
      setActivities((prev) => [newLog, ...prev]);

      // Remove or resolve today's action item if relevant
      if (appId === "APP-2026-105") {
        setActions((prev) => prev.filter((act) => act.id !== "ACT-001"));
      }

      setIsProcessing(null);
      setSelectedApplication(null);
      showToast(
        `Admissions File Approved: Welcomed ${studentName} to the Academy!`,
        "success",
      );
    }, 800);
  };

  // ERP Actions: Mark application as Lost
  const handleMarkAsLost = (appId, studentName) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "Lost" } : app)),
    );

    // Append real-time activity log
    const newLog = {
      id: `LOG-${Date.now()}`,
      type: "status_change",
      title: "Application Marked as Lost",
      description: `Application file for ${studentName} was marked as Lost/Withdrawn.`,
      timestamp: "Today • Just now",
      actor: "Admissions Officer",
      tag: "Withdrawn",
    };
    setActivities((prev) => [newLog, ...prev]);
    showToast(
      `Application for ${studentName} marked as Lost/Withdrawn.`,
      "info",
    );
  };

  // ERP Actions: Log a new urgent action item
  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const newAct = {
      id: `ACT-${Date.now()}`,
      title: newActionTitle.trim(),
      description:
        newActionMeta.trim() || "Urgent task requiring Principal attention.",
      type:
        newActionPriority === "critical"
          ? "assessment"
          : newActionPriority === "high"
            ? "approval"
            : "meeting",
      time: "Due soon",
      status: "Pending",
      meta: `${newActionPriority.toUpperCase()} PRIORITY`,
    };

    setActions((prev) => [...prev, newAct]);

    // Append real-time activity log for adding
    const newLog = {
      id: `LOG-${Date.now()}`,
      type: "status_change",
      title: "Urgent Task Logged",
      description: `Principal Evelyn Vance registered an urgent task: "${newActionTitle.trim()}"`,
      timestamp: "Today • Just now",
      actor: "Principal Office",
      tag: newActionPriority.toUpperCase(),
    };
    setActivities((prev) => [newLog, ...prev]);

    setNewActionTitle("");
    setNewActionMeta("");
    showToast(`Urgent task logged: ${newActionTitle.trim()}`, "success");
  };

  // ERP Actions: Complete Action task
  const handleCompleteAction = (actionId, actionTitle) => {
    setActions((prev) => prev.filter((act) => act.id !== actionId));

    // Append real-time activity log
    const newLog = {
      id: `LOG-${Date.now()}`,
      type: "status_change",
      title: "Action Item Resolved",
      description: `Task completed: "${actionTitle}"`,
      timestamp: "Today • Just now",
      actor: "Principal Office",
    };
    setActivities((prev) => [newLog, ...prev]);
    showToast(`Task marked as complete: ${actionTitle}`, "success");
  };

  // Filter lists inside slide-overs based on search query
  const filteredEnquiries = enquiries.filter(
    (enq) =>
      enq.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.phone &&
        enq.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      enq.grade.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredApplications = applications.filter(
    (app) =>
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.phone &&
        app.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen relative selection:bg-slate-900 selection:text-white bg-[#F8FAFD] flex font-sans"
      id="main-root"
    >
      {/* Edge-to-edge Desktop App Container */}
      <div
        className="w-full bg-[#F8FAFD] flex flex-col lg:flex-row min-h-screen"
        id="floating-workspace-container"
      >
        {/* SIDEBAR */}
        <aside
          className={`bg-gradient-to-b from-[#2E5BFF] to-[#1E3BB3] text-white flex flex-col justify-between shrink-0 relative overflow-hidden border-r border-slate-200/20 transition-all duration-300 ${isSidebarExpanded ? "w-full lg:w-[260px] p-6" : "w-[80px] p-4 items-center"}`}
          id="schooltec-sidebar"
        >
          {/* Subtle decorative circles to match premium look */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

          <div className="w-full flex flex-col gap-8">
            <div
              className={`flex items-center ${isSidebarExpanded ? "justify-between" : "flex-col gap-4"} w-full`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                  <Building className="w-5 h-5 text-white" />
                </div>
                {isSidebarExpanded && (
                  <div>
                    <span className="text-white block leading-none font-semibold text-[17px] tracking-tight text-slate-900">
                      Schooltec
                    </span>
                    <span className="text-[10px] text-white/60 block mt-1">
                      Principal ERP
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1 w-full">
              {[
                { name: "Admissions", icon: LayoutDashboard, active: true },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    className={`w-full flex items-center ${isSidebarExpanded ? "justify-start px-4" : "justify-center px-0"} py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${item.active
                      ? "bg-white/12 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/10 font-semibold"
                      : "text-white/75 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    onClick={() => {
                      if (item.name === "Admissions") setActivePage("dashboard");
                      setToast({
                        message: `Viewing ${item.name} module...`,
                        type: "info",
                      });
                    }}
                    title={!isSidebarExpanded ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4.5 h-4.5 ${item.active ? "text-white" : "text-white/60"}`}
                      />
                      {isSidebarExpanded && <span>{item.name}</span>}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Logout */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full">
            <div
              className={`flex ${isSidebarExpanded ? "flex-col gap-2" : "flex-col gap-4 items-center"}`}
            >
              <div
                className={`flex items-center ${isSidebarExpanded ? "gap-3 px-2 mb-2" : "justify-center"}`}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                {isSidebarExpanded && (
                  <div className="flex flex-col cursor-pointer" onClick={() => setActivePage("profile")}>
                    <span className="text-sm font-semibold text-white hover:underline">
                      Admin User
                    </span>
                    <span className="text-xs text-white/60">
                      admin@schooltec.com
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setToast({ message: "Logging out...", type: "info" });
                }}
                className={`w-full flex items-center ${isSidebarExpanded ? "gap-3 px-4" : "justify-center px-0"} py-2.5 rounded-xl text-sm font-medium text-white/75 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all cursor-pointer`}
                title={!isSidebarExpanded ? "Logout" : undefined}
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                {isSidebarExpanded && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main
          className="flex-1 p-6 md:p-8 flex flex-col justify-start overflow-y-auto"
          id="main-workspace-content"
        >
          {/* Workspace Header */}
          {activePage === "profile" ? (<ProfilePage onBack={() => setActivePage("dashboard")} />) : (
            <>
              <div
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedDetail ? "mb-2" : "mb-8"}`}
                id="workspace-header"
              >
                <div className="flex flex-col items-start gap-0.5">
                  {selectedDetail && (
                    <h2 className="font-bold text-2xl tracking-tight text-slate-900">
                      {selectedDetail.type === "enquiry"
                        ? "Enquiry Detail"
                        : selectedDetail.type === "application"
                          ? "Application Details"
                          : "Enrollment Details"}
                    </h2>
                  )}
                  {selectedDetail && (
                    <button
                      onClick={() => setSelectedDetail(null)}
                      className="hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[13px] font-medium text-slate-500"
                      title={selectedDetail.type === "enquiry" ? "All Enquiries" : selectedDetail.type === "application" ? "All Applications" : "All Enrollments"}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      {selectedDetail.type === "enquiry" ? "All Enquiries" : selectedDetail.type === "application" ? "All Applications" : "All Enrollments"}
                    </button>
                  )}
                </div>

                {/* Interactive tools, Live clock, notifications, search bar, profile */}
                <div className="flex flex-wrap items-center gap-3.5">
                  {/* Search Input bar aligned cleanly with the header */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for students/teachers/document..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-60 pl-3.5 pr-10 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2E5BFF]/30 font-sans transition-all"
                    />

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                      <span className="text-slate-300 mr-1.5">|</span>
                      <Search className="w-3.5 h-3.5 hover:text-[#2E5BFF] cursor-pointer" />
                    </div>
                  </div>


                  {/* Bell Notifications */}
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
                  >
                    <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                    <Bell className="w-3.5 h-3.5" />
                  </button>

                  {/* Avatar Profile */}
                  <div
                    className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                    onClick={() => setActivePage("profile")}
                  >
                    P
                  </div>
                </div>
              </div>

              {/* TOP METRICS CARDS (Mockup Inspired: simplified to focus on numbers) */}
              {!selectedDetail && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
                  id="workspace-top-cards"
                >
                  {/* CARD 1: Total Enquiries */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => {
                      setActiveTab("enquiries");
                    }}
                    className="bg-gradient-to-br from-blue-50/90 to-indigo-50/30 border border-blue-100/80 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-blue-300/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-blue-700/85 text-[10px] uppercase tracking-widest font-bold">
                        TOTAL ENQUIRIES
                      </span>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-3xl font-display font-bold text-blue-950 leading-none">
                          {stats.totalEnquiries}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                      <MessageSquare className="w-5.5 h-5.5" />
                    </div>
                  </motion.div>

                  {/* CARD 2: Active Applications */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => {
                      setActiveTab("applications");
                    }}
                    className="bg-gradient-to-br from-purple-50/90 to-violet-50/30 border border-purple-100/80 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-purple-300/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-purple-700/85 text-[10px] uppercase tracking-widest font-bold">
                        ACTIVE APPLICATIONS
                      </span>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-3xl font-display font-bold text-purple-950 leading-none">
                          {stats.activeApplications}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                      <FileText className="w-5.5 h-5.5" />
                    </div>
                  </motion.div>

                  {/* CARD 3: Enrolled Students */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => {
                      setActiveTab("enrollments");
                    }}
                    className="bg-gradient-to-br from-emerald-50/90 to-teal-50/30 border border-emerald-100/80 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:border-emerald-300/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-emerald-700/85 text-[10px] uppercase tracking-widest font-bold">
                        ENROLLED STUDENTS
                      </span>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-3xl font-display font-bold text-emerald-950 leading-none">
                          {stats.enrolled}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <GraduationCap className="w-5.5 h-5.5" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* DATATABLE ENGINE AND LAYOUT ROUTER */}
              {(() => {
                // Compute enrollments inline to ensure latest state is reflected
                const dynamicEnrollments = applications
                  .filter((a) => a.status === "Approved")
                  .map((app) => ({
                    id: app.id,
                    studentName: app.studentName,
                    grade: app.grade,
                    parentName: app.parentName,
                    timestamp: app.timestamp || "Today • 10:14 AM",
                    status: "Seat Secured",
                    isDynamic: true,
                    email: "parent.contact@academy.edu",
                    phone: app.phone || "+91 99581 22334",
                  }));

                const staticEnrollments = [
                  {
                    id: "ENR-2026-100",
                    studentName: "Aarav Sharma",
                    grade: "Grade 8",
                    parentName: "Rajesh Sharma",
                    email: "sharma0@example.com",
                    phone: "+91 99999 00000",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-101",
                    studentName: "Vihaan Patel",
                    grade: "Grade 8",
                    parentName: "Manish Patel",
                    email: "patel1@example.com",
                    phone: "+91 99999 00001",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-102",
                    studentName: "Vivaan Singh",
                    grade: "Grade 8",
                    parentName: "Vikram Singh",
                    email: "singh2@example.com",
                    phone: "+91 99999 00002",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-103",
                    studentName: "Ananya Gupta",
                    grade: "Grade 8",
                    parentName: "Amit Gupta",
                    email: "gupta3@example.com",
                    phone: "+91 99999 00003",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-104",
                    studentName: "Diya Reddy",
                    grade: "Grade 8",
                    parentName: "Sanjay Reddy",
                    email: "reddy4@example.com",
                    phone: "+91 99999 00004",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-105",
                    studentName: "Advik Nair",
                    grade: "Grade 8",
                    parentName: "Suresh Nair",
                    email: "nair5@example.com",
                    phone: "+91 99999 00005",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-106",
                    studentName: "Reyansh Iyer",
                    grade: "Grade 8",
                    parentName: "Prakash Iyer",
                    email: "iyer6@example.com",
                    phone: "+91 99999 00006",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-107",
                    studentName: "Myra Desai",
                    grade: "Grade 8",
                    parentName: "Ramesh Desai",
                    email: "desai7@example.com",
                    phone: "+91 99999 00007",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-108",
                    studentName: "Kiara Joshi",
                    grade: "Grade 8",
                    parentName: "Anil Joshi",
                    email: "joshi8@example.com",
                    phone: "+91 99999 00008",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-109",
                    studentName: "Kabir Verma",
                    grade: "Grade 8",
                    parentName: "Sunil Verma",
                    email: "verma9@example.com",
                    phone: "+91 99999 00009",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-110",
                    studentName: "Ishan Kapoor",
                    grade: "Grade 8",
                    parentName: "Vivek Kapoor",
                    email: "kapoor10@example.com",
                    phone: "+91 99999 00010",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-111",
                    studentName: "Dhruv Bhatia",
                    grade: "Grade 8",
                    parentName: "Rohan Bhatia",
                    email: "bhatia11@example.com",
                    phone: "+91 99999 00011",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-112",
                    studentName: "Riya Mehta",
                    grade: "Grade 8",
                    parentName: "Neeraj Mehta",
                    email: "mehta12@example.com",
                    phone: "+91 99999 00012",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-113",
                    studentName: "Zara Ali",
                    grade: "Grade 8",
                    parentName: "Imran Ali",
                    email: "ali13@example.com",
                    phone: "+91 99999 00013",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "ENR-2026-114",
                    studentName: "Arjun Rao",
                    grade: "Grade 8",
                    parentName: "Krishna Rao",
                    email: "rao14@example.com",
                    phone: "+91 99999 00014",
                    status: "Seat Secured",
                    timestamp: "Today • 10:00 AM",
                  },
                  {
                    id: "APP-2026-088",
                    studentName: "Ishaan Malhotra",
                    grade: "Grade 11 - Commerce",
                    parentName: "Ravi Malhotra",
                    timestamp: "Yesterday • 11:30 AM",
                    status: "Pre-registered",
                    isDynamic: false,
                    email: "ishaan@malhotra.com",
                    phone: "+91 98765 43210",
                  },
                  {
                    id: "APP-2026-079",
                    studentName: "Zara Gallagher",
                    grade: "Grade 4",
                    parentName: "Liam Gallagher",
                    timestamp: "2 Days Ago • 09:00 AM",
                    status: "Pre-registered",
                    isDynamic: false,
                    email: "zara@gallagher.com",
                    phone: "+91 98111 22233",
                  },
                ];

                const enrollmentsList = [
                  ...dynamicEnrollments,
                  ...staticEnrollments,
                ];

                // FILTER AND SORT LOGIC
                const effectiveSearch = tableSearchQuery || searchQuery;
                const processedEnquiries = enquiries
                  .filter((enq) => {
                    const searchLower = effectiveSearch.toLowerCase();
                    const matchesSearch =
                      effectiveSearch === "" ||
                      Object.values(enq).some(
                        (val) =>
                          val !== null &&
                          val !== undefined &&
                          String(val).toLowerCase().includes(searchLower),
                      );

                    const matchesStatus =
                      enquiryStatusFilter === "All" ||
                      enq.status === enquiryStatusFilter;
                    const matchesSource =
                      enquirySourceFilter === "All" ||
                      enq.source === enquirySourceFilter;

                    return matchesSearch && matchesStatus && matchesSource;
                  })
                  .sort((a, b) => {
                    let comparison = 0;
                    if (sortField === "studentName") {
                      comparison = a.studentName.localeCompare(b.studentName);
                    } else if (sortField === "grade") {
                      comparison = a.grade.localeCompare(b.grade);
                    } else if (sortField === "status") {
                      comparison = a.status.localeCompare(b.status);
                    } else if (sortField === "id") {
                      comparison = a.id.localeCompare(b.id);
                    } else if (sortField === "parentName") {
                      comparison = a.parentName.localeCompare(b.parentName);
                    } else if (sortField === "phone") {
                      comparison = (a.phone || "").localeCompare(b.phone || "");
                    } else if (sortField === "parentEmail") {
                      comparison = a.email.localeCompare(b.email);
                    } else if (sortField === "source") {
                      comparison = a.source.localeCompare(b.source);
                    } else {
                      comparison = a.studentName.localeCompare(b.studentName);
                    }
                    return sortOrder === "asc" ? comparison : -comparison;
                  });

                const processedApplications = applications
                  .filter((app) => {
                    const searchLower = effectiveSearch.toLowerCase();
                    const visualStatus =
                      app.status === "Awaiting Interview"
                        ? "Interview"
                        : app.status === "Entrance Test Passed"
                          ? "Test Passed"
                          : app.status === "Document Verification"
                            ? "Verification"
                            : app.status;
                    const matchesSearch =
                      effectiveSearch === "" ||
                      Object.values(app).some(
                        (val) =>
                          val !== null &&
                          val !== undefined &&
                          String(val).toLowerCase().includes(searchLower),
                      ) ||
                      visualStatus.toLowerCase().includes(searchLower);

                    const matchesStatus =
                      appStatusFilter === "All" || app.status === appStatusFilter;
                    const matchesSibling =
                      appSiblingFilter === "All" ||
                      (appSiblingFilter === "Sibling" && app.siblingEnrolled) ||
                      (appSiblingFilter === "No Sibling" && !app.siblingEnrolled);

                    return matchesSearch && matchesStatus && matchesSibling;
                  })
                  .sort((a, b) => {
                    let comparison = 0;
                    if (sortField === "studentName") {
                      comparison = a.studentName.localeCompare(b.studentName);
                    } else if (sortField === "grade") {
                      comparison = a.grade.localeCompare(b.grade);
                    } else if (sortField === "status") {
                      comparison = a.status.localeCompare(b.status);
                    } else if (sortField === "score") {
                      comparison = (a.score || 0) - (b.score || 0);
                    } else if (sortField === "id") {
                      comparison = a.id.localeCompare(b.id);
                    } else if (sortField === "parentName") {
                      comparison = a.parentName.localeCompare(b.parentName);
                    } else if (sortField === "phone") {
                      comparison = (a.phone || "").localeCompare(b.phone || "");
                    } else {
                      comparison = a.studentName.localeCompare(b.studentName);
                    }
                    return sortOrder === "asc" ? comparison : -comparison;
                  });

                const processedEnrollments = enrollmentsList
                  .filter((enroll) => {
                    const searchLower = effectiveSearch.toLowerCase();
                    const visualStatus =
                      enroll.status === "Seat Secured"
                        ? "Secured"
                        : enroll.status === "Pending Documents"
                          ? "Pending"
                          : enroll.status;
                    const matchesSearch =
                      effectiveSearch === "" ||
                      Object.values(enroll).some(
                        (val) =>
                          val !== null &&
                          val !== undefined &&
                          String(val).toLowerCase().includes(searchLower),
                      ) ||
                      visualStatus.toLowerCase().includes(searchLower);

                    const matchesStatus =
                      enrollStatusFilter === "All" ||
                      enroll.status === enrollStatusFilter;

                    let matchesGrade = true;
                    if (enrollGradeFilter !== "All") {
                      if (enrollGradeFilter === "Grade 11-12") {
                        matchesGrade =
                          enroll.grade.includes("Grade 11") ||
                          enroll.grade.includes("Grade 12");
                      } else if (enrollGradeFilter === "Middle School") {
                        matchesGrade =
                          enroll.grade.includes("Grade 6") ||
                          enroll.grade.includes("Grade 8");
                      } else if (enrollGradeFilter === "Primary/K") {
                        matchesGrade =
                          enroll.grade.includes("Grade 4") ||
                          enroll.grade.includes("Kindergarten");
                      }
                    }

                    return matchesSearch && matchesStatus && matchesGrade;
                  })
                  .sort((a, b) => {
                    let comparison = 0;
                    if (sortField === "studentName") {
                      comparison = a.studentName.localeCompare(b.studentName);
                    } else if (sortField === "grade") {
                      comparison = a.grade.localeCompare(b.grade);
                    } else if (sortField === "status") {
                      comparison = a.status.localeCompare(b.status);
                    } else if (sortField === "id") {
                      comparison = a.id.localeCompare(b.id);
                    } else if (sortField === "parentName") {
                      comparison = a.parentName.localeCompare(b.parentName);
                    } else if (sortField === "phone") {
                      comparison = a.phone.localeCompare(b.phone);
                    } else if (sortField === "timestamp") {
                      comparison = a.timestamp.localeCompare(b.timestamp);
                    } else {
                      comparison = a.studentName.localeCompare(b.studentName);
                    }
                    return sortOrder === "asc" ? comparison : -comparison;
                  });

                // DETAIL PAGE RENDERING
                if (selectedDetail) {
                  let detailData = null;
                  if (selectedDetail.type === "enquiry") {
                    detailData = enquiries.find((e) => e.id === selectedDetail.id);
                  } else if (selectedDetail.type === "application") {
                    detailData = applications.find(
                      (a) => a.id === selectedDetail.id,
                    );
                  } else if (selectedDetail.type === "enrollment") {
                    detailData = enrollmentsList.find(
                      (e) => e.id === selectedDetail.id,
                    );
                  }

                  if (!detailData) {
                    return (
                      <div className="bg-white p-12 text-center rounded-[24px] border border-slate-100 shadow-sm">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h4 className="text-base font-bold text-slate-800">
                          Dossier File Not Found
                        </h4>
                        <p className="mt-1 text-[13px] font-medium text-slate-500">
                          The requested profile key is invalid or has been archived.
                        </p>
                        <button
                          onClick={() => setSelectedDetail(null)}
                          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          Return to Admissions Hub
                        </button>
                      </div>
                    );
                  }

                  const appId = detailData.id;
                  const isApp = selectedDetail.type === "application";
                  const isEnq = selectedDetail.type === "enquiry";
                  const isEnr = selectedDetail.type === "enrollment";
                  const activeSubTab =
                    isEnq && detailSubTab === "workflow" ? "profile" : detailSubTab;

                  const docs = applicationDocs[appId] || {
                    "Birth Certificate": "verified",
                    "Previous Report Card": "pending",
                    "Address Proof": "pending",
                    "Immunization Records": "pending",
                  };
                  const verifiedCount = Object.keys(docs).filter(
                    (k) => docs[k] === "verified",
                  ).length;
                  const progressPercentage = Math.round((verifiedCount / 4) * 100);

                  const assessment = assessments[appId] || {
                    date: "",
                    status: "Not scheduled",
                  };
                  const interview = interviews[appId] || {
                    date: "",
                    status: "Not scheduled",
                  };
                  const fin = financials[appId] || {
                    responsibility: "Self (Primary Guardian)",
                    scholarship: false,
                  };

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                      id="student-profile-page"
                    >
                      {isEnq ? (
                        <div className="space-y-8 pb-12 max-w-6xl mx-auto px-6 xl:px-8">
                          {/* Updated Header layout */}


                          {/* Unified Master Card */}
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-2">
                            {/* Section 1: Header Details */}
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {detailData.studentName}
                                  </h1>
                                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 mt-1 text-[13px] font-medium text-slate-500">
                                    ID: {detailData.id}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-5">
                                  <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5 shadow-sm text-[13px] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    Callback Queue
                                  </span>
                                  <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 shadow-sm text-[13px] font-semibold">
                                    Grade: {detailData.grade}
                                  </span>
                                  <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 shadow-sm text-[13px] font-semibold">
                                    Source: {detailData.source}
                                  </span>
                                </div>
                              </div>

                              {/* Assignee Sub-card */}
                              <div
                                className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center gap-3 md:w-64 shrink-0 transition-colors cursor-pointer shadow-sm"
                                onClick={() =>
                                  showToast("Assigning new counsellor...", "info")
                                }
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                                  SJ
                                </div>
                                <div>
                                  <p className="mb-0.5 text-[13px] font-medium text-slate-500">
                                    Assigned To
                                  </p>
                                  <p className="text-slate-800 text-base font-semibold">
                                    Sarah Jenkins
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Main Content Grid */}
                            <div className="flex flex-col lg:flex-row">
                              {/* Left Column: Guardian & Actions */}
                              <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100">
                                {/* Guardian Contact Subsection */}
                                <div className="p-6 md:p-8 border-b border-slate-100">
                                  <h3 className="text-sm font-normal text-slate-800 mb-5">
                                    Guardian Contact
                                  </h3>
                                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                                    <div>
                                      <span className="block mb-1 text-[13px] font-medium text-slate-500">
                                        Name
                                      </span>
                                      <span className="text-sm font-normal text-slate-800">
                                        {detailData.parentName}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block mb-1 text-[13px] font-medium text-slate-500">
                                        Phone
                                      </span>
                                      <span className="text-sm font-normal text-slate-800">
                                        {detailData.phone || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block mb-1 text-[13px] font-medium text-slate-500">
                                        Email
                                      </span>
                                      <span className="text-sm font-normal text-slate-800">
                                        {detailData.email || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="block mb-1 text-[13px] font-medium text-slate-500">
                                        Best Time to Call
                                      </span>
                                      <span className="text-sm font-normal text-slate-800">
                                        3:00 PM - 6:00 PM
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Actions Subsection */}
                                <div className="p-6 md:p-8">
                                  <h3 className="text-sm font-normal text-slate-800 mb-5">
                                    Quick Actions
                                  </h3>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                      onClick={() => {
                                        convertEnquiryToApplication(detailData);
                                        setSelectedDetail(null);
                                      }}
                                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />{" "}
                                      Elevate to Application
                                    </button>
                                    <button
                                      onClick={() =>
                                        showToast(
                                          `Callback scheduled for ${detailData.studentName}`,
                                          "success",
                                        )
                                      }
                                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                    >
                                      <Phone className="w-3.5 h-3.5" /> Log Callback
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Timeline Subsection */}
                              <div className="lg:w-80 xl:w-96 shrink-0 p-6 md:p-8 bg-slate-50/50">
                                <h3 className="text-sm font-normal text-slate-800 mb-6">
                                  Enquiry Timeline
                                </h3>

                                <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 space-y-5">
                                  {/* Timeline Item 1 */}
                                  <div className="relative flex items-start gap-4 group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white bg-blue-50 text-blue-600 shrink-0 z-10 shadow-sm relative">
                                      <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-slate-800 text-base font-semibold">
                                          Outbound Call
                                        </h4>
                                        <span className="text-[13px] font-medium text-slate-500">
                                          10:00 AM
                                        </span>
                                      </div>
                                      <p className="text-xs font-medium text-slate-600">
                                        Left a voicemail regarding curriculum.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Timeline Item 2 */}
                                  <div className="relative flex items-start gap-4 group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white bg-emerald-50 text-emerald-600 shrink-0 z-10 shadow-sm relative">
                                      <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-slate-800 text-base font-semibold">
                                          Brochure Sent
                                        </h4>
                                        <span className="text-[13px] font-medium text-slate-500">
                                          Oct 23
                                        </span>
                                      </div>
                                      <p className="text-xs font-medium text-slate-600">
                                        Automated email sent.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Timeline Item 3 */}
                                  <div className="relative flex items-start gap-4 group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white bg-amber-50 text-amber-600 shrink-0 z-10 shadow-sm relative">
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-slate-800 text-base font-semibold">
                                          New Enquiry
                                        </h4>
                                        <span className="text-[13px] font-medium text-slate-500">
                                          Oct 23
                                        </span>
                                      </div>
                                      <p className="text-xs font-medium text-slate-600 italic">
                                        "Interested in transport."
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Navigation Header for Application & Enrollment Detail */}


                          {/* 3-Column Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-3">
                              <div
                                className={`bg-white border border-slate-200/60 p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden ${isApp ? "rounded-xl" : "rounded-3xl"}`}
                              >
                                {/* Decorative subtle background elements if desired */}
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-transparent"></div>

                                <div
                                  className={`relative w-28 h-28 rounded-full border-4 shadow-sm flex items-center justify-center mb-5 ${isEnq
                                    ? "bg-amber-50/50 border-amber-50"
                                    : isApp
                                      ? "bg-purple-50/50 border-purple-50"
                                      : "bg-emerald-50/50 border-emerald-50"
                                    }`}
                                >
                                  <svg
                                    className={`w-14 h-14 ${isEnq
                                      ? "text-amber-500/80"
                                      : isApp
                                        ? "text-purple-500/80"
                                        : "text-emerald-500/80"
                                      }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                    />
                                  </svg>
                                </div>

                                <div className="space-y-2 w-full relative">
                                  <h3
                                    className="text-2xl font-bold tracking-tight text-slate-900"
                                  >
                                    {detailData.studentName}
                                  </h3>
                                  <p
                                    className="text-sm font-medium text-slate-500"
                                  >
                                    #{detailData.id}
                                  </p>
                                </div>

                                <div className="flex flex-col items-center gap-3 mt-6 w-full relative">
                                  <span
                                    className={`inline-block text-[11px] px-3 py-1 uppercase tracking-wider ${isEnq
                                      ? "font-bold rounded-full text-amber-700 bg-amber-50 border border-amber-100/50"
                                      : isApp
                                        ? "font-medium rounded-full text-slate-600 bg-slate-50 border border-slate-200/60"
                                        : "font-bold rounded-full text-emerald-700 bg-emerald-50 border border-emerald-100/50"
                                      }`}
                                  >
                                    {isEnq
                                      ? "Admissions Prospect"
                                      : isApp
                                        ? "Active Applicant"
                                        : "Secured Enrollment"}
                                  </span>
                                  {(isApp || isEnr) && (
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors text-[13px] font-semibold">
                                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                        SJ
                                      </div>
                                      <span className="text-[11px] font-medium">
                                        Sarah Jenkins
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Custom status grids depending on entity type */}
                                {isEnq && (
                                  <div className="grid grid-cols-2 gap-4 w-full pt-6 mt-6 border-t border-slate-100/60 relative">
                                    <div className="text-center">
                                      <span className="block text-xs font-bold text-amber-600 truncate px-0.5">
                                        {detailData.source}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Source
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-xs font-bold text-slate-800">
                                        {detailData.grade}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Desired
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {isApp && (
                                  <div className="grid grid-cols-2 gap-4 w-full pt-6 mt-6 border-t border-slate-100/60 relative">
                                    <div className="text-center">
                                      <span className="block text-sm font-medium text-slate-800">
                                        {detailData.score
                                          ? `${detailData.score}%`
                                          : "N/A"}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Score
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-sm font-medium text-slate-800">
                                        {detailData.grade}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Applying
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {isEnr && (
                                  <div className="grid grid-cols-3 gap-2 w-full pt-6 mt-6 border-t border-slate-100/60 relative">
                                    <div className="text-center">
                                      <span className="block text-slate-800 text-base font-semibold">
                                        122
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Roll
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-slate-800 truncate px-0.5 text-base font-semibold">
                                        {detailData.grade}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Grade
                                      </span>
                                    </div>
                                    <div className="text-center">
                                      <span className="block text-slate-800 text-base font-semibold">
                                        {assignedHomerooms[detailData.id] || "A"}
                                      </span>
                                      <span className="block mt-1 text-[13px] font-medium text-slate-500">
                                        Sec
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Middle Area */}
                            <div className="lg:col-span-6 space-y-5">
                              <div
                                className={`flex bg-slate-100/60 p-1 gap-1 ${isApp ? "rounded-lg" : "rounded-xl"}`}
                              >
                                <button
                                  onClick={() => setDetailSubTab("profile")}
                                  className={`flex-1 text-center py-2 text-xs transition-all cursor-pointer ${isApp ? "font-medium rounded-md" : "font-bold rounded-lg"} ${activeSubTab === "profile" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                                >
                                  {isEnq ? "Inquiry Details" : "Profile Details"}
                                </button>
                                {!isEnq && (
                                  <button
                                    onClick={() => setDetailSubTab("workflow")}
                                    className={`flex-1 text-center py-2 text-xs transition-all cursor-pointer ${isApp ? "font-medium rounded-md" : "font-bold rounded-lg"} ${activeSubTab === "workflow" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                                  >
                                    {isApp
                                      ? "Required Documents"
                                      : "Onboarding Checklist"}
                                  </button>
                                )}
                                {isApp && (
                                  <button
                                    onClick={() => setDetailSubTab("assessment")}
                                    className={`flex-1 text-center py-2 text-xs transition-all cursor-pointer font-medium rounded-md ${activeSubTab === "assessment" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                                  >
                                    Assessment
                                  </button>
                                )}
                                {isEnr && (
                                  <button
                                    onClick={() => setDetailSubTab("payment")}
                                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSubTab === "payment" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                                  >
                                    Payment
                                  </button>
                                )}
                                <button
                                  onClick={() => setDetailSubTab("decision")}
                                  className={`flex-1 text-center py-2 text-xs transition-all cursor-pointer ${isApp ? "font-medium rounded-md" : "font-bold rounded-lg"} ${activeSubTab === "decision" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                                >
                                  {isEnq
                                    ? "Actions & Comments"
                                    : "Decisions & Notes"}
                                </button>
                              </div>

                              {activeSubTab === "profile" && isEnq && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between pb-2">
                                    <h4 className="font-semibold text-lg tracking-tight text-slate-900">
                                      Prospective Student Demographics
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                        Active Enquiry
                                      </span>
                                      <button
                                        onClick={() =>
                                          (() => { setFormModalData(detailData); setFormModalMode("edit"); setIsFormModalOpen(true); })()
                                        }
                                        className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200"
                                      >
                                        <Edit2 className="w-4 h-4" /> Edit
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between py-1.5 border-b border-slate-100/60">
                                      <span className="text-sm text-slate-500">
                                        Desired Grade
                                      </span>
                                      <span className="text-sm font-semibold text-slate-800">
                                        {detailData.grade}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-100/60">
                                      <span className="text-slate-500">
                                        Inquiry Origin Channel
                                      </span>
                                      <span className="text-sm font-semibold text-slate-800">
                                        {detailData.source}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 py-1">
                                      <span className="text-slate-500">
                                        Prospect Parent Notes / Comments
                                      </span>
                                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3 italic font-light">
                                        "
                                        {detailData.notes ||
                                          "Interested in curriculum details and transport services."}
                                        "
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeSubTab === "profile" && isApp && (
                                <div className="space-y-10 pt-2">
                                  {/* Group 1: Application Information */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-1">
                                      <h4 className="font-semibold text-[16px] tracking-tight text-slate-900">
                                        Application Information
                                      </h4>
                                      <button
                                        onClick={() => {
                                          setDrawerData({
                                            grade: detailData.grade || "Grade 7",
                                            session: detailData.session || "2026-27",
                                            appDate: detailData.appDate || "12 Jun 2026",
                                            previousSchool: detailData.previousSchool || "",
                                            currentGrade: detailData.currentGrade || "Grade 6",
                                            board: detailData.board || "CBSE",
                                            lastResult: detailData.lastResult || "88.5%",
                                            transferCert: detailData.transferCert || "Pending",
                                            scholarship: detailData.scholarship || "No",
                                            transport: detailData.transport || "Yes (Route 4)",
                                            specialReq: detailData.specialReq || ""
                                          });
                                          setIsAppEditDrawerOpen(true);
                                        }}
                                        className="text-[13px] font-semibold text-slate-600 hover:bg-slate-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-slate-200"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Applying For</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.grade || "Grade 7"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Academic Session</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.session || "2026-27"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Application Date</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.appDate || "12 Jun 2026"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Group 2: Academic Background */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-[16px] tracking-tight text-slate-900">
                                      Academic Background
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Previous School</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.previousSchool || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Current Grade</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.currentGrade || "Grade 6"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Board</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.board || "CBSE"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Last Academic Result</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.lastResult || "88.5%"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Transfer Certificate</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.transferCert || "Pending"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Group 3: Additional Information */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-[16px] tracking-tight text-slate-900">
                                      Additional Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Scholarship Applied</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.scholarship || "No"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Transport Required</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.transport || "Yes (Route 4)"}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">Special Requirements</span>
                                        <span className="text-[14px] font-semibold text-slate-800">{detailData.specialReq || "None"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeSubTab === "profile" && isEnr && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between pb-2">
                                    <h4 className="font-semibold text-lg tracking-tight text-slate-900">
                                      Official Student Roster File
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                        Seat Secured
                                      </span>
                                      <button
                                        onClick={() =>
                                          (() => { setFormModalData(detailData); setFormModalMode("edit"); setIsFormModalOpen(true); })()
                                        }
                                        className="text-sm font-semibold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200"
                                      >
                                        <Edit2 className="w-4 h-4" /> Edit
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between py-1.5 border-b border-slate-100/60">
                                      <span className="text-sm text-slate-500">
                                        Enrolled Grade
                                      </span>
                                      <span className="text-sm font-semibold text-slate-800">
                                        {detailData.grade}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-100/60">
                                      <span className="text-sm text-slate-500">
                                        Homeroom Class
                                      </span>
                                      <span className="text-sm font-semibold text-emerald-600">
                                        {assignedHomerooms[detailData.id]
                                          ? `Section ${assignedHomerooms[detailData.id]}`
                                          : "Section A (General)"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-100/60">
                                      <span className="text-slate-500">
                                        Date Admitted
                                      </span>
                                      <span className="text-sm font-semibold text-slate-800">
                                        {detailData.timestamp || "Today"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2 pt-4">
                                    <h4 className="font-semibold text-lg tracking-tight text-slate-900">
                                      Parents & Guardians
                                    </h4>
                                    <div className="space-y-2.5">
                                      <div className="flex items-center gap-2.5">
                                        <div>
                                          <h5 className="font-bold text-slate-800">
                                            {detailData.parentName}
                                          </h5>
                                          <span className="block text-[13px] font-medium text-slate-500">
                                            Father & Primary Guardian
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5">
                                        <div>
                                          <h5 className="font-bold text-slate-800">
                                            Jayshree Kumari
                                          </h5>
                                          <span className="block text-[13px] font-medium text-slate-500">
                                            Mother & Co-Guardian
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between py-1">
                                      <span className="text-sm text-slate-500">
                                        Permanent Address
                                      </span>
                                      <span className="text-sm font-semibold text-slate-800">
                                        12 Block A, Connaught Place, New Delhi
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeSubTab === "workflow" && !isEnq && (
                                <>
                                  {isApp ? (
                                    <div className="space-y-4">
                                      <h4 className="mb-2 font-semibold text-lg tracking-tight text-slate-900">Required Documents Checklist</h4>
                                      <div className="w-full bg-slate-100 rounded-md h-1.5 overflow-hidden">
                                        <div
                                          className="bg-emerald-600 h-1.5 rounded-md"
                                          style={{
                                            width: `${progressPercentage}%`,
                                          }}
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
                                              <span className="font-medium text-slate-800">
                                                {docName}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-medium text-slate-500">
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
                                                    showToast(
                                                      `Verified: ${docName}`,
                                                      "success",
                                                    );
                                                  }}
                                                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
                                                >
                                                  Verify
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 space-y-3 shadow-sm">
                                      <h4 className="text-xs font-extrabold text-slate-750">
                                        Enrollment Checkpoints
                                      </h4>
                                      <div className="space-y-3">
                                        {[
                                          {
                                            id: "docs_verified",
                                            label: "Documents Verified",
                                            done: true,
                                          },
                                          {
                                            id: "approved",
                                            label: "Approved for Admission",
                                            done: true,
                                          },
                                          {
                                            id: "payment",
                                            label: "Full Payment Received",
                                            done: false,
                                          },
                                          {
                                            id: "section",
                                            label:
                                              "Section and Roll Number Assigned",
                                            done: true,
                                          },
                                        ].map((step) => (
                                          <div
                                            key={step.id}
                                            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                                          >
                                            <div
                                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-transparent"}`}
                                            >
                                              <Check
                                                className="w-3.5 h-3.5"
                                                strokeWidth={3}
                                              />
                                            </div>
                                            <span
                                              className={`text-xs font-bold ${step.done ? "text-slate-800" : "text-slate-400"}`}
                                            >
                                              {step.label}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}

                              {activeSubTab === "payment" && isEnr && (
                                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-5">
                                  <div className="flex items-center justify-between pb-2">
                                    <h4 className="text-xs font-extrabold text-slate-750">
                                      Payment Summary
                                    </h4>
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                      Active Ledger
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <span className="block font-extrabold mb-1 text-[13px] font-medium text-slate-500">
                                        Total Payable
                                      </span>
                                      <span className="font-semibold text-lg tracking-tight text-slate-900">
                                        $15,000
                                      </span>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                      <span className="block text-xs font-extrabold text-emerald-600/70 mb-1">
                                        Amount Paid
                                      </span>
                                      <span className="text-emerald-700 font-semibold text-lg tracking-tight text-slate-900">
                                        $10,000
                                      </span>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                      <span className="block text-xs font-extrabold text-amber-600/70 mb-1">
                                        Balance Due
                                      </span>
                                      <span className="text-amber-700 font-semibold text-lg tracking-tight text-slate-900">
                                        $5,000
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                      <span className="text-slate-500">
                                        Payment Progress
                                      </span>
                                      <span className="text-emerald-600">
                                        66% Paid
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-emerald-500 h-2.5 rounded-full"
                                        style={{ width: "66%" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeSubTab === "assessment" && isApp && (
                                <div className="space-y-8">
                                  <div className="space-y-4">
                                    <h4 className="mb-2 font-semibold text-lg tracking-tight text-slate-900">Entrance Assessment</h4>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md border border-slate-100">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-slate-800 text-sm">
                                            Academic Written Test
                                          </span>
                                          {detailData.score ? (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                                              Completed
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">
                                              Scheduled
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-500">
                                          Date: {detailData.timestamp} at 10:00 AM
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {detailData.score ? (
                                          <div className="text-center">
                                            <span className="block mb-0.5 text-[13px] font-medium text-slate-500">
                                              Score
                                            </span>
                                            <span className="text-lg font-medium text-slate-800">
                                              {detailData.score}%
                                            </span>
                                          </div>
                                        ) : (
                                          <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors cursor-pointer">
                                            Input Score
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="mb-2 font-semibold text-lg tracking-tight text-slate-900">Family Interview</h4>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-md border border-slate-100">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-slate-800 text-sm">
                                            Principal Interview
                                          </span>
                                          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-xs font-medium">
                                            Pending
                                          </span>
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-500">
                                          Not yet scheduled
                                        </span>
                                      </div>
                                      <div>
                                        <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-sm">
                                          <CalendarClock className="w-3.5 h-3.5" />{" "}
                                          Schedule
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeSubTab === "decision" && (
                                <div className="space-y-8">
                                  <div
                                    className={
                                      isApp
                                        ? "space-y-3"
                                        : "bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-3"
                                    }
                                  >
                                    {isApp && (
                                      <div className="mb-6 pb-6 border-b border-slate-100">
                                        <h4 className="mb-4 font-semibold text-lg tracking-tight text-slate-900">Scholarship & Financial Aid</h4>
                                        <div className="bg-slate-50 rounded-md p-4 border border-slate-100 flex items-center justify-between">
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-slate-800 text-sm">
                                                Merit Scholarship
                                              </span>
                                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                                                Eligible
                                              </span>
                                            </div>
                                            <span className="text-[13px] font-medium text-slate-500">
                                              Based on entrance score (
                                              {detailData.score || "N/A"}%)
                                            </span>
                                          </div>
                                          <div className="text-right">
                                            <span className="block mb-0.5 text-[13px] font-medium text-slate-500">
                                              Approved Discount
                                            </span>
                                            <span className="font-medium text-emerald-600 text-base">
                                              15%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <h4
                                      className={`text-xs uppercase ${isApp ? "font-medium tracking-wide text-slate-500" : "font-extrabold tracking-wider text-slate-750"}`}
                                    >
                                      Actions
                                    </h4>
                                    {isApp && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleApproveApplication(
                                              detailData.id,
                                              detailData.studentName,
                                            )
                                          }
                                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-md text-xs cursor-pointer"
                                        >
                                          {isProcessing === detailData.id
                                            ? "Securing..."
                                            : "Approve & Enroll"}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setApplications((prev) =>
                                              prev.map((a) =>
                                                a.id === detailData.id
                                                  ? { ...a, status: "Rejected" }
                                                  : a,
                                              ),
                                            );
                                            showToast(
                                              `Application declined.`,
                                              "warning",
                                            );
                                          }}
                                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium py-2 rounded-md text-xs cursor-pointer"
                                        >
                                          Decline Application
                                        </button>
                                      </div>
                                    )}
                                    {isEnq && (
                                      <button
                                        onClick={() => {
                                          convertEnquiryToApplication(detailData);
                                          setSelectedDetail(null);
                                        }}
                                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                                      >
                                        Elevate to Application
                                      </button>
                                    )}
                                    {isEnr && (
                                      <span className="block text-xs text-emerald-600 font-bold">
                                        ✓ Active seat registration complete
                                      </span>
                                    )}
                                  </div>

                                  {/* Note logs */}
                                  <div
                                    className={
                                      isApp
                                        ? "space-y-3"
                                        : "bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-3"
                                    }
                                  >
                                    <h4
                                      className={`text-xs uppercase ${isApp ? "font-medium tracking-wide text-slate-500" : "font-extrabold tracking-wider text-slate-750"}`}
                                    >
                                      Staff Commentary Notes
                                    </h4>
                                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                                      {(customNotes[detailData.id] || []).map(
                                        (note, idx) => (
                                          <div
                                            key={idx}
                                            className={`bg-slate-50 p-2.5 text-xs font-medium text-slate-700 ${isApp ? "rounded-md" : "rounded-lg"}`}
                                          >
                                            {note}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Type counselor note..."
                                        value={noteInput}
                                        onChange={(e) =>
                                          setNoteInput(e.target.value)
                                        }
                                        className={`flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 outline-none ${isApp ? "rounded-md" : "rounded-lg"}`}
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          addCustomNote(detailData.id)
                                        }
                                      />
                                      <button
                                        onClick={() => addCustomNote(detailData.id)}
                                        className={`px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer ${isApp ? "font-medium rounded-md" : "font-bold rounded-lg"}`}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>

                                  {isApp && (
                                    <div>
                                      <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-[13px] font-medium text-slate-500">
                                          Communication Log
                                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="pt-4 space-y-3">
                                          <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                              <Mail className="w-3.5 h-3.5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                                              <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />{" "}
                                                  Entrance Admit Card Sent
                                                </span>
                                                <span className="text-[13px] font-medium text-slate-500">
                                                  Oct 24, 09:15 AM
                                                </span>
                                              </div>
                                              <p className="text-xs font-medium text-slate-600">
                                                Automated email with admit card PDF.
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                                              <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                  <ArrowUpRight className="w-3 h-3 text-blue-500" />{" "}
                                                  Inbound Call
                                                </span>
                                                <span className="text-[13px] font-medium text-slate-500">
                                                  Oct 23, 14:20 PM
                                                </span>
                                              </div>
                                              <p className="text-xs font-medium text-slate-600">
                                                Parent called to confirm document
                                                requirements. Clarified proof of
                                                address options.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-3 space-y-5">
                              <div
                                className={`bg-white border border-slate-200/60 p-6 shadow-sm space-y-6 ${isApp ? "rounded-lg" : "rounded-2xl"}`}
                              >
                                <h4 className="mb-3 text-[13px] font-medium text-slate-500">{isApp || isEnr ? "Quick Actions" : "Next Steps"}</h4>
                                <div className="w-full space-y-2.5">
                                  {isApp && (
                                    <>
                                      <button
                                        onClick={() => showToast(`Follow-up logged successfully.`, "success")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Log Follow-up</span>
                                      </button>
                                      <button
                                        onClick={() => showToast(`Reassignment requested.`, "info")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Reassign Counselor</span>
                                      </button>
                                      <button
                                        onClick={() => showToast(`Internal note editor opened.`, "success")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Add Internal Note</span>
                                      </button>
                                    </>
                                  )}
                                  {isEnr && (
                                    <>
                                      <button
                                        onClick={() => showToast(`Fees Ledger: Total outstanding due is ₹48,000 for ${detailData.studentName}.`, "success")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Fees & Payments</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDetailSubTab("workflow");
                                          showToast(`Opened academic timeline.`, "success");
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Academic Timeline</span>
                                      </button>
                                      <button
                                        onClick={() => showToast(`Generating enrollment document for printing...`, "info")}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-xl cursor-pointer flex items-center justify-start gap-3 transition-all transform hover:-translate-y-0.5 group"
                                      >
                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span>Print Enrollment</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>


                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                }

                // MAIN DATATABLE DASHBOARD RENDERING
                return (
                  <div
                    className="flex flex-col bg-transparent overflow-hidden mt-4"
                    id="main-datatable-dashboard"
                  >
                    {/* COHESIVE TAB HEADER INTEGRATED DIRECTLY INTO THE CARD */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-6 pt-2 gap-4 bg-transparent select-none"
                      id="unified-tabs-header"
                    >
                      <div className="flex items-center gap-6 overflow-x-auto -mb-px scrollbar-thin">
                        {[
                          {
                            id: "enquiries",
                            label: "Enquiries",
                            count: enquiries.length,
                            activeColor: "border-blue-600 text-blue-600",
                            icon: MessageSquare,
                          },
                          {
                            id: "applications",
                            label: "Applications",
                            count: applications.length,
                            activeColor: "border-blue-600 text-blue-600",
                            icon: FileText,
                          },
                          {
                            id: "enrollments",
                            label: "Enrollments",
                            count: enrollmentsList.length,
                            activeColor: "border-blue-600 text-blue-600",
                            icon: GraduationCap,
                          },
                        ].map((tab) => {
                          const isActive = activeTab === tab.id;
                          const TabIcon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id);
                                setIsColumnDropdownOpen(false);
                                showToast(`Viewing ${tab.label}`, "info");
                              }}
                              className={`flex items-center gap-2 py-3.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer relative ${isActive
                                ? `${tab.activeColor} font-bold`
                                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                }`}
                            >
                              <TabIcon
                                className={`w-4 h-4 shrink-0 ${isActive ? "" : "text-slate-400"}`}
                              />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Actions on the right side of tabs */}
                      <div className="flex items-center gap-3 py-2 sm:py-0">
                        {/* Column visibility selector button */}
                        <div
                          className="relative"
                          id="column-visibility-dropdown-container"
                        >
                          <button
                            onClick={() =>
                              setIsColumnDropdownOpen(!isColumnDropdownOpen)
                            }
                            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold outline-none text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span>Columns</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {isColumnDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsColumnDropdownOpen(false)}
                              />
                              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 animate-fade-in space-y-1">
                                <div className="px-2 py-1 font-extrabold border-b border-slate-100 mb-1 text-[13px] font-medium text-slate-500">
                                  Toggle Columns
                                </div>
                                {activeTab === "enquiries" && (
                                  <div className="space-y-1">
                                    {[
                                      { id: "id", label: "Enquiry ID" },
                                      { id: "studentName", label: "Student Name" },
                                      { id: "grade", label: "Grade" },
                                      { id: "parentName", label: "Guardian Name" },
                                      { id: "phone", label: "Guardian Contact" },
                                      { id: "status", label: "Status" },
                                    ].map((col) => {
                                      const isChecked =
                                        enquiryVisibleColumns.includes(col.id);
                                      return (
                                        <label
                                          key={col.id}
                                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              if (isChecked) {
                                                if (
                                                  enquiryVisibleColumns.length > 1
                                                ) {
                                                  setEnquiryVisibleColumns(
                                                    enquiryVisibleColumns.filter(
                                                      (c) => c !== col.id,
                                                    ),
                                                  );
                                                } else {
                                                  showToast(
                                                    "Must have at least one column visible.",
                                                    "info",
                                                  );
                                                }
                                              } else {
                                                setEnquiryVisibleColumns([
                                                  ...enquiryVisibleColumns,
                                                  col.id,
                                                ]);
                                              }
                                            }}
                                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                          />

                                          <span>{col.label}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                                {activeTab === "applications" && (
                                  <div className="space-y-1">
                                    {[
                                      { id: "id", label: "Application ID" },
                                      { id: "studentName", label: "Student Name" },
                                      { id: "grade", label: "Grade" },
                                      { id: "parentName", label: "Guardian Name" },
                                      { id: "phone", label: "Guardian Contact" },
                                      { id: "status", label: "Workflow Status" },
                                      { id: "actions", label: "Actions" },
                                    ].map((col) => {
                                      const isChecked =
                                        applicationVisibleColumns.includes(col.id);
                                      return (
                                        <label
                                          key={col.id}
                                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              if (isChecked) {
                                                if (
                                                  applicationVisibleColumns.length >
                                                  1
                                                ) {
                                                  setApplicationVisibleColumns(
                                                    applicationVisibleColumns.filter(
                                                      (c) => c !== col.id,
                                                    ),
                                                  );
                                                } else {
                                                  showToast(
                                                    "Must have at least one column visible.",
                                                    "info",
                                                  );
                                                }
                                              } else {
                                                setApplicationVisibleColumns([
                                                  ...applicationVisibleColumns,
                                                  col.id,
                                                ]);
                                              }
                                            }}
                                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                          />

                                          <span>{col.label}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                                {activeTab === "enrollments" && (
                                  <div className="space-y-1">
                                    {[
                                      { id: "id", label: "Enrollment ID" },
                                      { id: "studentName", label: "Student Name" },
                                      { id: "grade", label: "Grade" },
                                      { id: "parentName", label: "Guardian Name" },
                                      { id: "phone", label: "Guardian Contact" },
                                      { id: "status", label: "Status" },
                                    ].map((col) => {
                                      const isChecked =
                                        enrollmentVisibleColumns.includes(col.id);
                                      return (
                                        <label
                                          key={col.id}
                                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              if (isChecked) {
                                                if (
                                                  enrollmentVisibleColumns.length >
                                                  1
                                                ) {
                                                  setEnrollmentVisibleColumns(
                                                    enrollmentVisibleColumns.filter(
                                                      (c) => c !== col.id,
                                                    ),
                                                  );
                                                } else {
                                                  showToast(
                                                    "Must have at least one column visible.",
                                                    "info",
                                                  );
                                                }
                                              } else {
                                                setEnrollmentVisibleColumns([
                                                  ...enrollmentVisibleColumns,
                                                  col.id,
                                                ]);
                                              }
                                            }}
                                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                          />

                                          <span>{col.label}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={tableSearchQuery}
                              onChange={(e) => {
                                setTableSearchQuery(e.target.value);
                                setEnquiriesPage(1);
                                setApplicationsPage(1);
                                setEnrollmentsPage(1);
                              }}
                              placeholder="Type search..."
                              className="border border-slate-300 bg-white rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-slate-500 transition-colors w-44 shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY CONTENT */}
                    <div
                      className="p-6 flex flex-col"
                      id="unified-datatable-content-body"
                    >
                      {/* ACTIVE DATATABLE ELEMENT WITH GRID LINES */}
                      <div className="overflow-x-auto overflow-y-auto max-h-[350px] border border-slate-200 rounded-md">
                        {/* ENQUIRIES DATATABLE */}
                        {activeTab === "enquiries" && (
                          <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_#e2e8f0]">
                              <tr className="border-b bg-transparent hover:bg-slate-50/50 text-sm font-medium text-slate-500 transition-colors select-none">
                                {enquiryVisibleColumns.includes("id") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Enquiry ID
                                  </th>
                                )}
                                {enquiryVisibleColumns.includes("studentName") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Student Name
                                  </th>
                                )}
                                {enquiryVisibleColumns.includes("grade") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Grade
                                  </th>
                                )}
                                {enquiryVisibleColumns.includes("parentName") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Guardian Name
                                  </th>
                                )}
                                {enquiryVisibleColumns.includes("phone") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Guardian Contact
                                  </th>
                                )}

                                {enquiryVisibleColumns.includes("status") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Status
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {processedEnquiries.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={enquiryVisibleColumns.length}
                                    className="border-b border-slate-200 py-8 text-center italic bg-slate-50/30 text-[13px] font-medium text-slate-500"
                                  >
                                    No inquiry records matched your active search
                                    query/filters.
                                  </td>
                                </tr>
                              ) : (
                                processedEnquiries
                                  .slice(
                                    (Math.min(
                                      enquiriesPage,
                                      Math.ceil(
                                        processedEnquiries.length / itemsPerPage,
                                      ) || 1,
                                    ) -
                                      1) *
                                    itemsPerPage,
                                    Math.min(
                                      enquiriesPage,
                                      Math.ceil(
                                        processedEnquiries.length / itemsPerPage,
                                      ) || 1,
                                    ) * itemsPerPage,
                                  )
                                  .map((enq) => (
                                    <tr
                                      key={enq.id}
                                      onClick={() =>
                                        setSelectedDetail({
                                          type: "enquiry",
                                          id: enq.id,
                                        })
                                      }
                                      className="text-xs text-slate-700 hover:bg-amber-50/10 odd:bg-white even:bg-slate-50/30 cursor-pointer transition-colors animate-fade-in"
                                    >
                                      {enquiryVisibleColumns.includes("id") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-slate-400 font-medium">
                                          {enq.id}
                                        </td>
                                      )}
                                      {enquiryVisibleColumns.includes(
                                        "studentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-bold text-slate-800">
                                            {enq.studentName}
                                          </td>
                                        )}
                                      {enquiryVisibleColumns.includes("grade") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-semibold text-slate-600">
                                          {enq.grade}
                                        </td>
                                      )}
                                      {enquiryVisibleColumns.includes(
                                        "parentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-medium text-slate-800">
                                            {enq.parentName}
                                          </td>
                                        )}
                                      {enquiryVisibleColumns.includes("phone") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-medium text-slate-700">
                                          {enq.phone}
                                        </td>
                                      )}

                                      {enquiryVisibleColumns.includes("status") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                          <div className="flex items-center gap-1.5 select-none">
                                            <span
                                              className={`w-1.5 h-1.5 rounded-full ${enq.status === "New"
                                                ? "bg-blue-500"
                                                : enq.status === "Contacted"
                                                  ? "bg-slate-400"
                                                  : "bg-amber-500"
                                                }`}
                                            />
                                            <span className="font-semibold text-slate-700">
                                              {enq.status}
                                            </span>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        )}

                        {/* APPLICATIONS DATATABLE */}
                        {activeTab === "applications" && (
                          <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_#e2e8f0]">
                              <tr className="border-b bg-transparent hover:bg-slate-50/50 text-sm font-medium text-slate-500 transition-colors select-none">
                                {applicationVisibleColumns.includes("id") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Application ID
                                  </th>
                                )}
                                {applicationVisibleColumns.includes(
                                  "studentName",
                                ) && (
                                    <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                      Student Name
                                    </th>
                                  )}
                                {applicationVisibleColumns.includes("grade") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Grade
                                  </th>
                                )}
                                {applicationVisibleColumns.includes(
                                  "parentName",
                                ) && (
                                    <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                      Guardian Name
                                    </th>
                                  )}
                                {applicationVisibleColumns.includes("phone") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Guardian Contact
                                  </th>
                                )}

                                {applicationVisibleColumns.includes("status") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Workflow Status
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {processedApplications.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={applicationVisibleColumns.length}
                                    className="border-b border-slate-200 py-8 text-center italic bg-slate-50/30 text-[13px] font-medium text-slate-500"
                                  >
                                    No applications matched your active search
                                    query/filters.
                                  </td>
                                </tr>
                              ) : (
                                processedApplications
                                  .slice(
                                    (Math.min(
                                      applicationsPage,
                                      Math.ceil(
                                        processedApplications.length / itemsPerPage,
                                      ) || 1,
                                    ) -
                                      1) *
                                    itemsPerPage,
                                    Math.min(
                                      applicationsPage,
                                      Math.ceil(
                                        processedApplications.length / itemsPerPage,
                                      ) || 1,
                                    ) * itemsPerPage,
                                  )
                                  .map((app) => (
                                    <tr
                                      key={app.id}
                                      onClick={() =>
                                        setSelectedDetail({
                                          type: "application",
                                          id: app.id,
                                        })
                                      }
                                      className="text-xs text-slate-700 hover:bg-amber-50/10 odd:bg-white even:bg-slate-50/30 cursor-pointer transition-colors animate-fade-in"
                                    >
                                      {applicationVisibleColumns.includes("id") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-slate-400 font-medium">
                                          {app.id}
                                        </td>
                                      )}
                                      {applicationVisibleColumns.includes(
                                        "studentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                              {app.studentName}
                                            </div>
                                          </td>
                                        )}
                                      {applicationVisibleColumns.includes(
                                        "grade",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-semibold text-slate-600">
                                            {app.grade}
                                          </td>
                                        )}
                                      {applicationVisibleColumns.includes(
                                        "parentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-medium text-slate-800">
                                            {app.parentName}
                                          </td>
                                        )}
                                      {applicationVisibleColumns.includes(
                                        "phone",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-slate-500 font-normal">
                                            {app.phone}
                                          </td>
                                        )}

                                      {applicationVisibleColumns.includes(
                                        "status",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 font-semibold text-xs text-slate-700 select-none">
                                              <span
                                                className={`w-1.5 h-1.5 rounded-full ${app.status === "Approved"
                                                  ? "bg-emerald-500"
                                                  : app.status ===
                                                    "Entrance Test Passed"
                                                    ? "bg-blue-500"
                                                    : app.status ===
                                                      "Awaiting Interview"
                                                      ? "bg-rose-500"
                                                      : "bg-amber-500"
                                                  }`}
                                              />
                                              <span>
                                                {app.status === "Awaiting Interview"
                                                  ? "Interview"
                                                  : app.status ===
                                                    "Entrance Test Passed"
                                                    ? "Test Passed"
                                                    : app.status ===
                                                      "Document Verification"
                                                      ? "Verification"
                                                      : app.status}
                                              </span>
                                            </span>
                                          </td>
                                        )}
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        )}

                        {/* ENROLLMENTS DATATABLE */}
                        {activeTab === "enrollments" && (
                          <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_#e2e8f0]">
                              <tr className="border-b bg-transparent hover:bg-slate-50/50 text-sm font-medium text-slate-500 transition-colors select-none">
                                {enrollmentVisibleColumns.includes("id") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Enrollment ID
                                  </th>
                                )}
                                {enrollmentVisibleColumns.includes(
                                  "studentName",
                                ) && (
                                    <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                      Student Name
                                    </th>
                                  )}
                                {enrollmentVisibleColumns.includes("grade") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Grade
                                  </th>
                                )}
                                {enrollmentVisibleColumns.includes(
                                  "parentName",
                                ) && (
                                    <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                      Guardian Name
                                    </th>
                                  )}
                                {enrollmentVisibleColumns.includes("phone") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap">
                                    Guardian Contact
                                  </th>
                                )}

                                {enrollmentVisibleColumns.includes("status") && (
                                  <th className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-right">
                                    Status
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {processedEnrollments.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={enrollmentVisibleColumns.length}
                                    className="border-b border-slate-200 py-8 text-center italic bg-slate-50/30 text-[13px] font-medium text-slate-500"
                                  >
                                    No enrolled cohort records matched your search
                                    query/filters.
                                  </td>
                                </tr>
                              ) : (
                                processedEnrollments
                                  .slice(
                                    (Math.min(
                                      enrollmentsPage,
                                      Math.ceil(
                                        processedEnrollments.length / itemsPerPage,
                                      ) || 1,
                                    ) -
                                      1) *
                                    itemsPerPage,
                                    Math.min(
                                      enrollmentsPage,
                                      Math.ceil(
                                        processedEnrollments.length / itemsPerPage,
                                      ) || 1,
                                    ) * itemsPerPage,
                                  )
                                  .map((enroll) => (
                                    <tr
                                      key={enroll.id}
                                      onClick={() =>
                                        setSelectedDetail({
                                          type: "enrollment",
                                          id: enroll.id,
                                        })
                                      }
                                      className="text-xs text-slate-700 hover:bg-amber-50/10 odd:bg-white even:bg-slate-50/30 cursor-pointer transition-colors animate-fade-in"
                                    >
                                      {enrollmentVisibleColumns.includes("id") && (
                                        <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-slate-400 font-medium">
                                          {enroll.id}
                                        </td>
                                      )}
                                      {enrollmentVisibleColumns.includes(
                                        "studentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-bold text-slate-800">
                                            {enroll.studentName}
                                          </td>
                                        )}
                                      {enrollmentVisibleColumns.includes(
                                        "grade",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-semibold text-slate-600">
                                            {enroll.grade}
                                          </td>
                                        )}
                                      {enrollmentVisibleColumns.includes(
                                        "parentName",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap font-medium text-slate-800">
                                            {enroll.parentName}
                                          </td>
                                        )}
                                      {enrollmentVisibleColumns.includes(
                                        "phone",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-slate-500 font-normal">
                                            {enroll.phone}
                                          </td>
                                        )}

                                      {enrollmentVisibleColumns.includes(
                                        "status",
                                      ) && (
                                          <td className="border-b border-slate-200 px-3.5 py-2.5 whitespace-nowrap text-right">
                                            <div className="flex justify-end">
                                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 font-semibold text-xs text-slate-700 select-none">
                                                <span
                                                  className={`w-1.5 h-1.5 rounded-full ${enroll.status === "Seat Secured" ? "bg-emerald-500" : "bg-slate-400"}`}
                                                />
                                                <span>
                                                  {enroll.status === "Seat Secured"
                                                    ? "Secured"
                                                    : enroll.status}
                                                </span>
                                              </span>
                                            </div>
                                          </td>
                                        )}
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* PAGINATION PANEL (matches first photo) */}
                      {(() => {
                        let totalCount = 0;
                        let currentPage = 1;
                        let setPageFunc = null;

                        if (activeTab === "enquiries") {
                          totalCount = processedEnquiries.length;
                          currentPage = Math.min(
                            enquiriesPage,
                            Math.ceil(totalCount / itemsPerPage) || 1,
                          );
                          setPageFunc = setEnquiriesPage;
                        } else if (activeTab === "applications") {
                          totalCount = processedApplications.length;
                          currentPage = Math.min(
                            applicationsPage,
                            Math.ceil(totalCount / itemsPerPage) || 1,
                          );
                          setPageFunc = setApplicationsPage;
                        } else if (activeTab === "enrollments") {
                          totalCount = processedEnrollments.length;
                          currentPage = Math.min(
                            enrollmentsPage,
                            Math.ceil(totalCount / itemsPerPage) || 1,
                          );
                          setPageFunc = setEnrollmentsPage;
                        }

                        const totalPages =
                          Math.ceil(totalCount / itemsPerPage) || 1;
                        const startIndex = (currentPage - 1) * itemsPerPage;

                        const getPageNumbers = () => {
                          const pages = [];
                          if (totalPages <= 5) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            if (currentPage <= 3) {
                              pages.push(1, 2, 3, 4, "ellipsis", totalPages);
                            } else if (currentPage >= totalPages - 2) {
                              pages.push(
                                1,
                                "ellipsis",
                                totalPages - 3,
                                totalPages - 2,
                                totalPages - 1,
                                totalPages,
                              );
                            } else {
                              pages.push(
                                1,
                                "ellipsis",
                                currentPage - 1,
                                currentPage,
                                currentPage + 1,
                                "ellipsis",
                                totalPages,
                              );
                            }
                          }
                          return pages;
                        };

                        return (
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 select-none pt-4 border-t border-slate-100">
                            <div className="font-sans text-[13px] font-medium text-slate-500">
                              Showing {totalCount === 0 ? 0 : startIndex + 1} to{" "}
                              {Math.min(totalCount, startIndex + itemsPerPage)} of{" "}
                              {totalCount} entries
                            </div>

                            <nav
                              role="navigation"
                              aria-label="pagination"
                              className="flex items-center"
                            >
                              <ul className="flex items-center gap-1.5">
                                {/* Previous Button */}
                                <li>
                                  <button
                                    onClick={() =>
                                      setPageFunc(Math.max(1, currentPage - 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 h-8 rounded-md text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:pointer-events-none cursor-pointer select-none shadow-sm"
                                    aria-label="Go to previous page"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                                    <span>Previous</span>
                                  </button>
                                </li>

                                {/* Page Numbers */}
                                {getPageNumbers().map((page, index) => {
                                  if (page === "ellipsis") {
                                    return (
                                      <li key={`ellipsis-${index}`}>
                                        <span className="flex h-8 w-8 items-center justify-center text-slate-400">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">
                                            More pages
                                          </span>
                                        </span>
                                      </li>
                                    );
                                  }

                                  const pageNum = page;
                                  const isSelected = currentPage === pageNum;
                                  return (
                                    <li key={pageNum}>
                                      <button
                                        onClick={() => setPageFunc(pageNum)}
                                        aria-current={
                                          isSelected ? "page" : undefined
                                        }
                                        className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer select-none ${isSelected
                                          ? "border border-slate-250 bg-white shadow-sm text-slate-900 font-extrabold ring-1 ring-slate-200"
                                          : "bg-transparent text-slate-600 hover:bg-slate-150/50 hover:text-slate-900"
                                          }`}
                                      >
                                        {pageNum}
                                      </button>
                                    </li>
                                  );
                                })}

                                {/* Next Button */}
                                <li>
                                  <button
                                    onClick={() =>
                                      setPageFunc(
                                        Math.min(totalPages, currentPage + 1),
                                      )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 h-8 rounded-md text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:pointer-events-none cursor-pointer select-none shadow-sm"
                                    aria-label="Go to next page"
                                  >
                                    <span>Next</span>
                                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>
      </div>

      {/* TOAST NOTIFICATION STACK */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3"
            id="premium-toast"
          >
            <div
              className={`p-1 rounded-lg ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}
            >
              <Check className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-100 block">
                System Event Triggered
              </span>
              <p className="text-xs text-slate-300 mt-1 font-light leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {activeSlideOver && (
          <div
            className="fixed inset-0 z-40 overflow-hidden"
            id="slide-over-container"
          >
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveSlideOver(null);
                setSelectedInquiry(null);
                setSelectedApplication(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
            />

            {/* Slide-over panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white border-l border-slate-200/50 shadow-2xl rounded-l-[24px] flex flex-col overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      {activeSlideOver === "enquiries" && "Enquiries Inbox"}
                      {activeSlideOver === "applications" &&
                        "Active Applications"}
                      {activeSlideOver === "enrollments" && "Enrollments"}
                      {activeSlideOver === "actions" && "Action Control Center"}
                    </h3>
                    <p className="font-light mt-1 text-[13px] font-medium text-slate-500">
                      {activeSlideOver === "enquiries" &&
                        "Recent high-intent parent submissions"}
                      {activeSlideOver === "applications" &&
                        "Awaiting review and Principal sign-off"}
                      {activeSlideOver === "enrollments" &&
                        "Enrolled student roster & capacity tracking"}
                      {activeSlideOver === "actions" &&
                        "Critical items requiring immediate execution"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSlideOver(null);
                      setSelectedInquiry(null);
                      setSelectedApplication(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar inside Drawer */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-xs text-slate-700 placeholder-slate-400"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-slate-600 text-[13px] font-medium text-slate-500"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* SLIDE_OVER: ENQUIRIES LIST */}
                  {activeSlideOver === "enquiries" && (
                    <div className="space-y-4">
                      {selectedInquiry ? (
                        // Enquiry detail card
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <button
                            onClick={() => setSelectedInquiry(null)}
                            className="text-xs font-semibold text-blue-600 hover:underline mb-2 block"
                          >
                            ← Back to Inbox list
                          </button>

                          <div className="bg-slate-50/50 rounded-2xl p-5">
                            <span className="bg-blue-50 text-blue-700 border border-blue-100/40 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                              {selectedInquiry.id}
                            </span>
                            <h4 className="mt-2 font-semibold text-[17px] tracking-tight text-slate-900">
                              {selectedInquiry.studentName}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500">
                              {selectedInquiry.grade}
                            </p>

                            <div className="mt-4 pt-2 space-y-3">
                              <div>
                                <span className="block text-[13px] font-medium text-slate-500">
                                  Primary Parent
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {selectedInquiry.parentName}
                                </span>
                              </div>

                              <div className="flex gap-4">
                                <div>
                                  <span className="block text-[13px] font-medium text-slate-500">
                                    Email
                                  </span>
                                  <span className="text-xs text-slate-600">
                                    {selectedInquiry.email}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[13px] font-medium text-slate-500">
                                    Phone
                                  </span>
                                  <span className="text-xs text-slate-600">
                                    {selectedInquiry.phone}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="block text-[13px] font-medium text-slate-500">
                                  Source Channel
                                </span>
                                <span className="text-xs text-slate-600">
                                  {selectedInquiry.source}
                                </span>
                              </div>

                              <div>
                                <span className="block text-[13px] font-medium text-slate-500">
                                  Admissions Note
                                </span>
                                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-xl p-3 mt-1 italic font-light">
                                  "{selectedInquiry.notes}"
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                showToast(
                                  `Assigned callback coordinator for ${selectedInquiry.studentName}`,
                                  "success",
                                );
                                setSelectedInquiry(null);
                              }}
                              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Initiate Personal Callback
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        // Standard Enquiry list
                        filteredEnquiries.map((enq) => (
                          <div
                            key={enq.id}
                            onClick={() => setSelectedInquiry(enq)}
                            className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500">
                                {enq.id}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[13px] font-semibold">
                                {enq.source}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 mt-2">
                              {enq.studentName}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500">
                              {enq.grade}
                            </p>
                            <p className="italic mt-2 line-clamp-2 text-[13px] font-medium text-slate-500">
                              "{enq.notes}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* SLIDE_OVER: APPLICATIONS LIST */}
                  {activeSlideOver === "applications" && (
                    <div className="space-y-4">
                      {selectedApplication ? (
                        // Application Detail view with Interactive Approval Trigger
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <button
                            onClick={() => setSelectedApplication(null)}
                            className="text-xs font-semibold text-purple-600 hover:underline mb-2 block"
                          >
                            ← Back to Applications list
                          </button>

                          <div className="bg-slate-50/50 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                              <span className="bg-purple-50 text-purple-700 border border-purple-100/40 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                {selectedApplication.id}
                              </span>
                              {selectedApplication.siblingEnrolled && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100/30 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                  Sibling Privilege
                                </span>
                              )}
                            </div>

                            <h4 className="mt-3 font-semibold text-[17px] tracking-tight text-slate-900">
                              {selectedApplication.studentName}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500">
                              {selectedApplication.grade}
                            </p>

                            <div className="mt-4 pt-2 space-y-3">
                              <div>
                                <span className="block text-[13px] font-medium text-slate-500">
                                  Previous Institution
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {selectedApplication.previousSchool}
                                </span>
                              </div>

                              <div className="flex gap-4">
                                <div>
                                  <span className="block text-[13px] font-medium text-slate-500">
                                    Primary Parent
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700">
                                    {selectedApplication.parentName}
                                  </span>
                                </div>
                                {selectedApplication.score && (
                                  <div>
                                    <span className="block text-[13px] font-medium text-slate-500">
                                      Entrance score
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600">
                                      {selectedApplication.score}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div>
                                <span className="block text-[13px] font-medium text-slate-500">
                                  Workflow Status
                                </span>
                                <span
                                  className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${selectedApplication.status === "Approved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : selectedApplication.status ===
                                      "Entrance Test Passed"
                                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                                      : "b  g-amber-50 text-amber-700 border border-amber-100"
                                    }`}
                                >
                                  {selectedApplication.status}
                                </span>
                              </div>

                              {selectedApplication.status !== "Approved" && (
                                <div className="bg-purple-50/50 border border-purple-100/60 rounded-xl p-3.5 mt-4">
                                  <h5 className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Principal Sign-off Protocol
                                  </h5>
                                  <p className="text-xs text-purple-700/80 mt-1 leading-relaxed">
                                    Approving this file issues the official
                                    Offer Letter, registers their enrollment
                                    seat, and notifies finance desks.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            {selectedApplication.status !== "Approved" ? (
                              <button
                                onClick={() =>
                                  handleApproveApplication(
                                    selectedApplication.id,
                                    selectedApplication.studentName,
                                  )
                                }
                                disabled={isProcessing !== null}
                                className="w-full bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-100 text-emerald-700 border border-emerald-200/50 rounded-xl py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {isProcessing === selectedApplication.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Verifying Credentials...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Sign File & Approve Admission</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-center">
                                <span className="text-xs font-bold text-emerald-700 block">
                                  Admission Completed
                                </span>
                                <span className="text-xs text-emerald-600 block mt-0.5">
                                  Offer Letter Issued & Secured
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        // Standard applications list
                        filteredApplications.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className="p-4 rounded-xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500">
                                {app.id}
                              </span>
                              <span
                                className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${app.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : app.status === "Entrance Test Passed"
                                    ? "bg-blue-50 text-blue-700"
                                    : "b  g-amber-50 text-amber-700"
                                  }`}
                              >
                                {app.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-800 mt-2">
                              {app.studentName}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500">
                              {app.grade}
                            </p>
                            <p className="font-sans mt-1 text-[13px] font-medium text-slate-500">
                              Previous: {app.previousSchool}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* SLIDE_OVER: ENROLLMENTS ROSTER */}
                  {activeSlideOver === "enrollments" && (
                    <div className="space-y-4">
                      {/* Premium Summary Info */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 mb-2">
                        <span className="text-xs font-semibold text-emerald-900 block">
                          Capacity Overview
                        </span>
                        <div className="grid grid-cols-2 gap-4 mt-2.5">
                          <div>
                            <span className="block text-[13px] font-medium text-slate-500">
                              Enrolled Capacity
                            </span>
                            <span className="text-base font-bold text-slate-800">
                              {stats.enrolled} / {stats.target}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[13px] font-medium text-slate-500">
                              Available Seats
                            </span>
                            <span className="text-base font-bold text-emerald-600">
                              {stats.target - stats.enrolled}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Display roster of approved/active list */}
                      <div className="space-y-3.5">
                        <div className="text-[13px] font-medium text-slate-500">
                          Recently Enrolled Student Cohort
                        </div>
                        {applications.filter((a) => a.status === "Approved")
                          .length === 0 ? (
                          <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-100 text-[13px] font-medium text-slate-500">
                            Apply credentials to see live student cohort updates
                          </div>
                        ) : (
                          applications
                            .filter((a) => a.status === "Approved")
                            .map((app) => (
                              <div
                                key={app.id}
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-xs font-semibold text-slate-800 block">
                                    {app.studentName}
                                  </span>
                                  <span className="block mt-0.5 text-[13px] font-medium text-slate-500">
                                    {app.grade}
                                  </span>
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 text-[13px] font-semibold">
                                  Cohort 2026
                                </span>
                              </div>
                            ))
                        )}

                        {/* Traditional static list placeholder matching exact architecture */}
                        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 opacity-70 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">
                              Ishaan Malhotra
                            </span>
                            <span className="block mt-0.5 text-[13px] font-medium text-slate-500">
                              Grade 11 - Commerce
                            </span>
                          </div>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                            Pre-registered
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 opacity-70 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">
                              Zara Gallagher
                            </span>
                            <span className="block mt-0.5 text-[13px] font-medium text-slate-500">
                              Grade 4
                            </span>
                          </div>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                            Pre-registered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLIDE_OVER: ACTIONS CENTER */}
                  {activeSlideOver === "actions" && (
                    <div className="space-y-4">
                      {actions.length === 0 ? (
                        <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-100 text-[13px] font-medium text-slate-500">
                          Excellent: All Principal action tasks completed!
                        </div>
                      ) : (
                        actions.map((act) => (
                          <div
                            key={act.id}
                            className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-full text-[13px] font-semibold">
                                  {act.type.toUpperCase()}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-800 mt-2">
                                  {act.title}
                                </h4>
                                <p className="mt-1 font-light leading-relaxed text-[13px] font-medium text-slate-500">
                                  {act.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 text-xs">
                              <span className="text-slate-400">{act.time}</span>
                              <span className="text-slate-400">{act.meta}</span>
                            </div>

                            <div className="pt-2">
                              {act.id === "ACT-001" ? (
                                <button
                                  onClick={() => {
                                    setSelectedApplication(
                                      applications.find(
                                        (a) => a.id === "APP-2026-105",
                                      ) || null,
                                    );
                                    setActiveSlideOver("applications");
                                  }}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 text-xs font-semibold transition-all"
                                >
                                  Go to Sign-off Panel
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleCompleteAction(act.id, act.title)
                                  }
                                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Slide-over Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500">
                      Secure Protocol v2.4
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Encrypted Workspace
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Right Edit Drawer for Application Details */}
      <AnimatePresence>
        {isAppEditDrawerOpen && (
          <div className="fixed inset-0 z-[60] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsAppEditDrawerOpen(false)}
              />
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="pointer-events-auto w-screen max-w-md flex flex-col bg-white shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Edit Application</h2>
                      <p className="mt-1 text-sm text-slate-500">Update the applicant's application information.</p>
                    </div>
                    <button
                      onClick={() => setIsAppEditDrawerOpen(false)}
                      className="text-slate-400 hover:text-slate-500 rounded-lg p-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section 1 */}
                    <div className="space-y-4">
                      <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2">Application Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Applying For</label>
                          <select value={drawerData.grade || "Grade 7"} onChange={(e) => setDrawerData({ ...drawerData, grade: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none bg-white">
                            <option value="Grade 6">Grade 6</option>
                            <option value="Grade 7">Grade 7</option>
                            <option value="Grade 8">Grade 8</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Academic Session</label>
                          <input type="text" value={drawerData.session || "2026-27"} onChange={(e) => setDrawerData({ ...drawerData, session: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none" />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[13px] font-medium text-slate-700">Application Date</label>
                          <input type="text" value={drawerData.appDate || "12 Jun 2026"} onChange={(e) => setDrawerData({ ...drawerData, appDate: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none text-slate-600" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-4">
                      <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2">Academic Background</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[13px] font-medium text-slate-700">Previous School</label>
                          <input type="text" placeholder="N/A" value={drawerData.previousSchool || ""} onChange={(e) => setDrawerData({ ...drawerData, previousSchool: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Current Grade</label>
                          <input type="text" value={drawerData.currentGrade || "Grade 6"} onChange={(e) => setDrawerData({ ...drawerData, currentGrade: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Board</label>
                          <select value={drawerData.board || "CBSE"} onChange={(e) => setDrawerData({ ...drawerData, board: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none bg-white">
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State Board">State Board</option>
                            <option value="IB">IB</option>
                            <option value="Cambridge">Cambridge</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Last Academic Result</label>
                          <input type="text" value={drawerData.lastResult || "88.5%"} onChange={(e) => setDrawerData({ ...drawerData, lastResult: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Transfer Certificate</label>
                          <select value={drawerData.transferCert || "Pending"} onChange={(e) => setDrawerData({ ...drawerData, transferCert: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none bg-white">
                            <option value="Pending">Pending</option>
                            <option value="Submitted">Submitted</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-4">
                      <h3 className="text-[15px] font-semibold text-slate-900 border-b border-slate-100 pb-2">Additional Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Scholarship Applied</label>
                          <select value={drawerData.scholarship || "No"} onChange={(e) => setDrawerData({ ...drawerData, scholarship: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none bg-white">
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700">Transport Required</label>
                          <select value={drawerData.transport || "Yes (Route 4)"} onChange={(e) => setDrawerData({ ...drawerData, transport: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none bg-white">
                            <option value="Yes (Route 4)">Yes (Route 4)</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[13px] font-medium text-slate-700">Special Requirements</label>
                          <textarea rows="3" placeholder="None" value={drawerData.specialReq || ""} onChange={(e) => setDrawerData({ ...drawerData, specialReq: e.target.value })} className="w-full text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm py-2 px-3 border outline-none resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => setIsAppEditDrawerOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedDetail && selectedDetail.type === "application") {
                          setApplications(prev => prev.map(a => a.id === selectedDetail.id ? { ...a, ...drawerData } : a));
                          setSelectedDetail(prev => ({ ...prev, ...drawerData }));
                        }
                        setIsAppEditDrawerOpen(false);
                        showToast("Application Details updated successfully", "success");
                      }}
                      className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={formModalData}
        mode={formModalMode}
        onSubmit={handleFormModalSubmit}
      />
    </div>
  );
}
