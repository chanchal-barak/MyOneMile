import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Phone, Mail, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const navigate = useNavigate();

  const team = [
    {
      name: "Sandeep Mann",
      role: "Owner",
      img: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
      email: "thinkvast@gmail.com",
    },
    {
      name: "Chanchal",
      role: "Full-Stack Developer",
      img: "https://cdn-icons-png.flaticon.com/512/4140/4140040.png",
      email: "Chancha14b@gmail.com",
    },
    {
      name: "Somya Sharma",
      role: "Full-Stack Developer",
      img: "https://cdn-icons-png.flaticon.com/512/4140/4140051.png",
      email: "Somya.sharma010212@gmail.com",
    },
    {
      name: "Himanshi Kashyap",
      role: "Full-Stack Developer",
      img: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
      email: "kashyaphimanshi10@gmail.com",
    },

  ];

  const gmailComposeUrl = (email) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 flex flex-col items-center px-6 py-10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating Glow Effects */}
      <motion.div
        className="absolute top-20 left-10 w-44 h-44 bg-indigo-300 rounded-full blur-3xl opacity-25"
        animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-60 h-60 bg-indigo-400 rounded-full blur-3xl opacity-25"
        animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition"
        >
          <ArrowLeft size={22} className="mr-1" /> Back
        </button>

        <h2 className="text-3xl font-bold text-indigo-700 text-center flex-1">
          About Us
        </h2>

        <div className="w-6" />
      </div>

      {/* About Box */}
      <motion.div
        className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 text-center max-w-xl border border-indigo-100 relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mx-auto mb-4 bg-indigo-100 p-3 w-fit rounded-full shadow-md"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          <Heart size={28} className="text-indigo-600" />
        </motion.div>

        <p className="text-gray-700 leading-relaxed text-base">
          <strong className="text-indigo-700">MyOneMile</strong> is a civic
          engagement platform that empowers citizens to voice their concerns,
          solve local issues, and make communities stronger. Together, we build
          transparent and connected neighborhoods where every voice matters. 🌍
        </p>
      </motion.div>

      {/* Core Team Section */}
      <motion.div
        className="mt-16 max-w-6xl w-full relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-center text-3xl font-bold text-indigo-700 mb-10 flex items-center justify-center gap-2">
          <Users className="text-indigo-600" /> Our Core Team
        </h3>

        {/* MAKE SMALL CARDS + ALL IN ONE LINE */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <motion.div
              key={index}
              className="p-4 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg 
              border border-indigo-100 text-center hover:shadow-xl hover:-translate-y-1 
              transition-all duration-300 cursor-pointer relative overflow-hidden"
              whileHover={{ scale: 1.04 }}
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/40 via-white/30 to-indigo-100/40 
              rounded-2xl opacity-0 hover:opacity-30 transition duration-300 pointer-events-none" />

              <motion.img
                src={member.img}
                alt={member.name}
                className="w-16 h-16 mx-auto rounded-full border-2 border-indigo-200 shadow-sm object-cover mb-3"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />

              <h4 className="text-lg font-semibold text-gray-800">{member.name}</h4>
              <p className="text-gray-600 font-medium text-xs mt-1">{member.role}</p>

              <a
                href={gmailComposeUrl(member.email)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-700 font-medium hover:underline"
              >
                <Mail size={12} className="text-indigo-600" />
                {member.email}
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md mt-12 border border-indigo-100 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-indigo-700 font-bold mb-3 text-lg">Help & Support</h3>

        <div className="space-y-3 text-gray-700 text-sm text-center">
          <p className="flex items-center justify-center gap-2">
            <Phone size={16} className="text-indigo-500" /> +91 9891369629
          </p>

          <a
            href={gmailComposeUrl("Happytohelp@myonemile.com")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-indigo-600 hover:underline text-sm justify-center"
          >
            <Mail size={16} className="text-indigo-500" />
            Happytohelp@myonemile.com
          </a>
        </div>
      </motion.div>
      <motion.div
        className="w-full max-w-md mt-10 mb-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md font-semibold text-sm inline-block mb-3 shadow-sm">
          Terms & Conditions
        </h3>

        <div className="bg-white p-5 rounded-xl shadow-md text-gray-700 text-sm leading-relaxed border border-indigo-100">
          <ul className="list-disc list-inside space-y-1">
            <li>Registered identity should be legal & government approved.</li>
            <li>You own the content you post.</li>
            <li>Our mission is to help people who are facing problems.</li>
            <li>We don’t endorse or verify user-generated content.</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}


