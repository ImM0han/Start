import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      height: "100vh",
      background: "#4CAF70",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white"
    }}>
      <h1>Gig App</h1>
      <p>Your tagline here</p>
    </div>
  );
}
