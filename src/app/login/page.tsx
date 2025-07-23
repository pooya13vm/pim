"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ user, pass }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("نام کاربری یا رمز عبور اشتباه است");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 400,
          color: "#000",
          padding: "40px",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>
          🔐 Login to system
        </h2>

        <label style={{ display: "block", marginBottom: 8 }}>Username</label>
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: 20,
            borderRadius: 6,
            border: "1px solid #ccc",
            outlineColor: "#0070f3",
          }}
        />

        <label style={{ display: "block", marginBottom: 8 }}>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: 20,
            borderRadius: 6,
            border: "1px solid #ccc",
            outlineColor: "#0070f3",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0059c1")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0070f3")}
        >
          ورود
        </button>

        {error && (
          <div
            style={{
              marginTop: 20,
              color: "#d93025",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
