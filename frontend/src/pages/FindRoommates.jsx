import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, matchAPI, messageAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Card   from "../components/common/Card";
import Button from "../components/common/Button";
import Input  from "../components/common/Input";
import toast  from "react-hot-toast";

/* ── Compatibility colour helper ── */
const scoreColor = (s) =>
  s >= 80 ? "text-green-600 bg-green-100" :
  s >= 60 ? "text-mint-600 bg-mint-100"   :
  s >= 40 ? "text-yellow-600 bg-yellow-100" :
            "text-red-500 bg-red-100";

const FindRoommates = () => {
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [allUsers,    setAllUsers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("suggestions");
  const [liked,       setLiked]       = useState(new Set());
  const [rejected,    setRejected]    = useState(new Set());

  // Browse filters
  const [filters, setFilters] = useState({ location:"", sleepSchedule:"", smoking:"", pets:"", socialLevel:"" });
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);

  useEffect(() => { 
    fetchSuggestions(); 
  }, []);

  useEffect(() => { 
    if (tab === "browse") {
      fetchBrowse(); 
    }
  }, [tab, filters, page]);

  const fetchSuggestions = async () => {
    setLoading(true);  // Make sure loading is set to true
    try {
      const { data } = await matchAPI.getSuggestions();
      console.log("Suggestions API response:", data); // DEBUG: Check what data looks like
      console.log("Number of suggestions:", data?.length); // DEBUG: Check count
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else if (data && Array.isArray(data.data)) {
        setSuggestions(data.data);
      } else if (data && data.users) {
        setSuggestions(data.users);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Suggestions error:", err);
      toast.error("Could not load suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);  // CRITICAL FIX: Always set loading to false
    }
  };

  const fetchBrowse = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.searchUsers({ ...filters, page });
      console.log("Browse API response:", data); // DEBUG
      
      if (data && Array.isArray(data.users)) {
        setAllUsers(data.users);
        setPages(data.pages || 1);
      } else if (Array.isArray(data)) {
        setAllUsers(data);
        setPages(1);
      } else {
        setAllUsers([]);
        setPages(1);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const { data } = await matchAPI.like(userId);
      setLiked((p) => new Set([...p, userId]));
      toast.success(data.message || "Like sent! 💕");
    } catch (err) {
      console.error("Like error:", err);
      toast.error("Something went wrong");
    }
  };

  const handleReject = async (userId) => {
    try {
      await matchAPI.reject(userId);
      setRejected((p) => new Set([...p, userId]));
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const filterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const UserCard = ({ u }) => {
    const isDone = liked.has(u.id) || rejected.has(u.id);
    return (
      <Card key={u.id} className={`relative transition-all duration-300 ${isDone ? "opacity-40 scale-95" : ""}`} hover>
        {/* Score badge */}
        {u.score !== undefined && (
          <div className={`absolute top-4 right-4 text-xs font-black px-2 py-1 rounded-full ${scoreColor(u.score)}`} style={{fontFamily:"Nunito,sans-serif"}}>
            {u.score}% match
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-coral-200 to-violet-300 shrink-0">
            {u.profilePic ? (
              <img 
                src={`http://localhost:5000${u.profilePic}`} 
                alt={u.name} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-white" style={{fontFamily:"Nunito,sans-serif"}}>{u.name?.[0] || '?'}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-violet-900 truncate" style={{fontFamily:"Nunito,sans-serif"}}>{u.name}</h3>
            {u.location && <p className="text-xs text-violet-500">📍 {u.location}</p>}
            {u.budget   && <p className="text-xs text-violet-500">💰 {u.budget}</p>}
          </div>
        </div>

        {u.bio && <p className="text-sm text-violet-700 mb-3 line-clamp-2">{u.bio}</p>}

        {/* Preference chips */}
        <div className="flex flex-wrap gap-1 mb-4">
          {u.sleepSchedule && <span className="badge badge-violet">{u.sleepSchedule === "early" ? "🌅 Early bird" : u.sleepSchedule === "night" ? "🦉 Night owl" : "😴 Flexible"}</span>}
          {u.smoking       && <span className="badge badge-coral">{u.smoking === "no" ? "🚫 Non-smoker" : u.smoking === "outside" ? "🌿 Outside only" : "🚬 Smoker"}</span>}
          {u.pets          && u.pets !== "neutral" && <span className="badge badge-mint">{u.pets === "love" ? "🐾 Pet lover" : u.pets === "no" ? "🚫 No pets" : "🤧 Allergic"}</span>}
          {u.socialLevel   && <span className="badge badge-yellow">{u.socialLevel === "quiet" ? "📚 Introvert" : u.socialLevel === "social" ? "🎉 Social" : "🤝 Moderate"}</span>}
        </div>

        {/* Interests */}
        {u.interests && (
          <div className="flex flex-wrap gap-1 mb-4">
            {u.interests.split(",").slice(0,4).map((t) => (
              <span key={t} className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{t.trim()}</span>
            ))}
          </div>
        )}

        {!isDone ? (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" fullWidth onClick={() => handleLike(u.id)}>💕 Like</Button>
            <Button variant="ghost"   size="sm" fullWidth onClick={() => handleReject(u.id)}>✕ Skip</Button>
            <Button variant="outline" size="sm" onClick={() => handleMessage(u.id)}>💬</Button>
          </div>
        ) : (
          <p className="text-center text-sm text-violet-400 font-semibold py-1">
            {liked.has(u.id) ? "💕 Liked!" : "✓ Skipped"}
          </p>
        )}
      </Card>
    );
  };

  // Show loading state properly
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <div className="container-custom py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
        </div>
      </div>
    );
  }

  const displayUsers = tab === "suggestions" ? suggestions : allUsers;
  const hasUsers = displayUsers && displayUsers.length > 0;

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="container-custom py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-violet-900 mb-1" style={{fontFamily:"Nunito,sans-serif"}}>Find Roommates 🔍</h1>
          <p className="text-violet-600">Browse students sorted by compatibility — the higher the %, the better the match!</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[["suggestions","✨ My Matches"],["browse","🔍 Browse All"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${tab === key ? "bg-coral-500 text-white shadow-coral" : "bg-white text-violet-600 border border-violet-200 hover:bg-violet-50"}`}
              style={{fontFamily:"Nunito,sans-serif"}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Browse filters */}
        {tab === "browse" && (
          <Card className="mb-6 bg-violet-50 border-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Input label="📍 Location" name="location" value={filters.location} onChange={filterChange} placeholder="City / campus" />
              <div className="mb-4">
                <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>😴 Sleep</label>
                <select name="sleepSchedule" value={filters.sleepSchedule} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                  <option value="">Any</option>
                  <option value="early">Early bird</option>
                  <option value="night">Night owl</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🚬 Smoking</label>
                <select name="smoking" value={filters.smoking} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                  <option value="">Any</option>
                  <option value="no">No smoking</option>
                  <option value="outside">Outside only</option>
                  <option value="okay">Okay</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🐾 Pets</label>
                <select name="pets" value={filters.pets} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                  <option value="">Any</option>
                  <option value="love">Love pets</option>
                  <option value="neutral">Neutral</option>
                  <option value="no">No pets</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-violet-700 mb-1.5" style={{fontFamily:"Nunito,sans-serif"}}>🎉 Social</label>
                <select name="socialLevel" value={filters.socialLevel} onChange={filterChange} className="w-full rounded-xl border-2 border-violet-200 px-3 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400">
                  <option value="">Any</option>
                  <option value="quiet">Introvert</option>
                  <option value="moderate">Moderate</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Results */}
        {!hasUsers ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-black text-violet-700 mb-2" style={{fontFamily:"Nunito,sans-serif"}}>No one found</h2>
            <p className="text-violet-500">
              {tab === "suggestions" ? "Complete your profile to get better suggestions!" : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayUsers.map((u) => (
                <UserCard key={u.id} u={u} />
              ))}
            </div>

            {/* Pagination (browse tab) */}
            {tab === "browse" && pages > 1 && (
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

export default FindRoommates;