"use client";

import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAlerts = async () => {
    try {
      const db = getFirestore();
      const alertsRef = collection(db, "alerts");
      const q = query(alertsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetchedAlerts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Alerts</h1>

      {loading ? (
        <div>
          <Skeleton className="h-24 mb-4" />
          <Skeleton className="h-24 mb-4" />
          <Skeleton className="h-24 mb-4" />
        </div>
      ) : alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border">
              <CardHeader>
                <CardTitle>{alert.title}</CardTitle>
                <CardDescription>
                  {alert.createdAt
                    ? new Date(alert.createdAt.seconds * 1000).toLocaleString()
                    : "Unknown Date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{alert.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Location: {alert.location?.join(", ") || "N/A"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Requirements: {alert.requirements?.join(", ") || "None"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Created by: {alert.createdBy || "Unknown"}
                </p>
                {/* Tags section */}
                <div className="mt-4 text-sm text-muted-foreground">
                  <strong>Tags: </strong>
                  {alert.tags && alert.tags.length > 0
                    ? alert.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2"
                        >
                          {tag}
                        </span>
                      ))
                    : "None"}
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push(`/alert/${alert.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
