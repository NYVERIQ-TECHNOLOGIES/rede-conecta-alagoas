import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/session";
import { canAccessExperience, resolveHomePath, type Experience } from "@/lib/experience";

export function ExperienceGate({
  experience,
  children,
}: {
  experience: Experience;
  children: ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    const roles = user?.roles ?? [];
    if (!canAccessExperience(roles, experience)) {
      navigate({ to: resolveHomePath(roles), replace: true });
    }
  }, [isLoading, user, experience, navigate]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="panel flex flex-col items-center gap-3 px-8 py-6">
          <div className="size-6 animate-spin rounded-full border-2 border-line border-t-leaf" />
          <span className="label-mono">Abrindo sua experiência…</span>
        </div>
      </div>
    );
  }

  if (!canAccessExperience(user?.roles ?? [], experience)) return null;

  return <>{children}</>;
}
