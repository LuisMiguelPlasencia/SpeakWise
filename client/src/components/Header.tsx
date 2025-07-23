import { Mic } from "lucide-react";

export default function Header() {
  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
              <Mic className="text-white text-lg" />
            </div>
            <span className="text-white text-xl font-bold">SpeakWise</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">History</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Settings</a>
          </div>
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
