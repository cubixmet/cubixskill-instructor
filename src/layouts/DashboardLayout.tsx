import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";
import { Drawer } from "../components/ui/Drawer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/cn";

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-left overflow-x-hidden relative">
      {/* Fixed Sidebar for Desktop and Tablet */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        side="left"
        size="sm"
        title="Navigation"
        noPadding={true}
      >
        <Sidebar
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isMobileDrawer={true}
        />
      </Drawer>

      {/* Main Content Area - Left margin equals sidebar width with smooth transition */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 pb-16 md:pb-0 transition-all duration-300 ease-in-out min-h-screen",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Page Content with Smooth Transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenSidebar={() => setMobileSidebarOpen(true)} />
    </div>
  );
};
