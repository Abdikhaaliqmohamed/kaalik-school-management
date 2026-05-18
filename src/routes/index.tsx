import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/")({ component: Landing });
function Landing() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-lama-sky-light via-white to-lama-purple-light p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-lama-sky grid place-items-center text-2xl font-bold mb-6">K</div>
        <h1 className="text-4xl font-semibold tracking-tight">KAALIK School Management</h1>
        <p className="mt-3 text-muted-foreground">Role-based dashboards for administrators, teachers, students and parents — built with modern web technology.</p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link to="/sign-in" className="px-5 py-2.5 rounded-xl bg-lama-sky font-medium">Sign in</Link>
          <Link to="/admin" className="px-5 py-2.5 rounded-xl bg-lama-purple font-medium">Enter Admin Demo</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {["Admin","Teacher","Student","Parent"].map((r) => (
            <Link key={r} to={`/${r.toLowerCase()}` as any} className="rounded-xl bg-white border p-4 hover:shadow">
              <div className="font-medium">{r}</div><div className="text-xs text-muted-foreground">Open dashboard</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
