import React from "react";
import { CheckCircle2, AlertCircle, FileText, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function NotificationsPanel({ isOpen, onClose }) {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "New Application Received",
      description: "Aarav Sharma submitted an application for Grade 5.",
      time: "2 mins ago",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: 2,
      type: "success",
      title: "Entrance Test Passed",
      description: "Meera Patel passed the Grade 8 entrance test.",
      time: "1 hour ago",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      id: 3,
      type: "warning",
      title: "Interview Reminder",
      description: "Interview with Rohan Gupta in 30 minutes.",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      id: 4,
      type: "critical",
      title: "Document Missing",
      description: "Ananya Singh's birth certificate is invalid.",
      time: "5 hours ago",
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-12 right-0 w-80 bg-white border border-slate-200/60 rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div 
                  key={notif.id} 
                  className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${notif.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.description}</p>
                    <span className="text-[10px] font-medium text-slate-400 mt-1 block">{notif.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
            <button 
              onClick={onClose}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
