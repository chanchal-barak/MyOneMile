
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Award, Medal } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

export default function Spotlight() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("common");
  const [commonData, setCommonData] = useState([]);
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "my" && !localStorage.getItem("token")) {
          if (!cancelled) {
            setMyData([]);
            setError("Please log in to view your spotlight.");
          }
          return;
        }

        const endpoint =
          activeTab === "common" ? "/spotlights/common" : "/spotlights/my";

        const res = await api.get(endpoint);

        if (cancelled) return;

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.spotlights)
            ? res.data.spotlights
            : [];

        if (activeTab === "common") {
          setCommonData(data);
        } else {
          setMyData(data);
        }
      } catch (err) {
        console.error("Spotlight fetch error:", err);

        if (!cancelled) {
          const message =
            err.response?.status === 401 || err.response?.status === 403
              ? "Please log in again to view your spotlight."
              : err.response?.data?.message ||
                "Failed to fetch spotlight data.";

          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const formatCategory = (category) => {
    if (!category) return "Community";

    if (category === "trending_post") return "Trending Post";
    if (category === "achievement") return "Milestone";

    return String(category)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? ""
      : parsedDate.toLocaleDateString();
  };

  const formatScore = (score) => {
    const numericScore = Number(score);
    return Number.isFinite(numericScore)
      ? numericScore.toLocaleString()
      : "0";
  };

  const handleRetry = () => {
    // Trigger a fresh request by changing tabs and returning to the current tab.
    setError("");
    setLoading(true);

    const endpoint =
      activeTab === "common" ? "/spotlights/common" : "/spotlights/my";

    api
      .get(endpoint)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.spotlights)
            ? res.data.spotlights
            : [];

        if (activeTab === "common") {
          setCommonData(data);
        } else {
          setMyData(data);
        }
      })
      .catch((err) => {
        console.error("Spotlight retry error:", err);
        setError(
          err.response?.data?.message || "Failed to fetch spotlight data."
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center font-medium text-orange-700"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-orange-700">🌟 Spotlight</h1>
        <p className="text-gray-600">
          Celebrate achievements and community impact
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("common")}
          className={`rounded-full px-4 py-2 font-semibold ${
            activeTab === "common"
              ? "bg-orange-600 text-white"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          Common Spotlight
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`rounded-full px-4 py-2 font-semibold ${
            activeTab === "my"
              ? "bg-orange-600 text-white"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          My Spotlight
        </button>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl space-y-4">
        {loading && (
          <p className="mt-10 text-center text-gray-500">
            Loading spotlight...
          </p>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-xl border border-orange-200 bg-white p-6 text-center">
            <p className="mb-4 text-gray-700">{error}</p>

            {error.toLowerCase().includes("log in") ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
              >
                Log in
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Common Spotlight */}
        {!loading && !error && activeTab === "common" && (
          <>
            {commonData.length > 0 ? (
              commonData.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {index < 3 ? (
                      <Medal
                        className={
                          index === 0
                            ? "shrink-0 text-orange-500"
                            : index === 1
                              ? "shrink-0 text-gray-400"
                              : "shrink-0 text-orange-600"
                        }
                        size={28}
                      />
                    ) : (
                      <Award
                        className="shrink-0 text-orange-400"
                        size={24}
                      />
                    )}

                    {item.user?.avatar && (
                      <img
                        src={item.user.avatar}
                        alt={item.user?.name || "Community member"}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">
                        {item.user?.name ||
                          item.user?.username ||
                          "Anonymous"}
                      </p>

                      <p className="text-xs uppercase tracking-wide text-orange-600">
                        {formatCategory(item.category)}
                      </p>

                      <p className="break-words text-sm text-gray-500">
                        {item.title || "Community achievement"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-bold text-orange-700">
                      #{index + 1} • {formatScore(item.score)}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-10 text-center text-gray-500">
                No spotlight data available yet ✨ Be the first to hit 100
                likes on a post or reach 1K posts!
              </p>
            )}
          </>
        )}

        {/* My Spotlight */}
        {!loading && !error && activeTab === "my" && (
          <>
            {myData.length > 0 ? (
              myData.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Star
                      className="shrink-0 text-orange-500"
                      size={24}
                    />

                    <div className="min-w-0">
                      <p className="break-words font-semibold text-gray-800">
                        {item.title || "Community achievement"}
                      </p>

                      <p className="text-xs uppercase tracking-wide text-orange-600">
                        {formatCategory(item.category)}
                      </p>

                      {item.description && (
                        <p className="break-words text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {formatDate(item.date)}
                    </p>

                    {item.score !== undefined &&
                      item.score !== null &&
                      Number.isFinite(Number(item.score)) && (
                        <p className="text-xs font-semibold text-orange-700">
                          Score: {formatScore(item.score)}
                        </p>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-10 text-center text-gray-600">
                <p className="text-lg font-semibold">
                  No spotlight unlocked yet ✨
                </p>

                <p className="mt-2 text-sm">
                  Post actively and engage with the community to unlock:
                </p>

                <ul className="mt-3 space-y-1 text-sm">
                  <li>
                    • Reach <span className="font-semibold">1K posts</span>
                  </li>
                  <li>
                    • Get <span className="font-semibold">100+ likes</span> on
                    a single post
                  </li>
                  <li>• Create posts that get super fast engagement 🚀</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
