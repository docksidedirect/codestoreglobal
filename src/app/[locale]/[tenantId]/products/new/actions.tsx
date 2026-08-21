"use server";

import { prisma } from "@/lib/prisma";   // <-- adjust to your actual prisma client path
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  // add other visible fields from your form here
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(
  tenantId: string,
  sellerId: string,
  prevState: any,
  formData: FormData
) {
  const raw = Object.fromEntries(formData);
  const parsed = createProductSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, description, price } = parsed.data;
  let slug = slugify(name);

  // Ensure unique slug per tenant
  const existing = await prisma.product.findFirst({
    where: { tenantId, slug },
  });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      currency: "USD",
      tenantId,
      sellerId,
      category: "SOFTWARE",   // <-- adjust to your form's category input or default
    },
  });

  revalidatePath(`/${tenantId}/products`);
  redirect(`/${tenantId}/products`);
}