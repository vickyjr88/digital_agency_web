import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Signup from './pages/auth/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import CreateBrand from './pages/dashboard/CreateBrand';
import BrandDetails from './pages/dashboard/BrandDetails';
import EditBrand from './pages/dashboard/EditBrand';
import EditContent from './pages/dashboard/EditContent';
import Login from './pages/auth/Login';

// Protected Route Component (Simplified for now)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Layout Component
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-bold text-purple-600">
            <LayoutDashboard className="w-8 h-8" />
            Dexter
          </Link>
          {/* Add more nav items if needed */}
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto p-4 w-full">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/brands/new" element={
            <ProtectedRoute>
              <Layout><CreateBrand /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/brands/:id" element={
            <ProtectedRoute>
              <Layout><BrandDetails /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/brands/:id/edit" element={
            <ProtectedRoute>
              <Layout><EditBrand /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/content/:id/edit" element={
            <ProtectedRoute>
              <Layout><EditContent /></Layout>
            </ProtectedRoute>
          } />
          {/* Add direct brand routes for public/legacy links */}
          <Route path="/brand/:id" element={<BrandDetails />} />
          <Route path="/brands/new" element={<CreateBrand />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
