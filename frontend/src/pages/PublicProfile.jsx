import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-warm-50">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold text-violet-900">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />
      <div className="container-custom py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-gradient-to-br from-coral-200 to-violet-300 mb-4">
                {profile.profilePic ? (
                  <img 
                    src={`http://localhost:5000${profile.profilePic}`}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                    {profile.name?.[0] || "U"}
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-black text-violet-900 mb-2">{profile.name}</h1>
              
              {profile.location && (
                <p className="text-violet-600 mb-1"> {profile.location}</p>
              )}
              
              {profile.budget && (
                <p className="text-violet-600 mb-4"> {profile.budget}/month</p>
              )}
              
              {profile.bio && (
                <div className="text-left mt-4 pt-4 border-t border-violet-100">
                  <p className="text-violet-800">{profile.bio}</p>
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="primary" onClick={handleMessage}>
                  Send Message
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;