import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { venuesData as initialVenues } from "@/data/venues";
import { reviewsData as initialReviews } from "@/data/reviews";
import { articlesData as initialArticles } from "@/data/articles";
import { drinksData as initialDrinks } from "@/data/drinks";
import { initialOwnerMessages, initialCommunityPosts, initialCommunityEvents } from "@/data/community";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const COMMUNITY_POSTS_VERSION = 11;
const STORAGE_KEYS = {
  venues: "app_venues",
  communityPostsVersion: "app_community_posts_version",
  reviews: "app_reviews",
  articles: "app_articles",
  drinks: "app_drinks",
  user: "app_user",
  ownerMessages: "app_owner_messages",
  communityEvents: "app_community_events",
  communityPosts: "app_community_posts",
  bartenders: "app_bartenders",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  return fallback;
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [venues, setVenues] = useState(() => load(STORAGE_KEYS.venues, initialVenues));
  const [reviews, setReviews] = useState(() => load(STORAGE_KEYS.reviews, initialReviews));
  const [articles, setArticles] = useState(() => load(STORAGE_KEYS.articles, initialArticles));
  const [drinks, setDrinks] = useState(() => load(STORAGE_KEYS.drinks, initialDrinks));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      if (raw) {
        const u = JSON.parse(raw);
        if (u && typeof u === "object" && u.role) return u;
      }
    } catch (_) {}
    return null;
  });
  const [ownerMessages, setOwnerMessages] = useState(() => {
    const stored = load(STORAGE_KEYS.ownerMessages, []) || [];
    const seedMap = new Map((initialOwnerMessages || []).map((m) => [m.id, m]));
    const merged = stored.map((m) => {
      const seed = seedMap.get(m.id);
      return seed && seed.image ? { ...m, image: seed.image } : m;
    });
    const mergedIds = new Set(merged.map((m) => m.id));
    const missing = (initialOwnerMessages || []).filter((m) => !mergedIds.has(m.id));
    return stored.length > 0 ? [...merged, ...missing] : (initialOwnerMessages || []);
  });
  const [communityEvents, setCommunityEvents] = useState(() => {
    const stored = (load(STORAGE_KEYS.communityEvents, []) || []).filter(
      (e) => e.title !== "Cocktail Tiki Night"
    );
    const storedIds = new Set(stored.map((e) => e.id));
    const missing = (initialCommunityEvents || []).filter((e) => !storedIds.has(e.id));
    return [...stored, ...missing];
  });
  const [communityPosts, setCommunityPosts] = useState(() => {
    const storedVersion = parseInt(localStorage.getItem(STORAGE_KEYS.communityPostsVersion) || "0", 10);
    if (storedVersion < COMMUNITY_POSTS_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.communityPosts);
      localStorage.setItem(STORAGE_KEYS.communityPostsVersion, String(COMMUNITY_POSTS_VERSION));
      return initialCommunityPosts || [];
    }
    const stored = load(STORAGE_KEYS.communityPosts, []) || [];
    const seedMap = new Map((initialCommunityPosts || []).map((p) => [p.id, p]));
    const merged = stored.map((p) => {
      const seed = seedMap.get(p.id);
      return seed && seed.image ? { ...p, image: seed.image } : p;
    });
    const mergedIds = new Set(merged.map((p) => p.id));
    const missing = (initialCommunityPosts || []).filter((p) => !mergedIds.has(p.id));
    return stored.length > 0 ? [...merged, ...missing] : (initialCommunityPosts || []);
  });
  const [bartenders, setBartenders] = useState(() => load(STORAGE_KEYS.bartenders, []));
  const [cloudVenues, setCloudVenues] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    supabase
      .from("venues_cloud")
      .select("*")
      .eq("status", "approved")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCloudVenues(data.map((row) => ({ ...row, id: String(row.id) })));
        }
      })
      .catch(() => {});
  }, []);

  // Sincronizza locali salvati solo in locale (prima della config Supabase) verso Supabase
  const [hasSyncedLocalVenues, setHasSyncedLocalVenues] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured() || hasSyncedLocalVenues) return;
    const toSync = venues.filter((v) => !v._cloudPending && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id) && (v.id?.length ?? 0) < 20);
    if (toSync.length === 0) {
      setHasSyncedLocalVenues(true);
      return;
    }
    setHasSyncedLocalVenues(true);
    toSync.forEach((v) => {
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
      supabase
        .from("venues_cloud")
        .insert(row)
        .select()
        .single()
        .then(({ data: inserted, error }) => {
          if (!error && inserted) {
            const newId = String(inserted.id);
            setVenues((prev) => prev.filter((x) => x.id !== v.id).concat([{ ...v, id: newId, _cloudPending: true }]));
            setReviews((prev) => prev.map((r) => (r.venue_id === v.id ? { ...r, venue_id: newId } : r)));
          }
        })
        .catch(() => {});
    });
  }, []);

  useEffect(() => {
    save(STORAGE_KEYS.venues, venues);
  }, [venues]);
  useEffect(() => {
    save(STORAGE_KEYS.reviews, reviews);
  }, [reviews]);
  useEffect(() => {
    save(STORAGE_KEYS.articles, articles);
  }, [articles]);
  useEffect(() => {
    save(STORAGE_KEYS.drinks, drinks);
  }, [drinks]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } catch (_) {}
  }, [user]);
  useEffect(() => { save(STORAGE_KEYS.ownerMessages, ownerMessages); }, [ownerMessages]);
  useEffect(() => { save(STORAGE_KEYS.communityEvents, communityEvents); }, [communityEvents]);
  useEffect(() => { save(STORAGE_KEYS.communityPosts, communityPosts); }, [communityPosts]);
  useEffect(() => { save(STORAGE_KEYS.bartenders, bartenders); }, [bartenders]);

  const api = useMemo(() => {
    return {
      venues,
      reviews,
      articles,
      drinks,
      user,
      setUser,

      getVenues: () => [...venues.filter((v) => !v._cloudPending && v.verified !== false), ...cloudVenues],
      getVenueById: (id) => venues.find((v) => v.id === id) || cloudVenues.find((v) => v.id === id),
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
            setVenues((prev) => [...prev, venue]);
            return venue;
          }
          const cloudVenue = { ...venue, id: String(inserted.id), _cloudPending: true };
          setVenues((prev) => [...prev, cloudVenue]);
          return { ...cloudVenue, pending: true };
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
            category: data.category,
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
          category: data.category,
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
      addReview: (data) => {
        const id = data.id || generateId();
        const review = {
          ...data,
          id,
          created_date: new Date().toISOString(),
          author_name: user?.name || "Utente",
          created_by: user?.email,
        };
        setReviews((prev) => [...prev, review]);
        const venueReviews = [...reviews, review].filter((r) => r.venue_id === data.venue_id);
        if (venueReviews.length > 0) {
          const avg = (key) =>
            venueReviews.reduce((s, r) => s + (r[key] || 0), 0) / venueReviews.length;
          const avgDrink = avg("drink_quality");
          const avgStaff = avg("staff_competence");
          const avgAtmo = avg("atmosphere");
          const avgVal = avg("value_for_money");
          const overall = avg("overall_rating");
          setVenues((prev) =>
            prev.map((v) =>
              v.id === data.venue_id
                ? {
                    ...v,
                    review_count: venueReviews.length,
                    avg_drink_quality: Math.round(avgDrink * 10) / 10,
                    avg_staff_competence: Math.round(avgStaff * 10) / 10,
                    avg_atmosphere: Math.round(avgAtmo * 10) / 10,
                    avg_value: Math.round(avgVal * 10) / 10,
                    overall_rating: Math.round(overall * 10) / 10,
                  }
                : v
            )
          );
        }
        return review;
      },
      updateReview: (id, data) => {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        return { id, ...data };
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
      addBartender: (data) => {
        const id = data.id || generateId();
        const b = {
          id,
          name: data.name || "",
          surname: data.surname || "",
          photo: data.photo || "",
          venue_id: data.venue_id || "",
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
          created_at: new Date().toISOString(),
          interview_links: Array.isArray(data.interview_links) ? data.interview_links : [],
          qa_links: Array.isArray(data.qa_links) ? data.qa_links : [],
        };
        setBartenders((prev) => [...prev, b]);
        return b;
      },
      updateBartender: (id, data) => {
        setBartenders((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...data } : b))
        );
        return { id, ...data };
      },
      setBartenderStatus: (id, status) => {
        setBartenders((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      },
      deleteBartender: (id) => {
        setBartenders((prev) => prev.filter((b) => b.id !== id));
      },

      resetToDefaults: () => {
        setVenues(initialVenues);
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
        if (!isSupabaseConfigured()) return [];
        const { data } = await supabase.from("venues_cloud").select("*").eq("status", "pending").order("created_at", { ascending: false });
        return (data || []).map((row) => ({ ...row, id: String(row.id) }));
      },
      approveVenueCloud: async (id, extra = {}) => {
        if (!isSupabaseConfigured()) return;
        const update = { status: "approved" };
        if (extra.latitude != null) update.latitude = extra.latitude;
        if (extra.longitude != null) update.longitude = extra.longitude;
        await supabase.from("venues_cloud").update(update).eq("id", id);
        const { data } = await supabase.from("venues_cloud").select("*").eq("status", "approved");
        if (data) setCloudVenues(data.map((row) => ({ ...row, id: String(row.id) })));
        setVenues((prev) => prev.filter((v) => v.id !== id || !v._cloudPending));
      },
      rejectVenueCloud: async (id) => {
        if (!isSupabaseConfigured()) return;
        await supabase.from("venues_cloud").update({ status: "rejected" }).eq("id", id);
      },
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
        bartenders,
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
        if (data.bartenders && Array.isArray(data.bartenders)) setBartenders(data.bartenders);
      },
    };
  }, [venues, cloudVenues, reviews, articles, drinks, user, ownerMessages, communityEvents, communityPosts, bartenders]);

  return (
    <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
