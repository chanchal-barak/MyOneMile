import { useEffect, useState } from "react";
import { Award, Star } from "lucide-react";
import axios from "axios";

export default function Spotlight() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/issues/reports/all")
      .then(res => {
        // Simulate “leaderboard” logic by user field
        const users = {};
        res.data.forEach(issue => {
          const name = issue.user?.name || "Anonymous";
          users[name] = (users[name] || 0) + 1;
        });
        const sorted = Object.entries(users)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }));
        setTopUsers(sorted.slice(0, 5));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-full border border-yellow-400">
          <Award className="text-yellow-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-yellow-600">Community Spotlight</h1>
      </div>

      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-5 border">
        {topUsers.length === 0 ? (
          <p className="text-center text-gray-500">No achievements yet.</p>
        ) : (
          <ul className="space-y-3">
            {topUsers.map((user, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg hover:bg-yellow-50 transition"
              >
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={18} />
                  <span className="font-medium text-gray-700">{user.name}</span>
                </div>
                <span className="font-semibold text-yellow-600">{user.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">🏅 Keep contributing to earn your badge!</div>
    </div>
  );
}

