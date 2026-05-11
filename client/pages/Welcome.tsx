//import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
//import { Droplets } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  /*useEffect(() => {
    // Auto-redirect to booking after a brief moment
    const timer = setTimeout(() => {
      navigate("/booking");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]); */

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-500 to-blue-600 flex items-center justify-center px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.jpg" alt="Klean N Shine" className="h-40 w-40 rounded-full object-cover shadow-2xl border-4 border-white" />
        </div>

        <h1 className="text-5xl font-bold text-white mb-3">Klean N Shine</h1>
        
        <p className="text-blue-100 text-lg mb-12">
          We bring the SHINE to YOU!
        </p>

        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20 mb-8">
          <p className="text-white mb-6">Ready to book your wash?</p>
          <Button
            onClick={() => navigate("/booking")}
            className="w-full h-12 bg-white text-primary hover:bg-blue-50 font-semibold rounded-xl transition-all text-base"
          >
            Get Started
          </Button> 
          <p className="text-blue-100 text-sm mt-4">
            Or use the employee login
          </p>
          <Button
            onClick={() => navigate("/employee-login")}
            variant="outline"
            className="w-full mt-3 h-12 bg-transparent border-white text-white hover:bg-white hover:text-primary font-semibold rounded-xl"
          >
            Employee Login
          </Button>
        </div>

      </div>
    </div>
  );
}
