import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { Input } from "@/components/Field";

function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      // error sudah ditangani & disimpan di AuthContext
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mj-green px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="mj-display text-center text-xl text-mj-green-dark">magangjogja</p>
        <p className="mb-6 text-center text-sm text-black/50">Admin Dashboard</p>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-mj-ink">Username</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-mj-ink">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-center text-sm text-red-600">{error}</p> : null}

        <Button type="submit" disabled={loading} className="mt-6 w-full">
          {loading ? "Masuk..." : "Masuk"}
        </Button>
      </form>
    </div>
  );
}

export default Login;
