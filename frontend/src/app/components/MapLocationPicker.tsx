import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocationPickerProps {
  value: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  onChange: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
}

export function MapLocationPicker({ value, onChange }: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(value.address || "");
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocode using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Geocoding error:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Search location using Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;
        
        onChange({ address, coordinates: { lat, lng } });
        setSearchQuery(address);
        
        // Update map
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 13);
          markerRef.current.setLatLng([lat, lng]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Initialize map when shown
  useEffect(() => {
    if (!showMap || !mapRef.current || mapInstanceRef.current) return;

    const defaultLocation = value.coordinates || { lat: 51.505, lng: -0.09 }; // London

    // Create map
    const map = L.map(mapRef.current).setView([defaultLocation.lat, defaultLocation.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add marker
    const marker = L.marker([defaultLocation.lat, defaultLocation.lng], {
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      const lat = position.lat;
      const lng = position.lng;
      
      const address = await reverseGeocode(lat, lng);
      setSearchQuery(address);
      onChange({ address, coordinates: { lat, lng } });
    });

    // Handle map click
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      marker.setLatLng(e.latlng);
      
      const address = await reverseGeocode(lat, lng);
      setSearchQuery(address);
      onChange({ address, coordinates: { lat, lng } });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [showMap]);

  // Update marker when value changes externally
  useEffect(() => {
    if (value.coordinates && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([value.coordinates.lat, value.coordinates.lng], 13);
      markerRef.current.setLatLng([value.coordinates.lat, value.coordinates.lng]);
    }
  }, [value.coordinates]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchLocation();
              }
            }}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={searchLocation}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant={showMap ? "default" : "outline"}
          onClick={() => setShowMap(!showMap)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showMap ? "Hide Map" : "Show Map"}
        </Button>
      </div>

      {/* Map Container */}
      {showMap && (
        <Card className="overflow-hidden">
          <div ref={mapRef} className="w-full h-[400px]" />
          <div className="p-3 bg-muted/50 text-xs text-muted-foreground">
            💡 Click on the map or drag the marker to select a location
          </div>
        </Card>
      )}

      {/* Selected Location Display */}
      {value.coordinates && (
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Selected Location</p>
            <p className="text-xs text-muted-foreground truncate">{value.address}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {value.coordinates.lat.toFixed(6)}, {value.coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
