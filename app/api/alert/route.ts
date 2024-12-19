import { db } from "@/app/lib/firebase/config";
import { collection } from "firebase/firestore";
import { NextResponse } from "next/server";

const alert = collection(db, "alerts");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: Alert = body;

    console.log("Data: ", data);
    return NextResponse.json(
      {
        message: "Alert created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
  }
}
