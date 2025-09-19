'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Itinerary } from '@/lib/types';
import { useEffect, useState } from 'react';

// A default center, in case geocoding fails or is not available.
const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };

type MapViewProps = {
  itinerary: Itinerary;
};

// Simple component to use Google's Geocoding API.
// Note: For production, this should be a server-side call to protect the API key.
// As per request, we are using a public key here which is not ideal for geocoding.
async function geocodeAddress(address: string, apiKey: string) {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.results[0].geometry.location;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

export default function MapView({ itinerary }: MapViewProps) {
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [markers, setMarkers] = useState<{lat: number, lng: number}[]>([]);
    
    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;

            const destinationCoords = await geocodeAddress(itinerary.destination, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
            if(destinationCoords) {
                setCenter(destinationCoords);
            }

            const markerPromises = itinerary.itinerary.flatMap(day => 
                day.activities.map(activity => {
                    if (activity.coordinates) return Promise.resolve(activity.coordinates);
                    return geocodeAddress(`${activity.placeName}, ${itinerary.destination}`, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);
                })
            );

            const resolvedMarkers = (await Promise.all(markerPromises)).filter(m => m !== null) as {lat: number, lng: number}[];
            setMarkers(resolvedMarkers);
        };

        fetchCoordinates();

    }, [itinerary]);


  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Map
        defaultZoom={11}
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
