import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import About from './pages/About';
import Sell from './pages/Sell';
import EditItem from './pages/EditItem';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, padding: '2rem 0' }}>
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/sell" element={<Sell />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/items/:id" element={<ItemDetail />} />
                <Route path="/edit-item/:id" element={<EditItem />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
          {/* <Footer /> */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
