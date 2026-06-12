"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createSubmission, getOrganizers, FirestoreOrganizer } from "@/lib/db";
import Header from "@/components/Header";
import {
  Sparkles,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  Building,
  Trash2,
  Plus,
  Code,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isUserAdmin } from "@/lib/permissions";

const REGION_KEYS = ["Tel-Aviv", "Jerusalem", "Beer-Sheva", "Haifa", "Hasharon", "Other areas"];
const ORGANIZER_TYPE_KEYS = ["Group", "School", "Theater", "Other"];

export default function SubmitContent() {
  const tSub = useTranslations("Submissions");
  const tRegions = useTranslations("Regions");
  const tOrgTypes = useTranslations("OrganizerTypes");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<"event" | "organizer" | "ai" | "json">("event");
  const [organizers, setOrganizers] = useState<FirestoreOrganizer[]>([]);
  const { profile } = useAuth();
  const isAdmin = isUserAdmin(profile);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // JSON State
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 1. Structured Event Form State
  const [eventName, setEventName] = useState("");
  const [eventOrganizerId, setEventOrganizerId] = useState("");
  const [eventOrganizerString, setEventOrganizerString] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventMapLink, setEventMapLink] = useState("");
  const [eventRegion, setEventRegion] = useState("Tel-Aviv");
  const [eventLanguage, setEventLanguage] = useState("he");
  const [eventCost, setEventCost] = useState("Paid");
  const [eventAccess, setEventAccess] = useState("Open");
  const [eventRecurrence, setEventRecurrence] = useState("one-time");
  const [eventLinks, setEventLinks] = useState<{ url: string; type: string; label?: string }[]>([]);

  // Submitter Contact State
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");

  // 2. Structured Organizer Form State
  const [isUpdate, setIsUpdate] = useState(false);
  const [orgTargetId, setOrgTargetId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("Group");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgRegion, setOrgRegion] = useState("Tel-Aviv");
  const [orgLanguages, setOrgLanguages] = useState<string[]>(["he"]);
  const [orgLinks, setOrgLinks] = useState<{ url: string; type: string; label?: string }[]>([]);

  // 3. AI Parser State
  const [flyerText, setFlyerText] = useState("");
  const [aiParsing, setAiParsing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrganizers({ locale: locale as "en" | "he" });
        setOrganizers(data);
      } catch (err) {
        console.error("Failed to load organizers:", err);
      }
    }
    load();
  }, [locale]);

  // Simulating an LLM parser
  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setJsonError(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setJsonError("Invalid JSON format: " + errorMessage);
      return;
    }

    try {
      const res = await fetch("/api/submissions/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setJsonError(data.error + (data.details ? ": " + JSON.stringify(data.details) : ""));
        return;
      }
      if (data.errors && data.errors.length > 0) {
        setJsonError(
          (locale === "he" ? "חלק מהאירועים נכשלו בהגשה: " : "Some events failed to submit: ") +
            data.errors.join("; ")
        );
        if (data.submissionIds && data.submissionIds.length > 0) {
          setSuccess(true);
        }
        return;
      }
      setSuccess(true);
      setJsonText("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setJsonError(errorMessage);
      setError(true);
    }
  };

  const handleAiParse = () => {
    if (!flyerText.trim()) return;
    setAiParsing(true);

    setTimeout(() => {
      // Analyze text keywords to mock LLM structured extraction
      const lower = flyerText.toLowerCase();

      let name = "Awesome Improv Show";
      if (lower.includes("harold") || lower.includes("הארולד")) name = "The Harold Improv Showcase";
      else if (lower.includes("jam") || lower.includes("ג'אם")) name = "Community Improv Jam Stage";
      else if (lower.includes("workshop") || lower.includes("סדנה") || lower.includes("קורס"))
        name = "Improv Scene Relationships Workshop";

      let cost = "Paid";
      if (lower.includes("free") || lower.includes("חינם") || lower.includes("כניסה חופשית"))
        cost = "Free";

      let lang = "he";
      if (lower.includes("english") || lower.includes("אנגלית")) lang = "en";

      let region = "Tel-Aviv";
      if (lower.includes("jerusalem") || lower.includes("ירושלים")) region = "Jerusalem";
      else if (lower.includes("haifa") || lower.includes("חיפה")) region = "Haifa";

      let location = "Tel Aviv Improv Studio, Lilienblum St";
      if (lower.includes("gerard") || lower.includes("ז'ראר"))
        location = "Gerard Behar Center, Jerusalem";
      else if (lower.includes("carmel") || lower.includes("חיפה")) location = "Beit Hecht, Haifa";

      const description = "AI PARSED FLYER TEXT:\n" + flyerText.substring(0, 150) + "...";

      // Set forms fields
      setEventName(name);
      setEventDescription(description);
      setEventLocation(location);
      setEventCost(cost);
      setEventLanguage(lang);
      setEventRegion(region);
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const tzOffset = futureDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(futureDate.getTime() - tzOffset).toISOString().slice(0, 16);
      setEventTime(localISOTime); // 3 days in future (local timezone)

      setAiParsing(false);
      setActiveTab("event"); // Switch to review form
    }, 2000);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (!eventName || !eventLocation || !submitterEmail || !eventTime) {
      setError(true);
      return;
    }

    try {
      const selectedOrg = organizers.find((o) => o.id === eventOrganizerId);
      await createSubmission({
        type: "event",
        source: flyerText ? "free_text" : "web_form",
        submitterContact: {
          email: submitterEmail,
          phone: submitterPhone,
        },
        data: {
          name: eventName,
          organizerId: eventOrganizerId || undefined,
          organizerName: selectedOrg ? selectedOrg.name : eventOrganizerString || "Unknown",
          description: eventDescription,
          time: new Date(eventTime).getTime(),
          endTime: eventEndTime ? new Date(eventEndTime).getTime() : undefined,
          recurrence: eventRecurrence,
          location: eventLocation,
          mapLink: eventMapLink || undefined,
          region: eventRegion,
          language: eventLanguage,
          cost: eventCost,
          access: eventAccess,
          hidden: false,
          featured: false,
        },
        links: eventLinks,
      });
      setSuccess(true);
      clearEventForm();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const handleOrganizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (!orgName || !orgDesc || !submitterEmail || (isUpdate && !orgTargetId)) {
      setError(true);
      return;
    }

    try {
      await createSubmission({
        type: "organizer",
        source: "web_form",
        ...(isUpdate && orgTargetId ? { targetDocumentId: orgTargetId } : {}),
        submitterContact: {
          email: submitterEmail,
          phone: submitterPhone,
        },
        data: {
          ...(isUpdate && orgTargetId ? { id: orgTargetId } : {}),
          name: orgName,
          type: orgType,
          description: orgDesc,
          region: orgRegion,
          languages: orgLanguages,
          publishStatus: "pending",
          hidden: false,
          // Store meta indicating update
          isUpdateProposal: isUpdate,
        },
        links: orgLinks,
      });
      setSuccess(true);
      clearOrganizerForm();
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const clearEventForm = () => {
    setEventName("");
    setEventOrganizerId("");
    setEventOrganizerString("");
    setEventDescription("");
    setEventTime("");
    setEventEndTime("");
    setEventLocation("");
    setEventMapLink("");
    setEventLinks([]);
    setFlyerText("");
  };

  const clearOrganizerForm = () => {
    setOrgTargetId("");
    setOrgName("");
    setOrgDesc("");
    setOrgLinks([]);
  };

  const addEventLink = () => {
    setEventLinks([...eventLinks, { url: "", type: "Website" }]);
  };

  const updateEventLink = (index: number, field: string, value: string) => {
    const updated = [...eventLinks];
    updated[index] = { ...updated[index], [field]: value };
    setEventLinks(updated);
  };

  const removeEventLink = (index: number) => {
    setEventLinks(eventLinks.filter((_, idx) => idx !== index));
  };

  const toggleLanguageOption = (lang: string) => {
    if (orgLanguages.includes(lang)) {
      setOrgLanguages(orgLanguages.filter((l) => l !== lang));
    } else {
      setOrgLanguages([...orgLanguages, lang]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{tSub("title")}</h1>
          <p className="text-zinc-400 text-sm">
            {locale === "he"
              ? "הגישו אירועים או מארגנים חדשים ללוח. התכנים יפורסמו באופן מיידי לאחר בקרה ואישור מהירים."
              : "Submit upcoming events or listing proposals. Content will be published immediately after quick admin moderation."}
          </p>
        </div>

        {/* TABS NAVBAR */}
        <div className="flex border-b border-zinc-900 bg-zinc-950 sticky top-16 z-10 py-2 gap-2">
          <button
            onClick={() => {
              setActiveTab("event");
              setSuccess(false);
              setError(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === "event"
                ? "bg-zinc-800 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{tSub("eventTab")}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("organizer");
              setSuccess(false);
              setError(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === "organizer"
                ? "bg-zinc-800 text-white shadow-md"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <Building className="w-4 h-4 text-indigo-400" />
            <span>{tSub("organizerTab")}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ai");
              setSuccess(false);
              setError(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer relative overflow-hidden group border ${
              activeTab === "ai"
                ? "bg-gradient-primary border-indigo-500 text-white shadow-lg"
                : "border-zinc-800 text-indigo-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{tSub("flyerTab")}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab("json");
                setSuccess(false);
                setError(false);
                setJsonError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === "json"
                  ? "bg-zinc-800 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
              }`}
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>JSON</span>
            </button>
          )}
        </div>

        {/* FEEDBACK BANNER */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-bold">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{tSub("submitSuccess")}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold">
            {tSub("submitError")}
          </div>
        )}

        {/* 1. STRUCTURING EVENT FORM */}
        {activeTab === "event" && !success && (
          <form
            onSubmit={handleEventSubmit}
            className="glass-card rounded-2xl p-6 flex flex-col gap-6"
          >
            <div className="border-b border-zinc-850 pb-3">
              <h2 className="text-lg font-bold text-white">{tSub("eventTab")}</h2>
              <p className="text-xs text-zinc-400 mt-1">{tSub("eventFormDesc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("eventName")} *
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Late Night Comedy Showcase"
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Region */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {locale === "he" ? "אזור בארץ" : "Region"} *
                </label>
                <select
                  value={eventRegion}
                  onChange={(e) => setEventRegion(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {REGION_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tRegions(key)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & Time */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("eventTime")} *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("eventEndTime")}
                </label>
                <input
                  type="datetime-local"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Location Address */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("location")} *
                </label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Zoa House, Lilienblum 12, Tel Aviv"
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Map Link */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("mapLink")}
                </label>
                <input
                  type="url"
                  value={eventMapLink}
                  onChange={(e) => setEventMapLink(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Organizer Record Linked */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("organizerSelect")}
                </label>
                <select
                  value={eventOrganizerId}
                  onChange={(e) => setEventOrganizerId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="">
                    {locale === "he" ? "-- בחר מארגן מהאינדקס --" : "-- Choose from Directory --"}
                  </option>
                  {organizers.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organizer Display String */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <label className="text-xs font-extrabold uppercase text-zinc-400">
                    {tSub("organizerString")}
                  </label>
                  <span className="text-[10px] text-zinc-500">{tSub("organizerStringHelp")}</span>
                </div>
                <input
                  type="text"
                  disabled={!!eventOrganizerId}
                  value={eventOrganizerString}
                  onChange={(e) => setEventOrganizerString(e.target.value)}
                  placeholder={
                    eventOrganizerId ? "Locked (Linked to Directory)" : "e.g. Living Room Jam Team"
                  }
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-40"
                />
              </div>

              {/* Language, Cost, Access, Recurrence */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("language")} *
                </label>
                <select
                  value={eventLanguage}
                  onChange={(e) => setEventLanguage(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="he">Hebrew</option>
                  <option value="en">English</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("cost")} *
                </label>
                <select
                  value={eventCost}
                  onChange={(e) => setEventCost(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="Paid">Paid</option>
                  <option value="Free">Free</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("access")} *
                </label>
                <select
                  value={eventAccess}
                  onChange={(e) => setEventAccess(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="Open">Open to All</option>
                  <option value="Private">Private / Registration Required</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {locale === "he" ? "מחזוריות" : "Recurrence"}
                </label>
                <select
                  value={eventRecurrence}
                  onChange={(e) => setEventRecurrence(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="one-time">One-time Event</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("description")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Tell the community what your event is about..."
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>
            </div>

            {/* Event Outbound Links */}
            <div className="flex flex-col gap-4 border-t border-zinc-900 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("linksSection")}
                </label>
                <button
                  type="button"
                  onClick={addEventLink}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold transition-all hover:bg-indigo-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tSub("addLink")}</span>
                </button>
              </div>

              {eventLinks.map((lnk, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900"
                >
                  <select
                    value={lnk.type}
                    onChange={(e) => updateEventLink(idx, "type", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs"
                  >
                    <option value="Website">Website</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Facebook event">Facebook Event</option>
                    <option value="WhatsApp group">WhatsApp Group</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="url"
                    required
                    value={lnk.url}
                    onChange={(e) => updateEventLink(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={lnk.label || ""}
                      onChange={(e) => updateEventLink(idx, "label", e.target.value)}
                      placeholder="Label (optional)"
                      className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 text-xs w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeEventLink(idx)}
                      className="p-2 rounded bg-zinc-900 border border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submitter Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900 pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("contactEmail")} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 rtl:right-3 rtl:left-auto w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("contactPhone")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 rtl:right-3 rtl:left-auto w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="tel"
                    value={submitterPhone}
                    onChange={(e) => setSubmitterPhone(e.target.value)}
                    placeholder="e.g. 054-1234567"
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm mt-4 cursor-pointer"
            >
              {tSub("submitBtn")}
            </button>
          </form>
        )}

        {/* 2. PROPOSE ORGANIZER FORM */}
        {activeTab === "organizer" && !success && (
          <form
            onSubmit={handleOrganizerSubmit}
            className="glass-card rounded-2xl p-6 flex flex-col gap-6"
          >
            <div className="border-b border-zinc-850 pb-3">
              <h2 className="text-lg font-bold text-white">{tSub("organizerFormDesc")}</h2>
              <p className="text-xs text-zinc-400 mt-1">
                {locale === "he"
                  ? "הוסיפו גוף אימפרוב לאינדקס למטרות הפנייה."
                  : "Propose an entry or listing update."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proposal Type */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("newVsUpdate")}
                </label>
                <div className="flex gap-4 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdate(false);
                      setOrgTargetId("");
                    }}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      !isUpdate
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {tSub("newListing")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUpdate(true)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      isUpdate
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {tSub("updateListing")}
                  </button>
                </div>
              </div>

              {isUpdate ? (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-extrabold uppercase text-zinc-400">
                    {tSub("organizerSelect")} *
                  </label>
                  <select
                    required
                    value={orgTargetId}
                    onChange={(e) => setOrgTargetId(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">
                      {locale === "he" ? "-- בחר מארגן מהאינדקס --" : "-- Choose from Directory --"}
                    </option>
                    {organizers.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("organizerName")} *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Tel Aviv Harold Collective"
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("organizerType")} *
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {ORGANIZER_TYPE_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tOrgTypes(key)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {locale === "he" ? "אזור מאגר" : "Region"} *
                </label>
                <select
                  value={orgRegion}
                  onChange={(e) => setOrgRegion(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {REGION_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tRegions(key)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Languages Supported */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {locale === "he" ? "שפות פעילות" : "Languages"}
                </label>
                <div className="flex gap-3 mt-1.5">
                  {["he", "en"].map((lang) => {
                    const isSelected = orgLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguageOption(lang)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                            : "border-zinc-850 bg-zinc-950/40 text-zinc-500"
                        }`}
                      >
                        {lang === "he" ? "עברית" : "English"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("description")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  placeholder="Describe your troupe, school, theater or community platform..."
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>
            </div>

            {/* Submitter Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900 pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("contactEmail")} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 rtl:right-3 rtl:left-auto w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {tSub("contactPhone")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 rtl:right-3 rtl:left-auto w-4.5 h-4.5 text-zinc-500" />
                  <input
                    type="tel"
                    value={submitterPhone}
                    onChange={(e) => setSubmitterPhone(e.target.value)}
                    placeholder="e.g. 054-1234567"
                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm mt-4 cursor-pointer"
            >
              {tSub("submitBtn")}
            </button>
          </form>
        )}

        {/* 3. AI FLYER PARSER PLAYGROUND */}
        {activeTab === "ai" && (
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
            <div className="border-b border-zinc-850 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>{tSub("flyerTab")}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">{tSub("flyerDesc")}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <textarea
                rows={6}
                value={flyerText}
                onChange={(e) => setFlyerText(e.target.value)}
                placeholder={tSub("pasteFlyer")}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />

              <button
                onClick={handleAiParse}
                disabled={aiParsing || !flyerText.trim()}
                className="w-full py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiParsing ? tSub("parsing") : tSub("parseBtn")}</span>
              </button>
            </div>

            {/* Simulation Helpers */}
            <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-4 mt-2">
              <span className="text-xs text-zinc-500 font-extrabold uppercase">
                {locale === "he"
                  ? "מודעות לדוגמה (לחצו להדבקה מהירה)"
                  : "Mock Flyers (Click to auto-paste)"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setFlyerText(
                      "🔥 COMMUNITY IMPROV JAM IN JERUSALEM! 🔥\nEvery Tuesday at 20:00! Join us at the Gerard Behar Center. Completely free stage, open for all experience levels to play and laugh. English speakers friendly!"
                    )
                  }
                  className="p-3 text-left rtl:text-right rounded-xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900 transition-colors text-xs text-zinc-400 cursor-pointer"
                >
                  <span className="font-bold block text-white text-xs mb-1">
                    Jerusalem Free Jam Flyer
                  </span>
                  &quot;🔥 COMMUNITY IMPROV JAM IN JERUSALEM! 🔥...&quot;
                </button>

                <button
                  onClick={() =>
                    setFlyerText(
                      "🎭 GRAND HAROLD IMPROV SHOW 🎭\nImprov Israel presents an evening of longform Harold! zoa house tel aviv. June 15th, door opens at 20:30. Tickets: 50 NIS. Come see scenes weave and spin before your eyes!"
                    )
                  }
                  className="p-3 text-left rtl:text-right rounded-xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900 transition-colors text-xs text-zinc-400 cursor-pointer"
                >
                  <span className="font-bold block text-white text-xs mb-1">
                    Tel Aviv Harold Show Flyer
                  </span>
                  &quot;🎭 GRAND HAROLD IMPROV SHOW 🎭...&quot;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. JSON SUBMISSION (ADMIN ONLY) */}
        {isAdmin && activeTab === "json" && !success && (
          <form
            onSubmit={handleJsonSubmit}
            className="glass-card rounded-2xl p-6 flex flex-col gap-6"
          >
            <div className="border-b border-zinc-850 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <span>Bulk JSON Submission</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Submit an event or array of events using JSON format.
              </p>
            </div>

            {jsonError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold whitespace-pre-wrap">
                {jsonError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <textarea
                rows={12}
                required
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={
                  '[\n  {\n    "name": "My Event",\n    "description": "...",\n    "time": 1720000000000,\n    ...\n  }\n]'
                }
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm mt-4 cursor-pointer"
            >
              Submit JSON
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
