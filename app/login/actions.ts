"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1, "Password is required."),
});

export type LoginState = {
  success: boolean;
  message?: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Enter a valid email and password.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  // Read the application profile after authentication.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    console.error("Unable to resolve profile after login:", profileError);

    await supabase.auth.signOut();

    return {
      success: false,
      message: "Unable to access this account. Please try again.",
    };
  }

  if (profile.role === "tutor") {
    redirect("/tutor");
  }

  redirect("/student");
}
