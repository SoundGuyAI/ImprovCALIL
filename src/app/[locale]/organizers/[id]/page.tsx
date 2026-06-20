"use client";

import { useEffect, useState, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getOrganizerDetails, FirestoreOrganizer, FirestoreEvent } from "@/lib/db";
import Header from "@/components/Header";
import { Link } from "@/i18n/routing";
import {
  Building,
  MapPin,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Facebook,
  MessageCircle,
  Instagram,
  Link as LinkIcon,
  GraduationCap,
  Users,
  Theater,
  Sparkles,
} from "lucide-react";

export default function OrganizerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tCommon = useTranslations("Common");
  const tRegions = useTranslations("Regions");
  const tOrgTypes = useTranslations("OrganizerTypes");
  const tLinks = useTranslations("LinkTypes");
  const tOrganizers = useTranslations("Organizers");
  const locale = useLocale() as "en" | "he";

  const [organizer, setOrganizer] = useState<FirestoreOrganizer | null>(null);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { organizer: orgData, events: evtData } = await getOrganizerDetails(
          resolvedParams.id,
          locale
        );
        setOrganizer(orgData);
        setEvents(evtData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id, locale]);

  const getOrgTypeIcon = (type: string) => {
    switch (type) {
      case "School":
        return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      case "Group":
        return <Users className="w-6 h-6 text-indigo-400" />;
      case "Theater":
        return <Theater className="w-6 h-6 text-indigo-400" />;
      default:
        return <Building className="w-6 h-6 text-indigo-400" />;
    }
  };

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
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Asia/Jerusalem",
    });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString(locale === "he" ? "he-IL" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jerusalem",
    });
  };

  // Recurring events have no definitive end date — always show them as upcoming
  // regardless of their original start date.
  const upcomingEvents = events.filter(
    (e) => !e.hidden && (e.recurrence !== "one-time" || e.time >= Date.now())
  );
  const pastEvents = events.filter(
    (e) => !e.hidden && e.recurrence === "one-time" && e.time < Date.now()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-zinc-400 text-sm gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
          <span>{tCommon("loading")}</span>
        </div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Header />
        <div className="flex-grow max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400">{tOrganizers("notFound")}</p>
          <Link
            href="/organizers"
            className="px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold transition-all"
          >
            {tOrganizers("backToDirectoryLong")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* BACK LINK */}
        <Link
          href="/organizers"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 font-bold text-xs uppercase w-fit cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{tOrganizers("backToDirectory")}</span>
        </Link>

        {/* ORGANIZER HEADER PANEL */}
        <section className="relative w-full rounded-2xl border border-zinc-850 bg-zinc-900/50 p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
              {getOrgTypeIcon(organizer.type)}
            </div>

            <div className="flex flex-col gap-1 text-left rtl:text-right">
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">
                {tRegions(organizer.region)}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {organizer.name}
              </h1>
              <span className="text-xs text-indigo-500 font-bold">
                {tOrgTypes(organizer.type as "Group" | "School" | "Theater" | "Other")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
            <span className="text-zinc-500 uppercase">{tOrganizers("languagesLabel")}</span>
            {organizer.languages.map((lang) => (
              <span
                key={lang}
                className="text-zinc-300 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 uppercase"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* DESCRIPTION & OUTBOUND LINKS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Description */}
          <section className="lg:col-span-2 flex flex-col gap-4 glass-card rounded-2xl p-6">
            <h3 className="text-md font-bold text-indigo-400 uppercase tracking-wide border-b border-zinc-900 pb-2">
              {tOrganizers("about")}
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {organizer.description}
            </p>
          </section>

          {/* Outbound Social / Website Links */}
          <section className="flex flex-col gap-4 glass-card rounded-2xl p-6">
            <h3 className="text-md font-bold text-indigo-400 uppercase tracking-wide border-b border-zinc-900 pb-2">
              {tOrganizers("contactLinks")}
            </h3>
            {organizer.links && organizer.links.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {organizer.links.map((lnk, idx) => (
                  <a
                    key={idx}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900 hover:text-white transition-all text-sm font-semibold group"
                  >
                    <div className="flex items-center gap-3">
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
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-2">{tOrganizers("noLinks")}</p>
            )}
          </section>
        </div>

        {/* EVENTS LIST SCHEDULE */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">{tOrganizers("eventSchedule")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div className="flex flex-col gap-4">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4 h-4" />
                <span>{tOrganizers("upcomingEvents")}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold">
                  {upcomingEvents.length}
                </span>
              </h3>

              {upcomingEvents.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-zinc-500 text-xs italic">
                  {tOrganizers("noUpcoming")}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="glass-card rounded-xl p-4 flex justify-between items-center border border-zinc-950"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                          {formatDate(event.time)}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-400 font-bold">
                          {formatTime(event.time)}
                        </span>
                        {event.links && event.links.length > 0 ? (
                          <a
                            href={event.links[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <div className="w-8"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            <div className="flex flex-col gap-4">
              <h3 className="text-md font-bold text-zinc-500 flex items-center gap-1.5 uppercase">
                <Clock className="w-4 h-4" />
                <span>{tOrganizers("pastEvents")}</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-500 font-bold">
                  {pastEvents.length}
                </span>
              </h3>

              {pastEvents.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-zinc-500 text-xs italic">
                  {tOrganizers("noPast")}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="glass-card rounded-xl p-4 flex justify-between items-center border border-zinc-950 opacity-60"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                          {formatDate(event.time)}
                        </span>
                        <h4 className="text-sm font-black text-white leading-snug">{event.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <span className="text-xs text-zinc-500 font-bold">
                        {formatTime(event.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
