import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle, Send } from "lucide-react";

export default function Discussion() {
  const [discussions, setDiscussions] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    axios.get("http://localhost:4000/api/discussions")
      .then(res => setDiscussions(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    try {
      const res = await axios.post("http://localhost:4000/api/discussions", form);
      setDiscussions([res.data, ...discussions]);
      setForm({ title: "", content: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-full border border-blue-400">
          <MessageCircle className="text-blue-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-blue-600">Discussion Starter</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-4 w-full max-w-md mb-6">
        <input
          type="text"
          placeholder="Title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg p-2 mb-2 outline-none focus:ring-2 focus:ring-blue-300"
        />
        <textarea
          placeholder="Start your discussion..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border rounded-lg p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Send size={16} /> Post Discussion
        </button>
      </form>

      <div className="w-full max-w-md space-y-4">
        {discussions.map((d) => (
          <div key={d._id} className="bg-white border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-800">{d.title}</h2>
            <p className="text-gray-600 mt-1">{d.content}</p>
            <p className="text-xs text-gray-400 mt-2 text-right">By {d.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

