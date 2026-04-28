import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AdminDashboard from "@/components/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  const prisma = getPrisma();
  const leads = await prisma.user.findMany({
    include: { answers: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date → string for client component
  const serialized = leads.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt.toISOString(),
    answers: u.answers
      ? {
          aiWebsites: u.answers.aiWebsites,
          knowledge: u.answers.knowledge,
          copywriting: u.answers.copywriting,
          dataSystems: u.answers.dataSystems,
          bigPicture: u.answers.bigPicture,
        }
      : null,
  }));

  return (
    <main className="min-h-screen bg-gotham">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5 sm:px-10">
        <Logo size={32} />
      </header>
      <AdminDashboard initialLeads={serialized} />
    </main>
  );
}
