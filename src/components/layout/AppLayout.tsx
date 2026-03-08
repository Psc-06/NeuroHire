import { ReactNode } from "react";
import ParticleField from "@/components/ParticleField";

interface AppLayoutProps {
  children: ReactNode;
  showParticles?: boolean;
  showDots?: boolean;
}

export default function AppLayout({ 
  children, 
  showParticles = true, 
  showDots = true 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen gradient-surface noise-bg">
      {showParticles && <ParticleField count={30} />}
      {showDots && <div className="fixed inset-0 dot-bg pointer-events-none opacity-20" />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
