import { createFileRoute, useNavigate } from "@tanstack/react-router";
export const Route = createFileRoute("/sign-in")({ component: SignIn });
function SignIn() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-lama-sky-light to-lama-purple-light p-6">
      <form onSubmit={(e)=>{e.preventDefault(); nav({ to: "/admin" });}} className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-6"><div className="w-9 h-9 rounded-lg bg-lama-sky grid place-items-center font-bold">K</div><span className="font-semibold">KAALIK</span></div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Choose any credentials — this is a demo.</p>
        <label className="block mt-4 text-sm">Email
          <input defaultValue="admin@kaalik.edu" className="mt-1 w-full px-3 py-2 rounded-lg border bg-muted/40" />
        </label>
        <label className="block mt-3 text-sm">Password
          <input type="password" defaultValue="demo1234" className="mt-1 w-full px-3 py-2 rounded-lg border bg-muted/40" />
        </label>
        <button className="mt-5 w-full py-2.5 rounded-lg bg-lama-sky font-medium">Continue</button>
      </form>
    </div>
  );
}
