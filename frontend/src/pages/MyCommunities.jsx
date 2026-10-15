import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  LogOut,
  Plus,
  Loader2,
} from "lucide-react";
import api from "../api/axios";

export default function MyCommunities() {
  const navigate = useNavigate();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCommunities([]);
        toast.error("Please log in to view your communities.");
        return;
      }

      const response = await api.get("/api/community/my");

      setCommunities(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Failed to load communities:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load your communities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleLeave = async (id) => {
    if (actionId) return;

    try {
      setActionId(id);

      await api.post(
        `/api/community/${encodeURIComponent(id)}/leave`,
        {}
      );

      setCommunities((previous) =>
        previous.filter((community) => community._id !== id)
      );

      toast.success("You left the community.");
    } catch (error) {
      console.error("Failed to leave community:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to leave the community."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleRejoin = async (id) => {
    if (actionId) return;

    try {
      setActionId(id);

      await api.post(
        `/api/community/${encodeURIComponent(id)}/join`,
        {}
      );

      toast.success("Rejoined successfully!");

      await fetchCommunities();
    } catch (error) {
      console.error("Failed to rejoin community:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to rejoin the community."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium shrink-0"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-blue-700 text-center">
          My Communities
        </h2>

        <button
          type="button"
          onClick={() => navigate("/community")}
          aria-label="Explore communities"
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <Users
            size={60}
            className="mx-auto text-blue-400 mb-2"
          />

          <p>You haven&apos;t joined any communities yet.</p>

          <button
            type="button"
            onClick={() => navigate("/community")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Explore Communities
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((community) => (
            <div
              key={community._id}
              className="bg-white rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition transform hover:scale-[1.02] flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full border border-blue-300">
                    <Users
                      className="text-blue-600"
                      size={24}
                    />
                  </div>

                  <h3 className="font-semibold text-blue-700 text-lg">
                    {community.name || "Unnamed community"}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {community.description ||
                    "No description available."}
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => handleLeave(community._id)}
                  disabled={actionId !== null}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                >
                  {actionId === community._id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut size={16} />
                  )}

                  {actionId === community._id
                    ? "Please wait..."
                    : "Leave"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}