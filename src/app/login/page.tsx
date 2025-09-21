"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";

// 🚀 Force dynamic rendering (disable prerender/SSG for /login)
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
