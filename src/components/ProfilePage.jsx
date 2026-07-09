import React, { useState } from "react";
import { User, Mail, Shield, Key, SlidersHorizontal, ChevronRight, LogOut, ArrowLeft } from "lucide-react";

export default function ProfilePage({ onBack }) {
  const [activeTab, setActiveTab] = useState("Personal Info");

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Admin Profile
        </h1>
        <p className="text-xs text-slate-500 font-sans mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-slate-700">P</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Admin User</h2>
            <p className="text-sm text-slate-500 mb-4">Principal Office</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Account
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <nav className="space-y-1">
              {[
                { name: "Personal Info", icon: User },
                { name: "Security & Passwords", icon: Shield },
                { name: "Preferences", icon: SlidersHorizontal },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-slate-50 text-slate-900 border border-slate-200"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </div>
                    {!isActive && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Always Visible Sign Out Button */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="text-sm font-bold text-red-700 mb-1">Sign Out</h3>
            <p className="text-xs text-red-600/80 mb-3">End your current active session.</p>
            <button className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "Personal Info" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-6">Personal Information</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">First Name</label>
                    <input type="text" defaultValue="Admin" readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 outline-none cursor-default" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Last Name</label>
                    <input type="text" defaultValue="User" readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 outline-none cursor-default" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" defaultValue="admin@schooltec.com" readOnly className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 outline-none cursor-default" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Role / Designation</label>
                  <input type="text" defaultValue="System Administrator" disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security & Passwords" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Security</h3>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Password</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Last changed 3 months ago</p>
                  </div>
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Update
                  </button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Preferences" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-base font-bold text-slate-900 mb-6">System Preferences</h3>
              <p className="text-sm text-slate-500 mb-6">Customize your dashboard experience and notification alerts.</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Notification Alerts</h4>
                  <div className="space-y-3">
                    {[
                      { label: "New Application Submissions", defaultChecked: true },
                      { label: "Interview Schedules & Reminders", defaultChecked: true },
                      { label: "Daily Summary Reports", defaultChecked: false },
                      { label: "System & Security Alerts", defaultChecked: true },
                    ].map((pref, i) => (
                      <label key={i} className="flex items-center justify-between py-1 cursor-pointer group">
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{pref.label}</span>
                        <input type="checkbox" defaultChecked={pref.defaultChecked} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Dashboard Display</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between py-1 cursor-pointer group">
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Compact Table View</span>
                      <input type="checkbox" defaultChecked={false} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                    </label>
                    <label className="flex items-center justify-between py-1 cursor-pointer group">
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Dark Mode (Beta)</span>
                      <input type="checkbox" defaultChecked={false} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
