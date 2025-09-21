
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Itinerary } from '@/lib/types';
import { useEffect, useState } from 'react';

// A default center, in case geocoding fails or is not available.
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Centered on India

type MapViewProps = {
  itinerary: Itinerary;
};

// Note: For production, this should be a server-side call to protect the API key.
// As per request, we are using a public key here which is not ideal for geocoding.
async function geocodeAddress(address: string, apiKey: string): Promise<{lat: number, lng: number} | null> {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    if (!response.ok) {
        console.error('Geocoding API response not OK:', response.statusText);
        return null;
    }
    const data = await response.json();
    if (data.status === 'OK' && data.results[0]) {
      return data.results[0].geometry.location;
    } else {
      console.warn(`Geocoding failed for "${address}": ${data.status}`, data.error_message || '');
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
  }
  return null;
}

export default function MapView({ itinerary }: MapViewProps) {
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [markers, setMarkers] = useState<{lat: number, lng: number}[]>([]);
    const [zoom, setZoom] = useState(5);
    
    useEffect(() => {
        const fetchCoordinates = async () => {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.error("Google Maps API key is not configured.");
                return;
            }

            const allActivityNames = itinerary.itinerary.flatMap(day => 
                day.activities.map(activity => `${activity.placeName}, ${itinerary.destination}`)
            );

            const markerPromises = allActivityNames.map(name => geocodeAddress(name, apiKey));

            const resolvedMarkers = (await Promise.all(markerPromises)).filter(m => m !== null) as {lat: number, lng: number}[];
            
            setMarkers(resolvedMarkers);

            if (resolvedMarkers.length > 0) {
                // Calculate the average of all marker coordinates to center the map
                const avgLat = resolvedMarkers.reduce((sum, m) => sum + m.lat, 0) / resolvedMarkers.length;
                const avgLng = resolvedMarkers.reduce((sum, m) => sum + m.lng, 0) / resolvedMarkers.length;
                setCenter({ lat: avgLat, lng: avgLng });
                setZoom(resolvedMarkers.length === 1 ? 12 : 9); // Zoom in closer if there's only one marker
            } else {
                 const destinationCoords = await geocodeAddress(itinerary.destination, apiKey);
                 if(destinationCoords) {
                    setCenter(destinationCoords);
                    setZoom(10);
                }
            }
        };

        fetchCoordinates();

    }, [itinerary]);


  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map
        zoom={zoom}
        center={center}
        mapId="TRIPWISE_MAP"
      >
        {markers.map((marker, index) => (
             <AdvancedMarker key={index} position={marker}>
                <Pin />
            </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
}
