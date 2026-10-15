
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const API_ROOT = (
  import.meta.env.VITE_API_BASE || "https://myonemile.onrender.com/api"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

const resolveImageUrl = (img) => {
  if (!img || typeof img !== "string") return "";

  if (/^https?:\/\//i.test(img)) return img;

  const path = img.replace(/^\/+/, "");
  return `${API_ROOT}/${path}`;
};

export default function Story() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [impact, setImpact] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStories = async () => {
      try {
        setLoading(true);

        const res = await api.get("/stories");
        const data = res.data;

        if (!cancelled) {
          setStories(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.stories)
                ? data.stories
                : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err.response?.data?.message || "Failed to load stories"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const input = e.target;

    if (files.length > 4) {
      toast.error("You can upload up to 4 images");
      input.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      toast.error("Please select image files only");
      input.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      toast.error("Each image must be 5 MB or smaller");
      input.value = "";
      return;
    }

    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !issueSummary.trim()) {
      toast.error("Please fill title and issue summary");
      return;
    }

    if (title.trim().length > 150) {
      toast.error("Title must be 150 characters or fewer");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to share a story");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("issueSummary", issueSummary.trim());
      formData.append("impact", impact.trim());
      formData.append("location", location.trim());

      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/stories", formData);

      toast.success("Story shared successfully!");

      const createdStory = res.data?.story;

      if (createdStory) {
        setStories((prev) => [
          createdStory,
          ...prev.filter((story) => story._id !== createdStory._id),
        ]);
      } else {
        // Refresh the list if the backend doesn't return the created story.
        try {
          const refreshed = await api.get("/stories");
          const data = refreshed.data;

          setStories(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.stories)
                ? data.stories
                : []
          );
        } catch {
          // The story was submitted successfully; keep the existing list.
        }
      }

      setTitle("");
      setIssueSummary("");
      setImpact("");
      setLocation("");
      setImages([]);

      const fileInput = document.getElementById("story-images");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create story"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-orange-700 font-medium mb-4"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-orange-700">
            ✨ Impact Stories
          </h1>
          <p className="text-gray-600 mt-1">
            Share how your issue got resolved and inspire others in the
            community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 space-y-4"
        >
          <div>
            <label
              htmlFor="story-title"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              id="story-title"
              type="text"
              maxLength={150}
              required
              className="w-full border border-orange-200 rounded-xl px-3 py-2"
              placeholder="e.g. Street lights finally fixed in my area"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="story-summary"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Issue &amp; how it was resolved *
            </label>
            <textarea
              id="story-summary"
              required
              maxLength={5000}
              className="w-full border border-orange-200 rounded-xl px-3 py-2 h-24 resize-y"
              placeholder="Describe your issue..."
              value={issueSummary}
              onChange={(e) => setIssueSummary(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="story-impact"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Impact / Result (optional)
            </label>
            <textarea
              id="story-impact"
              maxLength={2000}
              className="w-full border border-orange-200 rounded-xl px-3 py-2 h-20 resize-y"
              placeholder="How did this change help?"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="story-location"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Location (optional)
            </label>
            <input
              id="story-location"
              type="text"
              maxLength={200}
              className="w-full border border-orange-200 rounded-xl px-3 py-2"
              placeholder="Area / city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="story-images"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Photos (optional)
            </label>

            <label
              htmlFor="story-images"
              className="flex items-center justify-between border-2 border-dashed border-orange-200 rounded-xl px-3 py-3 cursor-pointer text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={20} />
                <span>Add up to 4 images (5 MB each)</span>
              </div>

              <input
                id="story-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {images.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {images.length} image(s) selected:{" "}
                {images.map((file) => file.name).join(", ")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-full transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {submitting ? "Sharing..." : "Share Story"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-orange-800 mb-3">
            Community stories
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading stories...</p>
          ) : stories.length === 0 ? (
            <p className="text-gray-500">No stories yet.</p>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <article
                  key={story._id}
                  className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {story.user?.avatar && (
                      <img
                        src={resolveImageUrl(story.user.avatar)}
                        alt={story.user?.name || "Story author"}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <div>
                      <p className="font-semibold text-gray-800">
                        {story.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {story.createdAt &&
                        !Number.isNaN(new Date(story.createdAt).getTime())
                          ? new Date(story.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                        {story.location ? ` • ${story.location}` : ""}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-orange-800 mb-1">
                    {story.title}
                  </h3>

                  <p className="text-sm text-gray-700 mb-1 whitespace-pre-wrap break-words">
                    {story.issueSummary}
                  </p>

                  {story.impact && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                      <span className="font-semibold">Impact: </span>
                      {story.impact}
                    </p>
                  )}

                  {Array.isArray(story.images) && story.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {story.images.map((img, idx) => {
                        const imageUrl = resolveImageUrl(img);

                        return imageUrl ? (
                          <img
                            key={`${story._id}-image-${idx}`}
                            src={imageUrl}
                            alt={`Story photo ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null;
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
