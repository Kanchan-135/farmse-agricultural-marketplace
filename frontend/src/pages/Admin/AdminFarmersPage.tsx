import React, { useState, useEffect } from 'react';
import { Tractor, CheckCircle2, XCircle, Search, ShieldCheck, MapPin, Star } from 'lucide-react';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminFarmersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [farmers, setFarmers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({ role: 'FARMER', limit: 50 });
      if (res.data.success && res.data.data) {
        setFarmers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleToggleApproval = async (farmerId: string) => {
    try {
      const res = await adminApi.toggleFarmerApproval(farmerId);
      if (res.data.success) {
        success('Farmer verification updated');
        fetchFarmers();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update farmer');
    }
  };

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farmerProfile?.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farmerProfile?.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Producer Verification & Farmer Oversight
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review, certify, or suspend registered farmers and inspect farm certifications.
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by farmer name, farm, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading farmer profiles...</div>
        ) : filteredFarmers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No farmers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">Farmer & Farm Entity</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Farm Size / Exp</th>
                  <th className="py-4 px-4">Listed Produce</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4">Verification</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFarmers.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            f.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              f.name
                            )}&background=d97706&color=fff`
                          }
                          alt={f.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{f.name}</p>
                          <p className="text-[11px] text-amber-800 font-semibold">
                            {f.farmerProfile?.farmName || 'Independent Farm'}
                          </p>
                          <span className="text-[10px] text-gray-400">{f.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {f.farmerProfile?.location || f.city || 'India'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {f.farmerProfile?.farmSizeAcres || 5} Acres • {f.farmerProfile?.experienceYears || 3} yrs
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900">
                      {(f as any)._count?.products || 0} Crops
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        {f.farmerProfile?.rating ? f.farmerProfile.rating.toFixed(1) : '5.0'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          f.isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Producer
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-amber-600" /> Pending Review
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleApproval(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                          f.isApproved
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {f.isApproved ? 'Suspend' : 'Approve & Verify'}
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
