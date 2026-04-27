import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import BackgroundGlow from "@/components/BackgroundGlow";
import AdminLoginForm from "@/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gotham">
      <BackgroundGlow />
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo size={32} />
      </header>
      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 pb-16 sm:px-10">
        <AdminLoginForm />
      </section>
    </main>
  );
}
