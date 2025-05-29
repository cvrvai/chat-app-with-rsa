import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 py-4 md:py-6">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              Secure Messaging App &copy; {currentYear}
            </div>
          </div>
          
          <div className="flex space-x-4 md:space-x-6">
            <div className="text-xs sm:text-sm text-gray-400">
              create by group 2
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
