import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Briefcase, Wallet, User, Plus } from "lucide-react";
import "../App.css";

export default function BottomNav() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  // Different navigation items based on role
  const items = role === "client" ? [
    { to: "/client-dashboard", label: "Home", Icon: Home },
    { to: "/post-job", label: "Post Job", Icon: Plus },
    { to: "/myjobs", label: "My Jobs", Icon: Briefcase },
    { to: "/profile", label: "Profile", Icon: User },
  ] : [
    { to: "/dashboard", label: "Home", Icon: Home },
    { to: "/myjobs", label: "My Jobs", Icon: Briefcase },
    { to: "/wallet", label: "Wallet", Icon: Wallet },
    { to: "/profile", label: "Profile", Icon: User },
  ];

  return (
    <div className="appNav">
      {items.map((it) => {
        const isActive =
          location.pathname === it.to ||
          (it.to === "/dashboard" && location.pathname === "/") ||
          (it.to === "/client-dashboard" && location.pathname === "/");

        return (
          <NavLink
            key={it.to}
            to={it.to}
            className={isActive ? "navItem active" : "navItem"}
          >
            <div className={isActive ? "navCircle on" : "navCircle"}>
              <it.Icon
                size={22}
                strokeWidth={2.5}
                className="navIconSvg"
              />
            </div>

            <div className="navLabel">{it.label}</div>
          </NavLink>
        );
      })}
    </div>
  );
}