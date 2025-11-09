import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mb-2 text-2xl font-semibold text-gray-700">
          Page Not Found
        </p>
        <p className="mb-6 text-gray-600">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
        >
          ⬅ Back to Home
        </a>
      </div>
    </div>
  );
}
