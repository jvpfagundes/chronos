import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="md:hidden fixed inset-0 z-50">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed left-0 top-0 h-full w-64 bg-sidebar transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/logo_chronos.png" 
                alt="Chronos Logo" 
                className="h-8 w-8"
              />
              <img 
                src="/assets/logo_chronos_text.png"
                alt="Chronos" 
                className="h-6"
              />
            </div>
            <div className="w-10" />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}