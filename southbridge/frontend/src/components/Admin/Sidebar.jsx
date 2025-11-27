/* eslint-disable no-unused-vars */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Truck, 
  Ship, 
  Package, 
  CreditCard, 
  ClipboardList, 
  LogOut,
  X,
  User,
  Wrench
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeItem, onNavigation }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Broker', icon: Truck, path: '/broker' },
    { name: 'Driver', icon: User, path: '/driver' },
    { name: 'Shipper', icon: Ship, path: '/shipper' },
    { name: 'Load', icon: Package, path: '/load' },
    { name: 'Service', icon: Wrench, path: '/service' },
    { name: 'Payment', icon: CreditCard, path: '/payment' },
    { name: 'Order', icon: ClipboardList, path: '/order' },
  ];

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: { 
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  const itemVariants = {
    hover: { 
      x: 6,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  const handleNavigation = (itemName) => {
    onNavigation(itemName);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth >= 768) && (
        <>
          {/* Overlay for mobile */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/20 z-40 md:hidden"
            />
          )}

          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed md:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col border-r border-slate-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
                  <p className="text-sm text-slate-500 mt-1">Navigation Menu</p>
                </div>
                <button
                  onClick={onClose}
                  className="md:hidden text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.name;
                
                return (
                  <motion.button
                    key={item.name}
                    variants={itemVariants}
                    whileHover="hover"
                    onClick={() => handleNavigation(item.name)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-amber-500/10 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={22} />
                    <span className="font-medium text-base">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-200">
              <motion.button
                variants={itemVariants}
                whileHover="hover"
                onClick={() => alert('Logging out...')}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors shadow-md"
              >
                <LogOut size={22} />
                <span className="text-base">Logout</span>
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}