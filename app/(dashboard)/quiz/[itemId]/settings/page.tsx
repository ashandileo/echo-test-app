"use client";

export default function QuizSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="grid gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage quiz settings and preferences
          </p>
        </div>
        <div className="text-muted-foreground">
          Settings content will be added here
        </div>
      </div>
    </div>
  );
}
