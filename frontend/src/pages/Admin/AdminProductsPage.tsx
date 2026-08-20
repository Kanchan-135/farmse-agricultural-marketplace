import React, { useState, useEffect } from 'react';
import { Package, Trash2, Search, Leaf, CheckCircle2, XCircle } from 'lucide-react';
import { productApi, getMediaUrl } from '../../services/api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll({ limit: 50 });
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" as admin?`)) return;
    try {
      const res = await productApi.delete(id);
      if (res.data.success) {
        success('Product removed from platform catalog');
        fetchProducts();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to delete');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Global Product Catalog Oversight
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Inspect, moderate, or remove listed agricultural items across all farming hubs.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search produce, farmer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">Produce</th>
                  <th className="py-4 px-4">Farmer / Producer</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.images && p.images.length > 0
                              ? getMediaUrl(p.images[0])
                              : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <span className="text-[10px] text-gray-400">{p.location}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {p.farmer?.farmerProfile?.farmName || p.farmer?.name || 'Local Farmer'}
                    </td>

                    <td className="py-4 px-4 text-gray-600">{p.category?.name}</td>

                    <td className="py-4 px-4 font-bold text-gray-900">
                      ₹{p.price}/{p.unit}
                    </td>

                    <td className="py-4 px-4">
                      {p.quantity} {p.unit}
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-600">
                      ⭐ {p.rating > 0 ? p.rating.toFixed(1) : '5.0'} ({p.reviewCount})
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
