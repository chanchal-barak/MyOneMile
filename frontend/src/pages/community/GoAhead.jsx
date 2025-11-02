import { ArrowLeft, Flag } from "lucide-react";
import { Link } from "react-router-dom";

export default function GoAhead() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <Link to="/community" className="text-gray-500 hover:text-orange-500">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-full border border-orange-400">
            <Flag size={26} className="text-orange-600" />
          </div>
          <h1 className="text-xl font-bold text-orange-600">Go Ahead</h1>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 w-full max-w-md">
        <p className="text-gray-600 text-center">
          🚧 Feature coming soon!  
          This page will highlight users taking initiative in their communities.
        </p>
      </div>
    </div>
  );
}
