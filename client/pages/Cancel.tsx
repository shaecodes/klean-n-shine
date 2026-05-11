import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplets, MapPin, Clock, Car } from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  email: string;
  address: string;
  vehicle_label: string;
  license_plate: string;
  service_label: string;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  status: string;
}

export default function Cancel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${id}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Appointment not found.");
        } else {
          setAppointment(data.appointment);
          if (data.appointment.status === "cancelled") {
            setCancelled(true);
          }
        }
      } catch {
        setError("Could not load appointment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to cancel appointment.");
      } else {
        setCancelled(true);
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src="/logo.jpg" alt="Klean N Shine" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-bold">Klean N Shine</h1>
            <p className="text-blue-100 text-sm">Mobile Car Wash Service</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-8 mt-8">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading appointment...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-semibold text-lg mb-2">Oops!</p>
            <p className="text-red-500">{error}</p>
            <Button onClick={() => navigate("/")} className="mt-6 bg-primary hover:bg-blue-700 text-white rounded-xl">
              Return Home
            </Button>
          </div>
        )}

        {!loading && !error && cancelled && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-full p-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Cancelled</h2>
            <p className="text-gray-600 mb-8">Your appointment has been successfully cancelled.</p>
            <Button onClick={() => navigate("/booking")} className="bg-primary hover:bg-blue-700 text-white rounded-xl px-8 h-12">
              Book a New Appointment
            </Button>
          </div>
        )}

        {!loading && !error && !cancelled && appointment && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Appointment</h2>
              <p className="text-gray-600">Are you sure you want to cancel this appointment?</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-l-4 border-red-400 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{appointment.appointment_date} at {appointment.appointment_time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Car className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{appointment.vehicle_label} — {appointment.license_plate}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Droplets className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{appointment.service_label}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{appointment.address}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                  <span className="text-gray-600">Total</span>
                  <span className="text-primary">J${appointment.total_price}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
