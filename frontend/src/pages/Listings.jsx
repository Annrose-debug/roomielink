import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listingAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Card   from "../components/common/Card";
import Button from "../components/common/Button";
import Input  from "../components/common/Input";
import toast  from "react-hot-toast";

const Listings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [saved,    setSaved]    = useState(new Set());
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [filters,  setFilters]  = useState({
    location:"", minPrice:"", maxPrice:"", bedrooms:"", furnished:"", petsAllowed:""
  });

  useEffect(() => { fetchListings(); }, [filters, page]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await listingAPI.getAll({ ...filters, page });
      console.log("Fetched listings:", data);
      setListings(data.listings || []);
      setPages(data.pages || 1);  // Fix: handle null pages
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Could not load listings");
    } finally { 
      setLoading(false); 
    }
  };

  const toggleSave = async (id) => {
    try {
      const { data } = await listingAPI.toggleSave(id);
      setSaved((p) => {
        const next = new Set(p);
        data.saved ? next.add(id) : next.delete(id);
        return next;
      });
      toast.success(data.saved ? "Saved! 🏠" : "Removed from saved");
    } catch { 
      toast.error("Could not save listing"); 
    }
  };

  const filterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="container-custom py-8">

        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-violet-900 mb-1" style={{fontFamily:"Nunito,sans-serif"}}>Browse Listings 🏠</h1>
            <p className="text-violet-600">Find your perfect student-friendly rental.</p>
          </div>
          <Link to="/listings/new">
            <Button variant="primary">+ Post a Listing</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-violet-50 border-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Input label="📍 Location" name="location" value={filters.location} onChange={filterChange} placeholder="City" />
            <Input label="💰 Min $" name="minPrice" type="number" value={filters.minPrice} onChange={filterChange} placeholder="0" />
            <Input label="💰 Max $" name="maxPrice" type="number" value={filters.maxPrice} onChange={filterChange} placeholder="5000" />
            <div className="mb-4">
              <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🛏 Bedrooms</label>
              <select name="bedrooms" value={filters.bedrooms} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                <option value="">Any</option>
                {[1,2,3,4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🛋 Furnished</label>
              <select name="furnished" value={filters.furnished} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🐾 Pets OK</label>
              <select name="petsAllowed" value={filters.petsAllowed} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="h-80 skeleton rounded-2xl" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏚️</div>
            <h2 className="text-xl font-black text-violet-700 mb-2" style={{fontFamily:"Nunito,sans-serif"}}>No listings found</h2>
            <p className="text-violet-500 mb-4">Try adjusting your filters, or be the first to post!</p>
            <Link to="/listings/new"><Button variant="primary">Post a Listing</Button></Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l) => {
                // Handle images - could be string or already parsed
                let imgs = [];
                if (l.images) {
                  if (typeof l.images === 'string') {
                    try {
                      imgs = JSON.parse(l.images);
                    } catch (e) {
                      imgs = [];
                    }
                  } else if (Array.isArray(l.images)) {
                    imgs = l.images;
                  }
                }
                const isSaved = saved.has(l.id);
                return (
                  <Card key={l.id} hover className="overflow-hidden p-0">
                    {/* Image */}
                    <div className="relative h-44 bg-gradient-to-br from-violet-100 to-coral-100">
                      {imgs[0] ? (
                        <img 
                          src={`http://localhost:5000${imgs[0]}`} 
                          alt={l.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class=\"w-full h-full flex items-center justify-center text-5xl\">🏠</div>'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
                      )}
                      {/* Save button */}
                      <button
                        onClick={() => toggleSave(l.id)}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all ${isSaved ? "bg-coral-500 text-white" : "bg-white text-coral-500 hover:bg-coral-50"}`}
                      >
                        {isSaved ? "❤️" : "🤍"}
                      </button>
                      {/* Price badge */}
                      <div className="absolute bottom-3 left-3 bg-violet-900/90 text-white text-sm font-black px-3 py-1 rounded-xl" style={{fontFamily:"Nunito,sans-serif"}}>
                        ${parseFloat(l.price).toLocaleString()}/mo
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-black text-violet-900 mb-1 truncate" style={{fontFamily:"Nunito,sans-serif"}}>{l.title}</h3>
                      <p className="text-xs text-violet-500 mb-2">📍 {l.location}</p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="badge badge-violet">🛏 {l.bedrooms} bed{l.bedrooms !== 1 ? 's' : ''}</span>
                        <span className="badge badge-mint">🚿 {l.bathrooms} bath{l.bathrooms !== 1 ? 's' : ''}</span>
                        {l.furnished === 1 && <span className="badge badge-yellow">🛋 Furnished</span>}
                        {l.petsAllowed === 1 && <span className="badge badge-coral">🐾 Pets OK</span>}
                      </div>

                      {l.description && (
                        <p className="text-xs text-violet-600 line-clamp-2 mb-3">{l.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-violet-200">
                            {l.ownerPic ? (
                              <img 
                                src={`http://localhost:5000${l.ownerPic}`} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class=\"w-full h-full flex items-center justify-center text-xs font-bold text-violet-600\">' + (l.ownerName?.[0] || '?') + '</div>'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-violet-600">{l.ownerName?.[0] || '?'}</div>
                            )}
                          </div>
                          <span className="text-xs text-violet-500">{l.ownerName}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/messages`)}>
                          💬 Contact
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p} 
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === p ? "bg-coral-500 text-white shadow-coral" : "bg-white text-violet-600 border border-violet-200 hover:bg-violet-50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Listings;