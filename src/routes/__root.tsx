import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts, Link } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Menu } from "@/components/Menu";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/admin" className="mt-6 inline-flex rounded-md bg-lama-sky px-4 py-2 text-sm font-medium">Go to dashboard</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 rounded-md bg-lama-sky px-4 py-2 text-sm">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KAALIK · School Management System" },
      { name: "description", content: "Role-based school management dashboards for admins, teachers, students and parents." },
      { property: "og:title", content: "KAALIK · School Management System" },
      { name: "twitter:title", content: "KAALIK · School Management System" },
      { property: "og:description", content: "Role-based school management dashboards for admins, teachers, students and parents." },
      { name: "twitter:description", content: "Role-based school management dashboards for admins, teachers, students and parents." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/430aa290-a668-4a4d-93b1-6712a9574471/id-preview-260421da--326535f0-88d2-4089-94fb-93c8e0568ae6.lovable.app-1779205896687.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/430aa290-a668-4a4d-93b1-6712a9574471/id-preview-260421da--326535f0-88d2-4089-94fb-93c8e0568ae6.lovable.app-1779205896687.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider><AppLayout /><Toaster richColors position="top-right" /></AuthProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const isPublic = pathname === "/sign-in" || pathname === "/";
  useEffect(() => {
    if (!loading && !user && !isPublic) router.navigate({ to: "/sign-in" });
  }, [loading, user, isPublic, router]);
  if (isPublic) return <Outlet />;
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  return (
    <div className="flex h-screen w-full bg-page">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
