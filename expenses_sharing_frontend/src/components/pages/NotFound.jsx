import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-6">
        {/* 404 Error Code */}
        <h1 className="text-9xl font-extrabold tracking-wider">404</h1>

        {/* Page Not Found Message */}
        <p className="text-2xl font-light">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* Link to Redirect to Dashboard */}
        <Link
          to="/"
          className="inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
