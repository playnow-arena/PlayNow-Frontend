import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, X, Check, Loader2 } from 'lucide-react';
import { reverseGeocode } from '../utils/location';

// Custom neon pin icon for PlayNow branding
const createTurfIcon = () => {
  return L.divIcon({
    className: 'playnow-custom-marker',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        transform: translate(-50%, -100%);
        filter: drop-shadow(0 4px 10px rgba(57, 255, 20, 0.5));
      ">
        <svg viewBox="0 0 24 24" fill="#39FF14" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" fill="#000000" />
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

const DEFAULT_CENTER = {
  lat: 10.7905, // Sensible fallback (Trichy/Tamil Nadu region)
  lng: 78.7047,
};

const MapLocationPicker = ({
  isOpen,
  initialCoordinates,
  onConfirm,
  onClose,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedCoords, setSelectedCoords] = useState(
    initialCoordinates?.lat && initialCoordinates?.lng
      ? { lat: Number(initialCoordinates.lat), lng: Number(initialCoordinates.lng) }
      : null
  );

  const [locationPreview, setLocationPreview] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Sync selectedCoords with initialCoordinates when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCoordinates?.lat && initialCoordinates?.lng) {
        setSelectedCoords({
          lat: Number(initialCoordinates.lat),
          lng: Number(initialCoordinates.lng),
        });
      } else {
        setSelectedCoords(null);
      }
      setGeoError('');
      setLocationPreview('');
    }
  }, [isOpen, initialCoordinates]);

  // Fetch address preview when coordinates change
  useEffect(() => {
    let isCancelled = false;
    if (selectedCoords) {
      reverseGeocode(selectedCoords.lat, selectedCoords.lng).then((res) => {
        if (!isCancelled && res) {
          const parts = [res.area, res.city].filter(Boolean);
          setLocationPreview(parts.length ? parts.join(', ') : '');
        }
      }).catch(() => {});
    } else {
      setLocationPreview('');
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedCoords]);

  // Initialize and manage the Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal container dimensions are settled
    const timer = setTimeout(() => {
      if (mapInstanceRef.current || !mapContainerRef.current) return;

      const startLat = selectedCoords?.lat || DEFAULT_CENTER.lat;
      const startLng = selectedCoords?.lng || DEFAULT_CENTER.lng;
      const startZoom = selectedCoords ? 16 : 12;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: startZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const turfIcon = createTurfIcon();

      const placeMarker = (lat, lng) => {
        const roundedLat = Number(lat.toFixed(6));
        const roundedLng = Number(lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([roundedLat, roundedLng]);
        } else {
          const marker = L.marker([roundedLat, roundedLng], {
            icon: turfIcon,
            draggable: true,
          }).addTo(map);

          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            setSelectedCoords({
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
            });
          });

          markerRef.current = marker;
        }

        setSelectedCoords({ lat: roundedLat, lng: roundedLng });
      };

      // If initial coordinates exist, place the marker
      if (selectedCoords) {
        placeMarker(selectedCoords.lat, selectedCoords.lng);
      }

      // Handle map clicks to place/move marker
      map.on('click', (e) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle GPS Locate button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const roundedLat = Number(latitude.toFixed(6));
        const roundedLng = Number(longitude.toFixed(6));

        setSelectedCoords({ lat: roundedLat, lng: roundedLng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([roundedLat, roundedLng], 16);

          const turfIcon = createTurfIcon();
          if (markerRef.current) {
            markerRef.current.setLatLng([roundedLat, roundedLng]);
          } else {
            const marker = L.marker([roundedLat, roundedLng], {
              icon: turfIcon,
              draggable: true,
            }).addTo(mapInstanceRef.current);

            marker.on('dragend', (e) => {
              const pos = e.target.getLatLng();
              setSelectedCoords({
                lat: Number(pos.lat.toFixed(6)),
                lng: Number(pos.lng.toFixed(6)),
              });
            });

            markerRef.current = marker;
          }
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Unable to retrieve your current location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (!selectedCoords) {
      setGeoError('Please click on the map to select your turf location.');
      return;
    }
    onConfirm(selectedCoords);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#151b2b] border border-white/10 rounded-3xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14] shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                Pick Your Turf Location
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Tap anywhere on the map or drag the pin to pinpoint your turf
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 bg-[#0a0f1c] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition disabled:opacity-50"
          >
            {isLocating ? <Loader2 size={14} className="animate-spin text-[#39FF14]" /> : <Navigation size={14} className="text-[#39FF14]" />}
            {isLocating ? 'Locating...' : 'Use My GPS Location'}
          </button>

          <div className="text-xs font-mono text-gray-300 flex items-center gap-2">
            {selectedCoords ? (
              <span className="bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] px-2.5 py-1 rounded-lg font-bold">
                {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                {locationPreview && <span className="ml-1.5 text-gray-400 font-sans font-normal">({locationPreview})</span>}
              </span>
            ) : (
              <span className="text-gray-500 italic">No point placed yet</span>
            )}
          </div>
        </div>

        {geoError && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-medium">
            {geoError}
          </div>
        )}

        {/* Map Container */}
        <div className="relative flex-1 min-h-[350px] sm:min-h-[420px] w-full bg-black/40">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#151b2b] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400 text-center sm:text-left">
            {selectedCoords
              ? 'Coordinates ready to save to your registration.'
              : 'Click on the map above to select your location.'}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs font-bold transition uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedCoords}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black text-xs font-black transition uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#39FF14]/20"
            >
              <Check size={16} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
