'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getEvents, FirestoreEvent } from '@/lib/db';
import Header from '@/components/Header';
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
  Info
} from 'lucide-react';

const REGIONS = ['Tel-Aviv', 'Jerusalem', 'Beer-Sheva', 'Haifa', 'Hasharon', 'Other'];
const EVENT_TYPES = ['Show', 'Jam', 'Workshop', 'Festival', 'Other'];

export default function Home() {
  const t = useTranslations('Common');
  const tFilters = useTranslations('Filters');
  const tRegions = useTranslations('Regions');
  const tTypes = useTranslations('EventTypes');
  const tLinks = useTranslations('LinkTypes');
  const locale = useLocale();

  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCost, setSelectedCost] = useState('all');
  const [selectedAccess, setSelectedAccess] = useState('all');

  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<FirestoreEvent | null>(null);

  // Hero Featured Carousel State
  const [featuredIndex, setFeaturedIndex] = useState(0);

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

  const featuredEvents = events.filter(e => e.featured && !e.hidden);

  const nextFeatured = () => {
    if (featuredEvents.length === 0) return;
    setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevFeatured = () => {
    if (featuredEvents.length === 0) return;
    setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  // Filter Logic
  const filteredEvents = events.filter(e => {
    if (e.hidden) return false;
    
    // Search Query
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.organizerName.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Region
    if (selectedRegion !== 'all' && e.region !== selectedRegion) return false;
    // Event Type
    if (selectedType !== 'all') {
      const typeLower = selectedType.toLowerCase();
      const rec = e.recurrence.toLowerCase();
      // Jam, Show, Workshop, Festival
      if (typeLower === 'show' && !e.name.toLowerCase().includes('show') && !e.name.toLowerCase().includes('מופע') && !e.description.toLowerCase().includes('show')) return false;
      if (typeLower === 'jam' && !e.name.toLowerCase().includes('jam') && !e.name.toLowerCase().includes('ג\'אם') && !e.description.toLowerCase().includes('jam')) return false;
      if (typeLower === 'workshop' && !e.name.toLowerCase().includes('workshop') && !e.name.toLowerCase().includes('סדנ') && !e.description.toLowerCase().includes('workshop')) return false;
      if (typeLower === 'festival' && !e.name.toLowerCase().includes('festival') && !e.name.toLowerCase().includes('פסטיבל') && !e.description.toLowerCase().includes('festival')) return false;
    }
    // Language
    if (selectedLanguage !== 'all' && e.language !== selectedLanguage) return false;
    // Cost
    if (selectedCost !== 'all' && e.cost !== selectedCost) return false;
    // Access
    if (selectedAccess !== 'all' && e.access !== selectedAccess) return false;

    return true;
  });

  const getLinkIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'facebook':
      case 'facebook event':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'whatsapp group':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group events by day for weekly view
  const groupedEvents: { [key: string]: FirestoreEvent[] } = {};
  filteredEvents.forEach(e => {
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
              <span>{t('featured')}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3 text-center md:text-left rtl:md:text-right w-full mt-4 md:mt-0">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {featuredEvents[featuredIndex].name}
              </h2>
              <p className="text-sm md:text-base text-zinc-300 max-w-2xl line-clamp-2">
                {featuredEvents[featuredIndex].description}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-indigo-400" />{formatDate(featuredEvents[featuredIndex].time)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" />{formatTime(featuredEvents[featuredIndex].time)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" />{featuredEvents[featuredIndex].location}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto items-center justify-center">
              <button 
                onClick={() => setSelectedEvent(featuredEvents[featuredIndex])}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm cursor-pointer"
              >
                {t('details')}
              </button>

              {featuredEvents.length > 1 && (
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button onClick={prevFeatured} className="p-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></button>
                  <span className="text-xs text-zinc-500 font-bold">{featuredIndex + 1} / {featuredEvents.length}</span>
                  <button onClick={nextFeatured} className="p-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"><ChevronRight className="w-4 h-4 rtl:rotate-180" /></button>
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
              <span>{tFilters('title')}</span>
            </h3>

            {/* Main search input */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tFilters('search')}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Region Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">{tFilters('region')}</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === 'he' ? 'כל האזורים' : 'All Regions'}</option>
                {REGIONS.map((key) => (
                  <option key={key} value={key}>{tRegions(key)}</option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">{tFilters('eventType')}</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === 'he' ? 'כל הסוגים' : 'All Types'}</option>
                {EVENT_TYPES.map((key) => (
                  <option key={key} value={key}>{tTypes(key)}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">{tFilters('language')}</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === 'he' ? 'כל השפות' : 'All Languages'}</option>
                <option value="he">{locale === 'he' ? 'עברית' : 'Hebrew'}</option>
                <option value="en">{locale === 'he' ? 'אנגלית' : 'English'}</option>
                <option value="other">{locale === 'he' ? 'אחר' : 'Other'}</option>
              </select>
            </div>

            {/* Cost Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">{tFilters('cost')}</label>
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === 'he' ? 'הכל' : 'All Costs'}</option>
                <option value="Free">{locale === 'he' ? 'חינם בלבד' : 'Free Only'}</option>
                <option value="Paid">{locale === 'he' ? 'בתשלום בלבד' : 'Paid Only'}</option>
              </select>
            </div>

            {/* Access Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-500 font-bold uppercase">{tFilters('access')}</label>
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{locale === 'he' ? 'הכל' : 'All Access'}</option>
                <option value="Open">{locale === 'he' ? 'פתוח לכולם' : 'Open to All'}</option>
                <option value="Private">{locale === 'he' ? 'הרשמה מראש / פרטי' : 'Private / Required Registration'}</option>
              </select>
            </div>
          </div>

          {(search || selectedRegion !== 'all' || selectedType !== 'all' || selectedLanguage !== 'all' || selectedCost !== 'all' || selectedAccess !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedRegion('all');
                setSelectedType('all');
                setSelectedLanguage('all');
                setSelectedCost('all');
                setSelectedAccess('all');
              }}
              className="self-end px-4 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold tracking-wide transition-all cursor-pointer"
            >
              {tFilters('clearAll')}
            </button>
          )}
        </section>

        {/* 3. EVENT GRID / CHRONOLOGICAL CALENDAR FEED */}
        <section className="w-full flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 text-sm gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
              <span>{t('loading')}</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-2">
              <span>{t('noEvents')}</span>
            </div>
          ) : (
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
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold">{tRegions(event.region)}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              event.cost === 'Free' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                            }`}>{event.cost === 'Free' ? tFilters('free') : tFilters('paid')}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold uppercase">{event.language}</span>
                          </div>

                          <h5 className="text-md sm:text-lg font-black text-white leading-snug">{event.name}</h5>
                          <p className="text-xs text-indigo-400 font-bold">
                            {event.organizerId ? (
                              <a href={`/${locale}/organizers/${event.organizerId}`} className="hover:underline text-indigo-400">{event.organizerName}</a>
                            ) : (
                              <span>{event.organizerName}</span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{event.description}</p>
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
                            {t('details')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                  <span className="text-[10px] text-indigo-400 font-black tracking-wider uppercase">{tRegions(selectedEvent.region)}</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{selectedEvent.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-zinc-400 border-y border-zinc-800 py-3">
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-indigo-400" />{formatDate(selectedEvent.time)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" />{formatTime(selectedEvent.time)}{selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}</span>
                <span className="flex items-center gap-1.5">
                  {selectedEvent.access === 'Open' ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                  {selectedEvent.access === 'Open' ? tFilters('open') : tFilters('private')}
                </span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-indigo-400" />{selectedEvent.cost === 'Free' ? tFilters('free') : tFilters('paid')}</span>
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-indigo-400" />{selectedEvent.language.toUpperCase()}</span>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-xs text-zinc-500 font-extrabold uppercase">{locale === 'he' ? 'תיאור' : 'Description'}</h4>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4 mt-2">
                <span className="text-xs text-zinc-500 font-extrabold uppercase">{locale === 'he' ? 'פרטי הגעה ומארח' : 'Venue & Host'}</span>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-zinc-200 font-semibold">{locale === 'he' ? 'מיקום:' : 'Location:'} <span className="text-zinc-400 font-normal">{selectedEvent.location}</span></span>
                  {selectedEvent.mapLink && (
                    <a href={selectedEvent.mapLink} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 text-xs mt-0.5 w-fit">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{locale === 'he' ? 'צפה בגוגל מפות' : 'View on Google Maps'}</span>
                    </a>
                  )}
                  <span className="text-zinc-200 font-semibold mt-2">{locale === 'he' ? 'מארגן:' : 'Organizer:'} <span className="text-indigo-400 font-normal">
                    {selectedEvent.organizerId ? (
                      <a href={`/${locale}/organizers/${selectedEvent.organizerId}`} className="hover:underline">{selectedEvent.organizerName}</a>
                    ) : (
                      selectedEvent.organizerName
                    )}
                  </span></span>
                </div>
              </div>

              {selectedEvent.links && selectedEvent.links.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4 mt-2">
                  <span className="text-xs text-zinc-500 font-extrabold uppercase">{locale === 'he' ? 'קישורים לאירוע' : 'Event Links'}</span>
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
                        <span>{lnk.label || tLinks(lnk.type as any) || lnk.type}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
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
        <p className="max-w-7xl mx-auto px-4">{t('footer')}</p>
      </footer>
    </div>
  );
}
