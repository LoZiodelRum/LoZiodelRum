import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "./UserContext";

export type LocationStatus =
  | "idle"
  | "onboarding_required"
  | "checking"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export type LocationPosition = {
  lat: number;
  lng: number;
  timestamp: number;
};

type LocationContextValue = {
  userPosition: LocationPosition;
  hasRealPosition: boolean;
  hasSavedPosition: boolean;
  hasRequestedLocationOnboarding: boolean;
  locationStatus: LocationStatus;
  locationError: string | null;
  requestLocation: () => void;
  refreshLocation: () => void;
  checkLocationSilently: () => void;
  markLocationOnboardingDone: () => void;
};

export const DEFAULT_POSITION = {
  lat: 40.8518,
  lng: 14.2681,
};

const LAST_POSITION_STORAGE_KEY = "drinkwise_last_position";
const ONBOARDING_DONE_STORAGE_KEY = "drinkwise_location_onboarding_done";
const LOCATION_STARTED_SESSION_KEY = "drinkwise_location_started";

const LocationContext = createContext<LocationContextValue>({
  userPosition: {
    ...DEFAULT_POSITION,
    timestamp: 0,
  },
  hasRealPosition: false,
  hasSavedPosition: false,
  hasRequestedLocationOnboarding: false,
  locationStatus: "idle",
  locationError: null,
  requestLocation: () => undefined,
  refreshLocation: () => undefined,
  checkLocationSilently: () => undefined,
  markLocationOnboardingDone: () => undefined,
});

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function readCachedPosition(): LocationPosition | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(LAST_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      lat?: unknown;
      lng?: unknown;
      timestamp?: unknown;
    };

    const lat = parseCoordinate(parsed.lat);
    const lng = parseCoordinate(parsed.lng);
    const timestamp = Number(parsed.timestamp);

    if (lat === null || lng === null) return null;

    return {
      lat,
      lng,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeCachedPosition(position: LocationPosition) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(LAST_POSITION_STORAGE_KEY, JSON.stringify(position));
  } catch {
    // Ignore storage write failures.
  }
}

function readOnboardingDoneFlag() {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(ONBOARDING_DONE_STORAGE_KEY) === "true";
}

function writeOnboardingDoneFlag(value: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ONBOARDING_DONE_STORAGE_KEY, value ? "true" : "false");
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  const cachedPosition = useMemo(() => readCachedPosition(), []);
  const onboardingDoneFromStorage = useMemo(() => readOnboardingDoneFlag(), []);
  const [userPosition, setUserPosition] = useState<LocationPosition>(() =>
    cachedPosition || {
      ...DEFAULT_POSITION,
      timestamp: 0,
    }
  );
  const [hasRealPosition, setHasRealPosition] = useState(false);
  const [hasRequestedLocationOnboarding, setHasRequestedLocationOnboarding] = useState(
    onboardingDoneFromStorage
  );
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    onboardingDoneFromStorage ? "idle" : "onboarding_required"
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasSavedPosition = userPosition.timestamp > 0;

  const markLocationOnboardingDone = useCallback(() => {
    setHasRequestedLocationOnboarding(true);
    writeOnboardingDoneFlag(true);
    // Future enhancement: mirror onboarding+permission state to user profile in Supabase.
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const nextPosition: LocationPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: Date.now(),
    };

    setUserPosition(nextPosition);
    setHasRealPosition(true);
    setLocationStatus("granted");
    setLocationError(null);
    writeCachedPosition(nextPosition);
    markLocationOnboardingDone();
  }, [markLocationOnboardingDone]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setHasRealPosition(false);

    if (error.code === 1) {
      setLocationStatus("denied");
      setLocationError(
        "Posizione non autorizzata. Attivala per vedere locali ed eventi vicino a te. Se hai negato il permesso, riattivalo dalle impostazioni del browser."
      );
      return;
    }

    setLocationStatus("error");
    setLocationError("Non riesco a rilevare la posizione. Riprova tra poco.");
  }, []);

  const ensureWatchPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      (error) => {
        if (error.code === 1) {
          setHasRealPosition(false);
          setLocationStatus("denied");
          setLocationError(
            "Posizione non autorizzata. Attivala per vedere locali ed eventi vicino a te. Se hai negato il permesso, riattivalo dalle impostazioni del browser."
          );
          return;
        }

        setLocationStatus((prev) => (prev === "granted" ? prev : "error"));
        setLocationError((prev) => prev || "Non riesco a aggiornare la posizione in background.");
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  }, [handleSuccess]);

  const requestLocationInternal = useCallback(
    (maximumAge: number, markOnboardingDone: boolean) => {
      if (markOnboardingDone) {
        markLocationOnboardingDone();
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocationStatus("unavailable");
        setLocationError("Geolocalizzazione non disponibile su questo dispositivo.");
        setHasRealPosition(false);
        return;
      }

      setLocationStatus("requesting");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSuccess(position);
          ensureWatchPosition();
        },
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge,
        }
      );
    },
    [ensureWatchPosition, handleError, handleSuccess, markLocationOnboardingDone]
  );

  const requestLocation = useCallback(() => {
    requestLocationInternal(60000, true);
  }, [requestLocationInternal]);

  const refreshLocation = useCallback(() => {
    requestLocationInternal(0, true);
  }, [requestLocationInternal]);

  const checkLocationSilently = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      setLocationError("Geolocalizzazione non disponibile su questo dispositivo.");
      return;
    }

    if (!hasRequestedLocationOnboarding) {
      setLocationStatus("onboarding_required");
      return;
    }

    const permissionsApi = (navigator as any).permissions;
    if (!permissionsApi?.query) {
      setLocationStatus(hasSavedPosition ? "idle" : "idle");
      return;
    }

    setLocationStatus("checking");

    try {
      const result = await permissionsApi.query({ name: "geolocation" });

      if (result.state === "granted") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            handleSuccess(position);
            ensureWatchPosition();
          },
          (error) => {
            handleError(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          }
        );
        return;
      }

      if (result.state === "denied") {
        setHasRealPosition(false);
        setLocationStatus("denied");
        setLocationError(
          "Posizione non autorizzata. Se hai negato il permesso, riattivalo dalle impostazioni del browser."
        );
        return;
      }

      setLocationStatus("idle");
      setLocationError(null);
    } catch {
      setLocationStatus("error");
      setLocationError("Non riesco a controllare i permessi posizione in background.");
    }
  }, [ensureWatchPosition, handleError, handleSuccess, hasRequestedLocationOnboarding, hasSavedPosition]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (canUseSessionStorage()) {
        window.sessionStorage.removeItem(LOCATION_STARTED_SESSION_KEY);
      }
      return;
    }

    if (canUseSessionStorage()) {
      const alreadyStarted = window.sessionStorage.getItem(LOCATION_STARTED_SESSION_KEY);
      if (alreadyStarted === "true") return;
      window.sessionStorage.setItem(LOCATION_STARTED_SESSION_KEY, "true");
    }

    requestLocation();
  }, [isAuthenticated, requestLocation]);

  useEffect(() => {
    void checkLocationSilently();
  }, [checkLocationSilently]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userPosition,
        hasRealPosition,
        hasSavedPosition,
        hasRequestedLocationOnboarding,
        locationStatus,
        locationError,
        requestLocation,
        refreshLocation,
        checkLocationSilently,
        markLocationOnboardingDone,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
