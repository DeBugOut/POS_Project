import { Clock, User, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Clock className="h-6 w-6" />
        <span className="text-lg">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-2 hover:text-gray-300">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>John Doe</span>
        </div>
      </div>
    </nav>
  );
}