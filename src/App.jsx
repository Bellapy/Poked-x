import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { CardsProvider } from './context/CardsContext'
import { CartProvider } from './context/CartContext'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import CardDetails from './pages/CardDetails'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import PickCardToList from './pages/PickCardToList'
import Profile from './pages/Profile'
import PublishListing from './pages/PublishListing'
import Register from './pages/Register'
import TradeProposal from './pages/TradeProposal'

function Protected({ children, adminOnly }) {
  return (
    <RequireAuth adminOnly={adminOnly}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CardsProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />

              <Route path="/" element={<Protected><Home /></Protected>} />
              <Route path="/carta/:id" element={<Protected><CardDetails /></Protected>} />
              <Route path="/carrinho" element={<Protected><Cart /></Protected>} />
              <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
              <Route path="/perfil" element={<Protected><Profile /></Protected>} />
              <Route path="/publicar" element={<Protected><PickCardToList /></Protected>} />
              <Route path="/publicar/:itemId" element={<Protected><PublishListing /></Protected>} />
              <Route path="/troca/:listingId" element={<Protected><TradeProposal /></Protected>} />
              <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CardsProvider>
    </AuthProvider>
  )
}
