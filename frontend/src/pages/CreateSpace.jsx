import React, { useEffect, useState } from 'react';
import { Link ,useLocation } from 'react-router-dom';
import { Camera, Cross, Pencil, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CreateSpace = () => {
  const { state } = useLocation(); 
  const {createSpace , user , editSpace} = useAuthStore();
  const [userEmail , setuserEmail] = useState(user.email);
  const [spaceName, setSpaceName] = useState("");
  const [spaceLogo, setSpaceLogo] = useState(null);
  const [headerTitle, setHeaderTitle] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [extraInfo, setExtraInfo] = useState({ name: false, email: false, phone: false });
  const [collectionType, setCollectionType] = useState("text");
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode toggle for left section
  const [spaceLink, setSpaceLink] = useState(""); // Unique space link after creation
  const [errors, setErrors] = useState([]); // To store error messages
  useEffect(() => {
    // Set the questions only if the state is present
    if(state && state.type === 'AI') {
      if (state && state.questions) {
        console.log(state)
        const formattedQuestions = state.questions.map((question, index) => ({
          id: `${Date.now()}-${index}`, // Ensuring uniqueness by appending an index
          question,
        }));
        setQuestions(formattedQuestions);
        setCustomMessage(state.message);
        setHeaderTitle(state.header);
        console.log(state.questions)
        console.log(questions)
      } else {
        console.log("No questions found in the state.");
      }
    }
    else if(state && state.type === 'edit') {
      setQuestions(state.questions)
      setHeaderTitle(state.header)
      setCustomMessage(state.message)
      setSpaceName(state.name)
      setSpaceLogo(state.logo)
      setuserEmail(state.userEmail)
    }
    
  }, [state]);
 
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSpaceLogo(URL.createObjectURL(file));
    }
  };

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { id: Date.now(), question: "" }]);
    }
  };

  const handleQuestionChange = (id, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question: value } : q));
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const validateForm = () => {
    const newErrors = [];

    if (!spaceName) newErrors.push("Space Name is required.");
    if (!spaceLogo) newErrors.push("Space Logo is required.");
    if (!headerTitle) newErrors.push("Header Title is required.");
    if (!customMessage) newErrors.push("Custom Message is required.");
    if (questions.length === 0) newErrors.push("At least one question is required.");


    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateSpace = async () => {
    if (!validateForm()) {
      return;
    }

    const spaceData = {
      userEmail,
      spaceName,
      spaceLogo,
      headerTitle,
      customMessage,
      questions
    };

    try {
      if (state && state.type === 'edit') {
            // If `spaceId` exists, it's an edit operation
            await editSpace(state.spaceId, spaceData);  // Call your edit API
            toast.success("Space updated successfully");
        } else {
            // Otherwise, it's a create operation
            const link = await createSpace(spaceData);
            setSpaceLink(link); // Set the generated link after space creation
            toast.success("Space created successfully");
        }
    } catch (error) {
      console.error("Error creating space", error);
    }
  };

  
  

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900  text-white">
        
        
        <header className="p-6 flex justify-between items-center">
        <div>
            <Link
                to="/"
            >
                <img src="testiflow_white.png" alt="" className="w-56 h-30" />
            </Link>
            
        </div>
        
      <nav>
          <div className='rounded-full p-3 hover:bg-gray-800' >
            <Link
            to="/dashboard"
            >
            <X/>
            </Link>
            </div>
        </nav>
      </header>
      <div className="flex">
        {/* Left Section - Live Preview */}
        <div className={`w-1/2 p-6 bg-noneshadow-lg`}>
            <h1 className='font-thin text-3xl mb-10'>This is the <span className='text-blue-500 font-normal'>live preview </span>of the page that will be send to the clients for review :</h1>
            <div className=' relative border-2 border-gray-700 rounded-2xl h-auto p-10'>
            <span class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-black rounded-lg">
                Live Preview
  </span>
          <img src={spaceLogo || "https://via.placeholder.com/150"} alt="Logo" className="w-32 mx-auto mt-4" />
          <h2 className="text-4xl text-center mt-4">{headerTitle || 'Header Title goes here...'}</h2>
          <p className="text-center mt-6 text-lg">{customMessage || 'Custom Message goes...'}</p>

          <div className="mt-6">
            <h1 className='text-lg text-blue-300'>QUESTIONS : </h1>
            {questions.map((q, index) => (
              <div key={q.id} className="mt-2 p-4 bg-gray-700 rounded-xl">
                <p>{q.question || `Question ${index + 1}`}</p>
              </div>
            ))}
          </div>

          <div className='flex flex-row justify-center w-full gap-3'>
          <div className='p-3 mt-6 flex flex-row gap-3 justify-center font-light text-white items-center bg-gradient-to-r from-blue-600 to-blue-600 rounded-md'>
            <Pencil className='h-5 w-5' />
            <p className='text-lg font-thin'>Write a text</p>
            
          </div>
          <div className='p-3 mt-6 flex flex-row gap-3 font-extralight justify-center text-white items-center bg-gradient-to-r from-purple-600 to-purple-600  rounded-md'>
            <Camera className='h-5 w-5 ' />
            <p className='text-lg font-thin'>Record a video</p>
            
          </div>
          </div>
          

          
            </div>
          
        </div>

        {/* Right Section - Form for creating a space */}
        <div className=' mr-6 w-2/3'>
        <div className=" p-6 bg-none  border-2 border-gray-800 rounded-3xl shadow-lg">
          <h2 className="text-4xl font-nromal mb-4 text-center">
            {state && state.type === 'edit' ? (
              <> 
              Edit the space 
              </>
            ) : (
              <> 
              Create a New Space
              </>
            )}
            
            </h2>
          {state && state.type === 'AI' || !state && (
            <p className='text-center text-gray-300 font-light text-lg mb-6'>After the Space is created, it will generate a dedicated page for collecting testimonials.</p>
          )
          }
          <div className="space-y-4">
            {/* Space Name */}
            <div>
              <label className="block text-lg">Space Name :</label>
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full mt-3 p-3 rounded-lg bg-gray-600 text-white"
                placeholder="Enter space name"
              />
            </div>

            {/* Space Logo */}
            <div>
              <label className="block text-lg font-extralight">Space Logo :</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full p-3 mt-3 rounded-lg bg-gray-600 text-white"
              />
            </div>

            {/* Header Title */}
            <div>
              <label className="block text-lg font-extralight">Header Title : </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full p-3 mt-3 rounded-lg bg-gray-600 text-white"
                placeholder="Enter header title"
              />
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-lg font-extralight">Custom Message : </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 mt-3 rounded-lg bg-gray-600 text-white"
                placeholder="Enter a custom message"
              />
            </div>

            {/* Questions */}
            <div>
              <label className="block text-lg font-extralight">Questions : </label>
              {questions.map((q) => (
                <div key={q.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-600 text-white"
                    placeholder="Enter a question"
                  />
                  <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-600">
                    <Trash2 />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddQuestion}
                className="text-blue-500"
              >
                Add Question
              </button>
            </div>

            {/* Extra Information Collection */}
            <div>
              <label className="block text-lg font-extralight">Collect Extra Information : </label>
              <p className='text-sm text-gray-400 mb-3'>* These will be the reuired fields from the client giving review</p>
              <div className="space-y-2">
                <div>
                  <input
                    type="checkbox"
                    checked={extraInfo.name}
                    onChange={(e) => setExtraInfo({ ...extraInfo, name: e.target.checked })}
                    className="mr-2"
                  />
                  <label>Name</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={extraInfo.email}
                    onChange={(e) => setExtraInfo({ ...extraInfo, email: e.target.checked })}
                    className="mr-2"
                  />
                  <label>Email</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={extraInfo.phone}
                    onChange={(e) => setExtraInfo({ ...extraInfo, phone: e.target.checked })}
                    className="mr-2"
                  />
                  <label>Phone</label>
                </div>
              </div>
            </div>

            {/* Collection Type */}
            <div>
              <label className="block text-lg font-extralight">Collection Type : </label>
              <select
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value)}
                className="w-full p-3 mt-3 rounded-lg bg-gray-600 text-white"
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Custom Button Color (for paid users) */}
            

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mt-4 text-red-500">
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Create Space Button */}
            <button
              onClick={handleCreateSpace}
              className="w-full py-3 mt-4 font-extralight bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={errors.length > 0}
            >
              {state && state.type === 'edit' ? (
                <>  
                Edit the space 
                </>
              )
              : (
                <> 
                Create New Space + 
                </>
              )
              }
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Display the generated link */}
      {spaceLink && (
        <div className="mt-6 text-center">
          <p className="text-lg text-green-500">Space Created! Share this link:</p>
          <a href={spaceLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">{spaceLink}</a>
        </div>
      )}
      <footer className="bg-gray-800 p-4 text-center mt-8 w-full">
    <p className="text-sm text-gray-400">
      © {new Date().getFullYear()} TestiFlow. All rights reserved.
    </p>
  </footer>
    </div>
    
  );
};

export default CreateSpace;
