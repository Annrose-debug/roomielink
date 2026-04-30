import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listingAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Card   from "../components/common/Card";
import Button from "../components/common/Button";
import Input  from "../components/common/Input";
import Textarea from "../components/common/Textarea";
import toast  from "react-hot-toast";

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    title:"", description:"", price:"", location:"", address:"",
    bedrooms:"1", bathrooms:"1",
    furnished:"false", petsAllowed:"false", smokingOk:"false",
    availableFrom:"",
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.title || !form.price || !form.location)
    return toast.error("Title, price, and location are required");

  setLoading(true);
  try {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('location', form.location);
    fd.append('address', form.address);
    fd.append('bedrooms', form.bedrooms);
    fd.append('bathrooms', form.bathrooms);
    fd.append('furnished', form.furnished);
    fd.append('petsAllowed', form.petsAllowed);
    fd.append('smokingOk', form.smokingOk);
    fd.append('availableFrom', form.availableFrom);
    
    // Get images from file input
    const imageInput = document.querySelector('input[name="images"]');
    if (imageInput && imageInput.files) {
      for (let i = 0; i < imageInput.files.length; i++) {
        fd.append('images', imageInput.files[i]);
      }
    }
    
    const { data } = await listingAPI.create(fd);
    toast.success("Listing posted! 🏠");
    navigate("/listings");
  } catch (err) {
    console.error("Create listing error:", err);
    toast.error(err.response?.data?.message || "Could not post listing");
  } finally { setLoading(false); }
};
  const Toggle = ({ name, label }) => (
    <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
      <span className="text-sm font-semibold text-violet-700" style={{fontFamily:"Nunito,sans-serif"}}>{label}</span>
      <div className="flex gap-2">
        {["true","false"].map((v) => (
          <button key={v} type="button"
            onClick={() => setForm((p) => ({ ...p, [name]: v }))}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${form[name]===v ? "bg-coral-500 text-white" : "bg-white text-violet-500 border border-violet-200"}`}>
            {v === "true" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-violet-900 mb-1" style={{fontFamily:"Nunito,sans-serif"}}>Post a Listing 🏠</h1>
            <p className="text-violet-600">Help fellow students find great housing!</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Basic info */}
              <h2 className="text-lg font-black text-violet-800 mb-4" style={{fontFamily:"Nunito,sans-serif"}}>📋 Basic Info</h2>
              <Input label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cozy 2BR near campus" required />
              <div className="grid md:grid-cols-2 gap-3">
                <Input label="📍 Location *" name="location" value={form.location} onChange={handleChange} placeholder="City or neighbourhood" required />
                <Input label="🏠 Address" name="address" value={form.address} onChange={handleChange} placeholder="Street address (optional)" />
              </div>
              <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the place — size, nearby transport, vibe..." rows={4} />

              {/* Price & details */}
              <h2 className="text-lg font-black text-violet-800 mb-4 mt-2" style={{fontFamily:"Nunito,sans-serif"}}>💰 Price & Details</h2>
              <div className="grid md:grid-cols-3 gap-3">
                <Input label="Monthly Rent ($) *" name="price" type="number" value={form.price} onChange={handleChange} placeholder="900" required />
                <Input label="🛏 Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} min="1" max="10" />
                <Input label="🚿 Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} min="1" max="10" />
              </div>
              <Input label="📅 Available From" name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} />

              {/* Toggles */}
              <h2 className="text-lg font-black text-violet-800 mb-4 mt-2" style={{fontFamily:"Nunito,sans-serif"}}>🏷️ Features</h2>
              <div className="space-y-2 mb-6">
                <Toggle name="furnished"   label="🛋 Furnished" />
                <Toggle name="petsAllowed" label="🐾 Pets Allowed" />
                <Toggle name="smokingOk"   label="🚬 Smoking OK" />
              </div>

              {/* Image upload */}
              <h2 className="text-lg font-black text-violet-800 mb-3" style={{fontFamily:"Nunito,sans-serif"}}>📸 Photos (up to 5)</h2>
              <label className="block border-2 border-dashed border-violet-300 rounded-2xl p-6 text-center cursor-pointer hover:border-coral-400 hover:bg-coral-50 transition-all mb-4">
                <input type="file" name="images" multiple accept="image/*" onChange={handleImages} className="hidden" />
                <div className="text-4xl mb-2">📷</div>
                <p className="text-violet-600 font-semibold text-sm" style={{fontFamily:"Nunito,sans-serif"}}>Click to upload photos</p>
                <p className="text-violet-400 text-xs">JPG, PNG, WebP · Max 5 MB each · Up to 5 photos</p>
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-violet-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" variant="primary" size="lg" loading={loading}>Post Listing 🚀</Button>
                <Button type="button" variant="ghost" onClick={() => navigate("/listings")}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;