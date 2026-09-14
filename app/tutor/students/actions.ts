"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

const CreateStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Student name is required.")
    .max(100, "Student name is too long."),

  email: z
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Temporary password must contain at least 8 characters.")
    .max(128, "Temporary password is too long."),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(100, "Subject is too long."),

  currentLevel: z
    .string()
    .trim()
    .min(1, "Current level is required.")
    .max(100, "Current level is too long."),

  learningGoals: z.string().trim().max(2000, "Learning goals are too long."),

  weakAreas: z.string().trim().max(2000, "Weak areas are too long."),
});

export type CreateStudentState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    subject?: string[];
    currentLevel?: string[];
    learningGoals?: string[];
    weakAreas?: string[];
  };
};

const GENERIC_CREATE_ERROR =
  "Unable to create the student account. Please check the details and try again.";

export async function createStudent(
  _previousState: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  const tutor = await requireTutor();

  const parsed = CreateStudentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    subject: formData.get("subject"),
    currentLevel: formData.get("currentLevel"),
    learningGoals: formData.get("learningGoals") ?? "",
    weakAreas: formData.get("weakAreas") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    email,
    password,
    subject,
    currentLevel,
    learningGoals,
    weakAreas,
  } = parsed.data;

  const admin = createAdminClient();

  let studentUserId: string | null = null;
  let createdStudentId: string | null = null;

  let createdAuthUser = false;
  let createdProfile = false;

  try {
    // -------------------------------------------------
    // Resolve Auth user privately by email.
    // -------------------------------------------------

    const { data: existingUserId, error: lookupError } = await admin.rpc(
      "find_auth_user_by_email",
      {
        p_email: email,
      },
    );

    if (lookupError) {
      throw lookupError;
    }

    if (existingUserId) {
      studentUserId = existingUserId;
    } else {
      // -------------------------------------------------
      // Create Auth account only if one does not exist.
      //
      // The supplied temporary password is ignored when
      // an Auth account already exists.
      // -------------------------------------------------

      const { data: createdUser, error: createUserError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
          },
        });

      if (createUserError || !createdUser.user) {
        throw createUserError ?? new Error("Failed to create auth user.");
      }

      studentUserId = createdUser.user.id;
      createdAuthUser = true;
    }

    if (!studentUserId) {
      throw new Error("Student Auth user could not be resolved.");
    }

    // -------------------------------------------------
    // Check existing TutorFlow profile.
    // -------------------------------------------------

    const { data: existingProfile, error: profileLookupError } = await admin
      .from("profiles")
      .select(
        `
        id,
        role
      `,
      )
      .eq("id", studentUserId)
      .maybeSingle();

    if (profileLookupError) {
      throw profileLookupError;
    }

    // Never convert an existing tutor into a student.
    if (existingProfile && existingProfile.role !== "student") {
      console.error(
        "Cannot reuse Auth user because profile role is incompatible.",
        {
          userId: studentUserId,
        },
      );

      throw new Error("Incompatible existing account.");
    }

    // -------------------------------------------------
    // Check whether a student row already exists.
    //
    // Current schema:
    // students.user_id is UNIQUE.
    // -------------------------------------------------

    const { data: existingStudent, error: existingStudentError } = await admin
      .from("students")
      .select(
        `
        id,
        tutor_id
      `,
      )
      .eq("user_id", studentUserId)
      .maybeSingle();

    if (existingStudentError) {
      throw existingStudentError;
    }

    // -------------------------------------------------
    // Existing student already belongs to current tutor.
    //
    // Treat create as idempotent and redirect to the
    // existing student rather than creating another row.
    // -------------------------------------------------

    if (existingStudent) {
      if (existingStudent.tutor_id === tutor.user.id) {
        createdStudentId = existingStudent.id;
      } else {
        console.error("Existing student belongs to another tutor.", {
          userId: studentUserId,
          existingStudentId: existingStudent.id,
        });

        // throw new Error("Student is already assigned.");
        return {
          success: false,
          message: "Student is already assigned to another tutor.",
        };
      }
    }

    // -------------------------------------------------
    // Only create TutorFlow records when this is not
    // already one of the current tutor's students.
    // -------------------------------------------------

    if (!createdStudentId) {
      if (!existingProfile) {
        const { error: profileInsertError } = await admin
          .from("profiles")
          .insert({
            id: studentUserId,
            role: "student",
            full_name: name,
          });

        if (profileInsertError) {
          throw profileInsertError;
        }

        createdProfile = true;
      }

      const { data: createdStudent, error: studentInsertError } = await admin
        .from("students")
        .insert({
          tutor_id: tutor.user.id,
          user_id: studentUserId,
          name,
          subject,
          current_level: currentLevel,
          learning_goals: learningGoals,
          weak_areas: weakAreas,
        })
        .select("id")
        .single();

      if (studentInsertError || !createdStudent) {
        throw studentInsertError ?? new Error("Student insert failed.");
      }

      createdStudentId = createdStudent.id;
    }
  } catch (error) {
    console.error("Failed to create student:", error);

    // -------------------------------------------------
    // Cleanup only records created during this request.
    // Never delete an existing Auth user.
    // -------------------------------------------------

    if (createdAuthUser && studentUserId) {
      const { error: deleteUserError } =
        await admin.auth.admin.deleteUser(studentUserId);

      if (deleteUserError) {
        console.error(
          "Failed to clean up newly-created auth user:",
          deleteUserError,
        );
      }
    } else if (createdProfile && studentUserId) {
      const { error: deleteProfileError } = await admin
        .from("profiles")
        .delete()
        .eq("id", studentUserId);

      if (deleteProfileError) {
        console.error(
          "Failed to clean up newly-created profile:",
          deleteProfileError,
        );
      }
    }

    return {
      success: false,
      message: GENERIC_CREATE_ERROR,
    };
  }

  if (!createdStudentId) {
    return {
      success: false,
      message: GENERIC_CREATE_ERROR,
    };
  }

  // -------------------------------------------------
  // Keep redirect OUTSIDE try/catch.
  // -------------------------------------------------

  revalidatePath("/tutor");

  redirect(`/tutor/students/${createdStudentId}`);
}
