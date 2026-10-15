import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { getIssueById } from "../api/issues";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchIssue = async () => {
      setLoading(true);
      setError("");
      setIssue(null);

      try {
        const response = await getIssueById(id);

        if (isMounted) {
          setIssue(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch issue:", err);

        if (isMounted) {
          setError(
            err.response?.status === 404
              ? "This issue could not be found."
              : err.response?.data?.message ||
                  "Failed to load issue details. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchIssue();
    } else {
      setError("Invalid issue ID.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin text-purple-600 mb-3" size={36} />
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={42} className="text-red-500 mb-3" />

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Unable to load issue
        </h2>

        <p className="text-gray-600 mb-5">
          {error || "This issue could not be found."}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium mb-5"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {issue.title || "Untitled issue"}
          </h1>

          {issue.image && (
            <img
              src={issue.image}
              alt={issue.title || "Reported issue"}
              className="mb-5 w-full max-h-[450px] object-cover rounded-xl"
            />
          )}

          <p className="text-gray-700 mb-5 leading-relaxed whitespace-pre-wrap">
            {issue.description || "No description provided."}
          </p>

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Reported by:{" "}
              <span className="font-medium text-gray-700">
                {issue.user?.name ||
                  issue.user?.username ||
                  "Unknown"}
              </span>
            </p>

            <p className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                Location: {issue.location || "Not specified"}
              </span>
            </p>

            <p className="text-sm text-gray-500">
              Category:{" "}
              <span className="text-gray-700">
                {issue.category || "Not specified"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}