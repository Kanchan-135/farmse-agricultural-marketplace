import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Package, AlertCircle, Leaf } from 'lucide-react';
import { farmerApi, productApi, getMediaUrl } from '../../services/api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const FarmerProductsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await farmerApi.getProducts();
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load farmer products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleAvailability = async (product: Product) => {
    try {
      const updatedStatus = !product.isAvailable;
      const res = await productApi.update(product.id, { isAvailable: updatedStatus });
      if (res.data.success) {
        success(`Product ${updatedStatus ? 'is now Visible & Active' : 'Paused'}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isAvailable: updatedStatus } : p))
        );
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from listings?`)) {
      return;
    }

    try {
      const res = await productApi.delete(productId);
      if (res.data.success) {
        success('Product removed successfully');
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Produce & Harvest Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your crop listings, set real-time stock levels, and update prices.
          </p>
        </div>

        <Link
          to="/farmer/products/new"
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Harvest
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by produce name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading your inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No produce listings found</h3>
            <p className="text-xs text-gray-500">Start by listing your first harvest!</p>
            <Link
              to="/farmer/products/new"
              className="inline-block bg-brand-600 text-white text-xs font-bold px-6 py-2.5 rounded-full"
            >
              List Produce Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">Produce / Harvest</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price / Unit</th>
                  <th className="py-4 px-4">Stock Available</th>
                  <th className="py-4 px-4">Harvest Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? getMediaUrl(product.images[0])
                              : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{product.name}</span>
                            {product.isOrganic && (
                              <span title="Certified Organic">
                                <Leaf className="w-3.5 h-3.5 text-emerald-600 inline" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block">{product.location}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-700">
                      {product.category?.name || 'General'}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-900">₹{product.price}</span>
                      <span className="text-gray-400 text-[11px]">/{product.unit}</span>
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900">
                      {product.quantity} {product.unit}
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {product.harvestDate
                        ? new Date(product.harvestDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Immediate'}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          product.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-400" /> Paused
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/farmer/products/edit/${product.id}`}
                        className="inline-flex p-2 text-gray-500 hover:text-brand-700 hover:bg-gray-100 rounded-lg transition"
                        title="Edit Produce"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="inline-flex p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Produce"
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
