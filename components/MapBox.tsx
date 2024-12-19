"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Alert {
  id: string;
  title: string;
  description: string;
  location: number[];
  requirements: string[];
  tags: string[];
  createdAt: Date;
  createdBy: string;
}

const AlertMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  //   const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const db = getFirestore();
      const alertsCollection = collection(db, "alerts");
      const alertSnapshot = await getDocs(alertsCollection);
      const alertList = alertSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Alert[];
      setAlerts(alertList);
      return alertList;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const addAlertLayers = (alertList: Alert[]) => {
    if (!map.current) return;

    if (map.current.getLayer("alert-points"))
      map.current.removeLayer("alert-points");
    if (map.current.getLayer("alert-heat"))
      map.current.removeLayer("alert-heat");
    if (map.current.getSource("alerts")) map.current.removeSource("alerts");

    map.current.addSource("alerts", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: alertList.map((alert) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [alert.location[1], alert.location[0]],
          },
          properties: {
            id: alert.id,
            title: alert.title,
            description: alert.description,
            requirements: alert.requirements,
            tags: alert.tags,
          },
        })),
      },
    });

    map.current.addLayer({
      id: "alert-points",
      type: "circle",
      source: "alerts",
      paint: {
        "circle-radius": 8,
        "circle-color": "#FF0000",
        "circle-opacity": 0.7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF",
      },
    });

    map.current.addLayer({
      id: "alert-heat",
      type: "heatmap",
      source: "alerts",
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": 1,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-radius": 30,
        "heatmap-opacity": 0.7,
      },
    });

    // Add click event
    map.current.on("click", "alert-points", (e) => {
      if (!e.features?.[0]) return;
      const feature = e.features[0];
      const alertDetails = alertList.find(
        (a) => a.id === feature.properties?.id
      );
      if (alertDetails) {
        setSelectedAlert(alertDetails);
      }
    });

    map.current.on("mouseenter", "alert-points", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "alert-points", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
      pitch: 45,
      bearing: 0,
      projection: "globe",
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("style.load", () => {
      if (!map.current) return;

      map.current.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.02,
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.6,
      });

      if (alerts.length > 0) {
        addAlertLayers(alerts);
      }
    });

    const initializeMap = async () => {
      try {
        const alertList = await fetchAlerts();
        map.current?.on("load", () => {
          addAlertLayers(alertList);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (map.current?.isStyleLoaded() && alerts.length > 0) {
      addAlertLayers(alerts);
    }
  }, [alerts]);

  return (
    <div className="h-screen w-screen relative">
      <div ref={mapContainer} className="h-full w-full" />

      {selectedAlert && (
        <Card className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>{selectedAlert.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{selectedAlert.description}</p>
            <div className="mb-2">
              <strong>Requirements:</strong>
              <div className="flex flex-wrap gap-1">
                {selectedAlert.requirements.map((req, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Tags:</strong>
              <div className="flex flex-wrap gap-1">
                {selectedAlert.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlertMap;
