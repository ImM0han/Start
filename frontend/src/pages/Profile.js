import React, { useEffect, useRef, useState } from "react";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import "../App.css";

export default function Profile() {
  const role = localStorage.getItem("role"); // "partner" or "client"
  const nameLS = localStorage.getItem("name") || "";

  const [loading, setLoading] = useState(false);

  // user details
  const [name, setName] = useState(nameLS);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // partner skills
  const [skills, setSkills] = useState([]);

  // basic verification / settings
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState("Pending");
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  // Skills management
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const skillCategories = {
    "Construction & Labour Services": [
      "Mason (Raj Mistri)",
      "Construction Labour",
      "Tile Fitter",
      "Painter",
      "Plumber",
      "Electrician",
      "Carpenter",
      "POP/Ceiling Worker"
    ],
    "Home Cleaning & Daily Help": [
      "Full House Cleaning",
      "Bathroom Deep Cleaning",
      "Kitchen Deep Cleaning",
      "Sofa Cleaning",
      "Water Tank Cleaning",
      "Maid (Daily / Monthly)",
      "Office Cleaning",
      "Post-Construction Cleaning"
    ],
    "Repair & Installation Services": [
      "AC Repair",
      "Refrigerator Repair",
      "Washing Machine Repair",
      "Geyser Installation",
      "TV Mounting",
      "Inverter Repair",
      "RO Service"
    ],
    "Daily Wage": [
      "Event Labour (Marriage, Tent Setup)",
      "Loading/Unloading Workers",
      "Warehouse Helper",
      "Delivery Helper",
      "Farm Labour (Rural Market)",
      "Security Guard (Daily)",
      "Temporary Driver",
      "Hotel/Kitchen Helper",
      "Catering Staff"
    ]
  };

  const avatarInputRef = useRef(null);
  const aadhaarFileInputRef = useRef(null);

  const loadMe = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/me");
      const me = res.data;

      setName(me.name || nameLS);
      setPhone(me.phone || "");
      setEmail(me.email || "");
      setAddress(me.address || "");
      setAvatarUrl(me.avatarUrl || "");
      const userSkills = me.skills || [];
      setSkills(userSkills);
      setOriginalSkills([...userSkills]); // Store original skills
      setLanguage(me.language || "English");
      if (typeof me.pushNotifications === "boolean") {
        setPushNotifications(me.pushNotifications);
      }
      if (typeof me.biometric === "boolean") {
        setBiometric(me.biometric);
      }
      if (me.aadhaarNumber) setAadhaarNumber(me.aadhaarNumber);
      if (me.aadhaarDocUrl) setAadhaarDocUrl(me.aadhaarDocUrl);
      const verifiedFlag = !!(me.aadhaarVerified || me.verified);
      setAadhaarVerified(verifiedFlag);
      setAadhaarStatus(verifiedFlag ? "Verified" : "Pending");
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      await API.put("/auth/me", {
        name,
        phone,
        email,
        address,
        avatarUrl,
        skills,
        language,
        aadhaarNumber,
        aadhaarVerified,
        pushNotifications,
        biometric,
      });

      localStorage.setItem("name", name || "");
      localStorage.setItem("lang", language || "English");
      alert("Profile saved");
    } catch (err) {
      alert(err?.response?.data?.msg || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (s) => {
    setSkills((prev) => {
      if (prev.includes(s)) {
        // If skill is already selected, remove it
        return prev.filter((x) => x !== s);
      } else {
        // If adding a new skill, check if we're at the limit
        if (prev.length >= 3) {
          alert("You can select a maximum of 3 skills");
          return prev;
        }
        // Add the new skill
        return [...prev, s];
      }
    });
  };

  const toggleSkillModal = () => {
    setShowSkillsModal(!showSkillsModal);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Filter skills based on search term
  const filteredSkills = {};
  Object.keys(skillCategories).forEach(category => {
    if (searchTerm === "") {
      filteredSkills[category] = skillCategories[category];
    } else {
      filteredSkills[category] = skillCategories[category].filter(service =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

// Store original skills to reset when canceling
  const [originalSkills, setOriginalSkills] = useState([]);

  const handleSave = () => {
    // Update original skills to current skills when saving
    setOriginalSkills([...skills]);
    toggleSkillModal();
  };

  // Function to handle cancel (reset to original skills)
  const handleCancel = () => {
    // Reset to the original skills
    setSkills([...originalSkills]);
    toggleSkillModal();
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials =
    (name || "User")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const roleSubtitle =
    role === "partner"
      ? aadhaarVerified
        ? "Verified Partner"
        : "Not Verified"
      : "Client";

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleAadhaarFileClick = () => {
    if (aadhaarFileInputRef.current) {
      aadhaarFileInputRef.current.click();
    }
  };

  const handleAadhaarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAadhaarDocUrl(url);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  return (
    <div className="webShell">
      <div className="webContainer">
        <BottomNav />

        {/* Green header bar */}
        <div className="profileHeaderBar">
          <div className="profileHeaderTitle">Profile &amp; Verification</div>
          <button type="button" className="profileHeaderIcon">
            ⚙
          </button>
        </div>

        {/* Hero card with avatar + name */}
          <div className="profileHeroCard">
          <button
            type="button"
            className="profileAvatarCircle profileAvatarButton"
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <span
                className="profileAvatarImage"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              />
            ) : (
              initials
            )}
          </button>
          <div className="profileHeroInfo">
            <div className="profileName">{name || "Your Name"}</div>
            <div className="profileSubtitle">
              {skills.length > 0
                ? skills.join(" • ")
                : role === "partner"
                ? "Add your skills from below"
                : "Client"}
            </div>
            <div className="profileBadgeRow">
              <span
                className={
                  aadhaarVerified
                    ? "profileBadge profileBadgeVerified"
                    : "profileBadge profileBadgeNotVerified"
                }
              >
                {roleSubtitle}
              </span>
            </div>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        {/* Skills */}
        <div className="profileSection">
          <div className="profileSectionHeader">
            <div className="profileSectionTitle">Skills</div>
            <button
              type="button"
              className="profileLinkBtn"
              onClick={toggleSkillModal}
            >
              Manage Skills
            </button>
          </div>

          <p className="profileSectionHint">
            Select the services you provide so clients can find you.
          </p>

          <div className="skillsGrid">
            {skills.map((s) => (
              <button
                key={s}
                type="button"
                className="skillBtn active"
                onClick={() => toggleSkill(s)}
              >
                {s}
              </button>
            ))}
            {skills.length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                No skills selected. Click "Manage Skills" to add services.
              </p>
            )}
          </div>
        </div>

        {/* Aadhaar Verification */}
        <div className="profileSection">
          <div className="profileSectionHeader">
            <div className="profileSectionTitle">Aadhaar Verification</div>
            <span
              className={
                aadhaarVerified
                  ? "profileBadge profileBadgeVerified"
                  : "profileBadge profileBadgePending"
              }
            >
              {aadhaarStatus}
            </span>
          </div>

          <label className="profileFieldLabel">Aadhaar Number</label>
          <input
            type="text"
            className="profileInput"
            placeholder="XXXX XXXX 1234"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value)}
          />

          <div className="profileRowButtons">
            <button
              type="button"
              className="profileBtnSecondary"
              onClick={handleAadhaarFileClick}
            >
              {aadhaarDocUrl ? "Upload Again" : "Upload Document"}
            </button>
            <button
              type="button"
              className="profileBtnPrimary"
              onClick={async () => {
                try {
                  setLoading(true);
                  setAadhaarVerified(true);
                  setAadhaarStatus("Verified");
                  await API.put("/auth/me", {
                    aadhaarNumber,
                    aadhaarVerified: true,
                  });
                  alert("Aadhaar marked as verified");
                } catch (err) {
                  setAadhaarVerified(false);
                  setAadhaarStatus("Pending");
                  alert(
                    err?.response?.data?.msg || "Failed to verify Aadhaar"
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              Verify
            </button>
          </div>

          {aadhaarVerified && aadhaarDocUrl && (
            <button
              type="button"
              className="profileLinkBtn"
              style={{ marginTop: 8 }}
              onClick={() => {
                window.open(aadhaarDocUrl, "_blank");
              }}
            >
              View Document
            </button>
          )}

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            ref={aadhaarFileInputRef}
            style={{ display: "none" }}
            onChange={handleAadhaarFileChange}
          />
        </div>

        {/* Personal Details */}
        <div className="profileSection">
          <div className="profileSectionHeader">
            <div className="profileSectionTitle">Personal Details</div>
            <button type="button" className="profileLinkBtn">
              Edit
            </button>
          </div>

          <label className="profileFieldLabel">Full Name</label>
          <input
            type="text"
            className="profileInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="profileFieldLabel">Email</label>
          <input
            type="email"
            className="profileInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="profileFieldLabel">Phone Number</label>
          <input
            type="tel"
            className="profileInput"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="profileFieldLabel">Address</label>
          <textarea
            className="profileInput profileTextarea"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* App Settings */}
        <div className="profileSection">
          <div className="profileSectionTitle">App Settings</div>

          <div className="profileSettingRow">
            <div className="profileSettingLabel">Language</div>
            <select
              className="profileSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="profileSettingRow">
            <div className="profileSettingLabel">Push Notifications</div>
            <label className="profileToggle">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
              />
              <span className="profileToggleSlider" />
            </label>
          </div>

          <div className="profileSettingRow">
            <div className="profileSettingLabel">Biometric Login</div>
            <label className="profileToggle">
              <input
                type="checkbox"
                checked={biometric}
                onChange={(e) => setBiometric(e.target.checked)}
              />
              <span className="profileToggleSlider" />
            </label>
          </div>
        </div>

        <button
          className="blackBtn"
          onClick={saveProfile}
          disabled={loading}
          style={{ marginTop: 12, marginBottom: 8 }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="profileBtnSecondary"
          style={{ width: "100%", marginBottom: 20 }}
          onClick={handleLogout}
        >
          Logout
        </button>

        {/* Skills Management Modal */}
        {showSkillsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={toggleSkillModal}
          >
            <div className="bg-white rounded-2xl p-5 w-[90%] max-w-md max-h-[80vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold m-0">Manage Skills</h3>
                <button
                  type="button"
                  onClick={toggleSkillModal}
                  className="bg-transparent border-none text-xl cursor-pointer p-1 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl text-sm"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  🔍
                </span>
              </div>
              
              {/* Skills List */}
              {Object.entries(filteredSkills).map(([category, services]) => (
                services.length > 0 && (
                  <div key={category} className="mb-4">
                    <h4 
                      className="my-2 mx-0 text-base font-semibold cursor-pointer flex items-center"
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="mr-2">
                        {(expandedCategory === category || searchTerm) ? "▼" : "►"}
                      </span>
                      <span className="text-gray-700 flex-1">{category}</span>
                      {searchTerm && (
                        <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                          {services.length}
                        </span>
                      )}
                    </h4>
                    
                    {(expandedCategory === category || searchTerm) && (
                      <div className="flex flex-col gap-2 pl-5">
                        {services.map((service) => (
                          <div key={service} className={`flex items-center p-3 border border-gray-200 rounded-lg ${
                            skills.includes(service) ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <span className="flex-1">{service}</span>
                            <label className="profileToggle ml-3">
                              <input
                                type="checkbox"
                                checked={skills.includes(service)}
                                onChange={() => toggleSkill(service)}
                              />
                              <span className="profileToggleSlider" />
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
              
              {/* Display selected skills count */}
              <div className="text-center my-3 text-sm text-gray-600">
                Selected: {skills.length}/3 skills
              </div>
              
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  className="profileBtnSecondary flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="profileBtnPrimary flex-1"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
