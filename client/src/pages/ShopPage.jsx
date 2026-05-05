import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Check, ShoppingCart, Loader } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const ShopPage = () => {
  const navigate = useNavigate();
  const { user, token, updateUserProfile } = useGameStore();
  
  const [items, setItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/shop`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setOwnedItems(data.owned);
      }
    } catch (err) {
      console.error('Failed to fetch shop', err);
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (item) => {
    if (user.coins < item.price) {
      setError('Not enough coins!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setBuyingId(item.item_key);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/shop/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_key: item.item_key })
      });
      const data = await res.json();
      
      if (res.ok) {
        setOwnedItems([...ownedItems, item.item_key]);
        updateUserProfile({ coins: data.coins });
      } else {
        setError(data.error || 'Failed to buy item');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error buying item', err);
    } finally {
      setBuyingId(null);
    }
  };

  const renderItems = (typeFilter, title) => {
    const filtered = items.filter(i => i.type === typeFilter);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 t-text">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const isOwned = ownedItems.includes(item.item_key);
            const canAfford = user.coins >= item.price;
            
            return (
              <div key={item.id} className="relative p-4 rounded-2xl shadow-clay bg-clay-surface flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      item.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-600' :
                      item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-600' :
                      item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-600' :
                      'bg-gray-500/20 text-gray-600'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>
                  {isOwned ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                      <Check size={16} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-bold text-yellow-600">
                      <Coins size={16} />
                      {item.price}
                    </div>
                  )}
                </div>
                
                <div className="h-24 rounded-xl bg-black/5 flex items-center justify-center text-3xl opacity-50">
                  {/* Placeholder for item preview */}
                  {item.type === 'dice_skin' ? '🎲' : item.type === 'token_skin' ? '♟️' : '🗺️'}
                </div>

                {!isOwned && (
                  <button
                    onClick={() => buyItem(item)}
                    disabled={buyingId === item.item_key || !canAfford}
                    className={`w-full py-2 rounded-xl shadow-clay font-bold flex justify-center items-center gap-2 transition-all ${
                      !canAfford ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'bg-primary text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    {buyingId === item.item_key ? <Loader size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                    {canAfford ? 'Purchase' : 'Need more coins'}
                  </button>
                )}
                {isOwned && (
                  <button className="w-full py-2 rounded-xl shadow-clay font-bold bg-clay-surface text-gray-500 cursor-not-allowed">
                    Owned
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 pb-20 t-bg">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 rounded-3xl shadow-clay bg-clay-surface">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <ArrowLeft size={20} className="t-text" />
            </button>
            <h1 className="text-2xl font-black t-text">Cosmetics Shop</h1>
          </div>
          
          <div className="px-4 py-2 rounded-2xl bg-yellow-500/10 text-yellow-600 font-bold flex items-center gap-2">
            <Coins size={20} />
            {user?.coins || 0}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-center animate-bounce">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {renderItems('dice_skin', '🎲 Dice Skins')}
            {renderItems('token_skin', '♟️ Token Skins')}
            {renderItems('board_theme', '🗺️ Board Themes')}
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopPage;
