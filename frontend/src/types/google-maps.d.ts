// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral | null): void;
      getPosition(): LatLng | null;
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: Function): MapsEventListener;
        getPlace(): PlaceResult;
      }

      interface PlaceResult {
        formatted_address?: string;
        name?: string;
        geometry?: {
          location?: LatLng;
        };
      }

      interface AutocompleteOptions {
        fields?: string[];
        types?: string[];
      }
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderRequest {
      location?: LatLngLiteral;
      address?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
    }

    type GeocoderStatus = "OK" | "ERROR" | "INVALID_REQUEST" | "OVER_QUERY_LIMIT" | "REQUEST_DENIED" | "UNKNOWN_ERROR" | "ZERO_RESULTS";

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      mapTypeId?: string;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      draggable?: boolean;
      animation?: Animation;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    interface MapsEventListener {
      remove(): void;
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2,
    }
  }
}

interface Window {
  google: typeof google;
}
