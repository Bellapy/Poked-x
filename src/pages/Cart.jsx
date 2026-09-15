import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items } = useCart()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Carrinho</h1>
      {items.length === 0 ? (
        <p className="text-white/50">Seu carrinho está vazio.</p>
      ) : (
        <p className="text-white/50">{items.length} item(ns) no carrinho — em construção.</p>
      )}
    </div>
  )
}
