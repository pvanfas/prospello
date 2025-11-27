import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Briefcase, Users, LogOut } from "lucide-react";

const Dashboard = () => {
  const adminCards = [
    {
      title: "Manage Blogs",
      description: "Create, edit, and manage blogs",
      icon: FileText,
      path: "/admin/blogs",
      color: "bg-blue-500",
    },
    {
      title: "Job Posts",
      description: "Create and manage job postings",
      icon: Briefcase,
      path: "/admin/jobs",
      color: "bg-red-500",
    },
  ];

  console.log("kuch bho console");

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-[#FDFCF6] h-screen">
      {/* Header */}
      <header className="bg-[#FDFCF6] shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Manage your content and settings.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={card.path}
                className="block bg-[#FDFCF6] rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
