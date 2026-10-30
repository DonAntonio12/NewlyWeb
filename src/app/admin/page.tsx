import type { Metadata } from "next";
import { AdminRsvpDashboard } from "@/components/admin/admin-rsvp-dashboard";

export const metadata: Metadata = {
  title: "Admin | Kenneth & Danielle",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminRsvpDashboard />;
}
