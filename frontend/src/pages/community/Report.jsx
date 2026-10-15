
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      toast.error("Please log in to submit a report.");
      navigate("/login");
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

    if (reportedUsername.trim().toLowerCase() === user.username?.toLowerCase()) {
      toast.error("You cannot report your own account.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const payload = {
        reporterId: user._id,
        reportedUsername: reportedUsername.trim(),
        reason: selectedReason,
        details: details.trim(),
      };

      const res = await api.post("/reports", payload);

      toast.success(res.data?.message || "Report submitted successfully.");

      setReportedUsername("");
      setSelectedReason("");
      setDetails("");
      setSuccessOpen(true);
    } catch (error) {
      console.error("Report error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Your session may have expired. Please log in again.");
        navigate("/login");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Something went wrong while submitting the report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-white via-orange-50 to-orange-100 px-4 py-8">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-1/4 h-72 w-72 rounded-full bg-orange-200/40 opacity-60 blur-3xl"
      />

      {/* Glass header */}
      <div className="relative z-10 mb-8 flex w-full max-w-4xl items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex transform items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-orange-700 backdrop-blur-md transition hover:scale-105"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-center text-lg font-semibold text-orange-700 md:text-2xl">
          Report a User
        </h1>

        <div className="w-12" />
      </div>

      {/* Main card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur-lg md:p-10"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Keep the community safe
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your report will help our moderation team review the content
              quickly.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-white/20 bg-gradient-to-r from-orange-50 to-white/60 px-3 py-2 md:flex">
            <div className="h-3 w-3 rounded-full bg-orange-400 shadow-md" />
            <span className="text-sm text-gray-600">Confidential</span>
          </div>
        </div>

        {/* Reported username */}
        <div className="mb-6">
          <label
            htmlFor="reportedUsername"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Reported User (username)
          </label>

          <input
            id="reportedUsername"
            type="text"
            value={reportedUsername}
            onChange={(e) => setReportedUsername(e.target.value)}
            placeholder="e.g. cutie_pie"
            maxLength={100}
            autoComplete="off"
            className="w-full rounded-xl border border-white/40 bg-white/60 px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          />
        </div>

        {/* Reason grid */}
        <div className="mb-6">
          <p className="mb-3 block text-sm font-medium text-gray-700">
            Reason for report
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {REASONS.map((reason) => {
              const selected = selectedReason === reason;

              return (
                <motion.button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  whileTap={{ scale: 0.98 }}
                  layout
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium shadow-sm transition-all duration-200 ${
                    selected
                      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg"
                      : "border border-white/30 bg-white/70 text-gray-700 hover:scale-[1.02]"
                  }`}
                  aria-pressed={selected}
                >
                  <div
                    className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${
                      selected ? "bg-white/20" : "bg-orange-50"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        selected ? "text-white" : "text-orange-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="truncate">{reason}</div>
                    <div
                      className={`mt-0.5 text-xs ${
                        selected ? "text-orange-100" : "text-gray-400"
                      }`}
                    >
                      {selected ? "Selected" : "Tap to choose"}
                    </div>
                  </div>

                  <motion.span
                    initial={{ opacity: 0, x: 6 }}
                    animate={{
                      opacity: selected ? 1 : 0,
                      x: selected ? 0 : 6,
                    }}
                    transition={{ duration: 0.18 }}
                    className="flex-none"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div className="mb-6">
          <label
            htmlFor="reportDetails"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Additional details (optional)
          </label>

          <textarea
            id="reportDetails"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any extra context: post link, time, screenshots..."
            maxLength={5000}
            className="w-full resize-none rounded-xl border border-white/30 bg-white/60 px-4 py-3 transition focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {details.length}/5000
          </p>
        </div>

        {/* Submit row */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            <strong className="text-gray-700">Privacy:</strong> Reports are
            reviewed by our moderation team.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ml-auto inline-flex transform items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            aria-busy={loading}
          >
            <motion.span
              initial={{ x: -6, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Send className="h-4 w-4" />
            </motion.span>

            <span>{loading ? "Sending..." : "Send Report"}</span>

            {loading && (
              <svg
                className="ml-1 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                />
              </svg>
            )}
          </button>
        </div>
      </motion.form>

      {/* Success Modal */}
      <AnimatePresence>
        {successOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="report-success-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSuccessOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 8 }}
              className="w-full max-w-md rounded-2xl border border-white/30 bg-white/90 p-6 shadow-2xl backdrop-blur-lg"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-tr from-orange-400 to-orange-500 text-white shadow">
                  <Check className="h-6 w-6" />
                </div>

                <div>
                  <h3
                    id="report-success-title"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Report Submitted
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Thanks — our moderation team will review this shortly.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="rounded-lg border border-white/40 bg-white px-4 py-2 text-sm font-medium hover:shadow"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessOpen(false);
                    navigate("/help");
                  }}
                  className="transform rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 font-semibold text-white transition hover:scale-[1.02]"
                >
                  Get Help
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
