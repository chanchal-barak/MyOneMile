import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserProvider from "./context/UserContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";
import PrivateRoute from "./components/PrivateRoute";
import Profile from "./pages/Profile";
import About from "./pages/About";
import MyPosts from "./pages/MyPosts";
import MyLikes from "./pages/MyLikes";
import MyCommunities from "./pages/MyCommunities";
import EditProfile from "./pages/EditProfile";

// Compare Pages
import CompareList from "./pages/CompareList";
import CompareDetail from "./pages/CompareDetail";
import CreateCompare from "./pages/CreateCompare";

// Community Pages
import Community from "./pages/community";
import GoAhead from "./pages/community/GoAhead";
import Discussion from "./pages/community/Discussion";
import Spotlight from "./pages/community/Spotlight";
import Trends from "./pages/community/Trends";
import Report from "./pages/community/Report";
import Story from "./pages/community/Story";
import QA from "./pages/community/QA";
import Members from "./pages/community/Members";
import Polls from "./pages/community/Polls";

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-500">
          <Navbar />
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />

            {/* Protected Routes */}
            <Route
              path="/report"
              element={
                <PrivateRoute>
                  <ReportIssue />
                </PrivateRoute>
              }
            />
            <Route
              path="/myposts"
              element={
                <PrivateRoute>
                  <MyPosts />
                </PrivateRoute>
              }
            />
            <Route
              path="/mylikes"
              element={
                <PrivateRoute>
                  <MyLikes />
                </PrivateRoute>
              }
            />
            <Route
              path="/mycommunities"
              element={
                <PrivateRoute>
                  <MyCommunities />
                </PrivateRoute>
              }
            />
            <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />


            {/* Compare Pages */}
            <Route path="/compare" element={<CompareList />} />
            <Route path="/compare/new" element={<CreateCompare />} />
            <Route path="/compare/:id" element={<CompareDetail />} />

            {/* Community Pages */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/go-ahead" element={<GoAhead />} />
            <Route path="/community/discussion" element={<Discussion />} />
            <Route path="/community/spotlight" element={<Spotlight />} />
            <Route path="/community/trends" element={<Trends />} />
            <Route path="/community/report" element={<Report />} />
            <Route path="/community/story" element={<Story />} />
            <Route path="/community/qa" element={<QA />} />
            <Route path="/community/members" element={<Members />} />
            <Route path="/community/polls" element={<Polls />} />
          </Routes>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}
