import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAppData } from "@/lib/AppDataContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Store,
  Users,
  Calendar as CalendarIcon,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

export default function CommunityFeed() {
  const isMobile = useIsMobile();
  const { user, getOwnerMessages, getCommunityPosts, getCommunityEvents, addCommunityPost, addOwnerMessage, addCommunityEvent } = useAppData();
  const [postOpen, setPostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [ownerTitle, setOwnerTitle] = useState("");
  const [ownerContent, setOwnerContent] = useState("");
  const [ownerVenue, setOwnerVenue] = useState("");
  const [eventOpen, setEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const ownerMessages = getOwnerMessages();
  const communityPosts = getCommunityPosts();
  const ownerMessagesToShow = isMobile ? ownerMessages.slice(0, 4) : ownerMessages;
  const communityPostsToShow = isMobile ? communityPosts.slice(0, 4) : communityPosts;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allFutureEvents = getCommunityEvents().filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  const futureEvents = allFutureEvents.slice(-6);

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!postContent.trim() || !user) return;
    addCommunityPost({ content: postContent.trim() });
    setPostContent("");
    setPostOpen(false);
  };

  const handleAddOwnerMessage = (e) => {
    e.preventDefault();
    if (!ownerTitle.trim() || !user) return;
    addOwnerMessage({
      title: ownerTitle.trim(),
      content: ownerContent.trim(),
      venue_name: ownerVenue.trim(),
    });
    setOwnerTitle("");
    setOwnerContent("");
    setOwnerVenue("");
    setOwnerOpen(false);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !user) return;
    addCommunityEvent({
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      date: eventDate,
      location: eventLocation.trim(),
    });
    setEventTitle("");
    setEventDate("");
    setEventLocation("");
    setEventDesc("");
    setEventOpen(false);
  };

  const canPost = user?.role;
  const isOwner = user?.role === "proprietario" || user?.role === "admin";

  const eventDates = allFutureEvents.map((e) => new Date(e.date));

  return (
    <div className="min-h-screen relative pt-8 pb-28 lg:pb-12">
      {/* Sfondo a tutta pagina – grigio medio */}
      <div className="fixed inset-0 z-0 bg-stone-700" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl("Community")}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-500 text-sm mb-4"
          >
            ← Torna alla Carta
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mt-6">
            <Users className="w-8 h-8 text-amber-500" />
            <span className="text-amber-400">Bacheca</span>
            <span className="text-amber-400">Community</span>
          </h1>
          <p className="text-stone-400 mt-1">
            Racconti dei proprietari, riflessioni degli utenti e eventi in programma
          </p>
        </div>

        {/* Proprietari – annunci e presentazioni */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-100 flex items-center gap-2">
                <Store className="w-6 h-6 text-amber-500" />
                Dai proprietari
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">
                Presentazioni, eventi e annunci dai locali
              </p>
            </div>
            {isOwner && (
              <Dialog open={ownerOpen} onOpenChange={setOwnerOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Annuncio
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Pubblica un annuncio</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddOwnerMessage} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Titolo</label>
                      <Input
                        value={ownerTitle}
                        onChange={(e) => setOwnerTitle(e.target.value)}
                        placeholder="Es. Serata speciale rum"
                        className="bg-stone-800 border-stone-600 text-stone-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Contenuto</label>
                      <Textarea
                        value={ownerContent}
                        onChange={(e) => setOwnerContent(e.target.value)}
                        placeholder="Descrivi l'annuncio o l'evento..."
                        className="bg-stone-800 border-stone-600 text-stone-100 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Luogo / Località</label>
                      <Input
                        value={ownerVenue}
                        onChange={(e) => setOwnerVenue(e.target.value)}
                        placeholder="Es. Napoli, L'Antiquario"
                        className="bg-stone-800 border-stone-600 text-stone-100"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                      Pubblica
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ownerMessagesToShow.length > 0 ? (
              ownerMessagesToShow.map((msg, i) => (
                <CommunityPostCard key={msg.id} post={msg} type="owner" index={i} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center rounded-2xl bg-stone-900/30 border border-stone-800">
                <Store className="w-12 h-12 text-stone-600 mx-auto mb-2" />
                <p className="text-stone-500">Nessun annuncio dai proprietari</p>
              </div>
            )}
          </div>
        </section>

        {/* Community – post degli utenti */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-100 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-amber-500" />
                Dalla community
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">
                Esperienze, domande e riflessioni degli utenti
              </p>
            </div>
            {canPost && (
              <Dialog open={postOpen} onOpenChange={setPostOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Scrivi
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Scrivi un post</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPost} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Cosa vuoi condividere?</label>
                      <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Esperienze, domande, riflessioni..."
                        className="bg-stone-800 border-stone-600 text-stone-100 min-h-[100px]"
                        required
                      />
                    </div>
                    <p className="text-xs text-stone-500">
                      I post saranno visibili dopo approvazione da parte della redazione.
                    </p>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                      Invia
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {communityPostsToShow.length > 0 ? (
              communityPostsToShow.map((post, i) => (
                <CommunityPostCard key={post.id} post={post} type="user" index={i} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center rounded-2xl bg-stone-900/30 border border-stone-800">
                <MessageSquare className="w-12 h-12 text-stone-600 mx-auto mb-2" />
                <p className="text-stone-500">Nessun post dalla community</p>
                {canPost && (
                  <Button
                    onClick={() => setPostOpen(true)}
                    className="mt-4 bg-amber-500 hover:bg-amber-600 text-stone-950"
                  >
                    Scrivi il primo post
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Calendario eventi */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-100 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-amber-500" />
                Eventi in programma
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">
                Degustazioni, masterclass e serate speciali
              </p>
            </div>
            {isOwner && (
              <Dialog open={eventOpen} onOpenChange={setEventOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Aggiungi evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-stone-900 border-stone-700 text-stone-100 max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nuovo evento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Titolo</label>
                      <Input
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="Es. Degustazione rum"
                        className="bg-stone-800 border-stone-600 text-stone-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Data</label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="bg-stone-800 border-stone-600 text-stone-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Luogo</label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="Es. L'Antiquario, Napoli"
                        className="bg-stone-800 border-stone-600 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-300 mb-2">Descrizione</label>
                      <Textarea
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        placeholder="Descrizione evento..."
                        className="bg-stone-800 border-stone-600 text-stone-100 min-h-[80px]"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950">
                      Crea evento
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-[auto_minmax(220px,1fr)] gap-4 md:gap-8">
            {/* Calendario – box compatto, non si allunga */}
            <div className="rounded-xl border border-stone-700 bg-stone-900/80 backdrop-blur-sm p-3 shadow-inner w-fit self-start mx-auto md:mx-0">
              <Calendar
                mode="single"
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-amber-500" }}
                className="rounded-md border-0"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-1",
                  caption: "flex justify-center pt-0 pb-2 relative items-center",
                  caption_label: "text-sm font-semibold text-stone-100",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-6 w-6 p-0 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-amber-400 transition-colors absolute text-xs",
                  nav_button_previous: "left-0",
                  nav_button_next: "right-0",
                  table: "w-full border-collapse space-y-0",
                  head_row: "flex",
                  head_cell: "text-stone-500 rounded w-7 font-medium text-[0.65rem] uppercase tracking-wider",
                  row: "flex w-full mt-1",
                  cell: "relative p-0 text-center text-xs [&:has([aria-selected])]:[&:has(.day-outside)]:bg-stone-800/50 rounded",
                  day: "h-7 w-7 p-0 text-[0.75rem] font-medium rounded-md text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors aria-selected:opacity-100",
                  day_selected: "bg-amber-500 text-stone-950 hover:bg-amber-500 hover:text-stone-950",
                  day_today: "bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/50",
                  day_outside: "text-stone-600 opacity-60",
                  day_disabled: "text-stone-600 opacity-40",
                  day_hidden: "invisible",
                }}
              />
            </div>

            {/* Eventi – mobile: 2 colonne × 3 righe; desktop: 3 colonne × 2 righe */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 w-full lg:[grid-template-columns:repeat(3,minmax(200px,1fr))]">
              {futureEvents.length > 0 ? (
                futureEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-stone-700 bg-stone-900/50 p-3 md:p-4 hover:border-amber-500/30 transition-colors min-w-0"
                  >
                    <div className="flex gap-2 items-start">
                      <div className="w-8 h-8 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4 h-4 text-amber-500" />
                      </div>
                      <h3 className="font-semibold text-amber-400 text-sm leading-tight line-clamp-2 flex-1 min-w-0">
                        {event.title}
                      </h3>
                    </div>
                    <div className="mt-2">
                      <p className="text-[0.7rem] text-stone-400">
                        {new Date(event.date).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[0.65rem] text-stone-500 mt-0.5 truncate">{event.location}</p>
                      {event.description && (
                        <p className="text-[0.7rem] text-white mt-2 line-clamp-2 leading-snug">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-6 text-center rounded-xl bg-stone-900/30 border border-stone-800">
                  <CalendarIcon className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="text-stone-500 text-sm">Nessun evento in programma</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA registrazione se non loggato */}
        {!user?.role && (
          <section className="py-8 text-center">
            <p className="text-stone-400 mb-4">
              Registrati per scrivere post e partecipare alla community
            </p>
            <Link to={createPageUrl("Community")}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
                Registrati
              </Button>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
