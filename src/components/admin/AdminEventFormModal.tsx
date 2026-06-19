"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { FirestoreEvent, FirestoreOrganizer, EventLink } from "@/lib/db";
import { useTranslations } from "next-intl";

import { convertJerusalemLocalToUtc, convertUtcToJerusalemLocal } from "@/lib/date-utils";

interface AdminEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<FirestoreEvent, "id" | "createdAt" | "links">,
    links: EventLink[]
  ) => Promise<void>;
  initialData?: FirestoreEvent | null;
  organizers: FirestoreOrganizer[];
  locale: string;
}

const createDefaultEventData = () => ({
  name: "",
  type: "Show",
  organizerId: "",
  organizerName: "",
  description: "",
  time: 0,
  endTime: undefined as number | undefined,
  recurrence: "one-time",
  location: "",
  mapLink: "",
  region: "Tel-Aviv",
  language: "he",
  cost: "Paid",
  access: "Open",
  hidden: false,
  featured: false,
});

export default function AdminEventFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  organizers,
  locale,
}: AdminEventFormModalProps) {
  const tRegions = useTranslations("Regions");

  const isHe = locale === "he";

  const [formData, setFormData] = useState(createDefaultEventData());
  const [links, setLinks] = useState<EventLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          type: initialData.type || "Show",
          organizerId: initialData.organizerId || "",
          organizerName: initialData.organizerName || "",
          description: initialData.description || "",
          time: initialData.time || Date.now(),
          endTime: initialData.endTime,
          recurrence: initialData.recurrence || "one-time",
          location: initialData.location || "",
          mapLink: initialData.mapLink || "",
          region: initialData.region || "Tel-Aviv",
          language: initialData.language || "he",
          cost: initialData.cost || "Paid",
          access: initialData.access || "Open",
          hidden: !!initialData.hidden,
          featured: !!initialData.featured,
        });
        setLinks(initialData.links ? [...initialData.links] : []);
      } else {
        const now = Date.now();
        setFormData({
          ...createDefaultEventData(),
          time: now + 86400000,
          endTime: now + 86400000 + 7200000,
        });
        setLinks([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toDatetimeLocal = (ts?: number) => {
    return convertUtcToJerusalemLocal(ts);
  };

  const fromDatetimeLocal = (str: string) => {
    return convertJerusalemLocalToUtc(str);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const type = target.type;
    let finalValue: string | number | boolean | undefined = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === "datetime-local") {
      finalValue = value ? fromDatetimeLocal(value) : undefined;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: finalValue };
      // Auto-fill organizerName if organizerId changed
      if (name === "organizerId") {
        const org = organizers.find((o) => o.id === value);
        if (org) {
          next.organizerName = org.name;
        } else {
          // "custom" or "-- Select --": clear the name so the select reflects the right state
          next.organizerName = "";
        }
      }
      return next;
    });
  };

  const handleLinkChange = (index: number, field: keyof EventLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, { url: "", type: "Website", label: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submissionData = { ...formData };
      if (submissionData.organizerId === "custom") {
        submissionData.organizerId = "";
      }
      await onSave(submissionData, links);
      onClose();
    } catch (err) {
      console.error(err);
      alert(isHe ? "שגיאה בשמירת האירוע" : "Error saving event");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
      dir={isHe ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {initialData ? (isHe ? "ערוך אירוע" : "Edit Event") : isHe ? "הוסף אירוע" : "Add Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="event-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "שם אירוע *" : "Event Name *"}
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "סוג אירוע" : "Event Type"}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Show">Show</option>
                  <option value="Jam">Jam</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Course">Course</option>
                  <option value="Festival">Festival</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "מארגן" : "Organizer"}
                </label>
                <select
                  name="organizerId"
                  value={formData.organizerId || (formData.organizerName ? "custom" : "")}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{isHe ? "-- בחר --" : "-- Select --"}</option>
                  {organizers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                  <option value="custom">
                    {isHe ? "אחר (טקסט חופשי)" : "Other (Custom Text)"}
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "שם מארגן *" : "Organizer Name *"}
                </label>
                <input
                  required
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  disabled={!!formData.organizerId && formData.organizerId !== "custom"}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase">
                {isHe ? "תיאור" : "Description"}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "התחלה *" : "Start Time *"}
                </label>
                <input
                  required
                  type="datetime-local"
                  name="time"
                  value={toDatetimeLocal(formData.time)}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "סיום" : "End Time"}
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={toDatetimeLocal(formData.endTime)}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "מיקום *" : "Location *"}
                </label>
                <input
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "קישור מפה" : "Map Link"}
                </label>
                <input
                  type="url"
                  name="mapLink"
                  value={formData.mapLink}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "אזור" : "Region"}
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {["Tel-Aviv", "Jerusalem", "Haifa", "Hasharon", "North", "South", "Other"].map(
                    (r) => (
                      <option key={r} value={r}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {tRegions(r as any) || r}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "שפה" : "Language"}
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="he">Hebrew</option>
                  <option value="en">English</option>
                  <option value="he/en">Bilingual</option>
                  <option value="Gibberish">Gibberish</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "מחיר" : "Cost"}
                </label>
                <select
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Free">Free</option>
                  <option value="Donation">Donation</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  {isHe ? "חזרתיות" : "Recurrence"}
                </label>
                <select
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="one-time">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hidden"
                  checked={formData.hidden}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm font-semibold text-zinc-300">
                  {isHe ? "מוסתר מהאתר" : "Hidden"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                />
                <span className="text-sm font-semibold text-zinc-300">
                  {isHe ? "אירוע מקודם" : "Featured"}
                </span>
              </label>
            </div>

            <div className="h-px bg-white/10 w-full my-2"></div>

            {/* Links Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  {isHe ? "קישורים חיצוניים" : "External Links"}
                </h3>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isHe ? "הוסף קישור" : "Add Link"}
                </button>
              </div>

              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50"
                >
                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="w-full md:w-1/4 flex flex-col gap-1.5">
                    <select
                      value={link.type}
                      onChange={(e) => handleLinkChange(idx, "type", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    >
                      <option value="Website">Website</option>
                      <option value="Tickets">Tickets</option>
                      <option value="Facebook event">Facebook event</option>
                      <option value="WhatsApp group">WhatsApp group</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/4 flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder={isHe ? "כותרת (אופציונלי)" : "Label (Optional)"}
                      value={link.label || ""}
                      onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(idx)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 md:mt-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {links.length === 0 && (
                <div className="text-xs text-zinc-500 italic text-center py-4 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                  {isHe ? "אין קישורים עדיין." : "No links added yet."}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0 bg-white/5 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {isHe ? "ביטול" : "Cancel"}
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isSaving ? (isHe ? "שומר..." : "Saving...") : isHe ? "שמור אירוע" : "Save Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
