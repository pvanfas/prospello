import { Routes, Route, useLocation, matchPath } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Appointment from "./pages/Appointment";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BlogManagement from "./pages/BlogManagement";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import JobManagement from "./pages/JobManagement";
import CreateJob from "./pages/CreateJob";
import NotFound from "./pages/NotFound";
import Insights from "./pages/Insights";
import BlogDetails from "./pages/BlogDetails";
import Careers from "./pages/Careers";
import EditJob from "./pages/EditJob";
import Studio from "./pages/Studio";
import StudioDetail from "./pages/StudioDetail";
import LearningStudio from "./pages/Learning";

const App = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const hideNavbarAndFooterRoutes = [
    "/dashboard",
    "/admin/blogs",
    "/admin/blogs/new",
    "/admin/blogs/:id",
    "/admin/jobs",
    "/admin/jobs/new",
    "/admin/jobs/:id",
  ];

  const shouldHideNavbarAndFooter = hideNavbarAndFooterRoutes.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  return (
    <AuthProvider>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {!shouldHideNavbarAndFooter && <Navbar />}
        <Toaster position="top-right" />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/studio/:name" element={<StudioDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/learning" element={<LearningStudio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/blog/:id" element={<BlogDetails />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/blogs" element={<BlogManagement />} />
            <Route path="/admin/blogs/new" element={<CreateBlog />} />
            <Route path="/admin/blogs/:id" element={<EditBlog />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
            <Route path="/admin/jobs/new" element={<CreateJob />} />
            <Route path="/admin/jobs/:id" element={<EditJob />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        {!shouldHideNavbarAndFooter && <Footer />}
      </div>
    </AuthProvider>
  );
};

export default App;

// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import ComingSoon from "./pages/ComingSoon"; // Import your ComingSoon component
// import { AuthProvider } from "./context/AuthContext";

// const App = () => {
//   return (
//     <AuthProvider>
//       <div className="min-h-screen bg-white transition-colors duration-300">
//         {/* Remove Navbar since we don't need it for coming soon */}
//         <Toaster position="top-right" />

//         <Routes>
//           {/* Redirect all paths to the ComingSoon page */}
//           <Route path="*" element={<ComingSoon />} />
//         </Routes>

//         {/* Remove Footer since we don't need it for coming soon */}
//       </div>
//     </AuthProvider>
//   );
// };

// export default App;
