import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "framer-motion";
import { AuthProvider } from "@/features/auth";
import { ThemeProvider } from "@/features/theme-switcher";
import { RouterProvider } from "@/shared/routing";
import { TooltipProvider } from "@/shared/ui/tooltip";

function ReducedMotionGate({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LazyMotion features={domAnimation} strict>
          <ReducedMotionGate>
            <TooltipProvider>
              <RouterProvider>{children}</RouterProvider>
            </TooltipProvider>
          </ReducedMotionGate>
        </LazyMotion>
      </AuthProvider>
    </ThemeProvider>
  );
}
