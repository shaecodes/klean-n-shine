import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Demo employees for testing
  const demoEmployees = [
    { email: "employee@kleanshine.com", password: "demo123" },
    { email: "manager@kleanshine.com", password: "demo123" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const employee = demoEmployees.find(
      (emp) => emp.email === email && emp.password === password
    );

    if (employee) {
      localStorage.setItem(
        "employee",
        JSON.stringify({ email, name: email.split("@")[0] })
      );
      navigate("/employee-dashboard");
    } else {
      setError("Invalid email or password. Try: employee@kleanshine.com / demo123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-500 to-blue-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.jpg" alt="Klean N Shine" className="h-40 w-40 rounded-full object-cover shadow-2xl border-4 border-white" />
            </div>

            <h1 className="text-5xl font-bold text-white mb-3">Klean N Shine</h1>
            <p className="text-xl text-blue-100 mb-2">Mobile Car Wash Service</p>
            <p className="text-blue-100 text-sm mt-1">Employee Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Employee Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="employee@kleanshine.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="h-12 rounded-xl border-gray-300 pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="h-12 rounded-xl border-gray-300 pl-12"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!email || !password}
                className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl transition-all mt-6"
              >
                Login as Employee
              </Button>
            </form>

            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-600">
                Email: <span className="font-mono text-primary">employee@kleanshine.com</span>
              </p>
              <p className="text-xs text-gray-600">
                Password: <span className="font-mono text-primary">demo123</span>
              </p>
            </div> */}

            <button
              onClick={() => navigate("/")}
              className="w-full mt-6 flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customer Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
