import { getServerSession } from "next-auth";
import { authOptions, getDemoUser } from "./auth";
import { prisma } from "./db";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const id = (session.user as any).id;
    if (id) return prisma.user.findUnique({ where: { id } });
  }
  return getDemoUser();
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}
