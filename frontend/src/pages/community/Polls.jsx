import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, Send } from "lucide-react";

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/polls");
      setPolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addOption = () => setOptions([...options, ""]);

  const updateOption = (i, val) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || options.some((o) => !o.trim())) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/polls",
        { question, options },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPolls([res.data, ...polls]);
      setQuestion("");
      setOptions(["", ""]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (id, index) => {
    try {
      const res = await axios.post(`http://localhost:4000/api/polls/${id}/vote`, { optionIndex: index });
      setPolls(polls.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
        <BarChart3 size={24} /> Community Polls
      </h1>

      {/* Create Poll Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl shadow-md max-w-lg w-full mb-8"
      >
        <input
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border w-full mb-3 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-300"
        />

        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="border w-full mb-2 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-green-300"
          />
        ))}

        <button
          type="button"
          onClick={addOption}
          className="text-green-600 mb-4 text-sm hover:underline"
        >
          + Add another option
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          <Send size={16} />
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>

      {/* Polls List */}
      <div className="space-y-6 w-full max-w-lg">
        {polls.map((p) => {
          const totalVotes = p.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <div
              key={p._id}
              className="bg-white shadow-md rounded-xl p-5 border border-green-100"
            >
              {/* Poll Header */}
              <h2 className="font-semibold text-gray-800 text-lg mb-1">
                {p.question}
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                Posted by {p.createdBy?.name || "Anonymous"}
              </p>

              {/* Poll Options */}
              {p.options.map((opt, i) => {
                const percentage =
                  totalVotes === 0
                    ? 0
                    : Math.round((opt.votes / totalVotes) * 100);
                return (
                  <div key={i} className="mb-3">
                    <button
                      onClick={() => vote(p._id, i)}
                      className="w-full relative text-left border rounded-lg px-4 py-2 hover:bg-green-50 transition flex justify-between items-center"
                    >
                      <span>{opt.text}</span>
                      <span className="text-sm text-gray-500">
                        {opt.votes} votes
                      </span>
                    </button>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-green-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {percentage}% of votes
                    </p>
                  </div>
                );
              })}

              {totalVotes > 0 && (
                <p className="text-xs text-gray-400 mt-3 text-right">
                  Total votes: {totalVotes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

