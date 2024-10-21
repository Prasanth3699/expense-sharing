import { FaGithub, FaLinkedin } from "react-icons/fa"; // Import icons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Copyright Section */}
        <p className="text-sm text-center md:text-left mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Daily Expenses. All rights reserved.
        </p>

        {/* Social Links Section */}
        <div className="flex space-x-6">
          <a
            href="https://github.com/prasanth3699"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-blue-400 transition duration-300"
          >
            <FaGithub className="mr-2" /> GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/prasanthsekar3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-blue-400 transition duration-300"
          >
            <FaLinkedin className="mr-2" /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
