import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, MapPin, Phone, Clock, LogOut, Calendar, Car, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  licensePlate: string;
  vehicleType: string;
  serviceType: string;
  date: string;
  time: string;
  totalPrice: number;
  status: "upcoming" | "completed" | "cancelled";
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<{ name: string; email: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (!storedEmployee) {
      navigate("/employee-login");
      return;
    }
    setEmployee(JSON.parse(storedEmployee));

    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();

        const mapped: Appointment[] = data.appointments.map((apt: any) => ({
          id: apt.id,
          customerName: apt.name,
          phone: apt.phone,
          address: apt.address,
          licensePlate: apt.license_plate,
          vehicleType: apt.vehicle_label,
          serviceType: apt.service_label,
          date: apt.appointment_date,
          time: apt.appointment_time,
          totalPrice: apt.total_price,
          status: apt.status === "pending" ? "upcoming" : apt.status as "upcoming" | "completed" | "cancelled",        }));

        setAppointments(mapped);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchAppointments();
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem("employee");
    navigate("/employee-login");
  };

  const handleOpenMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, "_blank");
  };

  const handleCompleteAppointment = (id: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "completed" } : apt
      )
    );
    setSelectedAppointment(null);
  };

  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming");
  const completedAppointments = appointments.filter((apt) => apt.status === "completed");

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white py-6 px-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo.jpg" alt="Klean N Shine" className="h-12 w-12 rounded-full object-cover" />
              <h1 className="text-3xl font-bold">Klean N Shine</h1>
            </div>
            <p className="text-blue-100 text-sm">
              Welcome, {employee.name}! 👋
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Today</p>
                <p className="text-4xl font-bold text-primary mt-1">
                  {upcomingAppointments.length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-4xl font-bold text-green-600 mt-1">
                  {completedAppointments.length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-4xl font-bold text-orange-600 mt-1">
                  J${appointments.reduce((sum, apt) => sum + apt.totalPrice, 0)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No upcoming appointments</p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all border-l-4 border-primary overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {appointment.customerName}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        {appointment.date} at {appointment.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        J${appointment.totalPrice}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.vehicleType} - {appointment.serviceType}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <Car className="w-4 h-4" />
                      {appointment.licensePlate}
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Service Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleOpenMaps(appointment.address)}
                      className="flex-1 bg-blue-100 text-primary hover:bg-blue-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                    <Button
                      onClick={() => handleCompleteAppointment(appointment.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark Completed
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Appointments */}
        {completedAppointments.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Appointments</h2>
            <div className="space-y-3">
              {completedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-green-50 rounded-xl shadow border-l-4 border-green-500 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {appointment.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.licensePlate} • {appointment.vehicleType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        J${appointment.totalPrice}
                      </p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
