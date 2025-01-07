import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
const WallOfLove = ({ reviews }) => {
  const [layout, setLayout] = useState(1); // State to toggle between layouts
  const [embedCode, setEmbedCode] = useState(''); // State for storing the embed code

  // Animations for testimonials using Framer Motion
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Function to generate the embed code based on selected layout
  const generateAndCopyEmbedCode = () => {
    let embedHTML = `<div class="wall-of-love">`;

    if (layout === 1) {
      embedHTML += `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
      reviews.forEach((review) => {
        embedHTML += `<div class="bg-gray-800 border-2 border-gray-700 p-6 rounded-lg shadow-lg hover:bg-opacity-70">
          <p class="text-xl font-semibold text-teal-400 mb-2">Name: ${review.name || 'Anonymous'}</p>
          <p class="text-sm text-gray-400 mb-4">Email: ${review.email || 'No email provided'}</p>
          <p class="text-gray-200 text-sm">${review.reviewText?.map((q, i) => `<span>${i + 1}. ${q.answer}<br /></span>`).join('') || 'No answers provided.'}</p>
        </div>`;
      });
      embedHTML += `</div>`;
    } else if (layout === 2) {
      embedHTML += `<div class="space-y-6">`;
      reviews.forEach((review, index) => {
        embedHTML += `<div class="relative p-6 rounded-lg shadow-lg border-l-4 ${index % 2 === 0 ? 'border-teal-500 bg-gray-700' : 'border-blue-500 bg-gray-800'}">
          <p class="text-xl font-semibold text-teal-400 mb-2">Name: ${review.name || 'Anonymous'}</p>
          <p class="text-sm text-gray-400 mb-4">Email: ${review.email || 'No email provided'}</p>
          <p class="text-gray-200 text-sm">${review.reviewText?.map((q, i) => `<span>${i + 1}. ${q.answer}<br /></span>`).join('') || 'No answers provided.'}</p>
        </div>`;
      });
      embedHTML += `</div>`;
    } else if (layout === 3) {
      embedHTML += `<div class="flex overflow-x-auto space-x-6">`;
      reviews.forEach((review) => {
        embedHTML += `<div class="min-w-[300px] bg-gray-800 border-2 border-gray-700 p-6 rounded-lg shadow-lg hover:scale-105 transform transition">
          <p class="text-xl font-semibold text-teal-400 mb-2">Name: ${review.name || 'Anonymous'}</p>
          <p class="text-sm text-gray-400 mb-4">Email: ${review.email || 'No email provided'}</p>
          <p class="text-gray-200 text-sm">${review.reviewText?.map((q, i) => `<span>${i + 1}. ${q.answer}<br /></span>`).join('') || 'No answers provided.'}</p>
        </div>`;
      });
      embedHTML += `</div>`;
    }

    embedHTML += `</div>`;
    setEmbedCode(embedHTML); // Set the generated embed code

    // Copy the embed code to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = embedHTML;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    toast.success('Embed code copied to clipboard!');
  };

  return (
    <div className="">
      {/* Layout Selection */}
      <div className="w-full min-w-[700px] mt-4 mb-4 border-t-2 border-gray-700"></div>

      <h2 className='mb-3 text-xl'>Choose a Layout</h2>
      <div className="flex justify-center gap-4 mb-8 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-800">
        <button
          onClick={() => setLayout(1)}
          className={`px-4 py-2 text-sm font-bold rounded-lg ${
            layout === 1 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Layout 1
        </button>
        <button
          onClick={() => setLayout(2)}
          className={`px-4 py-2 text-sm font-bold rounded-lg ${
            layout === 2 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Layout 2
        </button>
        <button
          onClick={() => setLayout(3)}
          className={`px-4 py-2 text-sm font-bold rounded-lg ${
            layout === 3 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Layout 3
        </button>
      </div>
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto max-w-[1000px] scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-300">
      {reviews.length == 0 && (<div className='text-gray-400 font-thin text-4xl mt-10'> 
        <h3 className='text-gray-400 text-2xl font-light'>Looks like no Testimonials have been marked as favourite !</h3>
        + Add testimonials to your wall of love and they will appear here.</div>)}
      {/* Layouts */}
      {layout === 1 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {reviews.map((review) => (
      <motion.div
        key={review._id}
        className="bg-gradient-to-r from-pink-400 to-pink-400 p-6 rounded-3xl shadow-xl hover:bg-opacity-80 transition-all duration-300"
        {...animationProps}
      >
        <p className="text-xl font-light   text-white  mb-2">
          Name: {review.name || 'Anonymous'}
        </p>
        <p className="text-sm text-gray-700 mb-4">
          Email: {review.email || 'No email provided'}
        </p>
        <p className="text-gray-800 text-sm">
          {review.reviewText?.map((q, i) => (
            <span key={i}>
              {i + 1}. {q.answer}
              <br />
            </span>
          )) || 'No answers provided.'}
        </p>
      </motion.div>
    ))}
  </div>
)}


      {layout === 2 && (
        <div className="space-y-6 p-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              className={`relative p-6 rounded-2xl shadow-xl border-l-4 ${
                index % 2 === 0 ? 'border-purple-700 bg-pink-500' : 'border-purple-500 bg-pink-400'
              }`}
              {...animationProps}
            >
              <p className="text-xl font-light text-white mb-2">
                Name: {review.name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Email: {review.email || 'No email provided'}
              </p>
              <p className="text-gray-800 text-sm">
                {review.reviewText?.map((q, i) => (
                  <span key={i}>
                    {i + 1}. {q.answer}
                    <br />
                  </span>
                )) || 'No answers provided.'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {layout === 3 && (
        <div className="flex overflow-x-auto space-x-6 p-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              className="min-w-[400px] bg-pink-400 p-6 rounded-3xl shadow-xl hover:scale-105 transform transition"
              {...animationProps}
            >
              <p className="text-xl font-light text-white mb-2">
                Name: {review.name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Email: {review.email || 'No email provided'}
              </p>
              <p className="text-gray-800 text-sm">
                {review.reviewText?.map((q, i) => (
                  <span key={i}>
                    {i + 1}. {q.answer}
                    <br />
                  </span>
                )) || 'No answers provided.'}
              </p>
            </motion.div>
          ))}
        </div>
      )}
</div>
      {/* Single button for generating and copying embed code */}
      <div className="mt-8 text-center">
        <button
          onClick={generateAndCopyEmbedCode}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 duration-200 text-white font-light rounded-xl"
          disabled={(reviews.length === 0)}
        >
          Generate & Copy Embed Code
        </button>
      </div>
    </div>
  );
};

export default WallOfLove;
