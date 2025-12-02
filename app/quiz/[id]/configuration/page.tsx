"use client";

export default function QuizConfigurationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="grid gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
          <p className="text-muted-foreground">
            Configure quiz settings and options
          </p>
        </div>
        <div className="text-muted-foreground">
          Configuration content will be added here
        </div>
      </div>
    </div>
  );
}
