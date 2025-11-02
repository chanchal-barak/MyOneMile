import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function Members() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/community/members")
      .then(res => setMembers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <Link to="/community" className="text-gray-500 hover:text-orange-500">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-full border border-orange-400">
            <Award size={26} className="text-orange-600" />
          </div>
          <h1 className="text-xl font-bold text-orange-600">Member Highlights</h1>
        </div>
        <div className="w-6" />
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 w-full max-w-md">
        <h2 className="font-semibold mb-4 text-gray-700 text-center">🏆 Top Contributors</h2>
        {members.length === 0 && <p className="text-center text-gray-400">No members yet</p>}
        {members.map((m, i) => (
          <div key={i} className="flex justify-between bg-gray-50 py-2 px-4 mb-2 rounded-lg hover:bg-orange-50">
            <span>{m.name}</span>
            <span className="font-semibold text-orange-500">{m.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
