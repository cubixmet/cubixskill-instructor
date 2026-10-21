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

  const isEditorRoute = /\/certificates(\/.*)?\/canvas$/.test(location.pathname);
  const isPersonalChatRoute = /\/discussions\/personal/.test(location.pathname);
  const isCommunityChatRoute = /\/discussions\/community/.test(location.pathname);
  const pathParts = location.pathname.split('/').filter(Boolean);

  const isPersonalChatWithStudent = isPersonalChatRoute && (
    pathParts.length > 2 && !['personal', 'discussions'].includes(pathParts[pathParts.length - 1])
  );
  const isCommunityChatWithCourse = isCommunityChatRoute && (
    pathParts.length > 2 && !['community', 'discussions'].includes(pathParts[pathParts.length - 1])
  );
  const isActiveLiveClassroom = /\/live-classroom\/[^/]+/.test(location.pathname);
  const isFullMobileChatActive = isPersonalChatWithStudent || isCommunityChatWithCourse || isActiveLiveClassroom;

  if (isEditorRoute) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
        <RouteScrollReset />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-background)] text-[var(--text-primary)] text-left overflow-x-hidden relative transition-colors duration-200">
      <RouteScrollReset scrollContainerSelector="main" />

      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </div>

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

      <MobileProfileDrawer
        isOpen={mobileProfileOpen}
        onClose={() => setMobileProfileOpen(false)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-out min-h-screen",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <div className={cn("sticky top-0 z-40", isFullMobileChatActive && "hidden md:block")}>
          <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
        </div>

        <main
          className={cn(
            "flex-1 overflow-y-auto no-scrollbar w-full min-w-0",
            isFullMobileChatActive
              ? "p-0 pb-0 md:px-6 md:py-7 md:pb-8 h-dvh md:h-auto"
              : "px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-7 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={cn(
                "w-full min-w-0",
                isFullMobileChatActive ? "max-w-none h-full" : "max-w-[1440px] mx-auto space-y-5 sm:space-y-6"
              )}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className={cn(isFullMobileChatActive && "hidden md:block")}>
        <MobileBottomNav
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          onOpenProfile={() => setMobileProfileOpen(true)}
        />
      </div>
    </div>
  );
};
