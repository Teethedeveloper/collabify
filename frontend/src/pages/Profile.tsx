import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Typed user interface
interface User {
  id: string;
  name: string;
  email: string;
  // add other fields your backend returns
}

// Typed form state
interface ProfileForm {
  name: string;
  email: string;
}

// Typed fetch response from backend
interface ProfileResponse {
  success?: boolean;
  user?: User;
  message?: string;
}

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Load user from localStorage + fetch fresh profile
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsed: User = JSON.parse(storedUser);
    setUser(parsed);
    setForm({ name: parsed.name || "", email: parsed.email || "" });

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: ProfileResponse = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          setForm({ name: data.user.name || "", email: data.user.email || "" });
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setError(data.message || "Failed to load profile.");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data: ProfileResponse = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEditing(false);
      } else {
        setError(data.message || "Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          <CardDescription>Manage your Collabify account details</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-red-500 bg-red-100 px-3 py-2 rounded-md mb-3">
              {error}
            </p>
          )}

          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={saving}
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={saving}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-full gradient-primary text-white"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p>
                <span className="font-medium">Name:</span> {user?.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user?.email}
              </p>

              <div className="flex gap-2">
                <Button
                  className="w-full gradient-primary text-white"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

