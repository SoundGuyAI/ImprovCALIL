"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getEvents, FirestoreEvent, normalizeRegion } from "@/lib/db";
import Header from "@/components/Header";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Globe,
  Unlock,
  Lock,
  ExternalLink,
  Facebook,
  MessageCircle,
  Instagram,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  List,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

const REGIONS = ["Tel-Aviv", "Jerusalem", "Beer-Sheva", "Haifa", "Hasharon", "Other areas"];
const EVENT_TYPES = ["Show", "Jam", "Workshop", "Festival", "Other"];

export default function Home() {
  const t = useTranslations("Common");
  const tFilters = useTranslations("Filters");
  const tRegions = useTranslations("Regions");
  const tTypes = useTranslations("EventTypes");
  const tLinks = useTranslations("LinkTypes");
  const locale = useLocale();

  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedCost, setSelectedCost] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");

  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<FirestoreEvent | null>(null);

  // Hero Featured Carousel State
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // View & Date Navigation State
  const [viewMode, setViewMode] = useState<"list" | "week" | "month">("list");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(() => new Date());

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featuredEvents = events.filter((e) => e.featured && !e.hidden);

  const nextFeatured = () => {
    if (featuredEvents.length === 0) return;
    setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevFeatured = () => {
    if (featuredEvents.length === 0) return;
    setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  // Filter Logic
  const filteredEvents = events.filter((e) => {
    if (e.hidden) return false;

    // Search Query
    if (
      search &&
      !e.name.toLowerCase().includes(search.toLowerCase()) &&
      !e.description.toLowerCase().includes(search.toLowerCase()) &&
      !e.organizerName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    // Region
    if (selectedRegion !== "all" && normalizeRegion(e.region) !== normalizeRegion(selectedRegion))
      return false;
    // Event Type
    if (selectedType !== "all") {
      const typeLower = selectedType.toLowerCase();
      // Jam, Show, Workshop, Festival
      if (
        typeLower === "show" &&
        !e.name.toLowerCase().includes("show") &&
        !e.name.toLowerCase().includes("מופע") &&
        !e.description.toLowerCase().includes("show")
      )
        return false;
      if (
        typeLower === "jam" &&
        !e.name.toLowerCase().includes("jam") &&
        !e.name.toLowerCase().includes("ג'אם") &&
        !e.description.toLowerCase().includes("jam")
      )
        return false;
      if (
        typeLower === "workshop" &&
        !e.name.toLowerCase().includes("workshop") &&
        !e.name.toLowerCase().includes("סדנ") &&
        !e.description.toLowerCase().includes("workshop")
      )
        return false;
      if (
        typeLower === "festival" &&
        !e.name.toLowerCase().includes("festival") &&
        !e.name.toLowerCase().includes("פסטיבל") &&
        !e.description.toLowerCase().includes("festival")
      )
        return false;
    }
    // Language
    if (selectedLanguage !== "all" && e.language !== selectedLanguage) return false;
    // Cost
    if (selectedCost !== "all" && e.cost !== selectedCost) return false;
    // Access
    if (selectedAccess !== "all" && e.access !== selectedAccess) return false;

    return true;
  });

  const getLinkIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "facebook":
      case "facebook event":
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case "whatsapp group":
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Date Helpers for Calendar Views
  const getStartOfWeek = (d: Date): Date => {
    const date = new Date(d.getTime());
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getWeekDays = (startOfWeek: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek.getTime());
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const addMonths = (date: Date, months: number): Date => {
    const day = date.getDate();
    const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay));
    return result;
  };

  const getMonthDaysGrid = (refDate: Date): Date[] => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    // First day of the current month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // Sunday starts at 0

    // Start date is the Sunday of the week containing the 1st of the month
    const startDate = new Date(firstDay.getTime());
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    const cells: Date[] = [];
    // 42 cells (6 weeks of 7 days)
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate.getTime());
      d.setDate(d.getDate() + i);
      cells.push(d);
    }
    return cells;
  };

  const getEventsForDay = (dayDate: Date): FirestoreEvent[] => {
    return filteredEvents.filter((event) => isSameDay(new Date(event.time), dayDate));
  };

  const handlePrev = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => {
        const nextD = new Date(prev.getTime());
        nextD.setDate(nextD.getDate() - 7);
        return nextD;
      });
    } else if (viewMode === "month") {
      setCurrentDate((prev) => {
        const temp = new Date(prev.getFullYear(), prev.getMonth(), 1);
        return addMonths(temp, -1);
      });
      setSelectedCalendarDay(null);
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate((prev) => {
        const nextD = new Date(prev.getTime());
        nextD.setDate(nextD.getDate() + 7);
        return nextD;
      });
    } else if (viewMode === "month") {
      setCurrentDate((prev) => {
        const temp = new Date(prev.getFullYear(), prev.getMonth(), 1);
        return addMonths(temp, 1);
      });
      setSelectedCalendarDay(null);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDay(today);
  };

  const getWeekRangeLabel = (): string => {
    const start = getStartOfWeek(currentDate);
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    const localeStr = locale === "he" ? "he-IL" : "en-US";
    return `${start.toLocaleDateString(localeStr, options)} - ${end.toLocaleDateString(localeStr, options)}`;
  };

  const getMonthLabel = (): string => {
    const localeStr = locale === "he" ? "he-IL" : "en-US";
    return currentDate.toLocaleDateString(localeStr, { month: "long", year: "numeric" });
  };

  // Group events by day for weekly view
  const groupedEvents: { [key: string]: FirestoreEvent[] } = {};
  filteredEvents.forEach((e) => {
    const dateStr = formatDate(e.time);
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = [];
    }
    groupedEvents[dateStr].push(e);
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* 1. FEATURED EVENT HERO BANNER */}
        {featuredEvents.length > 0 && (
          <section className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("featured")}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 text-center md:text-left rtl:md:text-right w-full mt-4 md:mt-0">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {featuredEvents[featuredIndex].name}
              </h2>
              <p className="text-sm md:text-base text-zinc-300 max-w-2xl line-clamp-2">
                {featuredEvents[featuredIndex].description}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  {formatDate(featuredEvents[featuredIndex].time)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {formatTime(featuredEvents[featuredIndex].time)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {featuredEvents[featuredIndex].location}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto items-center justify-center">
              <button
                onClick={() => setSelectedEvent(featuredEvents[featuredIndex])}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm cursor-pointer"
              >
                {t("details")}
              </button>

              {featuredEvents.length > 1 && (
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button
                    onClick={prevFeatured}
                    className="p-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>
                  <span className="text-xs text-zinc-500 font-bold">
                    {featuredIndex + 1} / {featuredEvents.length}
                  </span>
                  <button
                    onClick={nextFeatured}
                    className="p-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 2. SEARCH & ADVANCED FILTERS SECTION */}
        <section className="w-full glass-card rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 w-full md:w-auto">
              <Info className="w-5 h-5 text-indigo-400" />
              <span>{tFilters("title")}</span>
            </h3>

            {/* Main search input */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tFilters("search")}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Region Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {tFilters("region")}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "כל האזורים" : "All Regions"}</option>
                {REGIONS.map((key) => (
                  <option key={key} value={key}>
                    {tRegions(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {tFilters("eventType")}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "כל הסוגים" : "All Types"}</option>
                {EVENT_TYPES.map((key) => (
                  <option key={key} value={key}>
                    {tTypes(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {tFilters("language")}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "כל השפות" : "All Languages"}</option>
                <option value="he">{locale === "he" ? "עברית" : "Hebrew"}</option>
                <option value="en">{locale === "he" ? "אנגלית" : "English"}</option>
                <option value="other">{locale === "he" ? "אחר" : "Other"}</option>
              </select>
            </div>

            {/* Cost Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {tFilters("cost")}
              </label>
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "הכל" : "All Costs"}</option>
                <option value="Free">{locale === "he" ? "חינם בלבד" : "Free Only"}</option>
                <option value="Paid">{locale === "he" ? "בתשלום בלבד" : "Paid Only"}</option>
              </select>
            </div>

            {/* Access Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {tFilters("access")}
              </label>
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "הכל" : "All Access"}</option>
                <option value="Open">{locale === "he" ? "פתוח לכולם" : "Open to All"}</option>
                <option value="Private">
                  {locale === "he" ? "הרשמה מראש / פרטי" : "Private / Required Registration"}
                </option>
              </select>
            </div>
          </div>

          {(search ||
            selectedRegion !== "all" ||
            selectedType !== "all" ||
            selectedLanguage !== "all" ||
            selectedCost !== "all" ||
            selectedAccess !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedRegion("all");
                setSelectedType("all");
                setSelectedLanguage("all");
                setSelectedCost("all");
                setSelectedAccess("all");
              }}
              className="self-end px-4 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold tracking-wide transition-all cursor-pointer"
            >
              {tFilters("clearAll")}
            </button>
          )}
        </section>

        {/* 3. EVENT GRID / CHRONOLOGICAL CALENDAR FEED */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              <span>{locale === "he" ? "לוח אירועים" : "Event Schedule"}</span>
            </h3>

            {/* View Mode Switcher */}
            <div className="flex bg-zinc-900/40 border border-zinc-800 rounded-xl p-1 w-full sm:w-auto self-end">
              <button
                id="view-mode-list"
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                <span>{t("listView")}</span>
              </button>
              <button
                id="view-mode-week"
                onClick={() => setViewMode("week")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  viewMode === "week"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>{t("weekView")}</span>
              </button>
              <button
                id="view-mode-month"
                onClick={() => setViewMode("month")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  viewMode === "month"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>{t("monthView")}</span>
              </button>
            </div>
          </div>

          {/* Calendar Navigation Bar (only for Week and Month views) */}
          {viewMode !== "list" && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex gap-2">
                  <button
                    id="cal-prev-btn"
                    onClick={handlePrev}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("prev")}
                  </button>
                  <button
                    id="cal-today-btn"
                    onClick={handleToday}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("today")}
                  </button>
                  <button
                    id="cal-next-btn"
                    onClick={handleNext}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-black text-white capitalize text-center sm:text-left rtl:sm:text-right">
                {viewMode === "week" ? getWeekRangeLabel() : getMonthLabel()}
              </h3>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 text-sm gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
              <span>{t("loading")}</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-2">
              <span>{t("noEvents")}</span>
            </div>
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-8">
              {Object.keys(groupedEvents).map((dayStr) => (
                <div key={dayStr} className="flex flex-col gap-4">
                  {/* Date Heading */}
                  <h4 className="text-md sm:text-lg font-bold text-indigo-400 border-b border-zinc-900 pb-2 capitalize">
                    {dayStr}
                  </h4>

                  {/* Events of the day */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedEvents[dayStr].map((event) => (
                      <div
                        key={event.id}
                        className="glass-card rounded-xl p-5 flex flex-col justify-between gap-4 border border-zinc-900"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Badges bar */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold">
                              {tRegions(event.region)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                event.cost === "Free"
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {event.cost === "Free" ? tFilters("free") : tFilters("paid")}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold uppercase">
                              {event.language}
                            </span>
                          </div>

                          <h5 className="text-md sm:text-lg font-black text-white leading-snug">
                            {event.name}
                          </h5>
                          <p className="text-xs text-indigo-400 font-bold">
                            {event.organizerId ? (
                              <a
                                href={`/${locale}/organizers/${event.organizerId}`}
                                className="hover:underline text-indigo-400"
                              >
                                {event.organizerName}
                              </a>
                            ) : (
                              <span>{event.organizerName}</span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-bold">
                            <Clock className="w-3.5 h-3.5 text-zinc-600" />
                            <span>{formatTime(event.time)}</span>
                          </div>

                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="px-3.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            {t("details")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "week" ? (
            <div id="week-view-grid" className="grid grid-cols-1 md:grid-cols-7 gap-4 w-full">
              {getWeekDays(getStartOfWeek(currentDate)).map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const localeStr = locale === "he" ? "he-IL" : "en-US";
                const dayName = day.toLocaleDateString(localeStr, { weekday: "short" });
                const dayNum = day.getDate();

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex flex-col min-h-[250px] rounded-xl border p-3 bg-zinc-900/20 transition-all ${
                      isToday
                        ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                        : "border-zinc-800"
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-indigo-400" : "text-zinc-500"}`}
                      >
                        {dayName}
                      </span>
                      <span
                        className={`text-sm font-black rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday ? "bg-indigo-600 text-white" : "text-zinc-300"
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Day Events list */}
                    <div className="flex flex-col gap-2 flex-grow overflow-y-auto max-h-[200px] pr-1">
                      {dayEvents.length === 0 ? (
                        <div className="text-[11px] text-zinc-500 italic mt-2 text-center">
                          {locale === "he" ? "אין אירועים" : "No events"}
                        </div>
                      ) : (
                        dayEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="group flex flex-col text-left rtl:text-right p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500 hover:bg-zinc-800 transition-all cursor-pointer w-full"
                          >
                            <span className="text-[10px] text-indigo-400 font-bold">
                              {formatTime(event.time)}
                            </span>
                            <span className="text-xs font-black text-white line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors mt-0.5">
                              {event.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 mt-1 uppercase font-semibold">
                              {tRegions(event.region)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
              {/* Month View Grid */}
              <div
                id="month-view-grid"
                className="grid grid-cols-7 gap-1 md:gap-2 w-full bg-zinc-900/10 border border-zinc-800/80 rounded-2xl p-2 md:p-4"
              >
                {/* Day of week headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                  const label =
                    locale === "he" ? ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"][idx] : dayName;
                  return (
                    <div
                      key={dayName}
                      className="text-center text-xs font-bold text-zinc-500 py-2 uppercase border-b border-zinc-800"
                    >
                      {label}
                    </div>
                  );
                })}

                {/* Grid cells */}
                {getMonthDaysGrid(currentDate).map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isSelected = selectedCalendarDay && isSameDay(day, selectedCalendarDay);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`flex flex-col justify-between p-1 md:p-2.5 rounded-xl transition-all cursor-pointer min-h-[60px] md:min-h-[120px] ${
                        isCurrentMonth ? "bg-zinc-900/30" : "bg-zinc-950/10 text-zinc-700"
                      } ${
                        isToday
                          ? "border border-indigo-500/80 shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                          : isSelected
                            ? "border border-zinc-500"
                            : "border border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[10px] md:text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday
                              ? "bg-indigo-600 text-white font-black"
                              : isSelected
                                ? "bg-zinc-700 text-zinc-100"
                                : isCurrentMonth
                                  ? "text-zinc-400"
                                  : "text-zinc-500"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {/* Event count badge on desktop */}
                        {dayEvents.length > 0 && (
                          <span className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-indigo-500/10 text-[9px] font-bold text-indigo-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Desktop event links inside cells */}
                      <div className="hidden md:flex flex-col gap-1 mt-2 overflow-y-auto max-h-[70px] pr-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCalendarDay(day);
                              setSelectedEvent(event);
                            }}
                            className="text-left rtl:text-right text-[10px] font-semibold text-indigo-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-1.5 py-0.5 rounded truncate w-full transition-all"
                          >
                            {formatTime(event.time)} {event.name}
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-zinc-500 italic px-1 font-bold">
                            +{dayEvents.length - 3} {locale === "he" ? "עוד" : "more"}
                          </span>
                        )}
                      </div>

                      {/* Mobile indicators (dots) */}
                      {dayEvents.length > 0 && (
                        <div className="flex md:hidden justify-center gap-0.5 mt-auto pb-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <span
                              key={event.id}
                              className={`w-1 h-1 rounded-full ${
                                event.cost === "Free" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="w-1 h-1 rounded-full bg-zinc-500" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Month View Selected Day Events Panel */}
              {selectedCalendarDay && (
                <div className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h4 className="text-sm sm:text-md font-bold text-white flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-400" />
                      <span>
                        {selectedCalendarDay.toLocaleDateString(
                          locale === "he" ? "he-IL" : "en-US",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </h4>
                    <span className="text-xs text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                      {getEventsForDay(selectedCalendarDay).length}{" "}
                      {locale === "he" ? "אירועים" : "events"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getEventsForDay(selectedCalendarDay).length === 0 ? (
                      <p className="text-zinc-500 text-sm italic py-2">
                        {locale === "he"
                          ? "אין אירועים ביום זה. נסו לבדוק תאריכים אחרים או לשנות את הסינונים!"
                          : "No events on this day. Try checking other dates or clearing filters!"}
                      </p>
                    ) : (
                      getEventsForDay(selectedCalendarDay).map((event) => (
                        <div
                          key={event.id}
                          className="glass-card rounded-xl p-4 flex flex-col justify-between gap-3 border border-zinc-800"
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-1.5 items-center">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-semibold">
                                {tRegions(event.region)}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                  event.cost === "Free"
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                                }`}
                              >
                                {event.cost === "Free" ? tFilters("free") : tFilters("paid")}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/20 text-[9px] text-indigo-400 font-semibold uppercase">
                                {event.language}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-white leading-snug">
                              {event.name}
                            </h5>
                            <p className="text-xs text-zinc-400 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-zinc-900 pt-2 mt-1">
                            <span className="text-[10px] text-zinc-500 font-semibold">
                              {formatTime(event.time)}
                            </span>
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              {t("details")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 4. DETAIL MODAL DIALOG */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase">
                    {tRegions(selectedEvent.region)}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {selectedEvent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-zinc-400 border-y border-zinc-800 py-3">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  {formatDate(selectedEvent.time)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {formatTime(selectedEvent.time)}
                  {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                </span>
                <span className="flex items-center gap-1.5">
                  {selectedEvent.access === "Open" ? (
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                  {selectedEvent.access === "Open" ? tFilters("open") : tFilters("private")}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                  {selectedEvent.cost === "Free" ? tFilters("free") : tFilters("paid")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  {selectedEvent.language.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs text-zinc-500 font-extrabold uppercase">
                  {locale === "he" ? "תיאור" : "Description"}
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4 mt-2">
                <span className="text-xs text-zinc-500 font-extrabold uppercase">
                  {locale === "he" ? "פרטי הגעה ומארח" : "Venue & Host"}
                </span>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-zinc-200 font-semibold">
                    {locale === "he" ? "מיקום:" : "Location:"}{" "}
                    <span className="text-zinc-400 font-normal">{selectedEvent.location}</span>
                  </span>
                  {selectedEvent.mapLink && (
                    <a
                      href={selectedEvent.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1 text-xs mt-0.5 w-fit"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{locale === "he" ? "צפה בגוגל מפות" : "View on Google Maps"}</span>
                    </a>
                  )}
                  <span className="text-zinc-200 font-semibold mt-2">
                    {locale === "he" ? "מארגן:" : "Organizer:"}{" "}
                    <span className="text-indigo-400 font-normal">
                      {selectedEvent.organizerId ? (
                        <a
                          href={`/${locale}/organizers/${selectedEvent.organizerId}`}
                          className="hover:underline"
                        >
                          {selectedEvent.organizerName}
                        </a>
                      ) : (
                        selectedEvent.organizerName
                      )}
                    </span>
                  </span>
                </div>
              </div>

              {selectedEvent.links && selectedEvent.links.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4 mt-2">
                  <span className="text-xs text-zinc-500 font-extrabold uppercase">
                    {locale === "he" ? "קישורים לאירוע" : "Event Links"}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.links.map((lnk, idx) => (
                      <a
                        key={idx}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-sm font-semibold transition-all hover:text-white"
                      >
                        {getLinkIcon(lnk.type)}
                        <span>
                          {lnk.label ||
                            tLinks(
                              lnk.type as
                                | "Website"
                                | "Facebook"
                                | "Facebook event"
                                | "WhatsApp group"
                                | "Instagram"
                                | "Other"
                            ) ||
                            lnk.type}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-900/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500 font-semibold">
        <p className="max-w-7xl mx-auto px-4">{t("footer")}</p>
      </footer>
    </div>
  );
}
