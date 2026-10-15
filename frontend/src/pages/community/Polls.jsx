
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Poll() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [votingPollId, setVotingPollId] = useState("");
  const [clearingPollId, setClearingPollId] = useState("");

  const [form, setForm] = useState({
    question: "",
    options: ["", ""],
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchPolls = async () => {
    setLoadError("");

    try {
      const res = await axios.get("/polls");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.polls)
          ? res.data.polls
          : [];

      setPolls(data);
    } catch (err) {
      console.error("Failed to load polls:", err);

      setLoadError(
        err.response?.data?.message || "Failed to load polls."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const requireLogin = () => {
    if (!token) {
      toast.error("Please log in to continue.");
      navigate("/login");
      return false;
    }

    return true;
  };

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return String(value._id || value.id || "");
    }
    return String(value);
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!requireLogin() || votingPollId || clearingPollId) return;

    setVotingPollId(pollId);

    try {
      await axios.post(`/polls/${pollId}/vote`, {
        optionIndex,
      });

      await fetchPolls();
      toast.success("Vote submitted.");
    } catch (err) {
      console.error("Failed to vote:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Your session may have expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to vote.");
      }
    } finally {
      setVotingPollId("");
    }
  };

  const handleClearVote = async (pollId) => {
    if (!requireLogin() || clearingPollId || votingPollId) return;

    setClearingPollId(pollId);

    try {
      await axios.post(`/polls/${pollId}/vote`, {
        clear: true,
      });

      await fetchPolls();
      toast.success("Vote cleared.");
    } catch (err) {
      console.error("Failed to clear vote:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Your session may have expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to clear vote.");
      }
    } finally {
      setClearingPollId("");
    }
  };

  const handleCreatePoll = async (event) => {
    event.preventDefault();

    if (!requireLogin() || creating) return;

    const question = form.question.trim();
    const validOptions = form.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!question) {
      toast.error("Please enter a poll question.");
      return;
    }

    if (validOptions.length < 2) {
      toast.error("Please provide at least two options.");
      return;
    }

    const uniqueOptions = new Set(
      validOptions.map((option) => option.toLowerCase())
    );

    if (uniqueOptions.size !== validOptions.length) {
      toast.error("Please remove duplicate options.");
      return;
    }

    setCreating(true);

    try {
      await axios.post("/polls", {
        question,
        options: validOptions,
      });

      toast.success("Poll created successfully.");
      setShowForm(false);
      setForm({ question: "", options: ["", ""] });

      await fetchPolls();
    } catch (err) {
      console.error("Failed to create poll:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Please log in again to create a poll.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to create poll.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 px-5 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center font-medium text-orange-600"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <h2 className="mb-6 text-center text-2xl font-extrabold text-orange-700 sm:text-3xl">
        Community Polls 📊
      </h2>

      <div className="mx-auto max-w-3xl space-y-6 pb-20">
        {loading && (
          <p className="py-8 text-center text-gray-500">Loading polls...</p>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-red-200 bg-white p-5 text-center">
            <p className="mb-3 text-red-600">{loadError}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchPolls();
              }}
              className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && polls.length === 0 && (
          <div className="rounded-xl border border-orange-100 bg-white p-6 text-center text-gray-500">
            No polls available yet. Create the first poll!
          </div>
        )}

        {!loadError &&
          polls.map((poll) => {
            const options = Array.isArray(poll.options) ? poll.options : [];
            const voters = Array.isArray(poll.voters) ? poll.voters : [];

            const totalVotes = options.reduce(
              (total, option) => total + (Number(option.votes) || 0),
              0
            );

            const myVote = userId
              ? voters.find((voter) => getId(voter.user) === getId(userId))
              : null;

            return (
              <div
                key={poll._id}
                className="rounded-2xl border border-orange-100 bg-white p-4 shadow-md sm:p-5"
              >
                <h3 className="mb-3 text-lg font-semibold text-orange-800 sm:text-xl">
                  {poll.question}
                </h3>

                <div className="space-y-3">
                  {options.map((option, index) => {
                    const votes = Number(option.votes) || 0;
                    const percentage =
                      totalVotes === 0 ? 0 : (votes / totalVotes) * 100;

                    const voted = Number(myVote?.optionIndex) === index;
                    const busy =
                      votingPollId === poll._id ||
                      clearingPollId === poll._id;

                    return (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => handleVote(poll._id, index)}
                          disabled={Boolean(busy)}
                          className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 ${
                            voted
                              ? "border-orange-600 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                              : "border-orange-200 bg-orange-50 text-gray-800 hover:bg-orange-100"
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-0 h-full rounded-xl ${
                              voted ? "bg-white/20" : "bg-orange-200/40"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative">
                            <div className="font-medium">{option.text}</div>
                            <div className="mt-1 text-xs opacity-80 sm:text-sm">
                              {votes} votes ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  Total votes: {totalVotes}
                </p>

                {myVote && (
                  <button
                    type="button"
                    onClick={() => handleClearVote(poll._id)}
                    disabled={
                      clearingPollId === poll._id ||
                      votingPollId === poll._id
                    }
                    className="mt-2 text-sm text-orange-600 underline disabled:opacity-50"
                  >
                    {clearingPollId === poll._id
                      ? "Clearing vote..."
                      : "Clear my vote"}
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => {
          if (requireLogin()) setShowForm(true);
        }}
        aria-label="Create a poll"
        className="fixed bottom-6 right-6 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow-xl sm:bottom-8 sm:right-8"
      >
        <Plus size={22} />
      </button>

      {/* Create Poll Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !creating) {
              setShowForm(false);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
            <button
              type="button"
              onClick={() => !creating && setShowForm(false)}
              aria-label="Close poll form"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="mb-4 text-xl font-bold text-orange-700">
              Create a Poll
            </h3>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <input
                type="text"
                value={form.question}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    question: event.target.value,
                  }))
                }
                placeholder="Enter question"
                maxLength={300}
                className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />

              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => {
                      const updatedOptions = [...form.options];
                      updatedOptions[index] = event.target.value;

                      setForm((prev) => ({
                        ...prev,
                        options: updatedOptions,
                      }));
                    }}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />

                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          options: prev.options.filter(
                            (_, optionIndex) => optionIndex !== index
                          ),
                        }))
                      }
                      aria-label={`Remove option ${index + 1}`}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                disabled={form.options.length >= 10}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    options: [...prev.options, ""],
                  }))
                }
                className="text-sm text-orange-600 disabled:opacity-50"
              >
                + Add another option
              </button>

              <button
                type="submit"
                disabled={creating}
                className="mt-1 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Poll"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
