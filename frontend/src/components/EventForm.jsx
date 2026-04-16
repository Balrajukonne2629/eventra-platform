"use client";

import { useState } from "react";
import InputField from "./InputField";
import Button from "./Button";
import Loader from "./Loader";
import Alert from "./Alert";
import { createEvent } from "@/lib/api";

export default function EventForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    club: "",
    category: "Technical",
    teamSize: "1",
    maxTeams: "",
    deadline: "",
    facultyEmail: "",
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    // Client-side quick checks
    if (!formData.facultyEmail.includes("@")) {
      setStatus({ type: "error", message: "Please enter a valid faculty email." });
      setIsLoading(false);
      return;
    }

    try {
      const response = await createEvent(formData);

      if (response.success || response.ok) {
        setStatus({ type: "success", message: "✅ Event Created & Faculty Notified" });
        setFormData({ // Reset form
          title: "", description: "", club: "", category: "Technical",
          teamSize: "1", maxTeams: "", deadline: "", facultyEmail: "",
        });
      } else {
        setStatus({ type: "error", message: response.message || "Failed to create event" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-700 max-w-3xl mx-auto w-full ring-1 ring-white/5">
      <h2 className="text-3xl font-extrabold text-white mb-8 border-b border-slate-700 pb-4 tracking-tight">Provide Event Details</h2>

      <Alert type={status.type} message={status.message} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Annual Tech Symposium"
          required
        />
        
        <InputField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what the event is all about..."
          isTextArea
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Organizing Club"
            name="club"
            value={formData.club}
            onChange={handleChange}
            placeholder="e.g. CodeX"
            required
          />

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-slate-300 tracking-wide">Category <span className="text-red-400 ml-1">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white outline-none font-medium text-base hover:border-slate-600 transition-all cursor-pointer"
            >
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-slate-300 tracking-wide">Team Size <span className="text-red-400 ml-1">*</span></label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-slate-700 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-800 text-white outline-none font-medium text-base hover:border-slate-600 transition-all cursor-pointer"
            >
              <option value="1">1 (Individual)</option>
              <option value="2">2 Members</option>
              <option value="4">4 Members</option>
            </select>
          </div>

          <InputField
            label="Maximum Teams"
            name="maxTeams"
            type="number"
            value={formData.maxTeams}
            onChange={handleChange}
            placeholder="e.g. 50"
            required
          />

          <InputField
            label="Registration Deadline"
            name="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={handleChange}
            required
          />

          <InputField
            label="Faculty Email (Approver)"
            name="facultyEmail"
            type="email"
            value={formData.facultyEmail}
            onChange={handleChange}
            placeholder="faculty@example.edu"
            required
          />
        </div>

        <div className="pt-6 border-t border-slate-700 mt-8">
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? <Loader text="Creating Event..." /> : "Propose Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
