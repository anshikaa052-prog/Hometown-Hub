import { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    city: "",
    state: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await API.get("/profile");
        const user = response.data.user;

        setProfile(user);

        setFormData({
          name: user.name || "",
          bio: user.bio || "",
          city: user.hometown?.city || "",
          state: user.hometown?.state || "",
          country: user.hometown?.country || "",
        });
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await API.put("/profile", {
        name: formData.name,
        bio: formData.bio,
        hometown: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
      });

      setProfile(response.data.user);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploading(true);

      const data = new FormData();
      data.append("profilePic", file);

      const response = await API.post("/profile/picture", data);

      setProfile((prev) => ({
        ...prev,
        profilePic: response.data.profilePic,
      }));

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message || "Profile picture upload failed"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return <div className="profile-message">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-message">Profile not found.</div>;
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <header className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </header>

        <div className="profile-picture-section">
          <img
            className="profile-picture"
            src={
              profile.profilePic ||
              "https://placehold.co/140x140?text=Profile"
            }
            alt="Profile"
          />

          <div className="profile-upload">
            <label htmlFor="profile-picture-input">
              Profile picture
            </label>

            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              onChange={handleProfilePicture}
              disabled={uploading}
            />

            {uploading && <p className="profile-status">Uploading...</p>}
          </div>
        </div>

        <div className="profile-email">
          <span>Email address</span>
          <p>{profile.email}</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              name="bio"
              placeholder="Tell your community about yourself"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="profile-location-grid">
            <div className="profile-field">
              <label htmlFor="profile-city">City</label>
              <input
                id="profile-city"
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-state">State</label>
              <input
                id="profile-state"
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-country">Country</label>
              <input
                id="profile-country"
                type="text"
                name="country"
                placeholder="Enter country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="profile-save-button"
            type="submit"
            disabled={saving || uploading}
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Profile;
