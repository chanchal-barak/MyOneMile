import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, MapPin } from "lucide-react";

export default function Report() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/issues/reports/all")
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-2 rounded-full border border-orange-400">
          <FileText className="text-orange-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-orange-600">Community Reports</h1>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center">No reports yet.</p>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="bg-white border shadow-sm p-4 rounded-xl hover:shadow-md transition">
              <h2 className="font-semibold text-gray-800">{report.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{report.description}</p>

              <div className="flex justify-between items-center text-gray-500 text-sm mt-3">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-orange-500" />
                  {report.location || "Unknown location"}
                </div>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-medium">
                  {report.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
