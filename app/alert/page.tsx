"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import MultiSelect from "@/components/MultiSelect";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const alertSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z
    .array(z.number())
    .length(2, "Location must include latitude and longitude")
    .refine(
      ([lat, lng]) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180,
      "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
    ),
  requirements: z
    .array(z.string())
    .nonempty("At least one requirement is needed")
    .max(5, "Maximum 5 requirements allowed"),
  tags: z
    .array(z.string())
    .nonempty("At least one tag is needed")
    .max(5, "Maximum 5 tags allowed"),
  phNo: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^\+?[0-9]*$/,
      "Phone number must contain only numbers and an optional '+'"
    ),
});

type AlertFormValues = z.infer<typeof alertSchema>;

const REQUIREMENT_OPTIONS = [
  { label: "Medical Supplies", value: "Medical Supplies" },
  { label: "Volunteers", value: "Volunteers" },
  { label: "Food", value: "Food" },
  { label: "Shelter", value: "Shelter" },
  { label: "Transportation", value: "Transportation" },
  { label: "Water", value: "Water" },
  { label: "Clothing", value: "Clothing" },
  { label: "Medical Personnel", value: "Medical Personnel" },
];

const TAG_OPTIONS = [
  { label: "Search & Rescue", value: "Search & Rescue" },
  { label: "Flood", value: "Flood" },
  { label: "Earthquake", value: "Earthquake" },
  { label: "Tsunami", value: "Tsunami" },
  { label: "Wildfire", value: "Wildfire" },
  { label: "Medical Emergency", value: "Medical Emergency" },
  { label: "Infrastructure", value: "Infrastructure" },
  { label: "Evacuation", value: "Evacuation" },
];

const CreateAlert = () => {
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationFetching, setLocationFetching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    mode: "onChange",
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationFetching(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("location.0", position.coords.latitude, {
            shouldValidate: true,
          });
          setValue("location.1", position.coords.longitude, {
            shouldValidate: true,
          });
          setLocationFetching(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLocationError(
            error.code === error.PERMISSION_DENIED
              ? "Location permission denied. Please enable location access or enter coordinates manually."
              : "Failed to get your location. Please try again or enter coordinates manually."
          );
          setLocationFetching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const onSubmit = async (data: AlertFormValues) => {
    try {
      setIsSubmitting(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User is not authenticated");
      }

      const alertData = {
        ...data,
        createdBy: user.uid,
        createdByName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        status: "active",
        volunteers: [],
      };

      await addDoc(collection(db, "alerts"), alertData);

      toast({
        title: "Success",
        description:
          "Alert created successfully! Redirecting to alerts page...",
      });

      reset();

      // Delayed redirect to allow the user to see the success message
      setTimeout(() => {
        router.push("/alerts");
      }, 2000);
    } catch (error) {
      console.error("Error creating alert:", error);
      toast({
        title: "Error",
        description: "Failed to create the alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full py-8 px-4 flex items-center justify-center bg-gray-50">
      <form
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Create New Alert</h2>
          <p className="text-sm text-gray-500">
            Fill out the details below to create a new emergency alert.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            {...register("title")}
            placeholder="Enter alert title"
            className="w-full"
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe the emergency situation and needed assistance"
            className="min-h-[100px]"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phNo">Contact Phone Number</Label>
          <Input
            id="phNo"
            type="tel"
            {...register("phNo")}
            placeholder="e.g., +1234567890"
          />
          {errors.phNo && (
            <p className="text-sm text-red-600">{errors.phNo.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitude"
              {...register("location.0", { valueAsNumber: true })}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              {...register("location.1", { valueAsNumber: true })}
            />
            <Button
              type="button"
              onClick={getLocation}
              disabled={locationFetching}
              variant="outline"
              className="whitespace-nowrap"
            >
              {locationFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                "Use My Location"
              )}
            </Button>
          </div>
          {locationError && (
            <Alert variant="destructive">
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements</Label>
          <MultiSelect
            control={control}
            name="requirements"
            options={REQUIREMENT_OPTIONS}
          />
          {errors.requirements && (
            <p className="text-sm text-red-600">
              {errors.requirements.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Emergency Type Tags</Label>
          <MultiSelect control={control} name="tags" options={TAG_OPTIONS} />
          {errors.tags && (
            <p className="text-sm text-red-600">{errors.tags.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Alert...
            </>
          ) : (
            "Create Alert"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateAlert;
