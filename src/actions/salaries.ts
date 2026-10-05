"use server";

import { revalidatePath } from "next/cache";
import { toPriceItemData, type PriceItemInput } from "@/lib/price-item";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId } from "@/lib/validation";

export async function createSalary(input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.salary.create({ data: toPriceItemData(input) });
  revalidatePath("/budget");
}

export async function updateSalary(id: string, input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.salary.update({ where: { id: requireId(id) }, data: toPriceItemData(input) });
  revalidatePath("/budget");
}

/** done = true : salaire reçu. */
export async function setSalaryDone(id: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.salary.update({ where: { id: requireId(id) }, data: { done: Boolean(done) } });
  revalidatePath("/budget");
}

export async function deleteSalary(id: string): Promise<void> {
  await requireSession();
  await prisma.salary.delete({ where: { id: requireId(id) } });
  revalidatePath("/budget");
}
