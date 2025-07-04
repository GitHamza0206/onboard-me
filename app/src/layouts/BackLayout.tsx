// src/layouts/BackLayout.tsx

import { BackHeader } from "@/components/layout/BackHeader";
import { Outlet } from "react-router-dom";

export function BackLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <BackHeader />
      <main className="flex-1">
        <Outlet /> {/* Les pages imbriquées seront rendues ici */}
      </main>
    </div>
  );
}