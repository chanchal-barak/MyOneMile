import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3 } from "lucide-react";

export default function Trends() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/issues/trends")
      .then(res => setTrends(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-2 rounded-full border border-green-400">
          <BarChart3 className="text-green-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-green-600">Trending Categories</h1>
      </div>

      <div className="bg-white shadow-lg border rounded-2xl p-6 w-full max-w-md">
        {trends.length === 0 ? (
          <p className="text-center text-gray-500">No trending issues yet.</p>
        ) : (
          <ul className="space-y-3">
            {trends.map((t, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-50 border px-4 py-2 rounded-lg hover:bg-green-50 transition"
              >
                <span className="font-medium text-gray-700">#{t._id}</span>
                <span className="text-green-600 font-semibold">{t.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
