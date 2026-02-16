import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { venuesData as initialVenues } from "@/data/venues";
import { reviewsData as initialReviews } from "@/data/reviews";
import { articlesData as initialArticles } from "@/data/articles";
import { drinksData as initialDrinks } from "@/data/drinks";
import { initialOwnerMessages, initialCommunityPosts, initialCommunityEvents } from "@/data/community";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getPendingRegistrations, updateAppUserStatus, insertAppUser, updateAppUser } from "@/lib/supabaseUsers";
import { useVenuesRealtime } from "@/hooks/useSupabaseRealtime";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [venues, setVenues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [articles, setArticles] = useState(initialArticles);
  const [drinks, setDrinks] = useState(initialDrinks);
  const [user, setUser] = useState(null);
  const [ownerMessages, setOwnerMessages] = useState(initialOwnerMessages || []);
  const [communityEvents, setCommunityEvents] = useState(initialCommunityEvents || []);
  const [communityPosts, setCommunityPosts] = useState(initialCommunityPosts || []);
  const [bartenders, setBartenders] = useState([]);
  const [cloudVenues, setCloudVenues] = useState([]);

  const mapAppUserToBartender = useCallback((row) => ({
    id: String(row.id),
    name: row.name || "",
    surname: row.surname || "",
    photo: row.photo || "",
    venue_id: row.venue_id ? String(row.venue_id) : "",
    venue_name: row.custom_venue_name || "",
    city: row.city || "",
    specialization: row.specialization || "",
    years_experience: row.years_experience || "",
    philosophy: row.philosophy || "",
    distillati_preferiti: row.distillati_preferiti || "",
    approccio_degustazione: row.approccio_degustazione || "",
    consiglio_inizio: row.consiglio_inizio || "",
    signature_drinks: row.signature_drinks || "",
    percorso_esperienze: row.percorso_esperienze || "",
    bio: row.bio || "",
    motivation: row.motivation || "",
    consent_linee_editoriali: !!row.consent_linee_editoriali,
    status: row.status || "pending",
    created_at: row.created_at,
    interview_links: Array.isArray(row.interview_links) ? row.interview_links : [],
    qa_links: Array.isArray(row.qa_links) ? row.qa_links : [],
  }), []);

  const mapReviewCloudToLocal = useCallback((row) => ({
    id: String(row.id),
    venue_id: row.venue_id,
    author_name: row.author_name || "",
    author_id: row.author_id,
    title: row.title || "",
    content: row.content || "",
    visit_date: row.visit_date,
    drink_quality: row.drink_quality ?? 0,
    staff_competence: row.staff_competence ?? 0,
    atmosphere: row.atmosphere ?? 0,
    value_for_money: row.value_for_money ?? 0,
    overall_rating: row.overall_rating ?? 0,
    drinks_ordered: Array.isArray(row.drinks_ordered) ? row.drinks_ordered : [],
    photos: Array.isArray(row.photos) ? row.photos : [],
    videos: Array.isArray(row.videos) ? row.videos : [],
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    improvements: Array.isArray(row.improvements) ? row.improvements : [],
    would_recommend: row.would_recommend ?? true,
    created_date: row.created_at,
    status: row.status || "approved",
  }), []);

  // Fetch iniziale: venues, reviews, bartenders da Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setVenues([...initialVenues]);
      setReviews([...initialReviews]);
      return;
    }
    supabase.from("venues_cloud").select("*").eq("status", "approved").then(({ data }) => {
      if (data && data.length > 0) {
        setVenues(data.map((row) => ({
          ...row,
          id: row.external_id || String(row.id),
          supabase_id: String(row.id),
        })));
      } else {
        setVenues([...initialVenues]);
      }
    }).catch(() => setVenues([...initialVenues]));

    supabase.from("reviews_cloud").select("*").eq("status", "approved").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data && Array.isArray(data)) {
        setReviews(data.map(mapReviewCloudToLocal));
      } else {
        setReviews([...initialReviews]);
      }
    }).catch(() => setReviews([...initialReviews]));

    supabase.from("app_users").select("*").eq("role", "bartender").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error && data && Array.isArray(data)) {
        setBartenders(data.map(mapAppUserToBartender));
      }
    }).catch(() => {});
  }, [mapAppUserToBartender, mapReviewCloudToLocal]);

  // Real-time: aggiornamenti live da Supabase
  const onInsert = useCallback((row) => {
    if (row?.status === "approved") {
      const mapped = { ...row, id: row.external_id || String(row.id), supabase_id: String(row.id) };
      setVenues((prev) => {
        const exists = prev.some((v) => v.id === mapped.id || v.supabase_id === row.id);
        if (exists) return prev.map((v) => (v.id === mapped.id || v.supabase_id === row.id ? mapped : v));
        return [...prev, mapped];
      });
    }
  }, []);
  const onUpdate = useCallback((row) => {
    if (row?.status === "approved") {
      const mapped = { ...row, id: row.external_id || String(row.id), supabase_id: String(row.id) };
      setVenues((prev) => prev.map((v) => (v.id === mapped.id || v.supabase_id === row.id ? mapped : v)));
    } else {
      setVenues((prev) => prev.filter((v) => v.supabase_id !== row?.id));
    }
  }, []);
  const onDelete = useCallback((old) => {
    setVenues((prev) => prev.filter((v) => v.supabase_id !== old?.id && v.id !== (old?.external_id || old?.id)));
  }, []);
  useVenuesRealtime(onInsert, onUpdate, onDelete);


  const api = useMemo(() => {
    const enrichVenueWithRealCount = (v) => {
      const venueReviews = reviews.filter((r) => r.venue_id === v.id);
      const count = venueReviews.length;
      if (count === 0) {
        return { ...v, review_count: 0, overall_rating: null };
      }
      const avg = (key) => venueReviews.reduce((s, r) => s + (r[key] || 0), 0) / venueReviews.length;
      return {
        ...v,
        review_count: count,
        overall_rating: Math.round(avg("overall_rating") * 10) / 10,
        avg_drink_quality: Math.round(avg("drink_quality") * 10) / 10,
        avg_staff_competence: Math.round(avg("staff_competence") * 10) / 10,
        avg_atmosphere: Math.round(avg("atmosphere") * 10) / 10,
        avg_value: Math.round(avg("value_for_money") * 10) / 10,
      };
    };

    const baseVenues = [...venues.filter((v) => !v._cloudPending && v.verified !== false), ...cloudVenues];
    return {
      venues,
      reviews,
      articles,
      drinks,
      user,
      setUser,

      getVenues: () => baseVenues.map(enrichVenueWithRealCount),
      getPendingLocalVenues: () => venues.filter((v) => !v.verified && !v._cloudPending),
      getVenueById: (id) => {
        const v = venues.find((x) => x.id === id) || cloudVenues.find((x) => x.id === id);
        return v ? enrichVenueWithRealCount(v) : null;
      },
      addVenue: async (data) => {
        const id = data.id || generateId();
        const venue = { ...data, id, review_count: 0, overall_rating: null, verified: data.verified ?? false };
        if (isSupabaseConfigured()) {
          const row = {
            name: venue.name,
            slug: venue.slug || (venue.name || "").toLowerCase().replace(/\s+/g, "-"),
            description: venue.description || "",
            city: venue.city || "",
            country: venue.country || "Italia",
            address: venue.address || "",
            latitude: venue.latitude ?? null,
            longitude: venue.longitude ?? null,
            cover_image: venue.cover_image || "",
            video_url: venue.video_url || null,
            category: venue.category || "cocktail_bar",
            price_range: venue.price_range || "€€",
            phone: venue.phone || "",
            website: venue.website || "",
            instagram: venue.instagram || "",
            opening_hours: venue.opening_hours || "",
            status: "pending",
          };
          const { data: inserted, error } = await supabase.from("venues_cloud").insert(row).select().single();
          if (error) {
            console.error("Supabase insert venue:", error);
            throw new Error(error.message || "Errore salvataggio locale su Supabase");
          }
          const cloudVenue = { ...venue, id: String(inserted.id), _cloudPending: true };
          setVenues((prev) => [...prev, cloudVenue]);
          return { ...cloudVenue, pending: true };
        }
        if (typeof fetch === "function") {
          try {
            const base = typeof window !== "undefined" ? window.location.origin : "";
            const res = await fetch(`${base}/api/add-venue`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: venue.name,
                slug: venue.slug || (venue.name || "").toLowerCase().replace(/\s+/g, "-"),
                description: venue.description || "",
                city: venue.city || "",
                country: venue.country || "Italia",
                address: venue.address || "",
                latitude: venue.latitude ?? null,
                longitude: venue.longitude ?? null,
                cover_image: venue.cover_image || "",
                video_url: venue.video_url || null,
                status: "pending",
                category: venue.category || "cocktail_bar",
                price_range: venue.price_range || "€€",
                phone: venue.phone || "",
                website: venue.website || "",
                instagram: venue.instagram || "",
                opening_hours: venue.opening_hours || "",
              }),
            });
            const json = await res.json();
            if (json.ok && json.id) {
              return { ...venue, id: json.id, pending: true };
            }
          } catch (_) {}
        }
        setVenues((prev) => [...prev, venue]);
        return venue;
      },
      updateVenue: (id, data) => {
        setVenues((prev) =>
          prev.map((v) => (v.id === id ? { ...v, ...data } : v))
        );
        const isCloud = cloudVenues.some((v) => v.id === id) || venues.some((v) => v.id === id && v._cloudPending);
        if (isCloud && isSupabaseConfigured()) {
          const row = {
            name: data.name,
            description: data.description,
            city: data.city,
            country: data.country,
            address: data.address,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            cover_image: data.cover_image,
            category: data.categories?.[0] ?? data.category ?? "cocktail_bar",
            price_range: data.price_range,
            phone: data.phone,
            website: data.website,
            instagram: data.instagram,
            opening_hours: data.opening_hours,
          };
          supabase.from("venues_cloud").update(row).eq("id", id).then(() => {}).catch(() => {});
        }
        return { id, ...data };
      },
      updateVenueCloud: async (id, data) => {
        if (!isSupabaseConfigured()) return { id, ...data };
        const row = {
          name: data.name,
          description: data.description,
          city: data.city,
          country: data.country,
          address: data.address,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          cover_image: data.cover_image,
            category: data.categories?.[0] ?? data.category ?? "cocktail_bar",
            price_range: data.price_range,
          phone: data.phone,
          website: data.website,
          instagram: data.instagram,
          opening_hours: data.opening_hours,
        };
        await supabase.from("venues_cloud").update(row).eq("id", id);
        return { id, ...data };
      },
      deleteVenue: (id) => {
        setVenues((prev) => prev.filter((v) => v.id !== id));
        setReviews((r) => r.filter((rev) => rev.venue_id !== id));
      },

      getReviews: () => reviews,
      getReviewById: (id) => reviews.find((r) => r.id === id),
      getReviewsByVenueId: (venueId) =>
        reviews.filter((r) => r.venue_id === venueId).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
      addReview: async (data) => {
        if (!isSupabaseConfigured()) throw new Error("Supabase non configurato");
        const row = {
          venue_id: String(data.venue_id),
          author_name: data.author_name || user?.name || "Utente",
          author_id: user?.id || null,
          title: data.title || null,
          content: data.content || null,
          visit_date: data.visit_date || null,
          drink_quality: data.drink_quality ?? null,
          staff_competence: data.staff_competence ?? null,
          atmosphere: data.atmosphere ?? null,
          value_for_money: data.value_for_money ?? null,
          overall_rating: data.overall_rating ?? null,
          drinks_ordered: Array.isArray(data.drinks_ordered) ? data.drinks_ordered : [],
          photos: Array.isArray(data.photos) ? data.photos : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          improvements: Array.isArray(data.improvements) ? data.improvements : [],
          would_recommend: data.would_recommend ?? true,
          status: "approved",
        };
        const { data: inserted, error } = await supabase.from("reviews_cloud").insert(row).select().single();
        if (error) throw error;
        const review = mapReviewCloudToLocal(inserted);
        setReviews((prev) => [review, ...prev]);
        return review;
      },
      updateReview: async (id, data) => {
        if (!isSupabaseConfigured()) throw new Error("Supabase non configurato");
        const row = {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.content !== undefined && { content: data.content }),
          ...(data.visit_date !== undefined && { visit_date: data.visit_date }),
          ...(data.drink_quality !== undefined && { drink_quality: data.drink_quality }),
          ...(data.staff_competence !== undefined && { staff_competence: data.staff_competence }),
          ...(data.atmosphere !== undefined && { atmosphere: data.atmosphere }),
          ...(data.value_for_money !== undefined && { value_for_money: data.value_for_money }),
          ...(data.overall_rating !== undefined && { overall_rating: data.overall_rating }),
          ...(data.drinks_ordered !== undefined && { drinks_ordered: data.drinks_ordered }),
          ...(data.photos !== undefined && { photos: data.photos }),
          ...(data.videos !== undefined && { videos: data.videos }),
          ...(data.highlights !== undefined && { highlights: data.highlights }),
          ...(data.improvements !== undefined && { improvements: data.improvements }),
          ...(data.would_recommend !== undefined && { would_recommend: data.would_recommend }),
        };
        const { data: updated, error } = await supabase.from("reviews_cloud").update(row).eq("id", id).select().single();
        if (error) throw error;
        if (updated) setReviews((prev) => prev.map((r) => (r.id === id ? mapReviewCloudToLocal(updated) : r)));
        return { id, ...data };
      },
      restoreReviewsFromSeed: () => {
        setReviews([...initialReviews]);
      },
      deleteReview: async (id) => {
        if (!isSupabaseConfigured()) return;
        const { error } = await supabase.from("reviews_cloud").delete().eq("id", id);
        if (!error) setReviews((prev) => prev.filter((r) => r.id !== id));
      },

      getArticles: () => articles,
      getArticleById: (id) => articles.find((a) => a.id === id),
      addArticle: (data) => {
        const id = data.id || generateId();
        const article = {
          id,
          title: data.title || "",
          slug: (data.title || "").toLowerCase().replace(/\s+/g, "-"),
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          category: data.category || "cultura",
          author_name: user?.name || "Lo Zio del Rum",
          views: 0,
          likes: 0,
          created_date: new Date().toISOString(),
          published: true,
        };
        setArticles((prev) => [...prev, article]);
        return article;
      },
      updateArticle: (id, data) => {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
        return { id, ...data };
      },
      deleteArticle: (id) => {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      },

      getDrinks: () => drinks,
      getDrinkById: (id) => drinks.find((d) => d.id === id),
      addDrink: (data) => {
        const id = data.id || generateId();
        const drink = {
          id,
          name: data.name || "",
          category: (data.category || "other").toLowerCase(),
          brand: data.brand || "",
          origin: data.origin || "",
          description: data.description || "",
          image: data.image || "",
          abv: Number(data.abv) || 0,
          avg_rating: 0,
        };
        setDrinks((prev) => [...prev, drink]);
        return drink;
      },
      updateDrink: (id, data) => {
        setDrinks((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...data } : d))
        );
        return { id, ...data };
      },
      deleteDrink: (id) => {
        setDrinks((prev) => prev.filter((d) => d.id !== id));
      },

      // Community: messaggi proprietari (inviti, annunci)
      ownerMessages,
      getOwnerMessages: (approvedOnly = true) =>
        approvedOnly
          ? ownerMessages.filter((m) => m.approved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [...ownerMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      getPendingOwnerMessages: () => ownerMessages.filter((m) => !m.approved),
      addOwnerMessage: (data) => {
        const id = data.id || generateId();
        const isAdmin = user?.role === "admin";
        const msg = {
          id,
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
          author_name: user?.name || "Lo Zio del Rum",
          venue_name: data.venue_name || "",
          createdAt: new Date().toISOString(),
          approved: isAdmin,
        };
        setOwnerMessages((prev) => [...prev, msg]);
        return msg;
      },
      updateOwnerMessage: (id, data) => {
        setOwnerMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...data } : m))
        );
        return { id, ...data };
      },
      setOwnerMessageApproved: (id, approved) => {
        setOwnerMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, approved } : m))
        );
      },
      deleteOwnerMessage: (id) => {
        setOwnerMessages((prev) => prev.filter((m) => m.id !== id));
      },

      // Community: eventi (calendario)
      communityEvents,
      getCommunityEvents: (approvedOnly = true) =>
        approvedOnly
          ? communityEvents.filter((e) => e.approved).sort((a, b) => new Date(a.date) - new Date(b.date))
          : [...communityEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
      getPendingCommunityEvents: () => communityEvents.filter((e) => !e.approved),
      addCommunityEvent: (data) => {
        const id = data.id || generateId();
        const isAdmin = user?.role === "admin";
        const ev = {
          id,
          title: data.title || "",
          description: data.description || "",
          date: data.date,
          location: data.location || "",
          image: data.image || "",
          author_name: user?.name || "Lo Zio del Rum",
          createdAt: new Date().toISOString(),
          approved: isAdmin,
        };
        setCommunityEvents((prev) => [...prev, ev]);
        return ev;
      },
      updateCommunityEvent: (id, data) => {
        setCommunityEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...data } : e))
        );
        return { id, ...data };
      },
      setCommunityEventApproved: (id, approved) => {
        setCommunityEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, approved } : e))
        );
      },
      deleteCommunityEvent: (id) => {
        setCommunityEvents((prev) => prev.filter((e) => e.id !== id));
      },

      // Community: bacheca utenti
      communityPosts,
      getCommunityPosts: (approvedOnly = true) =>
        approvedOnly
          ? communityPosts.filter((p) => p.approved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [...communityPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      getPendingCommunityPosts: () => communityPosts.filter((p) => !p.approved),
      addCommunityPost: (data) => {
        const id = data.id || generateId();
        const post = {
          id,
          content: data.content || "",
          image: data.image || "",
          author_name: user?.name || "Utente",
          createdAt: new Date().toISOString(),
          approved: false,
        };
        setCommunityPosts((prev) => [...prev, post]);
        return post;
      },
      updateCommunityPost: (id, data) => {
        setCommunityPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data } : p))
        );
        return { id, ...data };
      },
      setCommunityPostApproved: (id, approved) => {
        setCommunityPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, approved } : p))
        );
      },
      deleteCommunityPost: (id) => {
        setCommunityPosts((prev) => prev.filter((p) => p.id !== id));
      },

      // Bartender
      bartenders,
      getBartenders: (statusFilter) => {
        let list = [...bartenders];
        if (statusFilter === "approved") list = list.filter((b) => b.status === "approved" || b.status === "featured");
        if (statusFilter === "featured") list = list.filter((b) => b.status === "featured");
        if (statusFilter === "pending") list = list.filter((b) => b.status === "pending");
        return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      },
      getBartenderById: (id) => bartenders.find((b) => b.id === id),
      getPendingBartenders: () => bartenders.filter((b) => b.status === "pending"),
      loadBartendersFromCloud: async () => {
        if (!isSupabaseConfigured()) return;
        const { data, error } = await supabase.from("app_users").select("*").eq("role", "bartender").order("created_at", { ascending: false });
        if (!error && data && Array.isArray(data)) {
          setBartenders(data.map(mapAppUserToBartender));
        }
      },
      addBartender: async (data) => {
        const isValidUuid = (s) => s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
        const venueId = data.venue_id && isValidUuid(data.venue_id) ? data.venue_id : null;
        const customVenueName = data.venue_name?.trim() || null;
        const row = await insertAppUser({
          role: "bartender",
          name: data.name || "",
          surname: data.surname || "",
          photo: data.photo || "",
          venue_id: venueId,
          custom_venue_name: customVenueName,
          city: data.city || "",
          specialization: data.specialization || "",
          years_experience: data.years_experience || "",
          philosophy: data.philosophy || "",
          distillati_preferiti: data.distillati_preferiti || "",
          approccio_degustazione: data.approccio_degustazione || "",
          consiglio_inizio: data.consiglio_inizio || "",
          signature_drinks: data.signature_drinks || "",
          percorso_esperienze: data.percorso_esperienze || "",
          bio: data.bio || "",
          motivation: data.motivation || "",
          consent_linee_editoriali: !!data.consent_linee_editoriali,
          status: data.status || "pending",
        });
        if (!row) throw new Error("Errore salvataggio bartender");
        const b = mapAppUserToBartender(row);
        setBartenders((prev) => [b, ...prev]);
        return b;
      },
      updateBartender: async (id, data) => {
        const isValidUuid = (s) => s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
        const row = {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.surname !== undefined && { surname: data.surname }),
          ...(data.photo !== undefined && { photo: data.photo }),
          ...(data.venue_id !== undefined && { venue_id: data.venue_id && isValidUuid(data.venue_id) ? data.venue_id : null }),
          ...(data.venue_name !== undefined && { custom_venue_name: data.venue_name?.trim() || null }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.specialization !== undefined && { specialization: data.specialization }),
          ...(data.years_experience !== undefined && { years_experience: data.years_experience }),
          ...(data.philosophy !== undefined && { philosophy: data.philosophy }),
          ...(data.distillati_preferiti !== undefined && { distillati_preferiti: data.distillati_preferiti }),
          ...(data.approccio_degustazione !== undefined && { approccio_degustazione: data.approccio_degustazione }),
          ...(data.consiglio_inizio !== undefined && { consiglio_inizio: data.consiglio_inizio }),
          ...(data.signature_drinks !== undefined && { signature_drinks: data.signature_drinks }),
          ...(data.percorso_esperienze !== undefined && { percorso_esperienze: data.percorso_esperienze }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.motivation !== undefined && { motivation: data.motivation }),
          ...(data.consent_linee_editoriali !== undefined && { consent_linee_editoriali: data.consent_linee_editoriali }),
          ...(data.status !== undefined && { status: data.status }),
        };
        const updated = await updateAppUser(id, row);
        if (updated) {
          setBartenders((prev) => prev.map((b) => (b.id === id ? mapAppUserToBartender(updated) : b)));
        }
        return { id, ...data };
      },
      setBartenderStatus: async (id, status) => {
        if (!isSupabaseConfigured()) return;
        const updated = await updateAppUser(id, { status });
        if (updated) {
          setBartenders((prev) => prev.map((b) => (b.id === id ? mapAppUserToBartender(updated) : b)));
        }
      },
      deleteBartender: async (id) => {
        if (!isSupabaseConfigured()) return;
        const { error } = await supabase.from("app_users").delete().eq("id", id);
        if (!error) {
          setBartenders((prev) => prev.filter((b) => b.id !== id));
        }
      },

      resetToDefaults: () => {
        if (!isSupabaseConfigured()) setVenues(initialVenues);
        else supabase?.from("venues_cloud").select("*").eq("status", "approved").then(({ data }) => {
          if (data?.length) setVenues(data.map((r) => ({ ...r, id: r.external_id || String(r.id) })));
        });
        setReviews(initialReviews);
        setArticles(initialArticles);
        setDrinks(initialDrinks);
      },

      isSupabaseConfigured,
      getLocalVenuesToSync: () =>
        venues.filter((v) => !v._cloudPending && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id) && (v.id?.length ?? 0) < 20),
      syncLocalVenuesToCloud: async () => {
        if (!isSupabaseConfigured()) return { synced: 0 };
        const toSync = venues.filter((v) => !v._cloudPending && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id) && (v.id?.length ?? 0) < 20);
        let synced = 0;
        for (const v of toSync) {
          const row = {
            name: v.name,
            slug: v.slug || (v.name || "").toLowerCase().replace(/\s+/g, "-"),
            description: v.description || "",
            city: v.city || "",
            country: v.country || "Italia",
            address: v.address || "",
            latitude: v.latitude ?? null,
            longitude: v.longitude ?? null,
            cover_image: v.cover_image || "",
            category: v.category || "cocktail_bar",
            price_range: v.price_range || "€€",
            phone: v.phone || "",
            website: v.website || "",
            instagram: v.instagram || "",
            opening_hours: v.opening_hours || "",
            status: "pending",
          };
          const { data: inserted, error } = await supabase.from("venues_cloud").insert(row).select().single();
          if (!error && inserted) {
            const newId = String(inserted.id);
            setVenues((prev) => prev.filter((x) => x.id !== v.id).concat([{ ...v, id: newId, _cloudPending: true }]));
            setReviews((prev) => prev.map((r) => (r.venue_id === v.id ? { ...r, venue_id: newId } : r)));
            synced++;
          }
        }
        return { synced };
      },
      getPendingVenuesFromCloud: async () => {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const viaApi = async () => {
          if (typeof fetch !== "function") return [];
          const res = await fetch(`${base}/api/pending-venues`);
          const json = await res.json();
          if (json.ok && Array.isArray(json.data)) return json.data;
          throw new Error(json.error || "Errore caricamento");
        };
        if (!isSupabaseConfigured()) return viaApi();
        const run = async () => {
          const { data, error } = await supabase.from("venues_cloud").select("*").eq("status", "pending").order("created_at", { ascending: false });
          if (error) throw error;
          return (data || []).map((row) => ({ ...row, id: String(row.id) }));
        };
        try {
          return await run();
        } catch (err) {
          const needsInit = err?.message?.includes("venues_cloud") || err?.message?.includes("does not exist") || err?.code === "42P01";
          if (needsInit && typeof fetch === "function") {
            try {
              const res = await fetch(`${base}/api/init-db`, { method: "POST" });
              if (res.ok) return await run();
            } catch (_) {}
          }
          try {
            return await viaApi();
          } catch (_) {
            throw err;
          }
        }
      },
      approveVenueCloud: async (id, extra = {}) => {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        if (!isSupabaseConfigured()) {
          if (typeof fetch === "function") {
            const res = await fetch(`${base}/api/venue-action`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "approve", id, latitude: extra.latitude, longitude: extra.longitude }),
            });
            const json = await res.json();
            if (json.ok && json.venue) setCloudVenues((prev) => [...prev, json.venue]);
          }
          return;
        }
        const update = { status: "approved" };
        if (extra.latitude != null) update.latitude = extra.latitude;
        if (extra.longitude != null) update.longitude = extra.longitude;
        await supabase.from("venues_cloud").update(update).eq("id", id);
        const { data } = await supabase.from("venues_cloud").select("*").eq("status", "approved");
        if (data && data.length > 0) {
          const mapped = data.map((row) => ({ ...row, id: row.external_id || String(row.id), supabase_id: String(row.id) }));
          setVenues(mapped);
        } else {
          setVenues((prev) => prev.filter((v) => v.id !== id || !v._cloudPending));
        }
      },
      rejectVenueCloud: async (id) => {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        if (!isSupabaseConfigured()) {
          if (typeof fetch === "function") {
            await fetch(`${base}/api/venue-action`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "reject", id }),
            });
          }
          return;
        }
        await supabase.from("venues_cloud").update({ status: "rejected" }).eq("id", id);
      },
      deleteVenueCloud: async (id) => {
        if (!isSupabaseConfigured()) return;
        await supabase.from("venues_cloud").delete().eq("id", id);
        setVenues((prev) => prev.filter((v) => v.id !== id));
      },
      deleteAppUser: async (id) => {
        if (!isSupabaseConfigured()) return;
        const { error } = await supabase.from("app_users").delete().eq("id", id);
        if (!error) {
          setBartenders((prev) => prev.filter((b) => b.id !== id));
        }
      },
      getPendingRegistrationsFromCloud: () => getPendingRegistrations(),
      updateAppUserStatus: (id, status) => updateAppUserStatus(id, status),
      exportVenuesForMobileSync: () => {
        const toExport = venues.filter((v) => !v._cloudPending && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id) && (v.id?.length ?? 0) < 20);
        return JSON.stringify({ venues: toExport, exportedAt: new Date().toISOString(), type: "loziodelrum-venues-sync" }, null, 2);
      },
      importVenuesFromMobileSync: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (data?.type !== "loziodelrum-venues-sync" || !Array.isArray(data?.venues)) return { imported: 0 };
          const existingIds = new Set(venues.map((v) => v.id));
          let imported = 0;
          for (const v of data.venues) {
            if (!v.name || existingIds.has(v.id)) continue;
            const venue = {
              ...v,
              id: v.id || generateId(),
              review_count: v.review_count ?? 0,
              overall_rating: v.overall_rating ?? null,
              verified: false,
            };
            setVenues((prev) => [...prev, venue]);
            existingIds.add(venue.id);
            imported++;
          }
          return { imported };
        } catch (_) {
          return { imported: 0 };
        }
      },

      exportData: () => ({
        venues,
        reviews,
        articles,
        drinks,
        user,
        ownerMessages,
        communityEvents,
        communityPosts,
        exportedAt: new Date().toISOString(),
        version: 1,
      }),
      importVenuesFromMobile: (mobileVenues) => {
        if (!Array.isArray(mobileVenues) || mobileVenues.length === 0) return;
        const ids = new Set(venues.map((v) => v.id));
        const toAdd = mobileVenues.filter((v) => v.id && !ids.has(v.id)).map((v) => ({ ...v, verified: false }));
        if (toAdd.length > 0) setVenues((prev) => [...prev, ...toAdd]);
      },
      importData: (data) => {
        if (data.venues && Array.isArray(data.venues)) setVenues(data.venues);
        if (data.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
        if (data.articles && Array.isArray(data.articles)) setArticles(data.articles);
        if (data.drinks && Array.isArray(data.drinks)) setDrinks(data.drinks);
        if (data.user && typeof data.user === "object") setUser(data.user);
        if (data.ownerMessages && Array.isArray(data.ownerMessages)) setOwnerMessages(data.ownerMessages);
        if (data.communityEvents && Array.isArray(data.communityEvents)) setCommunityEvents(data.communityEvents);
        if (data.communityPosts && Array.isArray(data.communityPosts)) setCommunityPosts(data.communityPosts);
      },
    };
  }, [venues, cloudVenues, reviews, articles, drinks, user, ownerMessages, communityEvents, communityPosts, bartenders, mapAppUserToBartender, mapReviewCloudToLocal]);

  return (
    <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
