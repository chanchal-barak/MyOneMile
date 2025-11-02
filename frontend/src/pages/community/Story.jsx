import { useState, useEffect } from "react";
import axios from "axios";
import { Image, Send } from "lucide-react";

export default function Story() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", author: "" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/api/stories")
      .then((res) => setStories(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (file) fd.append("image", file);

    try {
      const res = await axios.post("http://localhost:4000/api/stories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStories([res.data, ...stories]);
      setForm({ title: "", content: "", author: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <h1 className="text-2xl font-bold text-orange-600 mb-6 flex items-center gap-2">
        <Image size={24} /> Storytelling Posts
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 shadow-md rounded-lg mb-6 max-w-lg">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border w-full mb-2 rounded px-3 py-2"
        />
        <textarea
          placeholder="Share your story..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="border w-full mb-2 rounded px-3 py-2"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Send size={16} /> Post Story
        </button>
      </form>

      <div className="grid gap-4 max-w-lg">
        {stories.map((s) => (
          <div key={s._id} className="bg-white shadow rounded-lg p-4">
            {s.image && (
              <img
                src={s.image}
                alt=""
                className="rounded-lg mb-3 w-full h-48 object-cover"
              />
            )}
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="text-gray-600 mt-1">{s.content}</p>
            <p className="text-xs text-gray-400 mt-2 text-right">
              By {s.author || "Anonymous"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

