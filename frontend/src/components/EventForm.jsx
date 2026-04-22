"use client";

import { useState } from "react";
import InputField from "./InputField";
import Button from "./Button";
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
    externalFormLink: "",
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

    if (formData.externalFormLink.trim()) {
      try {
        const parsed = new URL(formData.externalFormLink.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("Invalid protocol");
        }
      } catch {
        setStatus({ type: "error", message: "Please enter a valid external form URL." });
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await createEvent(formData);

      if (response.success || response.ok) {
        setStatus({ type: "success", message: "✅ Event Created & Faculty Notified" });
        setFormData({ // Reset form
          title: "", description: "", club: "", category: "Technical",
          teamSize: "1", maxTeams: "", deadline: "", facultyEmail: "", externalFormLink: "",
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
    <div className="surface-card mx-auto w-full max-w-3xl rounded-2xl p-6 shadow-xl sm:p-8 lg:p-10">
      <h2 className="page-title mb-8 border-b border-slate-700/80 pb-4 text-3xl font-extrabold tracking-tight">Provide Event Details</h2>

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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-slate-200">Category <span className="ml-1 text-red-400">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
            >
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-slate-200">Team Size <span className="ml-1 text-red-400">*</span></label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full cursor-pointer rounded-xl border border-slate-600/80 bg-slate-900/85 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all hover:border-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/35"
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

          <InputField
            label="External Form Link (optional)"
            name="externalFormLink"
            type="url"
            value={formData.externalFormLink}
            onChange={handleChange}
            placeholder="https://forms.google.com/..."
          />
        </div>

        <div className="mt-8 border-t border-slate-700/80 pt-6">
          <Button type="submit" disabled={isLoading} loading={isLoading} fullWidth>
            {isLoading ? "Creating Event..." : "Propose Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
