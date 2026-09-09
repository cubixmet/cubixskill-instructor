import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";
import { MobileProfileDrawer } from "../components/layout/MobileProfileDrawer";
import { RouteScrollReset } from "../components/layout/RouteScrollReset";
import { Drawer } from "../components/ui/Drawer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/cn";

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-left overflow-x-hidden relative transition-colors duration-200">
      <RouteScrollReset scrollContainerSelector="main" />
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
        title="Academy Navigation"
        noPadding={true}
      >
        <Sidebar
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isMobileDrawer={true}
        />
      </Drawer>

      {/* Mobile Profile Action Drawer */}
      <MobileProfileDrawer
        isOpen={mobileProfileOpen}
        onClose={() => setMobileProfileOpen(false)}
      />

      {/* Main Content Area - Left margin equals sidebar width with smooth transition */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out min-h-screen",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Sticky Header */}
        <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* Page Content with Smooth Transition */}
        <main className="flex-1 px-3 py-4 sm:px-6 lg:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 overflow-y-auto no-scrollbar w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-6 w-full min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenProfile={() => setMobileProfileOpen(true)}
      />
    </div>
  );
};
