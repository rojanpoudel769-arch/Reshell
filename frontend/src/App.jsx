import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ItemDetail from './pages/ItemDetail';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import About from './pages/About';
import Sell from './pages/Sell';
import EditItem from './pages/EditItem';
import MessagesPage from './pages/MessagesPage';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, padding: '2rem 0' }}>
              <div className="container">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/items/:id" element={<ItemDetail />} />

                  {/* Protected (logged-in users) */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
                  <Route path="/edit-item/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

                  {/* Admin only */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
            {/* <Footer /> */}
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
