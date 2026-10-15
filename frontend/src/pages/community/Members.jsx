
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Star } from "lucide-react";

export default function MemberHighlight() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchMembers = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/members");

        if (!cancelled) {
          const data = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.members)
              ? res.data.members
              : [];

          const sortedMembers = [...data].sort(
            (a, b) =>
              (Number(b.activityScore) || 0) -
              (Number(a.activityScore) || 0)
          );

          setMembers(sortedMembers);
        }
      } catch (err) {
        console.error("Error fetching member highlights:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load member highlights. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  const medalColors = [
    "text-yellow-500",
    "text-gray-400",
    "text-amber-700",
  ];

  const bgColors = [
    "bg-yellow-100",
    "bg-gray-100",
    "bg-amber-100",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center font-medium text-orange-700"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-orange-700">
          <Award className="text-orange-600" />
          Member Highlights
        </h1>

        <p className="text-gray-600">
          Celebrating the most active social activists and community
          contributors 🌍
        </p>
      </div>

      {loading && (
        <p className="py-10 text-center text-gray-500">
          Loading member highlights...
        </p>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-5 text-center">
          <p className="mb-3 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          No member highlights are available yet.
        </p>
      )}

      {!loading && !error && members.length > 0 && (
        <>
          {/* Top 3 Members */}
          <div className="mb-8 flex flex-wrap justify-center gap-6">
            {members.slice(0, 3).map((member, index) => (
              <div
                key={member._id || member.id || member.username || index}
                className={`flex w-64 flex-col items-center rounded-2xl p-5 shadow-md ${
                  bgColors[index]
                }`}
              >
                <div className={`mb-2 text-3xl ${medalColors[index]}`}>
                  <Star fill="currentColor" />
                </div>

                <img
                  src={
                    member.avatar ||
                    "https://placehold.co/80x80?text=User"
                  }
                  alt={member.username || "Community member"}
                  className="mb-3 h-16 w-16 rounded-full border-2 border-orange-500 object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/80x80?text=User";
                  }}
                />

                <h3 className="text-lg font-semibold text-gray-800">
                  {member.username || "Anonymous"}
                </h3>

                <p className="text-sm text-gray-600">
                  Activity Score:{" "}
                  {(Number(member.activityScore) || 0).toFixed(1)}
                </p>

                <p className="mt-1 text-center text-xs text-gray-500">
                  Posts: {Number(member.totalPosts) || 0} | Campaigns:{" "}
                  {Number(member.totalCampaigns) || 0}
                </p>
              </div>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="mx-auto max-w-5xl overflow-x-auto rounded-xl border border-orange-200 bg-white shadow-md">
            <table className="w-full min-w-[650px] text-left text-sm text-gray-700">
              <thead className="bg-orange-100 text-orange-700">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Posts</th>
                  <th className="px-4 py-3">Campaigns</th>
                  <th className="px-4 py-3">Votes</th>
                  <th className="px-4 py-3">Reports</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member, index) => (
                  <tr
                    key={
                      member._id ||
                      member.id ||
                      member.username ||
                      index
                    }
                    className="border-t transition hover:bg-orange-50"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {member.username || "Anonymous"}
                    </td>

                    <td className="px-4 py-3">
                      {Number(member.totalPosts) || 0}
                    </td>

                    <td className="px-4 py-3">
                      {Number(member.totalCampaigns) || 0}
                    </td>

                    <td className="px-4 py-3">
                      {Number(member.totalVotes) || 0}
                    </td>

                    <td className="px-4 py-3">
                      {Number(member.totalReports) || 0}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {(Number(member.activityScore) || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
