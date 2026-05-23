import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Droplets, Zap, MapPin, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BookingStep = "services" | "details" | "payment" | "confirmation";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressDetails: string;
  licensePlate: string;
  vehicleType: string;
  serviceType: string;
  addPolish: boolean;
  date: string;
  time: string;
  paymentMethod: "card" | "invoice";
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  licensePlate?: string;
}

const vehicleTypes = [
  { id: "sedan", label: "Car", price: 1800 },
  { id: "suv", label: "SUV", price: 2500 },
  { id: "van", label: "Van", price: 3000 },
  { id: "truck", label: "Truck", price: 5000 },
];

const serviceTypes = [
  { id: "basic", label: "Basic Wash", price: 0, icon: Droplets },
  { id: "premium", label: "Premium + Polish", price: 2500, icon: Zap },
];

const availableTimes = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

function validate(booking: BookingData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!booking.name.trim()) {
    errors.name = "Full name is required.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(booking.name.trim())) {
    errors.name = "Name can only contain letters.";
  }

  if (!booking.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!booking.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-()]{7,}$/.test(booking.phone.trim())) {
    errors.phone = "Please enter a valid phone number (min 7 digits).";
  }

  if (!booking.address.trim()) {
    errors.address = "Address is required.";
  } else if (booking.address.trim().length < 10) {
    errors.address = "Please enter a full address (at least 10 characters).";
  }

  if (!booking.licensePlate.trim()) {
    errors.licensePlate = "License plate is required.";
  } else if (!/^[a-zA-Z0-9-]{4,8}$/.test(booking.licensePlate.trim())) {
    errors.licensePlate = "License plate must be 4–8 letters/numbers.";
  }

  return errors;
}

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>("services");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [booking, setBooking] = useState<BookingData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    addressDetails: "",
    licensePlate: "",
    vehicleType: "",
    serviceType: "basic",
    addPolish: false,
    date: "",
    time: "",
    paymentMethod: "card",
  });

  const selectedVehicle = vehicleTypes.find((v) => v.id === booking.vehicleType);
  const selectedService = serviceTypes.find((s) => s.id === booking.serviceType);
  const totalPrice = (selectedVehicle?.price || 0) + (selectedService?.price || 0);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(booking));
  };

  const handleSelectTime = (date: string, time: string) => {
    setBooking((prev) => ({ ...prev, date, time }));
  };

  const fetchBookedTimes = async (date: string) => {
    try {
      const response = await fetch(`/api/appointments/booked-times/${date}`);
      if (!response.ok) {
        setBookedTimes([]);
        return;
      }
      const data = await response.json();
      setBookedTimes(data.bookedTimes || []);
    } catch (err) {
      console.error("Failed to fetch booked times:", err);
      setBookedTimes([]);
    }
  };

  const handleContinueToPayment = () => {
    const validationErrors = validate(booking);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, phone: true, address: true, licensePlate: true });
    if (Object.keys(validationErrors).length > 0) return;
    if (!booking.date || !booking.time) return;
    setStep("payment");
  };

  const openPDFReceipt = () => {
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Klean N Shine Receipt</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #f0f4ff; display: flex; justify-content: center; padding: 40px 20px; }
            .receipt { background: white; width: 100%; max-width: 520px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
            .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 32px 28px 24px; text-align: center; }
            .logo-circle { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid white; margin: 0 auto 14px; display: block; }
            .header h1 { color: white; font-size: 26px; font-weight: bold; letter-spacing: 2px; }
            .header p { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
            .badge { display: inline-block; background: #22c55e; color: white; font-size: 11px; font-weight: bold; padding: 5px 16px; border-radius: 99px; margin-top: 14px; letter-spacing: 1px; }
            .body { padding: 28px; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 10px; font-weight: bold; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #f1f5f9; }
            .row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f8fafc; }
            .row:last-child { border-bottom: none; }
            .label { color: #64748b; font-size: 13px; }
            .value { color: #1e293b; font-size: 13px; font-weight: 600; text-align: right; max-width: 65%; }
            .plate { font-family: monospace; background: #fef9c3; border: 1px solid #fde047; padding: 2px 10px; border-radius: 6px; letter-spacing: 3px; font-size: 13px; }
            .total-box { background: linear-gradient(135deg, #1d4ed8, #3b82f6); border-radius: 12px; padding: 20px 24px; margin: 24px 0 20px; }
            .total-inner { display: flex; justify-content: space-between; align-items: center; }
            .total-label { color: #bfdbfe; font-size: 13px; }
            .total-amount { color: white; font-size: 32px; font-weight: bold; }
            .total-sub { color: #93c5fd; font-size: 11px; margin-top: 6px; }
            .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0; }
            .footer { text-align: center; padding: 0 28px 32px; }
            .tagline { color: #1d4ed8; font-weight: bold; font-size: 14px; margin-bottom: 6px; }
            .footer p { color: #94a3b8; font-size: 11px; margin-top: 4px; line-height: 1.6; }
            .booking-id { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; margin: 16px 0; text-align: center; }
            .booking-id p { color: #94a3b8; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
            .booking-id span { color: #1e293b; font-size: 12px; font-family: monospace; font-weight: bold; }
            @media print {
              body { background: white; padding: 0; }
              .receipt { box-shadow: none; border-radius: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <img src="${window.location.origin}/logo.jpg" class="logo-circle" alt="Klean N Shine" />
              <h1>KLEAN N SHINE</h1>
              <p>Mobile Car Wash Service · We Bring the Shine to You</p>
              <div class="badge">✓ BOOKING CONFIRMED</div>
            </div>

            <div class="body">
              <div class="section">
                <div class="section-title">Customer Information</div>
                <div class="row"><span class="label">Name</span><span class="value">${booking.name}</span></div>
                <div class="row"><span class="label">Email</span><span class="value">${booking.email}</span></div>
                <div class="row"><span class="label">Phone</span><span class="value">${booking.phone}</span></div>
              </div>

              <div class="section">
                <div class="section-title">Service Location</div>
                <div class="row"><span class="label">Address</span><span class="value">${booking.address}</span></div>
                ${booking.addressDetails ? `<div class="row"><span class="label">Notes</span><span class="value">${booking.addressDetails}</span></div>` : ""}
              </div>

              <div class="section">
                <div class="section-title">Vehicle Details</div>
                <div class="row"><span class="label">Type</span><span class="value">${selectedVehicle?.label}</span></div>
                <div class="row"><span class="label">License Plate</span><span class="value"><span class="plate">${booking.licensePlate}</span></span></div>
              </div>

              <div class="section">
                <div class="section-title">Appointment</div>
                <div class="row"><span class="label">Date</span><span class="value">${booking.date}</span></div>
                <div class="row"><span class="label">Time</span><span class="value">${booking.time}</span></div>
                <div class="row"><span class="label">Service</span><span class="value">${selectedService?.label}</span></div>
                <div class="row"><span class="label">Payment Method</span><span class="value">${booking.paymentMethod === "card" ? "Credit Card" : "Pay on Arrival"}</span></div>
              </div>

              <div class="section">
                <div class="section-title">Pricing Breakdown (JMD)</div>
                <div class="row"><span class="label">Vehicle — ${selectedVehicle?.label}</span><span class="value">J$${selectedVehicle?.price || 0}</span></div>
                <div class="row"><span class="label">Service — ${selectedService?.label}</span><span class="value">J$${selectedService?.price || 0}</span></div>
              </div>

              <div class="total-box">
                <div class="total-inner">
                  <span class="total-label">TOTAL AMOUNT ${booking.paymentMethod === "invoice" ? "DUE ON ARRIVAL" : "CHARGED"}</span>
                  <span class="total-amount">J$${totalPrice}</span>
                </div>
                <p class="total-sub">Booked on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              <hr class="divider" />

              <div class="footer">
                <div class="tagline">✦ Thank You for Choosing Klean N Shine! ✦</div>
                <p>Our team will arrive at your address on the scheduled date and time.</p>
                <p>For any queries, please contact us directly.</p>
                <p style="margin-top: 10px; color: #cbd5e1;">© ${new Date().getFullYear()} Klean N Shine · Mobile Car Wash Service</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      receiptWindow.document.close();
    }
  };

  const handleSubmit = async () => {
    if (
      booking.name &&
      booking.email &&
      booking.phone &&
      booking.address &&
      booking.licensePlate &&
      booking.date &&
      booking.time
    ) {
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            address: booking.address,
            address_details: booking.addressDetails,
            license_plate: booking.licensePlate,
            vehicle_type: booking.vehicleType,
            vehicle_label: selectedVehicle?.label,
            service_type: booking.serviceType,
            service_label: selectedService?.label,
            appointment_date: booking.date,
            appointment_time: booking.time,
            payment_method: booking.paymentMethod,
            vehicle_price: selectedVehicle?.price || 0,
            service_price: selectedService?.price || 0,
            total_price: totalPrice,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          if (response.status === 409) {
            alert(err.error);
            setStep("details");
          } else {
            alert("Something went wrong saving your appointment. Please try again.");
          }
          return;
        }

        const resData = await response.json();
        setCurrentAppointmentId(resData.appointment.id);

      } catch (err) {
        console.error("Network error:", err);
        alert("Could not connect to server. Please try again.");
        return;
      }

      // Open PDF receipt for all customers
      openPDFReceipt();

      setStep("confirmation");
    }
  };

  const handleEditBooking = async () => {
    if (!currentAppointmentId) return;
    setCancelling(true);
    try {
      await fetch(`/api/appointments/${currentAppointmentId}/cancel`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Failed to cancel for edit:", err);
    } finally {
      setCancelling(false);
    }
    setCurrentAppointmentId(null);
    setBookedTimes([]);
    setErrors({});
    setTouched({});
    setStep("services");
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const fieldClass = (field: string) =>
    `h-12 rounded-xl border-gray-300 ${
      touched[field] && errors[field as keyof ValidationErrors]
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : ""
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white py-6 px-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo.jpg" alt="Klean N Shine" className="h-12 w-12 rounded-full object-cover" />
              <h1 className="text-3xl font-bold">Klean N Shine</h1>
            </div>
            <p className="text-blue-100 text-sm">Mobile Car Wash Service</p>
          </div>
          <Button
            onClick={() => navigate("/employee-login")}
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-primary text-sm"
          >
            Employee
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 mt-6">
          {(["services", "details", "payment"] as const).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  (["services", "details", "payment"] as const).indexOf(step) >= idx
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`h-1 w-8 mx-2 transition-all ${
                    (["services", "details", "payment"] as const).indexOf(step) > idx
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Services */}
        {step === "services" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Choose Your Service</h2>
            <p className="text-gray-600 mb-6">Select your vehicle type and service package</p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {vehicleTypes.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      booking.vehicleType === vehicle.id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 bg-white hover:border-primary hover:bg-blue-50"
                    }`}
                    onClick={() => setBooking((prev) => ({ ...prev, vehicleType: vehicle.id }))}
                  >
                    <div className="font-semibold text-gray-900">{vehicle.label}</div>
                    <div className="text-sm text-gray-600">J${vehicle.price}</div>
                    {booking.vehicleType === vehicle.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Service Package</h3>
              <div className="space-y-3">
                {serviceTypes.map((service) => {
                  const ServiceIcon = service.icon;
                  return (
                    <div
                      key={service.id}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        booking.serviceType === service.id
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 bg-white hover:border-primary hover:bg-blue-50"
                      }`}
                      onClick={() => setBooking((prev) => ({ ...prev, serviceType: service.id }))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <ServiceIcon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900">{service.label}</div>
                            <div className="text-sm text-gray-600">+J${service.price}</div>
                          </div>
                        </div>
                        {booking.serviceType === service.id && (
                          <div className="w-5 h-5 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {booking.vehicleType && (
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span>Vehicle:</span>
                  <span>J${selectedVehicle?.price || 0}</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-400 pt-3 mb-4">
                  <span>Service:</span>
                  <span>J${selectedService?.price || 0}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-blue-400 pt-3">
                  <span>Total:</span>
                  <span>J${totalPrice}</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep("details")}
              disabled={!booking.vehicleType}
              className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-base"
            >
              Continue to Booking
            </Button>
          </div>
        )}

        {/* Step 2: Booking Details */}
        {step === "details" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Your Information</h2>
            <p className="text-gray-600 mb-6">Provide your contact details and service location</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={booking.name}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, name: e.target.value }));
                    if (touched.name) setErrors(validate({ ...booking, name: e.target.value }));
                  }}
                  onBlur={() => handleBlur("name")}
                  className={fieldClass("name")}
                />
                {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={booking.email}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, email: e.target.value }));
                    if (touched.email) setErrors(validate({ ...booking, email: e.target.value }));
                  }}
                  onBlur={() => handleBlur("email")}
                  className={fieldClass("email")}
                />
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={booking.phone}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, phone: e.target.value }));
                    if (touched.phone) setErrors(validate({ ...booking, phone: e.target.value }));
                  }}
                  onBlur={() => handleBlur("phone")}
                  className={fieldClass("phone")}
                />
                {touched.phone && errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Service Location
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                <Input
                  type="text"
                  placeholder="123 Main St, City, State ZIP"
                  value={booking.address}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, address: e.target.value }));
                    if (touched.address) setErrors(validate({ ...booking, address: e.target.value }));
                  }}
                  onBlur={() => handleBlur("address")}
                  className={fieldClass("address")}
                />
                {touched.address && errors.address ? (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Our team will arrive at this address for service</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Directions (Optional)</label>
                <textarea
                  placeholder="e.g., Gate code is 1234, park in driveway, apartment number, etc."
                  value={booking.addressDetails}
                  onChange={(e) => setBooking((prev) => ({ ...prev, addressDetails: e.target.value }))}
                  className="w-full h-24 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 mb-8 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate Number</label>
                <Input
                  type="text"
                  placeholder="e.g., ABC-1234"
                  value={booking.licensePlate}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setBooking((prev) => ({ ...prev, licensePlate: val }));
                    if (touched.licensePlate) setErrors(validate({ ...booking, licensePlate: val }));
                  }}
                  onBlur={() => handleBlur("licensePlate")}
                  className={`${fieldClass("licensePlate")} font-mono text-lg tracking-widest`}
                  maxLength="10"
                />
                {touched.licensePlate && errors.licensePlate && (
                  <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  min={getMinDate()}
                  value={booking.date}
                  onChange={(e) => {
                    setBooking((prev) => ({ ...prev, date: e.target.value, time: "" }));
                    fetchBookedTimes(e.target.value);
                  }}
                  className="h-12 rounded-xl border-gray-300 pl-12"
                />
              </div>
            </div>

            {booking.date && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Available Times</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && handleSelectTime(booking.date, time)}
                        disabled={isBooked}
                        className={`p-3 rounded-lg font-medium text-sm transition-all border ${
                          isBooked
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                            : booking.time === time
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                        }`}
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        {time}
                      </button>
                    );
                  })}
                </div>
                {!booking.time && <p className="text-xs text-gray-500 mt-2">Please select a time slot</p>}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-medium text-gray-900">{selectedVehicle?.label}</span>
                </div>
                {booking.licensePlate && (
                  <div className="flex justify-between">
                    <span>License Plate:</span>
                    <span className="font-medium text-gray-900 font-mono">{booking.licensePlate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium text-gray-900">{selectedService?.label}</span>
                </div>
                {booking.address && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-900 text-right text-xs">{booking.address}</span>
                  </div>
                )}
                {booking.date && booking.time && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span>Date & Time:</span>
                    <span className="font-medium text-gray-900">{booking.date} at {booking.time}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">J${totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep("services")} variant="outline" className="flex-1 h-12 rounded-xl">
                Back
              </Button>
              <Button
                onClick={handleContinueToPayment}
                disabled={!booking.date || !booking.time}
                className="flex-1 h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Payment Method</h2>
            <p className="text-gray-600 mb-6">Choose how you'd like to pay for your appointment</p>

            <div className="space-y-3 mb-8">
              <div
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  booking.paymentMethod === "card" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                }`}
                onClick={() => setBooking((prev) => ({ ...prev, paymentMethod: "card" }))}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Pay with Card</div>
                    <div className="text-sm text-gray-600">Secure payment now</div>
                  </div>
                  {booking.paymentMethod === "card" && <div className="w-5 h-5 bg-primary rounded-full" />}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  booking.paymentMethod === "invoice" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                }`}
                onClick={() => setBooking((prev) => ({ ...prev, paymentMethod: "invoice" }))}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Pay on Arrival</div>
                    <div className="text-sm text-gray-600">Download invoice, pay at location</div>
                  </div>
                  {booking.paymentMethod === "invoice" && <div className="w-5 h-5 bg-primary rounded-full" />}
                </div>
              </div>
            </div>

            {booking.paymentMethod === "card" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Card Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                    <Input type="text" placeholder="1234 5678 9012 3456" maxLength="19" className="h-12 rounded-xl border-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <Input type="text" placeholder="MM/YY" maxLength="5" className="h-12 rounded-xl border-gray-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                      <Input type="text" placeholder="123" maxLength="3" className="h-12 rounded-xl border-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {booking.paymentMethod === "invoice" && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Invoice Preview</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{selectedVehicle?.label}</span>
                  </div>
                  {booking.licensePlate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">License Plate:</span>
                      <span className="font-medium font-mono">{booking.licensePlate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedService?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Address:</span>
                    <span className="font-medium text-right text-xs">{booking.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">{booking.date} at {booking.time}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total Amount Due:</span>
                    <span className="text-primary">J${totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span>Subtotal:</span>
                <span>J${totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-blue-400 pt-3">
                <span>Total:</span>
                <span>J${totalPrice}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep("details")} variant="outline" className="flex-1 h-12 rounded-xl">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 bg-secondary hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
              >
                {booking.paymentMethod === "card" ? "Complete Payment" : "Download Invoice & Confirm"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === "confirmation" && (
          <div className="animate-fadeIn">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
              <p className="text-gray-600 text-lg">Your car wash appointment has been booked successfully</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Details</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b">
                  <p className="text-xs text-gray-500 font-semibold mb-1">CUSTOMER</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.name}</p>
                  <p className="text-sm text-gray-600">{booking.email}</p>
                  <p className="text-sm text-gray-600">{booking.phone}</p>
                </div>

                <div className="pb-4 border-b">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">SERVICE LOCATION</p>
                      <p className="text-sm font-medium text-gray-900">{booking.address}</p>
                    </div>
                  </div>
                </div>

                <div className="pb-4 border-b bg-orange-50 -mx-8 px-8 py-4">
                  <p className="text-xs text-gray-500 font-semibold mb-3">VEHICLE</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Type</p>
                      <p className="font-semibold text-gray-900">{selectedVehicle?.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">License Plate</p>
                      <p className="font-semibold text-gray-900 font-mono">{booking.licensePlate}</p>
                    </div>
                  </div>
                </div>

                <div className="pb-4 border-b">
                  <p className="text-xs text-gray-500 font-semibold mb-3">SERVICE & TIME</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Service</p>
                      <p className="font-semibold text-gray-900">{selectedService?.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Scheduled</p>
                      <p className="font-semibold text-gray-900">{booking.date}</p>
                      <p className="font-semibold text-gray-900">{booking.time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-4">
                  <p className="text-xs font-semibold mb-3 opacity-90">TOTAL COST (JMD)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total Amount:</span>
                    <span className="text-3xl font-bold">J${totalPrice}</span>
                  </div>
                  <p className="text-xs mt-3 opacity-90">
                    Payment Method: {booking.paymentMethod === "card" ? "Credit Card" : "Upon Arrival"}
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-gray-900 mb-2">What's Next?</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {booking.paymentMethod === "card" ? (
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      Payment confirmed and processed
                    </li>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        Receipt downloaded to your device
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        Payment due upon arrival (J${totalPrice})
                      </li>
                    </>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    Our team will arrive at your address on the scheduled date
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={openPDFReceipt}
                variant="outline"
                className="w-full h-12 rounded-xl border-blue-400 text-blue-600 hover:bg-blue-50"
              >
                Download Receipt
              </Button>
              <Button
                onClick={handleEditBooking}
                disabled={cancelling}
                variant="outline"
                className="w-full h-12 rounded-xl border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                <Pencil className="w-4 h-4 mr-2" />
                {cancelling ? "Preparing edit..." : "Edit My Booking"}
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setBooking({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      addressDetails: "",
                      licensePlate: "",
                      vehicleType: "",
                      serviceType: "basic",
                      addPolish: false,
                      date: "",
                      time: "",
                      paymentMethod: "card",
                    });
                    setBookedTimes([]);
                    setCurrentAppointmentId(null);
                    setErrors({});
                    setTouched({});
                    setStep("services");
                  }}
                  className="flex-1 h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Book Another Service
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="flex-1 h-12 rounded-xl">
                  Return Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-100 text-center py-6 px-4 text-gray-600 text-sm mt-8">
        <p>© {new Date().getFullYear()} Klean N Shine. Professional Mobile Car Wash Service.</p>
      </footer>
    </div>
  );
}