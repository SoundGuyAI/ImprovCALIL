"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getOrganizers, FirestoreOrganizer } from "@/lib/db";
import Header from "@/components/Header";
import { Link } from "@/i18n/routing";
import { Building, ChevronRight, Info, GraduationCap, Users, Theater } from "lucide-react";

const REGIONS = ["Tel-Aviv", "Jerusalem", "Beer-Sheva", "Haifa", "Hasharon", "Other"];
const ORGANIZER_TYPES = ["Group", "School", "Theater", "Other"];

export default function OrganizersDirectory() {
  const tCommon = useTranslations("Common");
  const tFilters = useTranslations("Filters");
  const tRegions = useTranslations("Regions");
  const tOrgTypes = useTranslations("OrganizerTypes");
  const locale = useLocale() as "en" | "he";

  const [organizers, setOrganizers] = useState<FirestoreOrganizer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrganizers({ locale });
        setOrganizers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale]);

  const filteredOrganizers = organizers.filter((org) => {
    if (org.hidden) return false;

    // Search Query
    if (
      search &&
      !org.name.toLowerCase().includes(search.toLowerCase()) &&
      !org.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    // Region
    if (selectedRegion !== "all" && org.region !== selectedRegion) return false;
    // Organizer Type
    if (selectedType !== "all" && org.type !== selectedType) return false;

    return true;
  });

  const getOrgTypeIcon = (type: string) => {
    switch (type) {
      case "School":
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case "Group":
        return <Users className="w-5 h-5 text-indigo-400" />;
      case "Theater":
        return <Theater className="w-5 h-5 text-indigo-400" />;
      default:
        return <Building className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {locale === "he" ? "אינדקס מארגני אימפרוב" : "Improv Organizers Directory"}
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            {locale === "he"
              ? "גלו קבוצות הופעה, בתי ספר וסדנאות, ותיאטראות המפעילים אירועי אימפרוביזציה בישראל."
              : "Browse active improv troupes, training centers, and theater companies producing improv events in Israel."}
          </p>
        </div>

        {/* SEARCH & FILTERS PANEL */}
        <section className="w-full glass-card rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
            <h3 className="text-md font-bold text-white flex items-center gap-2 w-full md:w-auto">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>{locale === "he" ? "סינון מארגנים" : "Filter Directory"}</span>
            </h3>

            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === "he" ? "חימוש מארגנים..." : "Search organizers..."}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Organizer Type Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">
                {locale === "he" ? "סוג מארגן" : "Organizer Type"}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === "he" ? "כל הסוגים" : "All Types"}</option>
                {ORGANIZER_TYPES.map((key) => (
                  <option key={key} value={key}>
                    {tOrgTypes(key)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* DIRECTORY GRID */}
        <section className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 text-sm gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
              <span>{tCommon("loading")}</span>
            </div>
          ) : filteredOrganizers.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-2">
              <span>{tCommon("noOrganizers")}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizers.map((org) => (
                <Link
                  key={org.id}
                  href={`/organizers/${org.id}`}
                  className="glass-card rounded-xl p-6 flex flex-col justify-between gap-6 border border-zinc-900 group cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                        {getOrgTypeIcon(org.type)}
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase">
                        {tRegions(org.region)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">
                        {org.name}
                      </h3>
                      <span className="text-xs text-indigo-500 font-semibold">
                        {tOrgTypes(org.type as "Group" | "School" | "Theater" | "Other")}
                      </span>
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-1">
                        {org.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">
                      {locale === "he"
                        ? `${org.languages.length} שפות`
                        : `${org.languages.length} Languages`}
                    </span>
                    <span className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      <span>{tCommon("details")}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-900/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500 font-semibold">
        <p className="max-w-7xl mx-auto px-4">{tCommon("footer")}</p>
      </footer>
    </div>
  );
}
