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

const alertSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z
    .array(z.number())
    .length(2, "Location must include latitude and longitude"),
  requirements: z
    .array(z.string())
    .nonempty("At least one requirement is needed"),
  tags: z.array(z.string()).nonempty("At least one tag is needed"),
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

const CreateAlert = () => {
  const { toast } = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
  });

  const [locationFetching, setLocationFetching] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationFetching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("location.0", position.coords.latitude);
          setValue("location.1", position.coords.longitude);
          setLocationFetching(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          toast({
            title: "Error",
            description: "Failed to get your location. Please try again.",
            status: "error",
          });
          setLocationFetching(false);
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        status: "error",
      });
    }
  };

  const onSubmit = async (data: AlertFormValues) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User is not authenticated");
      }

      const alertData = {
        ...data,
        createdBy: user.displayName,
        createdAt: serverTimestamp(),
      };

      console.log("Alert Data: ", alertData);

      await addDoc(collection(db, "alerts"), alertData);

      toast({
        title: "Success",
        description: "Alert created successfully!",
        status: "success",
      });

      setValue("title", "");
      setValue("description", "");
      setValue("location", []);
      setValue("requirements", []);
      setValue("tags", []);
      setValue("phNo", "");

      setTimeout(() => {
        router.push("/alerts");
      }, 3000);
    } catch (error) {
      console.error("Error creating alert:", error);
      toast({
        title: "Error",
        description: "Failed to create the alert. Please try again.",
        status: "error",
      });
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <form
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-xl font-bold mb-4">Create New Alert</h2>

        {/* Title */}
        <div className="mb-4">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            {...register("title")}
            placeholder="Enter alert title"
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe the alert"
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <Label htmlFor="phNo">Phone Number</Label>
          <Input
            id="phNo"
            type="text"
            {...register("phNo")}
            placeholder="Enter phone number"
          />
          {errors.phNo && (
            <p className="text-sm text-red-600">{errors.phNo.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4">
          <Label>Location (Latitude, Longitude)</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitude"
              {...register("location.0", {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              {...register("location.1", {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              onClick={getLocation}
              disabled={locationFetching}
            >
              {locationFetching ? "Fetching..." : "Use My Location"}
            </Button>
          </div>
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <Label htmlFor="requirements">Requirements</Label>
          <MultiSelect
            control={control}
            name="requirements"
            options={[
              { label: "Medical Supplies", value: "Medical Supplies" },
              { label: "Volunteers", value: "Volunteers" },
              { label: "Food", value: "Food" },
              { label: "Shelter", value: "Shelter" },
            ]}
          />
          {errors.requirements && (
            <p className="text-sm text-red-600">
              {errors.requirements.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <Label htmlFor="tags">Tags</Label>
          <MultiSelect
            control={control}
            name="tags"
            options={[
              { label: "Search & Rescue", value: "Search & Rescue" },
              { label: "Flood", value: "Flood" },
              { label: "Earthquake", value: "Earthquake" },
              { label: "Tsunami", value: "Tsunami" },
              { label: "Wildfire", value: "Wildfire" },
            ]}
          />
          {errors.tags && (
            <p className="text-sm text-red-600">{errors.tags.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Create Alert
        </Button>
      </form>
    </div>
  );
};

export default CreateAlert;
