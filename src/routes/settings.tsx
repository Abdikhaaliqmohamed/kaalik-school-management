import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/settings")({ component: () => (
  <div className="bg-white rounded-2xl p-6 max-w-2xl">
    <h1 className="text-xl font-semibold mb-4">Settings</h1>
    <p className="text-sm text-muted-foreground">Account preferences, notifications and appearance settings.</p>
  </div>
)});
