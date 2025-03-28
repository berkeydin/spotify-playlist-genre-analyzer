import { useState, useEffect, useCallback } from "react";

const ScrollToTop = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(() => {
    if (containerRef.current) {
      setIsVisible(containerRef.current.scrollTop > 300);
    }
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", toggleVisibility);
      return () => currentRef.removeEventListener("scroll", toggleVisibility);
    }
  }, [containerRef, toggleVisibility]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-spotify-green hover:bg-spotify-secondary text-white p-3 rounded-full shadow-spotify transition-all duration-300 transform hover:scale-110 z-50 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Yukarı çık"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

export default ScrollToTop;
