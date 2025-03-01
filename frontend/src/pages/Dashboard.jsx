import React, { useEffect, useState  } from "react";
import { Link ,useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import axios from "axios";
import { Loader, Sparkles, Trash2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";


const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout , getSpaces , deleteUser} = useAuthStore();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSpaces, setTotalSpaces] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalVideoReviews, setTotalVideoReviews] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // Ensure this is an array
  const [url, setUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const[generating , setGenerating] = useState(false)
  const handleLogout = () => {
    try {
      logout();
      const name = user.email;
      toast.success(name + " is logged out successfully");
    } catch (error) {
      toast.error("Could not logout");
    }
  };

  // Fetch spaces from the backend API using the email
  const fetchSpaces = async () => {
    try {
      const response = await getSpaces(user.email); // Calls the fixed `getSpaces`
      console.log(response)
      // Access `response.data` from Axios
      const sp = response.data;
      setSpaces(sp);
      setTotalSpaces(response.data.length);
  
      // Calculate total reviews
      let total = 0;
      response.data.forEach((space) => {
        total += space.reviews.length;
      });
      setTotalReviews(total);
  
      setLoading(false);
    } catch (err) {
      console.error("Error fetching spaces:", err); // Log the exact error
      setLoading(false);
      toast.error("Failed to load spaces");
    }
  };
  

  // Function to generate questions using AI for the provided URL
  const generateQuestionsWithAI = async () => {
    setGenerating(true)
    if (!url) {
      setGenerating(false)
      toast.error("Please provide a valid URL");
      return;
    }
    try {
      const response = await axios.post("https://testiflow-pythonbackend-production.up.railway.app/generate-testimonial-questions", { url });
      const questions = response.data.questions || []; // Ensure it's an array
      const header = response.data.header || ""
      const message = response.data.message || ""
      console.log(questions)
      setGeneratedQuestions(questions); 
      // console.log(generatedQuestions)
      toast.success("Website fetched successfully!");
      setModalOpen(false); // Close the modal after generating questions
      setGenerating(false)
      navigate('/create-space', { state: { questions: questions , header: header , message: message , type: 'AI' } });
    } catch (error) {
      setGenerating(false)
      toast.error("Failed to fetch website.");
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.3 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white"
      variants={pageVariants}
    >
      {/* Header */}
      <motion.header
        className="p-6 flex justify-between items-center"
        variants={itemVariants}
      >
        <div>
          <Link to="/">
            <img src="testiflow_white.png" alt="" className="w-56 h-30" />
          </Link>
        </div>
        <nav>
          <button
            className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg text-white"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </nav>
      </motion.header>
  
      {/* Dashboard Content */}
      <motion.main className="px-8 py-6" variants={itemVariants}>
        <motion.h2 className="text-7xl font-light mb-4">
          Welcome Back! <span className="text-teal-500">{user.name}</span>
        </motion.h2>
        <motion.p
          className="text-gray-400 mb-6 text-xl"
          variants={itemVariants}
        >
          Here’s a summary of your testimonial spaces.
        </motion.p>
  
        {/* Spaces Overview */}
        <motion.div className="space-y-4" variants={pageVariants}>
          <h3 className="text-2xl font-light">Overview:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Total Spaces Created", value: totalSpaces },
              { title: "Total Video Reviews", value: totalVideoReviews },
              { title: "Total Text Reviews", value: totalReviews },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 bg-opacity-60 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                variants={itemVariants}
              >
                <h4 className="text-2xl font-light text-white">{item.title}</h4>
                <p className="mt-4 text-teal-400 text-3xl">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
  
        {/* Your Spaces */}
        <motion.div className="mt-8 space-y-4" variants={pageVariants}>
          <h3 className="text-2xl font-light">Your Spaces:</h3>
          {loading ? (
            <p className="text-gray-500 flex">Loading spaces... <Loader className="animate-spin" /></p>
          ) : error ? (
            <p className="text-gray-500">{error}</p>
          ) : spaces.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={pageVariants}
            >
              {spaces.map((space) => (
                <motion.div
                  key={space.id}
                  className="bg-gray-900 bg-opacity-80 border-2 border-gray-600 transition duration-300 hover:border-blue-600 mb-3 p-6 rounded-xl shadow-lg"
                  variants={itemVariants}
                >
                  <h4 className="text-3xl font-normal text-gray-50">{space.spaceName}</h4>
                  <p className="mt-2 text-gray-400">Created: {space.createdAt}</p>
                  <p className="mt-2">
                    Link:{" "}
                    <a
                      href={space.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {space.link}
                    </a>
                  </p>
                  <Link
                    to={`/viewspace/${space.spaceId}`}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-700 py-2 px-4 rounded-lg text-sm text-white mt-4 inline-block"
                  >
                    View Space
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-500 text-xl">No spaces created yet.</p>
          )}
        </motion.div>
  
        {/* Create Buttons */}
        <motion.div className="mt-8 flex justify-between gap-4" variants={pageVariants}>
          <div className="flex gap-4">
            <Link
              to="/create-space"
              className="bg-teal-600 hover:bg-teal-700 py-3 px-6 rounded-lg text-lg"
            >
              Create a New Space +
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-blue-700 to-purple-700 hover:from-purple-700 hover:to-blue-700 py-3 px-6 rounded-lg text-lg"
            >
              <div className="flex items-center gap-1">Create New Space with AI <Sparkles className="h-5" /></div>
            </button>
          </div>
          <button
              onClick={() => setModalOpen(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-700 hover:to-red-700 py-3 px-6 rounded-lg text-lg"
            >
              <div className="flex items-center gap-1">Delete this profile<Trash2 className=" h-5  " /></div>
          </button>


        </motion.div>
  
        {/* Modal */}
        {modalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-40"
            initial="hidden"
            animate="visible"
            variants={modalVariants}
          >
            <div className="bg-pink-100 p-8 rounded-xl shadow-lg w-full">
              <h3 className="text-2xl font-medium text-gray-800 mb-4">
                <img className="h-12" src="/generatespace.png" alt="" />
              </h3>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter the URL"
                className="w-full p-3 rounded-2xl bg-white text-gray-800 text-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={generateQuestionsWithAI}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 py-2 px-4 rounded-lg text-white"
                >
                  {generating ? "Generating..." : "Generate with AI"}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-red-500 py-2 px-4 rounded-lg text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>
    </motion.div>
  );
};

export default Dashboard;
