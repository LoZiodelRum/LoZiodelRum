import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type LocationStatus =
  | "idle"
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
  locationStatus: LocationStatus;
  locationError: string | null;
  requestLocation: () => void;
  refreshLocation: () => void;
};

export const DEFAULT_POSITION = {
  lat: 40.8518,
  lng: 14.2681,
};

const LAST_POSITION_STORAGE_KEY = "drinkwise_last_position";

const LocationContext = createContext<LocationContextValue>({
  userPosition: {
    ...DEFAULT_POSITION,
    timestamp: 0,
  },
  hasRealPosition: false,
  locationStatus: "idle",
  locationError: null,
  requestLocation: () => undefined,
  refreshLocation: () => undefined,
});

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const cachedPosition = useMemo(() => readCachedPosition(), []);
  const [userPosition, setUserPosition] = useState<LocationPosition>(() =>
    cachedPosition || {
      ...DEFAULT_POSITION,
      timestamp: 0,
    }
  );
  const [hasRealPosition, setHasRealPosition] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
  }, []);

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
    (maximumAge: number) => {
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
    [ensureWatchPosition, handleError, handleSuccess]
  );

  const requestLocation = useCallback(() => {
    requestLocationInternal(60000);
  }, [requestLocationInternal]);

  const refreshLocation = useCallback(() => {
    requestLocationInternal(0);
  }, [requestLocationInternal]);

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
        locationStatus,
        locationError,
        requestLocation,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
