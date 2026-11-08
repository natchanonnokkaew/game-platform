import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth, type User } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      auth.set(data.token);
      navigate("/library");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="narrow">
      <h1>เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit}>
        <label>
          อีเมล
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          รหัสผ่าน
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
      <p className="muted">
        บัญชีทดสอบ (หลังรัน npm run seed): player@example.com / password123
      </p>
    </section>
  );
}
