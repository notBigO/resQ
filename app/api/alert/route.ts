import { db } from "@/app/lib/firebase/config";
import { collection } from "firebase/firestore";

const alert = collection(db, "alerts");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data: Alert = body;

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
