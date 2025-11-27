import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, matchPath } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Typography from "./components/Typography";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Appointment = lazy(() => import("./pages/Appointment"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BlogManagement = lazy(() => import("./pages/BlogManagement"));
const CreateBlog = lazy(() => import("./pages/CreateBlog"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const JobManagement = lazy(() => import("./pages/JobManagement"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Insights = lazy(() => import("./pages/Insights"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const Careers = lazy(() => import("./pages/Careers"));
const EditJob = lazy(() => import("./pages/EditJob"));
const Studio = lazy(() => import("./pages/Studio"));
const StudioDetail = lazy(() => import("./pages/StudioDetail"));
const LearningStudio = lazy(() => import("./pages/Learning"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Typography variant="h5" color="muted" className="animate-pulse">
      Loading...
    </Typography>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
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
        </Suspense>

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
