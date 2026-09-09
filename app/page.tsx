import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";

export const instant = false;

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.profile.role === "tutor") {
    redirect("/tutor");
  }

  redirect("/student");
}