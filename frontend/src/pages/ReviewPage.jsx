import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
const ReviewPage = () => {
  const { link } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const {fetchReview , createReview} = useAuthStore();

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const data = await fetchReview(link);
        setReviewData(data);
      } catch (error) {
        console.error('Error fetching review data:', error);
      }
    };

    fetchReviewData();
  }, [link]);

  const handleAnswerChange = (questionId, event) => {
    setAnswers({
      ...answers,
      [questionId]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const reviewTextArray = Object.keys(answers).map((questionId) => ({
      questionId,
      answer: answers[questionId],
    }));

    const review = {
      spaceId: link,
      reviewText: reviewTextArray,
      name,
      email,
      rating,
    };

    try {
  
      const data = await createReview(review);
      console.log('Review submitted successfully:', data);
      toast.success("Review submitted successfully")
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Error submitting review")
    }
  };

  if (!reviewData) {
    return <div className="min-h-screen flex justify-center items-center text-xl text-white">Loading...</div>;
  }

  // Check if the spaceLogo is a Blob URL or not
  const isBlobUrl = reviewData.spaceLogo.startsWith('blob:');

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 flex flex-col items-center py-10 text-white">
      <div className='-mt-8'>
          <Link to="/">
            <img src="/testiflow_white.png" alt="" className="w-56 h-30" />
          </Link>
        </div>
      {/* Header Section */}
      <header className="mb-8">
        
        <img
          src={isBlobUrl ? reviewData.spaceLogo : 'default_logo.png'} // Handle Blob URL
          alt={reviewData.spaceName}
          className="mx-auto w-32 h-32 rounded-full mb-10 border-4 border-gray-700"
        />
        <p className="text-7xl text-gray-200 ">{reviewData.headerTitle}</p>
      </header>

      {/* Main Content Section */}
      <main className="w-full max-w-4xl bg-none rounded-lg shadow-xl px-8 py-6">
        <div className="text-center">
          <p className="text-2xl text-gray-400 font-thin mb-6">{reviewData.customMessage}</p>

          <div className="w-full mt-16 mb-8 border-t-2 border-gray-600"></div>

          <h3 className="text-lg font-medium text-blue-200 mb-4 text-left">QUESTIONS</h3>

          <ul className="space-y-4">
            {reviewData.questions.map((questionObj, index) => (
              <li key={index} className="rounded-lg shadow-md text-left">
                <p className="text-lg text-gray-300">{index + 1}. {questionObj.question}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Button Section */}
      <div className="flex flex-row justify-center items-center gap-4">
        <div className="p-4 mt-6 flex flex-row gap-3 justify-center font-light text-white items-center bg-gradient-to-r from-blue-600 to-blue-600 rounded-md">
          <button
            className="flex flex-row items-center justify-center gap-3 w-72"
            onClick={() => setIsFormVisible(true)} // Show the form on button click
          >
            <Pencil className="h-5 w-5" />
            <p className="text-xl font-thin">Write a text</p>
          </button>
        </div>
        <div className="p-4 mt-6 flex flex-row gap-3 font-extralight justify-center text-white items-center bg-gradient-to-r from-purple-600 to-purple-600 rounded-md">
          <button className="flex flex-row items-center justify-center gap-3 w-72">
            <Camera className="h-5 w-5 " />
            <p className="text-xl font-thin">Record a video</p>
          </button>
        </div>
      </div>

      {/* Form Section */}
      {isFormVisible && (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mt-8 bg-gray-800 rounded-lg shadow-xl px-8 py-6">
          <h3 className="text-2xl text-gray-300 font-light mb-6">Write a textimonial to <span className='font-normal'>{reviewData.spaceName}</span></h3>
          {/* Name and Email Input */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-lg text-gray-300 mb-2">Name <span className='text-red-500'>*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded-md"
                placeholder="Enter your name"
                required={true}
              />
            </div>
            <div>
              <label className="block text-lg text-gray-300 mb-2">Email <span className='text-red-500'>*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded-md"
                placeholder="Enter your email"
                required={true}
              />
            </div>
          </div>

          {/* Questions Input */}
          <ul className="space-y-4">
            {reviewData.questions.map((questionObj, index) => (
              <li key={index} className="space-y-2">
                <label className="text-lg text-gray-300">{index + 1}. {questionObj.question}</label>
                <input
                  type="text"
                  value={answers[questionObj._id] || ''}
                  onChange={(event) => handleAnswerChange(questionObj._id, event)}
                  className="w-full p-2 bg-gray-700 text-white rounded-md"
                  placeholder="Your answer..."
                />
              </li>
            ))}
          </ul>

          {/* Ratings Input */}
          <div className="mt-6">
            <label className="block text-lg text-gray-300 mb-2">Rating (1-5) <span className='text-red-500'>*</span></label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Math.min(Math.max(e.target.value, 1), 5))} // Ensure rating stays within 1-5
              className="w-full p-2 bg-gray-700 text-white rounded-md"
              placeholder="Rate from 1 to 5"
              min="1"
              max="5"
              required={true}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-light rounded-md">Submit Review</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewPage;
