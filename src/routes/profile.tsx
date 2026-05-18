import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/profile")({ component: () => (
  <div className="bg-white rounded-2xl p-6 max-w-2xl">
    <h1 className="text-xl font-semibold mb-4">Profile</h1>
    <div className="flex items-center gap-4">
      <img src="https://i.pravatar.cc/100?img=12" className="w-20 h-20 rounded-full" />
      <div>
        <div className="font-medium">Demo User</div>
        <div className="text-sm text-muted-foreground">demo@kaalik.edu</div>
      </div>
    </div>
  </div>
)});
