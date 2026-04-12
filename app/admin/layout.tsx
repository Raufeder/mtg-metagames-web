"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { PageSpinner } from "@/app/components/atoms/PageSpinner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.app_metadata?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PageSpinner className="h-16 w-16 text-text-muted" />
      </div>
    );
  }

  if (!user || user.app_metadata?.role !== "admin") return null;

  return <>{children}</>;
}
