"use client";

import { useEffect, useState, type ReactNode } from "react";

function useClientMountReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

/** Avoid SSR for children that break hydration (Recharts, layout measurement). */
export function ClientMountGate({
  skeleton,
  children,
}: {
  skeleton: ReactNode;
  children: ReactNode;
}) {
  const ready = useClientMountReady();
  if (!ready) return skeleton;
  return children;
}

export function RegistryChartsHost({
  skeleton,
  children,
}: {
  skeleton: ReactNode;
  children: ReactNode;
}) {
  return <ClientMountGate skeleton={skeleton}>{children}</ClientMountGate>;
}

export function DemographicsChartsHost({
  skeleton,
  children,
}: {
  skeleton: ReactNode;
  children: ReactNode;
}) {
  return <ClientMountGate skeleton={skeleton}>{children}</ClientMountGate>;
}
