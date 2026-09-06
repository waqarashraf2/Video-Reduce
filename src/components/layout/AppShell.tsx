"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const PwaInstallBanner = dynamic(
  () => import("./PwaInstallBanner").then((mod) => mod.PwaInstallBanner),
  { ssr: false }
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#080c14] text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <PwaInstallBanner
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
