"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const MyVolunteeringPage = () => {
  const [loading, setLoading] = useState(true);
  const [volunteeringAlerts, setVolunteeringAlerts] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVolunteeringAlerts = async (userId: string) => {
      try {
        const db = getFirestore();
        const alertsRef = collection(db, "alerts");
        const querySnapshot = await getDocs(alertsRef);

        const fetchedAlerts = [];
        for (const docSnap of querySnapshot.docs) {
          const participantsRef = collection(docSnap.ref, "participants");
          const participantQuery = query(
            participantsRef,
            where("userId", "==", userId)
          );
          const participantsSnap = await getDocs(participantQuery);

          if (!participantsSnap.empty) {
            fetchedAlerts.push({
              id: docSnap.id,
              ...docSnap.data(),
            });
          }
        }

        setVolunteeringAlerts(fetchedAlerts);
      } catch (error) {
        console.error("Error fetching volunteering alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchVolunteeringAlerts(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Volunteering</h1>

      {loading ? (
        <div>
          <Skeleton className="h-24 mb-4" />
          <Skeleton className="h-24 mb-4" />
          <Skeleton className="h-24 mb-4" />
        </div>
      ) : volunteeringAlerts.length === 0 ? (
        <p>You are not currently volunteering for any alerts.</p>
      ) : (
        <div className="space-y-4">
          {volunteeringAlerts.map((alert) => (
            <Card key={alert.id} className="border">
              <CardHeader>
                <CardTitle>{alert.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-muted-foreground">
                  Created at:{" "}
                  {alert.createdAt
                    ? new Date(alert.createdAt.seconds * 1000).toLocaleString()
                    : "Unknown"}
                </p>
                <p className="mb-4">{alert.description}</p>
                <p className="text-sm text-muted-foreground">
                  Location: {alert.location?.join(", ") || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requirements: {alert.requirements?.join(", ") || "None"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tags: {alert.tags?.join(", ") || "None"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVolunteeringPage;
