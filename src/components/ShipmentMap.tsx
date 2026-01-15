import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Loader2 } from 'lucide-react';

interface ShipmentMapProps {
  destinationAddress: {
    city: string;
    state: string;
    country: string;
  };
  carrierName?: string;
}

const ShipmentMap = ({ destinationAddress, carrierName }: ShipmentMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data, error: fnError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (fnError || !data?.token) {
          setError('Unable to load map');
          setIsLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;

        // Geocode destination address
        const addressQuery = `${destinationAddress.city}, ${destinationAddress.state}, ${destinationAddress.country}`;
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json?access_token=${data.token}`
        );
        const geocodeData = await geocodeResponse.json();
        
        const destCoords = geocodeData.features?.[0]?.center || [78.9629, 20.5937]; // Default to India center

        // Create map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: destCoords,
          zoom: 5,
          pitch: 30,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        // Disable scroll zoom
        map.current.scrollZoom.disable();

        // Add destination marker
        const destMarker = document.createElement('div');
        destMarker.className = 'destination-marker';
        destMarker.innerHTML = `
          <div style="
            width: 40px; 
            height: 40px; 
            background: linear-gradient(135deg, #B8860B, #DAA520); 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
          ">
            <svg style="transform: rotate(45deg); color: white; width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;

        new mapboxgl.Marker({ element: destMarker })
          .setLngLat(destCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: system-ui; padding: 8px;">
              <p style="font-weight: 600; margin: 0 0 4px 0;">Delivery Location</p>
              <p style="color: #666; margin: 0; font-size: 13px;">${addressQuery}</p>
            </div>
          `))
          .addTo(map.current);

        // Simulate shipment location (random point along route)
        const originCoords: [number, number] = [77.2090, 28.6139]; // Delhi (origin warehouse)
        const progress = 0.3 + Math.random() * 0.5; // Random progress 30-80%
        const shipmentCoords: [number, number] = [
          originCoords[0] + (destCoords[0] - originCoords[0]) * progress,
          originCoords[1] + (destCoords[1] - originCoords[1]) * progress
        ];

        // Add shipment marker (truck)
        const shipmentMarker = document.createElement('div');
        shipmentMarker.className = 'shipment-marker';
        shipmentMarker.innerHTML = `
          <div style="
            width: 36px; 
            height: 36px; 
            background: #3B82F6; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            animation: pulse 2s infinite;
          ">
            <svg style="color: white; width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
            </svg>
          </div>
        `;

        new mapboxgl.Marker({ element: shipmentMarker })
          .setLngLat(shipmentCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="font-family: system-ui; padding: 8px;">
              <p style="font-weight: 600; margin: 0 0 4px 0;">Your Package</p>
              <p style="color: #666; margin: 0; font-size: 13px;">${carrierName || 'In Transit'}</p>
              <p style="color: #3B82F6; margin: 4px 0 0 0; font-size: 12px;">~${Math.round(progress * 100)}% of the way</p>
            </div>
          `))
          .addTo(map.current);

        // Draw route line
        map.current.on('load', () => {
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [originCoords, shipmentCoords, destCoords]
              }
            }
          });

          // Dashed line for remaining route
          map.current?.addLayer({
            id: 'route-remaining',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#CBD5E1',
              'line-width': 3,
              'line-dasharray': [2, 2]
            }
          });

          // Solid line for completed route
          map.current?.addSource('route-done', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [originCoords, shipmentCoords]
              }
            }
          });

          map.current?.addLayer({
            id: 'route-done',
            type: 'line',
            source: 'route-done',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4
            }
          });

          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(originCoords);
          bounds.extend(shipmentCoords);
          bounds.extend(destCoords);
          map.current?.fitBounds(bounds, { padding: 60 });
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [destinationAddress, carrierName]);

  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ShipmentMap;
