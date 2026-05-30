import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, LogOut, Calendar, Car, DollarSign, Search, CheckCircle, CalendarClock, Download, X } from "lucide-react";
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
  paymentMethod: string;
  status: "today" | "upcoming" | "completed" | "cancelled";
}

type Tab = "today" | "upcoming" | "completed";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<{ name: string; email: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [searchName, setSearchName] = useState("");
  const [searchPlate, setSearchPlate] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

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

        const mapped: Appointment[] = data.appointments.map((apt: any) => {
          const isToday = apt.appointment_date === todayStr;
          let status: Appointment["status"] = "upcoming";
          if (apt.status === "completed") status = "completed";
          else if (isToday) status = "today";
          else status = "upcoming";

          return {
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
            paymentMethod: apt.payment_method,
            status,
          };
        });

        setAppointments(mapped);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("employee");
    navigate("/employee-login");
  };

  const handleOpenMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, "_blank");
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}/complete`, { method: "PATCH" });
      setAppointments((prev) =>
        prev.map((apt) => apt.id === id ? { ...apt, status: "completed" } : apt)
      );
    } catch (err) {
      console.error("Failed to complete appointment:", err);
    }
  };

  const filterAppointments = (list: Appointment[]) => {
    return list.filter((apt) => {
      const nameMatch = apt.customerName.toLowerCase().includes(searchName.toLowerCase());
      const plateMatch = apt.licensePlate.toLowerCase().includes(searchPlate.toLowerCase());
      const dateMatch = dateFilter ? apt.date === dateFilter : true;
      return nameMatch && plateMatch && dateMatch;
    });
  };

  const todayAppointments = filterAppointments(appointments.filter((a) => a.status === "today"));
  const upcomingAppointments = filterAppointments(appointments.filter((a) => a.status === "upcoming"));
  const completedAppointments = filterAppointments(appointments.filter((a) => a.status === "completed"));

  const totalRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, apt) => sum + apt.totalPrice, 0);

  const activeList =
    activeTab === "today" ? todayAppointments :
    activeTab === "upcoming" ? upcomingAppointments :
    completedAppointments;

  const handleExportCSV = () => {
    const exportList = dateFilter
      ? appointments.filter((a) => a.date === dateFilter)
      : appointments;

    if (exportList.length === 0) {
      alert("No appointments to export.");
      return;
    }

    const headers = [
      "Name", "Phone", "Email", "Address", "License Plate",
      "Vehicle", "Service", "Date", "Time", "Payment Method",
      "Total (JMD)", "Status"
    ];

    const rows = exportList.map((apt) => [
      apt.customerName,
      apt.phone,
      "",
      apt.address,
      apt.licensePlate,
      apt.vehicleType,
      apt.serviceType,
      apt.date,
      apt.time,
      apt.paymentMethod === "invoice" ? "Pay on Arrival" : "Credit Card",
      `J$${apt.totalPrice}`,
      apt.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = dateFilter
      ? `klean-n-shine-appointments-${dateFilter}.csv`
      : `klean-n-shine-appointments-all.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchName("");
    setSearchPlate("");
    setDateFilter("");
  };

  const hasFilters = searchName || searchPlate || dateFilter;

  if (!employee) return null;

  const tabs: { key: Tab; label: string; count: number; icon: any; activeClass: string; inactiveClass: string }[] = [
    {
      key: "today",
      label: "Today",
      count: appointments.filter(a => a.status === "today").length,
      icon: CalendarClock,
      activeClass: "bg-blue-600 text-white",
      inactiveClass: "text-blue-600 hover:bg-blue-50",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: appointments.filter(a => a.status === "upcoming").length,
      icon: Calendar,
      activeClass: "bg-orange-500 text-white",
      inactiveClass: "text-orange-500 hover:bg-orange-50",
    },
    {
      key: "completed",
      label: "Completed",
      count: appointments.filter(a => a.status === "completed").length,
      icon: CheckCircle,
      activeClass: "bg-green-600 text-white",
      inactiveClass: "text-green-600 hover:bg-green-50",
    },
  ];

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
            <p className="text-blue-100 text-sm">Welcome, {employee.name}! 👋</p>
          </div>
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-xs font-medium">Today</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{appointments.filter(a => a.status === "today").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-400">
            <p className="text-gray-500 text-xs font-medium">Upcoming</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{appointments.filter(a => a.status === "upcoming").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-xs font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{appointments.filter(a => a.status === "completed").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">Revenue</p>
                <p className="text-xl font-bold text-purple-600 mt-1">J${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-300" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by customer name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9 h-10 rounded-lg border-gray-200"
              />
            </div>
            <div className="relative flex-1">
              <Car className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by license plate..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                className="pl-9 h-10 rounded-lg border-gray-200 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 h-10 rounded-lg border-gray-200"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 px-4 text-gray-500 border-gray-200 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
              <Button
                onClick={handleExportCSV}
                className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {dateFilter ? `Export ${dateFilter}` : "Export All"}
              </Button>
            </div>
          </div>

          {dateFilter && (
            <p className="text-xs text-blue-600 font-medium">
              Showing appointments for {new Date(dateFilter + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl shadow p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-semibold text-sm transition-all ${
                  isActive ? tab.activeClass : tab.inactiveClass
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white bg-opacity-30" : "bg-gray-100"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Appointment List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : activeList.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">
              {hasFilters ? "No results found" : `No ${activeTab} appointments`}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-primary text-sm mt-2 underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map((appointment) => (
              <div
                key={appointment.id}
                className={`bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden border-l-4 ${
                  appointment.status === "completed" ? "border-green-500" :
                  appointment.status === "today" ? "border-blue-500" :
                  "border-orange-400"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{appointment.customerName}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        {appointment.date} at {appointment.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">J${appointment.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">{appointment.vehicleType} · {appointment.serviceType}</p>
                      <p className="text-xs text-gray-400">{appointment.paymentMethod === "invoice" ? "Pay on Arrival" : "Card"}</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-100 flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-500" />
                    <span className="font-mono font-bold text-gray-800 tracking-wider">{appointment.licensePlate}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{appointment.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Service Location</p>
                        <p className="text-sm font-medium text-gray-900">{appointment.address}</p>
                      </div>
                    </div>
                  </div>

                  {appointment.status !== "completed" && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => handleOpenMaps(appointment.address)}
                        variant="outline"
                        className="flex-1 bg-blue-50 text-primary hover:bg-blue-100 border border-blue-200"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Open in Maps
                      </Button>
                      <Button
                        onClick={() => handleCompleteAppointment(appointment.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Completed
                      </Button>
                    </div>
                  )}

                  {appointment.status === "completed" && (
                    <div className="pt-4 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}