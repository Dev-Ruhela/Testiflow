import React, { useEffect, useState } from 'react';
import { useParams, Link , useNavigate } from 'react-router-dom';
import { X, Heart, Download, Share2, Star, Pencil, Loader , Sparkles, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { use } from 'react';
import WallOfLove from './WallOfLove';
import { useAuthStore } from '../store/authStore';
const ViewPage = () => {
  const navigate = useNavigate();
  const { link } = useParams();
  const [spaceData, setSpaceData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favReviews , setFavReviews] = useState([]);
  const [showWallOfLove , setShowWallOfLove] = useState(false);
  const [loading , setLoading] = useState(false);
  const [questions , setQuestions] = useState([]);
  const [summary , setSummary] = useState();
  const [showSummary , setShowSummary] = useState(false);
  const [loadingAI , setLoadingAI] = useState(false)
  const [showCaseStudy , setShowCaseStudy] = useState(false);
  const [caseStudy , setCaseStudy] = useState(false)
  const [generating , setGenerating] = useState(false)
  const {fetchReview , toggleFav} = useAuthStore();

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const data = await fetchReview(link); // `fetchReview` now returns JSON
        if (data) {
          setSpaceData(data);
          setReviews(data.reviews || []);
          setQuestions(data.questions || []);
          setFavReviews(data.reviews.filter((review) => review.isFav === true));
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
      }
    };
  
    fetchReviewData();
  }, [link]);
  

  const fetchFavReviewData = async () => {
    setLoading(true)
    try {
      const data = await fetchReview(link);
      if (data) {
        setLoading(false)
        setFavReviews(data.reviews.filter((review) => review.isFav === true))
        setShowWallOfLove(!showWallOfLove)
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching review data:', error);
    }
  };

  const toggleFavorite = async ( reviewId, isFav , index) => {
    try{

      const result = await toggleFav(reviewId , isFav , link);

      if (result.success) {
        // Update the reviews state after successful backend update
        const updatedReviews = [...reviews];
        updatedReviews[index].isFav = !isFav;
        if(!isFav) {
          toast.success("Successfully added to Wall of love !")
        }
        else{
          toast.success("Successfully removed from Wall of love!")
        }
        setReviews(updatedReviews);
      } else {
        console.error('Error toggling favorite:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = (review) => {
    console.log(review)
    const content = `
Review by ${review.name || 'Anonymous'} (${review.email || 'No email provided'}):
${review.reviewText?.map((q, i) => `${i + 1}. ${q.answer}`).join('\n') || 'No answers provided.'}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Review_${review._id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleShare = async (review) => {
    const content = `
Review by ${review.name || 'Anonymous'} (${review.email || 'No email provided'}):
${review.reviewText?.map((q, i) => `${i + 1}. ${q.answer}`).join('\n') || 'No answers provided.'}
    `;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${review.name || 'Anonymous'}'s Review`,
          text: content,
        });
        console.log('Content shared successfully!');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  const summarizeData = async (review) => {
    try {
      setLoadingAI(true)
      // Define the payload with a single review (no need to map over it)
      const payload = {
        questions: questions.map((q) => ({
          id: q.id,  // Ensure the question IDs are passed as strings
          question: q.question,
        })),
        reviews: [
          {
            name: review.name,
            email: review.email,
            reviewText: review.reviewText.map((rt) => ({
              questionId: rt.questionId,  // Ensure questionId is sent as string
              answer: rt.answer,
            })),
            isFav: review.isFav,
            rating: review.rating,
          },
        ], // Wrap review in an array since backend may expect it as an array
      };
  
      

      // Send POST request to the backend
      const response = await fetch('https://testiflowbackend-production.up.railway.app/summarize-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),  // Convert data to JSON
      });
  
      // Handle the response
      if (response.ok) {
        const data = await response.json();
        
        setSummary(data.summary);  // Set summary for UI display
        setShowSummary(true);
        setLoadingAI(false);
      } else {
        setLoadingAI(false);
        console.error('Failed to get summary from backend:', response.status);
      }
    } catch (error) {
      setLoadingAI(false);
      console.error('Error occurred while sending data to backend:', error);
    }
  };
  
  const handleCaseStudy = async () => {
    try {
      setGenerating(true)
      // Prepare the payload with questions and reviews
      const payload = {
        questions: questions.map((q) => ({
          id: q.id,  // Ensure the question IDs are passed as strings
          question: q.question,
        })),
        reviews: reviews.map((review) => ({
          name: review.name,
          email: review.email,
          reviewText: review.reviewText.map((rt) => ({
            questionId: rt.questionId,  // Ensure questionId is sent as string
            answer: rt.answer,
          })),
          isFav: review.isFav,
          rating: review.rating,
        })),
      };
      console.log(payload);
      // Send POST request to the backend using fetch
      const response = await fetch('https://testiflowbackend-production.up.railway.app/generate-casestudy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Set content type as JSON
        },
        body: JSON.stringify(payload),  // Convert payload to JSON
      });
  
      // Check if the response is successful
      if (response.ok) {
        const data = await response.json();
        setCaseStudy(data.summary)
        setGenerating(false)
        setShowCaseStudy(true)

        toast.success("Case Study Created Successfully !")
        
       
      } else {
        setGenerating(false)
        console.error('Failed to get summary from backend:', response.status);
        toast.error("Failed to create Case Study ")
      }
    } catch (error) {
      setGenerating(false)
      console.error('Error occurred while sending data to backend:', error);
      toast.error("Failed to create Case Study ")
    }
  };
  


  const sendEditData = () => {
  
      const questions = spaceData.questions || []; // Ensure it's an array
      const header = spaceData.headerTitle || ""
      const message = spaceData.customMessage || ""
      const spaceId = spaceData.spaceId || ""
      const name = spaceData.spaceName || ""
      const userEmail = spaceData.userEmail || ""
      const logo = spaceData.spaceLogo || ""
      navigate('/create-space', { state: { questions: questions , header: header , message: message , spaceId: spaceId , name: name , userEmail: userEmail , logo: logo, type: 'edit' } });
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: rating }, (_, index) => (
          <Star key={index} className="text-yellow-500 w-5 h-5" />
        ))}
      </div>
    );
  };
  if (!spaceData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl text-white">
        Loading...
      </div>
    );
  }

  const parseMarkdown = (text) => {
    let result = text;
    
    // Bold: Replace **text** with <strong>text</strong>
    result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // New line: Replace \n with <br />
    result = result.replace(/\n/g, "<br />");

    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white">
      <header className="p-6 flex justify-between bg-gradient-to-r from-gray-900 via-black to-gray-900 items-center fixed top-0 left-0 w-full z-50">
        <div>
          <Link to="/">
            <img src="/testiflow_white.png" alt="Logo" className="w-56 h-30" />
          </Link>
        </div>
        <nav>
          <div className="rounded-full p-3 hover:bg-gray-800">
            <Link to="/dashboard">
              <X />
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-20 px-6 pb-8">
        <div className="flex flex-row justify-between items-center mt-24">
          <div>
            <h1 className="text-5xl font-light mb-2 text-center">{spaceData.spaceName}</h1>
          </div>
          
          <div className='flex flex-row items-center justify-center'>
            <div className='mr-5 p-3 px-4 bg-white hover:bg-gray-200 text-center items-center rounded-xl text-black'>
              <button 
              onClick={fetchFavReviewData}
              className='flex gap-1 items-center'>
                {!loading ? (
                    <>
                      Wall of love <Heart className="font-bold text-red-500 h-4 w-4" />
                    </>
                  ) : (
                    <Loader  className="h-4 w-4 animate-spin" />
                  )}              
              </button>
              {showWallOfLove && (

        <div className=" text-white fixed inset-0 bg-black bg-opacity-80  flex flex-col  justify-center items-center z-50">
          <div className='border-4 border-pink-500 bg-pink-100 text-black p-10 rounded-2xl'>
            <div>
              
            </div>
            <div className='flex justify-between items-center'>
              <h1 className='text-4xl font-semibold -mt-6 font-sans flex items-center gap-3'> <img className="h-32 w-30" src="/walloflove.png" alt="" /></h1>
              <button
                onClick={() => setShowWallOfLove(!showWallOfLove)}
              >
                <X className='hover:bg-pink-200 p-2 rounded-full h-10 w-10'/>
              </button>
            </div>
            
            <p style={{ fontStyle: 'italic' }} className='text-left text-2xl font-normal bg-gradient-to-r from-pink-500 via-violet-600 to-pink-500 bg-clip-text text-transparent'>' Generate code and showcase on your websites '</p>
            <WallOfLove reviews={favReviews} />
            
          </div>
          
        </div>
      )}
            </div>
            
            <div className='flex mr-5 gap-1 p-3 px-4 bg-white hover:bg-gray-200 text-center items-center rounded-xl text-black'>
              <button 
                className='flex gap-1 items-center' 
                onClick={() => sendEditData()} // Place the onClick handler here
              >
                Edit Space 
                <Pencil className='font-thin h-4 w-4' />
              </button>
            </div>

            <div className='flex mr-5 gap-1 p-3 px-4 bg-gradient-to-r from-purple-600  to-blue-600 hover:bg-gray-200 text-center items-center rounded-xl text-white font-light'>
              <button 
                className='flex gap-1 items-center' 
                onClick={() => handleCaseStudy()} 
              >
                {generating ? (
                    <>
                      Generating case study
                      <Loader className='font-thin h-4 w-4 animate-spin' />
                      
                    </>
                ) : (
                  <>
                      Create Case-Study using AI 
                      <Wand2 className='font-thin h-4 w-4' />
                  </>
                )}
                
              </button>
            </div>
            {showCaseStudy && (
              <div className="text-white fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-10">
                <div className='bg-gradient-to-tr from-pink-100  to-purple-100 p-11  rounded-2xl max-h-[80vh] overflow-y-auto'>
                  <div className='flex justify-between items-center text-black mb-5'>
                    <div className='flex text-3xl text-black items-center gap-2'>
                      <h3 className="bg-gradient-to-r  from-pink-700 to-pink-700 text-4xl font-semibold mb-2 text-black bg-clip-text text-transparent"><img className="h-28" src="/casestudy.png" alt="" /></h3>
                    </div>
                    <button onClick={() => setShowCaseStudy(!showCaseStudy)}>
                      <X className='hover:bg-pink-200 p-3 rounded-full h-12 w-12'/>
                    </button>
                  </div>
                  <div className='text-black text-xl '>
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(caseStudy) }} />
                  </div>
                </div>
              </div>
          )}
          </div>
        </div>

        <div className="w-full mt-10 mb-14 border-t-2 border-gray-700"></div>
        
        <section className="mb-12">
          {reviews.length > 0 ? (
            <div>
              <div className='flex gap-2 items-center'>
                <span className='text-3xl font-thin '>Congrats ! You have {reviews.length} testimonials  </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fdfdfc" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-party-popper"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              
              {reviews.map((review, index) => (
                <div
                  key={review._id}
                  className="bg-gray-800 bg-opacity-40 border-2 border-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-800 hover:bg-opacity-70 relative"
                >
                  <button
                    title='Add this review to the wall of love'
                    className={`absolute top-3 right-3 rounded-full p-2 ${
                      review.isFav ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                    onClick={() => toggleFavorite(review._id, review.isFav, index)}
                  >
                    <Heart />
                  </button>

                  <p className="text-xl font-semibold text-teal-400 mb-2">
                    Name: {review.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">Email: {review.email || 'No email provided'}</p>

                  {review.rating && (
                    <div className="mb-4 flex gap-3 items-center">
                      <p className="text-gray-300 text-lg">Rating :</p>
                      <span>{renderStars(review.rating)}</span>
                    </div>
                  )}

                  {Array.isArray(review.reviewText) && review.reviewText.length > 0 ? (
                    review.reviewText.map((answer, idx) => (
                      <div key={idx} className="mt-2">
                        <p className="text-gray-200 text-sm">
                          {idx + 1}. {answer.answer}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No answers available for this review.</p>
                  )}

                  <div className="flex justify-end gap-4 ">
                    <button
                      className="h-fit w-fit p-3 bg-gray-700 hover:bg-gray-600 rounded-full"
                      title='Download the response !'
                      onClick={() => handleDownload(review)}
                    >
                      <Download className="h-5 w-5 text-gray-300" />
                    </button>
                    <button
                      className=" h-fit w-fit p-3 bg-gray-700 hover:bg-gray-600 rounded-full"
                      title='Share this response !'
                      onClick={() => handleShare(review)}
                    >
                      <Share2 className="h-5 w-5 text-gray-300" />
                    </button>
                    <button
                      className=" h-fit w-fit p-3 bg-gray-700 hover:bg-gray-600 rounded-full"
                      title='Summarize the response using AI !'
                      
                      onClick={() => summarizeData(review)}
                    >
                      
                    <Sparkles className='text-gray-300'/>
                                 
                              
                    </button>
                    {showSummary && (

                        <div className=" text-white fixed inset-0 bg-black bg-opacity-30  flex flex-col  justify-center items-center z-50 p-80">
                          <div className='border-2  bg-pink-100 p-11 rounded-2xl'>
                            <div>
                              
                            </div>
                            <div className='flex justify-between items-center text-black mb-5'>
                            <div className='flex text-3xl text-black items-center gap-2'>
                              <h3 className="text-3xl font-semibold mb-2 text-black -mt-5"><img className='h-16 w-44' src="\summary.png" alt="" /> </h3>
                            </div>
                              <button
                                onClick={() => setShowSummary(!showSummary)}
                              >
                                
                                <X className='hover:bg-gray-200 p-2 rounded-full h-10 w-10 -mt-10'/>
                                
                                
                              </button>
                            </div>
                            <div>
                            <p className="text-2xl text-black font-extralight" dangerouslySetInnerHTML={{ __html: summary }}></p>
                            </div>
                          </div>
                          
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No reviews yet for this space.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default ViewPage;
