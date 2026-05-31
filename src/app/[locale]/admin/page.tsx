"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  getEvents,
  getOrganizers,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  updateRecordVisibility,
  updateEventFeatured,
  deleteRecord,
  FirestoreEvent,
  FirestoreOrganizer,
  FirestoreSubmission,
} from "@/lib/db";
import Header from "@/components/Header";
import {
  ShieldCheck,
  Calendar as CalendarIcon,
  Users,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  Sparkles,
  Bot,
  MessageSquare,
  Search,
  Activity,
} from "lucide-react";

export default function AdminConsole() {
  const tCommon = useTranslations("Common");
  const tAdmin = useTranslations("Admin");
  const tRegions = useTranslations("Regions");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "queue" | "events" | "organizers" | "simulator"
  >("dashboard");

  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [organizers, setOrganizers] = useState<FirestoreOrganizer[]>([]);
  const [submissions, setSubmissions] = useState<FirestoreSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Show Hidden records toggle
  const [showHidden, setShowHidden] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulator State
  const [simSource, setSimSource] = useState<"telegram" | "whatsapp">("telegram");
  const [simText, setSimText] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const evts = await getEvents({ includeHidden: true });
        const orgs = await getOrganizers({ includeHidden: true });
        const subs = await getPendingSubmissions();
        setEvents(evts);
        setOrganizers(orgs);
        setSubmissions(subs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const evts = await getEvents({ includeHidden: true });
      const orgs = await getOrganizers({ includeHidden: true });
      const subs = await getPendingSubmissions();
      setEvents(evts);
      setOrganizers(orgs);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Moderation actions
  const handleApprove = async (id: string) => {
    try {
      await approveSubmission(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSubmission(id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Hide / unhide records
  const handleToggleVisibility = async (
    collectionName: "events" | "organizers",
    id: string,
    currentHidden: boolean
  ) => {
    try {
      await updateRecordVisibility(collectionName, id, !currentHidden);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Featured toggle
  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateEventFeatured(id, !currentFeatured);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Delete record
  const handleDelete = async (collectionName: "events" | "organizers", id: string) => {
    if (
      !confirm(
        locale === "he"
          ? "האם אתה בטוח שברצונך למחוק לצמיתות רשומה זו?"
          : "Are you sure you want to permanently delete this record?"
      )
    )
      return;
    try {
      await deleteRecord(collectionName, id);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Ingestion Simulator trigger
  const runIngestionSim = () => {
    if (!simText.trim()) return;
    setSimulating(true);
    setSimSuccess(false);

    setTimeout(async () => {
      // Simulate LLM parse and add to submissions
      try {
        const mockSubmissionData = {
          type: "event",
          status: "pending",
          source: simSource,
          createdAt: Date.now(),
          submitterContact: { email: `bot-scraped@soundguy.ai` },
          data: {
            name:
              simSource === "telegram"
                ? "Telegram Community Workshop"
                : "WhatsApp Scraped Show Match",
            organizerName: "Unknown",
            description: `INGESTED VIA ${simSource.toUpperCase()}:\n${simText.substring(0, 100)}...`,
            time: Date.now() + 6 * 24 * 60 * 60 * 1000,
            endTime: Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
            recurrence: "one-time",
            location:
              simSource === "telegram" ? "Community Hub, Ra'anana" : "Improv Club, Tel Aviv",
            region: simSource === "telegram" ? "Hasharon" : "Tel-Aviv",
            language: "he",
            cost: "Paid",
            access: "Open",
            hidden: false,
            featured: false,
          },
          links: [{ url: "https://chat.whatsapp.com/scraped-group", type: "WhatsApp group" }],
        };

        // Create submission directly in database
        const { db } = await import("@/lib/firebase");
        const { addDoc, collection } = await import("firebase/firestore");
        await addDoc(collection(db, "submissions"), mockSubmissionData);

        setSimSuccess(true);
        setSimText("");
        await refreshData();
      } catch (err) {
        console.error(err);
      } finally {
        setSimulating(false);
      }
    }, 1500);
  };

  // Filter lists based on Show Hidden & Search query
  const filteredEvents = events.filter((e) => {
    if (!showHidden && e.hidden) return false;
    if (
      searchQuery &&
      !e.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.organizerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredOrganizers = organizers.filter((org) => {
    if (!showHidden && org.hidden) return false;
    if (searchQuery && !org.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const pendingSubsCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <span>{tAdmin("title")}</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            {locale === "he"
              ? "נהלו את לוח האירועים, אינדקס המארגנים ואשרו הגשות חדשות מהקהילה."
              : "Moderate community calendars, reference indexes, and review crowd-sourced submissions."}
          </p>
        </div>

        {/* TABS HEADER */}
        <div className="flex flex-wrap border-b border-zinc-900 bg-zinc-950 sticky top-16 z-10 py-2 gap-2">
          {[
            { id: "dashboard", label: tAdmin("dashboard"), icon: Activity },
            { id: "queue", label: `${tAdmin("queue")} (${pendingSubsCount})`, icon: Clock },
            { id: "events", label: tAdmin("events"), icon: CalendarIcon },
            { id: "organizers", label: tAdmin("organizers"), icon: Users },
            { id: "simulator", label: tAdmin("simulator"), icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "dashboard" | "queue" | "events" | "organizers" | "simulator"
                  )
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* LOADING INDICATOR */}
        {loading && activeTab !== "simulator" && (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-850 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* A. DASHBOARD STATS */}
        {!loading && activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="glass-card rounded-2xl p-6 border border-zinc-900 flex flex-col gap-2">
                <span className="text-zinc-500 text-xs font-bold uppercase">
                  {tAdmin("pendingSubmissions")}
                </span>
                <span className="text-4xl font-extrabold text-indigo-400">{pendingSubsCount}</span>
              </div>

              {/* Stat 2 */}
              <div className="glass-card rounded-2xl p-6 border border-zinc-900 flex flex-col gap-2">
                <span className="text-zinc-500 text-xs font-bold uppercase">
                  {tAdmin("activeEvents")}
                </span>
                <span className="text-4xl font-extrabold text-emerald-400">
                  {events.filter((e) => !e.hidden).length}
                </span>
              </div>

              {/* Stat 3 */}
              <div className="glass-card rounded-2xl p-6 border border-zinc-900 flex flex-col gap-2">
                <span className="text-zinc-500 text-xs font-bold uppercase">
                  {tAdmin("totalOrganizers")}
                </span>
                <span className="text-4xl font-extrabold text-purple-400">{organizers.length}</span>
              </div>
            </div>

            {/* Ingestion Overview */}
            <div className="glass-card rounded-2xl p-6 border border-zinc-900 flex flex-col gap-3">
              <h3 className="text-md font-bold text-white uppercase">
                {locale === "he" ? "צינור קליטה מבוסס AI" : "AI Ingestion Pipeline Overview"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                {locale === "he"
                  ? "מערכת זו משתלבת עם קבוצות וואטסאפ ובוט טלגרם. הודעות טקסט חופשיות נשלחות לעיבוד ב-Gemini ומחולצות אוטומטית לשדות מובנים (כמו מיקום, שפה, שעה). לאחר מכן הן מתווספות לתור האישורים כממתינות לבקרה ידנית."
                  : "This ecosystem integrates with scrape engines in WhatsApp groups and Telegram chats. Raw texts are structured using LLMs (Gemini), converting unstructured flyers into events, complete with maps, recurrence, and typed social links, pending admin one-click publish."}
              </p>
            </div>
          </div>
        )}

        {/* B. MODERATION QUEUE */}
        {!loading && activeTab === "queue" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white">{tAdmin("queue")}</h2>

            {submissions.filter((s) => s.status === "pending").length === 0 ? (
              <div className="glass-card rounded-2xl py-12 text-center text-zinc-500 text-sm">
                {tAdmin("noSubmissions")}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {submissions
                  .filter((s) => s.status === "pending")
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="glass-card rounded-xl p-5 border border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase">
                            {sub.type === "event" ? "Event Proposal" : "Organizer Listing"}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold uppercase">
                            Source: {sub.source}
                          </span>
                        </div>

                        <h3 className="text-md font-bold text-white">{sub.data.name}</h3>
                        <p className="text-xs text-zinc-400 max-w-2xl">{sub.data.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 font-bold mt-1">
                          {sub.data.location && <span>Location: {sub.data.location}</span>}
                          {sub.data.time && (
                            <span>Time: {new Date(sub.data.time).toLocaleString()}</span>
                          )}
                          {sub.submitterContact?.email && (
                            <span>Submitter: {sub.submitterContact.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full md:w-auto">
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{tAdmin("approve")}</span>
                        </button>

                        <button
                          onClick={() => handleReject(sub.id)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>{tAdmin("reject")}</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* C. EVENTS CRUD MANAGEMENT */}
        {!loading && activeTab === "events" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Show Hidden and Search controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    showHidden
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-zinc-850 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tAdmin("showHidden")}
                </button>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-zinc-900 rounded-xl bg-zinc-950/40">
              <table className="w-full text-sm text-left rtl:text-right text-zinc-400">
                <thead className="text-xs uppercase bg-zinc-950 text-zinc-500 border-b border-zinc-900">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "אירוע" : "Event"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "מארגן" : "Organizer"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "אזור" : "Region"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className={`hover:bg-zinc-900/30 ${evt.hidden ? "opacity-50 bg-zinc-950/20" : ""}`}
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span>{evt.name}</span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">
                            {evt.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{evt.organizerName}</td>
                      <td className="px-6 py-4 text-xs">{tRegions(evt.region)}</td>
                      <td className="px-6 py-4 text-xs">{new Date(evt.time).toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex gap-1.5 flex-wrap">
                          {evt.hidden && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-500 font-extrabold uppercase border border-zinc-800">
                              {tAdmin("hiddenBadge")}
                            </span>
                          )}
                          {evt.featured && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px] text-indigo-400 font-extrabold uppercase border border-indigo-500/20">
                              {tAdmin("featuredBadge")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVisibility("events", evt.id, evt.hidden)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 cursor-pointer"
                            title={evt.hidden ? tAdmin("unhide") : tAdmin("hide")}
                          >
                            {evt.hidden ? (
                              <Eye className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-500" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(evt.id, evt.featured)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 cursor-pointer"
                            title={tAdmin("toggleFeatured")}
                          >
                            <Sparkles
                              className={`w-4 h-4 ${evt.featured ? "text-amber-400" : "text-zinc-500"}`}
                            />
                          </button>

                          <button
                            onClick={() => handleDelete("events", evt.id)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title={tAdmin("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* D. ORGANIZERS CRUD MANAGEMENT */}
        {!loading && activeTab === "organizers" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    showHidden
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-zinc-850 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tAdmin("showHidden")}
                </button>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organizers..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto w-full border border-zinc-900 rounded-xl bg-zinc-950/40">
              <table className="w-full text-sm text-left rtl:text-right text-zinc-400">
                <thead className="text-xs uppercase bg-zinc-950 text-zinc-500 border-b border-zinc-900">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "מארגן" : "Organizer"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "סוג" : "Type"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      {locale === "he" ? "אזור" : "Region"}
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredOrganizers.map((org) => (
                    <tr
                      key={org.id}
                      className={`hover:bg-zinc-900/30 ${org.hidden ? "opacity-50 bg-zinc-950/20" : ""}`}
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span>{org.name}</span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">
                            {org.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{org.type}</td>
                      <td className="px-6 py-4 text-xs">{tRegions(org.region)}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex gap-1.5 flex-wrap">
                          {org.hidden && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-500 font-extrabold uppercase border border-zinc-800">
                              {tAdmin("hiddenBadge")}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] text-emerald-400 font-extrabold uppercase border border-emerald-500/20">
                            {org.publishStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVisibility("organizers", org.id, org.hidden)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 cursor-pointer"
                            title={org.hidden ? tAdmin("unhide") : tAdmin("hide")}
                          >
                            {org.hidden ? (
                              <Eye className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-500" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete("organizers", org.id)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-850 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title={tAdmin("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* E. INGESTION PLAYGROUND / SCRAPER SIMULATION */}
        {activeTab === "simulator" && (
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
            <div className="border-b border-zinc-850 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>{tAdmin("simulator")}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">{tAdmin("simDesc")}</p>
            </div>

            {simSuccess && (
              <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-sm font-bold flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>
                  {locale === "he"
                    ? "סימולציית הקליטה הצליחה! טיוטת האירוע התווספה לתור האישורים."
                    : "Simulation successful! Parsed draft event has been added to the moderation queue."}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Config Panel */}
              <div className="flex flex-col gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500 font-bold uppercase">
                    {locale === "he" ? "מקור קליטה" : "Ingestion Source"}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setSimSource("telegram")}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        simSource === "telegram"
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-zinc-850 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 inline mr-1" />
                      <span>Telegram Bot</span>
                    </button>

                    <button
                      onClick={() => setSimSource("whatsapp")}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        simSource === "whatsapp"
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-zinc-850 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                      <span>WhatsApp Scrape</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  <span className="text-xs text-zinc-500 font-bold uppercase">
                    {locale === "he" ? "דוגמאות הודעה מהירות" : "Quick Message Presets"}
                  </span>

                  <button
                    onClick={() =>
                      setSimText(
                        simSource === "telegram"
                          ? "Hi! Please post my workshop 'Harold scenic matching' happening at Gerar Behar, Jerusalem next Monday at 19:30. Price is 45 NIS, register in advance at https://eventer.co.il/haroldjlm"
                          : "🔥 NEW EVENT ALERT 🔥\nWhatsApp Scrape: Friday Improv Jam match in Tel AvivLilienblum! Starting 21:00. Entrance is free, beer available at bar!"
                      )
                    }
                    className="p-3 text-left rtl:text-right rounded-lg border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 transition-colors text-xs text-zinc-400 cursor-pointer"
                  >
                    Load preset chat text
                  </button>
                </div>
              </div>

              {/* Right Input Area */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <label className="text-xs font-extrabold uppercase text-zinc-400">
                  {simSource === "telegram"
                    ? tAdmin("simulateTelegram")
                    : tAdmin("simulateWhatsApp")}
                </label>

                <textarea
                  rows={6}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder={
                    locale === "he"
                      ? "הדביקו הודעת וואטסאפ או טקסט שנשלח לבוט..."
                      : "Paste message payload to parse..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                />

                <button
                  onClick={runIngestionSim}
                  disabled={simulating || !simText.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{simulating ? "LLM Parsing Ingestion..." : tAdmin("simBtn")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-900/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500 font-semibold">
        <p className="max-w-7xl mx-auto px-4">{tCommon("footer")}</p>
      </footer>
    </div>
  );
}
