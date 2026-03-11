import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { MapPin, Navigation, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  title?: string;
}

export function LocationMapModal({ isOpen, onClose, location, title }: LocationMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Get user's location
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Could not get user location:", error);
        }
      );
    }
  }, [isOpen]);

  // Calculate distance
  useEffect(() => {
    if (location.coordinates && userLocation) {
      const R = 6371; // Earth's radius in km
      const dLat = ((userLocation.lat - location.coordinates.lat) * Math.PI) / 180;
      const dLng = ((userLocation.lng - location.coordinates.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((location.coordinates.lat * Math.PI) / 180) *
          Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      setDistance(dist);
    }
  }, [location.coordinates, userLocation]);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapRef.current || !location.coordinates || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [location.coordinates.lat, location.coordinates.lng],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add marker for event location
    const eventMarker = L.marker([location.coordinates.lat, location.coordinates.lng])
      .addTo(map)
      .bindPopup(`<strong>${title || "Event Location"}</strong><br>${location.address}`);

    // Add marker for user location if available
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      })
        .addTo(map)
        .bindPopup("Your Location");

      // Show both markers on map
      const bounds = L.latLngBounds([
        [location.coordinates.lat, location.coordinates.lng],
        [userLocation.lat, userLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen, location.coordinates, userLocation, title]);

  const openInGoogleMaps = () => {
    if (location.coordinates) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`,
        "_blank"
      );
    }
  };

  const openInAppleMaps = () => {
    if (location.coordinates) {
      window.open(
        `http://maps.apple.com/?daddr=${location.coordinates.lat},${location.coordinates.lng}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                {title || "Event Location"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">{location.address}</p>
              {distance !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {distance < 1
                      ? `${(distance * 1000).toFixed(0)} meters away`
                      : `${distance.toFixed(1)} km away`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {location.coordinates ? (
          <>
            <div ref={mapRef} className="w-full h-[400px]" />
            
            <div className="p-6 pt-4 space-y-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">Get directions:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={openInGoogleMaps}
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Google Maps
                </Button>
                <Button
                  onClick={openInAppleMaps}
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Apple Maps
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Location coordinates not available for this event.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
