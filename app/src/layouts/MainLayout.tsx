// src/layouts/MainLayout.tsx

import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export function MainLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <Outlet /> {/* Les pages imbriquées seront rendues ici */}
      </main>
    </div>
  );
}