"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const AlertDetailsPage = () => {
  const [alert, setAlert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteerMessage, setVolunteerMessage] = useState("");
  const [alreadyVolunteering, setAlreadyVolunteering] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  const fetchAlertDetails = async () => {
    try {
      const db = getFirestore();
      const alertRef = doc(db, "alerts", id);
      const alertDoc = await getDoc(alertRef);
      if (alertDoc.exists()) {
        setAlert(alertDoc.data());
      } else {
        console.error("No such document!");
        router.push("/alerts");
      }
    } catch (error) {
      console.error("Error fetching alert details:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkVolunteerStatus = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return false;

      const db = getFirestore();
      const participantsRef = collection(db, "alerts", id, "participants");
      const participantsQuery = query(
        participantsRef,
        where("userId", "==", user.uid)
      );
      const participantsSnap = await getDocs(participantsQuery);

      return !participantsSnap.empty;
    } catch (error) {
      console.error("Error checking volunteer status:", error);
      return false;
    }
  };

  const handleVolunteer = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast({ title: "Error", description: "You must be logged in." });
        return;
      }

      const alreadyVolunteer = await checkVolunteerStatus();
      if (alreadyVolunteer) {
        toast({ title: "Error", description: "You are already volunteering." });
        return;
      }

      const db = getFirestore();
      const participantsRef = collection(db, "alerts", id, "participants");

      await addDoc(participantsRef, {
        userId: user.uid,
        name: user.displayName || "Anonymous",
        message: volunteerMessage,
        joinedAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "You registered as a volunteer!",
      });
      setVolunteerMessage("");
      setAlreadyVolunteering(true);
    } catch (error) {
      console.error("Error registering as a volunteer:", error);
      toast({ title: "Error", description: "Failed to register." });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAlertDetails();
      const status = await checkVolunteerStatus();
      setAlreadyVolunteering(status);
    };
    if (id) fetchData();
  }, [id]);
  console.log(alert);
  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {loading ? (
        <Skeleton className="h-96 w-full max-w-4xl" />
      ) : alert ? (
        <div className="w-full max-w-4xl">
          <Card className="border bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {alert.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Created at:</strong>{" "}
                {alert.createdAt
                  ? new Date(alert.createdAt.seconds * 1000).toLocaleString()
                  : "Unknown"}
              </p>
              <p>{alert.description}</p>
              <p className="text-sm text-muted-foreground">
                <strong>Location:</strong> {alert.location?.join(", ") || "N/A"}{" "}
                <Link
                  href={`https://www.google.com/maps?q=${alert.location[0]},${alert.location[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline ml-2"
                >
                  View on Google Maps
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Requirements:</strong>{" "}
                {alert.requirements?.join(", ") || "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Tags:</strong> {alert.tags?.join(", ") || "None"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Created by:</strong> {alert.createdBy || "Unknown"}
              </p>
            </CardContent>
          </Card>

          {/* Volunteer Form */}
          <div className="mt-8 bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {alreadyVolunteering
                ? "You are already registered as a volunteer."
                : "Register as a Volunteer"}
            </h2>

            {alreadyVolunteering ? (
              <p className="text-green-600 font-medium">
                Thank you for volunteering!
              </p>
            ) : (
              <>
                <Textarea
                  placeholder="Why do you want to volunteer? (Optional)"
                  value={volunteerMessage}
                  onChange={(e) => setVolunteerMessage(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={handleVolunteer} className="w-full">
                  Volunteer Now
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>Alert not found.</p>
      )}
    </div>
  );
};

export default AlertDetailsPage;
