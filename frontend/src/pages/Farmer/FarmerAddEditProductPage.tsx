import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Leaf,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { productApi, categoryApi, uploadApi } from '../../services/api';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const FarmerAddEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEditing = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<number>(100);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<string>('kg');
  const [location, setLocation] = useState<string>('Nashik, Maharashtra');
  const [harvestDate, setHarvestDate] = useState<string>('');
  const [isOrganic, setIsOrganic] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    // Load categories
    categoryApi.getAll().then((res) => {
      if (res.data.success && res.data.data) {
        setCategories(res.data.data);
        if (!isEditing && res.data.data.length > 0) {
          setCategoryId(res.data.data[0].id);
        }
      }
    });

    // If editing, load existing product
    if (isEditing && id) {
      setLoading(true);
      productApi
        .getById(id)
        .then((res) => {
          if (res.data.success && res.data.data) {
            const p = res.data.data;
            setName(p.name);
            setDescription(p.description);
            setCategoryId(p.categoryId);
            setPrice(p.price);
            setOriginalPrice(p.originalPrice || '');
            setQuantity(p.quantity);
            setUnit(p.unit);
            setLocation(p.location);
            setHarvestDate(p.harvestDate ? p.harvestDate.split('T')[0] : '');
            setIsOrganic(p.isOrganic);
            setIsAvailable(p.isAvailable);
            setImages(p.images || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadApi.uploadFile(file);
      if (res.data.success && res.data.data) {
        setImages((prev) => [...prev, res.data.data.url]);
        success('Image uploaded successfully!');
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !categoryId) {
      toastError('Please fill out all required fields.');
      return;
    }

    if (images.length === 0) {
      // Add default image if none provided
      images.push('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
    }

    const payload: any = {
      name,
      description,
      categoryId,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      quantity: Number(quantity),
      unit,
      location,
      harvestDate: harvestDate ? new Date(harvestDate).toISOString() : null,
      isOrganic,
      isAvailable,
      images,
    };

    try {
      setLoading(true);
      if (isEditing && id) {
        await productApi.update(id, payload);
        success('Produce updated successfully!');
      } else {
        await productApi.create(payload);
        success('New harvest listed successfully!');
      }
      navigate('/farmer/products');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/farmer/products"
          className="text-xs font-bold text-gray-500 hover:text-brand-700 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
          {isEditing ? 'Editing Harvest Listing' : 'New Harvest Registration'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isEditing ? 'Edit Agricultural Produce' : 'List New Farm Harvest'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Provide transparent product details so customers can understand your soil origin and freshness.
          </p>
        </div>

        {/* 1. Core Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            1. Produce Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-gray-700">Crop / Produce Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Ratnagiri Alphonso Mangoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Farming Location / State *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nashik, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-gray-700">Detailed Description & Taste Profile *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe how the produce is grown, flavor profile, organic fertilizers used, storage recommendations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Pricing & Stock */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            2. Price & Harvest Inventory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Price (₹) *</label>
              <input
                type="number"
                required
                min={1}
                step="any"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Original Price (₹)</label>
              <input
                type="number"
                placeholder="Optional"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Quantity In Stock *</label>
              <input
                type="number"
                required
                min={0}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Measurement Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold cursor-pointer"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="litre">litre (Liquid/Milk/Ghee)</option>
                <option value="dozen">dozen (12 pcs)</option>
                <option value="pack">pack</option>
                <option value="crate">crate</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-gray-700">Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-900">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded accent-brand-600"
                />
                🌱 Certified Organic
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded accent-brand-600"
                />
                Available For Sale
              </label>
            </div>
          </div>
        </div>

        {/* 3. Product Media */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            3. Produce Photos & Media
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste high-res image URL (e.g. from Unsplash or cloud storage)..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 rounded-xl transition"
              >
                Add URL
              </button>
            </div>

            {/* Local upload option */}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-400 bg-brand-50/50 hover:bg-brand-50 text-brand-700 font-bold cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Or Upload Local Photo (JPG/PNG)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Images Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={img} alt="produce preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Submit Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Link
            to="/farmer/products"
            className="px-6 py-3.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-md transition"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Produce Listing' : 'Publish Harvest To Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
};
