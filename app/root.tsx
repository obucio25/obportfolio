import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import SiteHeader from "./components/SiteHeader";

import type { Route } from "./+types/root";
import "./app.css";
import { getSupabaseAdmin } from "./lib/supabase.server";
import { requireAdmin, hasDeviceHintCookie } from "./lib/adminAuth.server";

export async function loader({ request }: { request: Request }) {
  const admin = await requireAdmin(request);
  
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "header_status")
    .maybeSingle();

  const showLoginShortcut = Boolean(admin) || hasDeviceHintCookie(request);

  return { 
    headerStatus: data?.value ?? "Open for work",
    isAdmin: Boolean(admin),
    showLoginShortcut,
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { headerStatus, isAdmin, showLoginShortcut  } = useLoaderData() as { 
    headerStatus: string;
    isAdmin: boolean;
    showLoginShortcut: boolean;
  };

  return (
    <>
      <SiteHeader 
        statusText={headerStatus}
        isAdmin={isAdmin}
        showLoginShortcut={showLoginShortcut}
      />

      <main>
        <Outlet />;
      </main>
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
