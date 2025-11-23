import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { useUser } from "../../context/UserContext";

const REASONS = [
  "Harassment",
  "Abusive Language",
  "Violent Content",
  "Threats",
  "Cyberbullying",
  "Fake News",
  "Nudity",
  "Spam",
  "Suicidal Things",
  "Other",
];

export default function Report() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [reportedUsername, setReportedUsername] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      toast.error("You must be logged in to submit a report.");
      return;
    }

    if (!reportedUsername.trim()) {
      toast.error("Please enter the username of the user you want to report.");
      return;
    }

    if (!selectedReason) {
      toast.error("Please select a reason for the report.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        reporterId: user._id,
        reportedUsername: reportedUsername.trim(),
        reason: selectedReason,
        details,
      };

      const res = await api.post("/reports", payload);

      toast.success(res.data?.message || "Report submitted successfully.");

      // reset form
      setReportedUsername("");
      setSelectedReason("");
      setDetails("");
    } catch (error) {
      console.error("Report error:", error);

      const msg =
        error?.response?.data?.message ||
        "Something went wrong while submitting the report.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-purple-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-xl md:text-2xl font-semibold text-purple-700">
          Report User
        </h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Content */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white shadow-md rounded-2xl p-4 md:p-8 mb-10"
      >
        <p className="text-gray-500 mb-6">
          Help us keep the community safe and respectful.
        </p>

        {/* Reported username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reported User (Username)
          </label>
          <input
            type="text"
            value={reportedUsername}
            onChange={(e) => setReportedUsername(e.target.value)}
            placeholder="Enter username (e.g. cutie_pie)"
            className="w-full border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Reasons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reason for Report
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm font-medium transition
                  ${
                    selectedReason === reason
                      ? "bg-purple-600 text-white border-purple-600 shadow"
                      : "bg-white text-gray-700 border-purple-200 hover:border-purple-400"
                  }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{reason}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Details (optional)
          </label>
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe what happened. This helps our team understand the situation better."
            className="w-full border border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl py-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send Report"}
        </button>
      </form>
    </div>
  );
}
