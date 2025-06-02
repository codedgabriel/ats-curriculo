import { useState, useEffect } from "react";

function LoadedDataModal({setData}) {
  const [showLoadedMessage, setShowLoadedMessage] = useState(false);

  useEffect(() => {
    if (showLoadedMessage) {
      const timer = setTimeout(() => setShowLoadedMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLoadedMessage]);

  useEffect(() => {
    const savedFormData = localStorage.getItem("resumeFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setData(parsedData);
        setShowLoadedMessage(true);
        setTimeout(() => setShowLoadedMessage(false), 3000);
      } catch (error) {
        console.error("Failed to parse saved form data", error);
      }
    }
  }, [setData]); // Added setData to dependency array

  return (
    <>
      {showLoadedMessage && (
        <div className="fixed bottom-4 left-4 z-50 w-80 max-w-full bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg flex items-center shadow-lg transform transition-all duration-500 ease-out animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm">
            Seus dados anteriores foram carregados automaticamente.
          </p>
        </div>
      )}
    </>
  );
}

export default LoadedDataModal;