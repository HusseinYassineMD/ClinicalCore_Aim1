"use client";

import DashboardAuthGate from "@/components/DashboardAuthGate";

export default function DashboardAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardAuthGate>{children}</DashboardAuthGate>;
}
