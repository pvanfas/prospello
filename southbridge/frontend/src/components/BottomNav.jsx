import React, { useMemo } from "react";
import { Home, Truck, User, HandCoins, Route, LucideBox, Calendar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Build nav items based on role
  const navItems = useMemo(() => {
    if (user?.role === "service_provider") {
      // Service provider navigation: Home, Booking, Order, Profile
      return [
        { id: "Home", label: "Home", icon: Home, path: "/" },
        { id: "Booking", label: "Booking", icon: Calendar, path: "/service-booking" },
        { id: "Order", label: "Order", icon: LucideBox, path: "/orders" },
        { id: "Profile", label: "Profile", icon: User, path: "/profile" },
      ];
    }

    const base = [
      { id: "Home", label: "Home", icon: Home, path: "/" },
      { id: "Load", label: "Load", icon: Truck, path: "/load" },
      { id: "Orders", label: "Orders", icon: LucideBox, path: "/orders" },
      { id: "Profile", label: "Profile", icon: User, path: "/profile" },
    ];

    if (user?.role === "driver") {
      // Only drivers see Bids and Route
      base.splice(3, 0, { id: "Route", label: "Route", icon: Route, path: "/route" });
    }
    return base;
  }, [user?.role]);

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 rounded-t-xl shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors duration-200 min-w-0 flex-1"
            >
              {/* Icon */}
              <IconComponent
                size={22}
                className={`mb-0.5 transition-colors duration-200 ${
                  isActive
                    ? "text-orange-500 scale-110"
                    : "text-slate-500 hover:text-slate-600"
                }`}
              />

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-slate-600"
                }`}
              >
                {item.label}
              </span>

              {/* Bubble Effect */}
              {/* {isActive && (
                <span className="absolute bottom-9 w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
              )} */}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
