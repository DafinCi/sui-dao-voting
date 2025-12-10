import { Link, useLocation } from "react-router-dom";
import { Home, FileText, PlusCircle, Trophy } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: "/", icon: Home, label: "Overview" },
    { path: "/proposals", icon: FileText, label: "Proposals" },
    { path: "/create", icon: PlusCircle, label: "Create" },
    { path: "/results", icon: Trophy, label: "Results" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sui-dark/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="max-w-md mx-auto flex justify-around p-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) && item.path !== "/");
          return (
            <Link key={item.path} to={item.path} className="relative w-full">
              <div
                className={clsx(
                  "flex flex-col items-center py-2 rounded-xl transition-all active:scale-95",
                  isActive
                    ? "text-sui-blue"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-mono mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-0 w-12 h-1 bg-sui-blue rounded-full shadow-[0_0_10px_#4DA2FF]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
