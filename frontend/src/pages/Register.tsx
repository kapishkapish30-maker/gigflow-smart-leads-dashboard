import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "sales",
      });

      navigate("/login");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "350px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 0 20px rgba(255,255,255,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "32px",
            color: "black",
          }}
        >
          Register
        </h1>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={{ textAlign: "center", margin: 0 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {message && (
          <p style={{ color: "red", textAlign: "center" }}>{message}</p>
        )}
      </form>
    </div>
  );
}