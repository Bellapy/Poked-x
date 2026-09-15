import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import CardDetails from './pages/CardDetails'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carta/:id" element={<CardDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
