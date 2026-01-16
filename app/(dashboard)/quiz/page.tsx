import { requireAdmin } from "@/lib/auth/get-user";

import Contents from "./_components/Contents/Contents";
import Header from "./_components/Contents/Header";

export default async function QuizPage() {
  // Only admin can access this page
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <Contents />
      </div>
    </div>
  );
}
