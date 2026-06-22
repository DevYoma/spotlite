import "./loadEnv";

import { db } from "./index";
import { users, projects, forms, submissions, templates, generatedImages } from "./schema";

async function main() {
  console.log("Seeding started...");

  // 1. Insert test user
  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: "user_test_clerk_123",
      email: "test_creator@spotlite.com",
    })
    .returning();

  console.log(`Inserted user with ID: ${user.id}`);

  // 2. Insert test project
  const [project] = await db
    .insert(projects)
    .values({
      ownerId: user.id,
      name: "Beta Testers Workspace",
      description: "A sandbox for testing forms and graphics generation.",
    })
    .returning();

  console.log(`Inserted project with ID: ${project.id}`);

  // 3. Insert test form
  const [form] = await db
    .insert(forms)
    .values({
      projectId: project.id,
      name: "Feedback Form",
      title: "Tell us about your experience",
      schemaJson: {
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "Your Full Name",
            required: true,
            placeholder: "John Doe",
          },
          {
            id: "field_2",
            type: "textarea",
            label: "Comments",
            required: false,
            placeholder: "Leave your thoughts here...",
          },
          {
            id: "field_3",
            type: "image",
            label: "Profile Picture",
            required: true,
          },
        ],
      },
    })
    .returning();

  console.log(`Inserted form with ID: ${form.id}`);

  // 4. Insert test template
  const [template] = await db
    .insert(templates)
    .values({
      projectId: project.id,
      name: "Cool Banner Template",
      backgroundImageUrl: "https://pub-c3d017d58626417d91741eb937b2da1f.r2.dev/placeholder-bg.png",
      layoutJson: {
        width: 1200,
        height: 630,
        elements: [
          {
            id: "el_1",
            type: "text",
            fieldRef: "field_1",
            x: 100,
            y: 200,
            fontSize: 48,
            color: "#ffffff",
            fontWeight: "bold",
          },
          {
            id: "el_2",
            type: "text",
            fieldRef: "field_2",
            x: 100,
            y: 350,
            fontSize: 24,
            color: "#cccccc",
            fontWeight: "normal",
          },
          {
            id: "el_3",
            type: "image",
            fieldRef: "field_3",
            x: 800,
            y: 150,
            width: 300,
            height: 300,
            borderRadius: 150,
          },
        ],
      },
    })
    .returning();

  console.log(`Inserted template with ID: ${template.id}`);

  // 5. Insert test submission
  const [submission] = await db
    .insert(submissions)
    .values({
      formId: form.id,
      dataJson: {
        field_1: "Alice Smith",
        field_2: "Spotlite is absolutely amazing!",
        field_3: "https://pub-c3d017d58626417d91741eb937b2da1f.r2.dev/alice-avatar.png",
      },
    })
    .returning();

  console.log(`Inserted submission with ID: ${submission.id}`);

  // 6. Insert test generated image
  const [genImage] = await db
    .insert(generatedImages)
    .values({
      submissionId: submission.id,
      templateId: template.id,
      imageUrl: "https://pub-c3d017d58626417d91741eb937b2da1f.r2.dev/generated-feedback-alice.png",
    })
    .returning();

  console.log(`Inserted generated image with ID: ${genImage.id}`);

  console.log("Seeding completed successfully!");
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
