import React, { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, ShoppingBag, ShoppingCart, Minus, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import WatermarkedImage from '../components/WatermarkedImage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSupabaseData } from '../hooks/useSupabase';

export default function Products() {
  const { data: products, loading, insert, update, remove } = useSupabaseData<any>('products');
  const { data: clients } = useSupabaseData<any>('clients');
  const { insert: insertSale } = useSupabaseData<any>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryFee, setDeliveryFee] = useLocalStorage('delivery_fee', 15.00);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'pix',
    client_id: ''
  });

  const handleAddProduct = async () => {
    const newProduct = {
      name: "Novo Produto",
      price: 0,
      stock: 0,
      description: "Descrição do produto",
      img_url: ""
    };
    await insert(newProduct);
  };

  const updateProduct = async (id: string, updated: any) => {
    await update(id, updated);
  };

  const removeProduct = async (id: string) => {
    await remove(id);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.product.id === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      setCart(cart.filter(item => item.product.id !== productId));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const finalTotal = cartTotal + (deliveryMethod === 'delivery' ? deliveryFee : 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (checkoutStep === 'cart') {
      setCheckoutStep('details');
      return;
    }
    
    if (checkoutStep === 'details') {
      if (!customerDetails.name || !customerDetails.phone || (deliveryMethod === 'delivery' && !customerDetails.address)) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      setCheckoutStep('payment');
      return;
    }

    // Finalize
    for (const item of cart) {
      const newStock = Math.max(0, item.product.stock - item.quantity);
      await update(item.product.id, { stock: newStock });
    }

    // Record Sale
    try {
      await insertSale({
        client_id: customerDetails.client_id || null,
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        total_amount: finalTotal,
        delivery_method: deliveryMethod,
        payment_method: customerDetails.paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      });
    } catch (err) {
      console.error('Error recording sale:', err);
    }
    
    // Generate WhatsApp Message
    let message = `*Novo Pedido* 🛍️%0A%0A`;
    message += `*Cliente:* ${customerDetails.name}%0A`;
    message += `*Contato:* ${customerDetails.phone}%0A`;
    message += `*Entrega:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Retirada'}%0A`;
    if (deliveryMethod === 'delivery') {
      message += `*Endereço:* ${customerDetails.address}%0A`;
    }
    message += `*Pagamento:* ${customerDetails.paymentMethod.toUpperCase()}%0A%0A`;
    message += `*Itens:*%0A`;
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2)})%0A`;
    });
    message += `%0A*Subtotal:* R$ ${cartTotal.toFixed(2)}%0A`;
    if (deliveryMethod === 'delivery') {
      message += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}%0A`;
    }
    message += `*Total:* R$ ${finalTotal.toFixed(2)}`;

    window.open(`https://wa.me/?text=${message}`, '_blank');

    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('cart');
    setCustomerDetails({ name: '', phone: '', address: '', paymentMethod: 'pix' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f2ed]">
      <header className="sticky top-0 z-30 bg-[#f5f2ed]/90 backdrop-blur-xl border-b border-primary/10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium text-gray-900 leading-tight">Produtos</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium mt-0.5">Loja & Estoque</p>
          </div>
          <div className="flex items-center gap-3">
            {outOfStockCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{outOfStockCount} Esgotado(s)</span>
              </div>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center bg-white text-primary rounded-full shadow-sm border border-primary/20 hover:bg-primary/5 transition-all"
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleAddProduct}
              className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32 overflow-y-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-[1.5rem] border border-gray-100/50 bg-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onUpdate={(updated) => updateProduct(product.id, updated)}
              onDelete={() => removeProduct(product.id)}
              onAddToCart={() => addToCart(product)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-8 text-sm">Nenhum produto encontrado.</div>
          )}
        </div>
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full sm:w-[400px] sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={24} className="text-primary" /> 
                {checkoutStep === 'cart' ? 'Carrinho' : checkoutStep === 'details' ? 'Detalhes da Entrega' : 'Pagamento'}
              </h2>
              <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 min-h-[200px]">
              {checkoutStep === 'cart' && (
                cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                    <ShoppingBag size={48} className="opacity-20" />
                    <p className="text-sm">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h4>
                        <p className="text-primary font-semibold text-sm">R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-primary transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.product)} className="text-gray-400 hover:text-primary transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                    <button 
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${deliveryMethod === 'delivery' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                      Entrega
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${deliveryMethod === 'pickup' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                    >
                      Retirada
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Vincular Cliente (Opcional)</label>
                    <select 
                      value={customerDetails.client_id}
                      onChange={e => {
                        const client = clients.find((c: any) => c.id === e.target.value);
                        if (client) {
                          setCustomerDetails({
                            ...customerDetails,
                            client_id: client.id,
                            name: client.name,
                            phone: client.phone || ''
                          });
                        } else {
                          setCustomerDetails({...customerDetails, client_id: ''});
                        }
                      }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                    >
                      <option value="">Selecionar Cliente...</option>
                      {clients?.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    value={customerDetails.name}
                    onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  <input 
                    type="tel" 
                    placeholder="WhatsApp" 
                    value={customerDetails.phone}
                    onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                  {deliveryMethod === 'delivery' && (
                    <textarea 
                      placeholder="Endereço Completo (Rua, Número, Bairro, CEP, Complemento)" 
                      value={customerDetails.address}
                      onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm h-24 resize-none"
                    />
                  )}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 mb-2">Forma de Pagamento</h3>
                  <div className="space-y-2">
                    {['pix', 'cartao_credito', 'cartao_debito', 'dinheiro'].map(method => (
                      <label key={method} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${customerDetails.paymentMethod === method ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method}
                          checked={customerDetails.paymentMethod === method}
                          onChange={e => setCustomerDetails({...customerDetails, paymentMethod: e.target.value})}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                          {method.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              {checkoutStep !== 'cart' && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Taxa de Entrega</span>
                      <span>R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Total</span>
                <span className="text-2xl font-display font-bold text-primary">R$ {finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                {checkoutStep !== 'cart' && (
                  <button 
                    onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')}
                    className="px-6 py-4 rounded-2xl font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Voltar
                  </button>
                )}
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:shadow-none"
                >
                  {checkoutStep === 'payment' ? 'Confirmar Pedido' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onUpdate, onDelete, onAddToCart }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, img_url: imageUrl });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      ...editForm,
      price: parseFloat(editForm.price) || 0,
      stock: parseInt(editForm.stock) || 0
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-primary/30 flex flex-col gap-3 col-span-2 sm:col-span-1">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200 group/img">
          <WatermarkedImage src={editForm.img_url || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300&h=300"} alt="Upload" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm hover:bg-white transition-colors"
            >
              <ImageIcon size={16} /> Alterar Foto
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <input 
          type="text" 
          value={editForm.name || ''} 
          onChange={e => setEditForm({...editForm, name: e.target.value})}
          className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 font-medium text-gray-900 outline-none text-sm"
          placeholder="Nome do Produto"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Preço (R$)</label>
            <input 
              type="number" 
              value={editForm.price || ''} 
              onChange={e => setEditForm({...editForm, price: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-primary font-semibold outline-none text-sm"
              placeholder="0.00"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Estoque</label>
            <input 
              type="number" 
              value={editForm.stock || ''} 
              onChange={e => setEditForm({...editForm, stock: e.target.value})}
              className="w-full border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-1 text-gray-600 outline-none text-sm"
              placeholder="0"
            />
          </div>
        </div>
        <textarea 
          value={editForm.description || ''}
          onChange={e => setEditForm({...editForm, description: e.target.value})}
          className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-600 focus:border-primary focus:ring-0 resize-none h-16 outline-none"
          placeholder="Descrição..."
        />
        <div className="flex justify-between items-center pt-2">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(window.confirm('Excluir produto?')) onDelete(); }} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors">
            <Trash2 size={16} />
          </button>
          <div className="flex gap-2">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(false); }} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
              <X size={16} />
            </button>
            <button onClick={handleSave} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100/50 flex flex-col group relative overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={() => setIsEditing(true)}
          className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-gray-400 hover:text-primary rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
        >
          <Edit2 size={14} />
        </button>
      </div>
      
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 relative">
        <WatermarkedImage src={product.img_url || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300&h=300"} alt={product.name} className="w-full h-full object-cover" />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Esgotado</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Estoque: {product.stock}</p>
            <p className="text-primary font-bold">R$ {parseFloat(product.price).toFixed(2)}</p>
          </div>
          <button 
            onClick={onAddToCart}
            disabled={product.stock <= 0}
            className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary rounded-full transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
