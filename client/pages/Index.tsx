import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Droplets, Zap, Wind } from "lucide-react";

type BookingStep = "services" | "details" | "payment";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  serviceType: string;
  date: string;
  time: string;
  paymentMethod: "card" | "invoice";
}

const vehicleTypes = [
  { id: "sedan", label: "Sedan", price: 25 },
  { id: "suv", label: "SUV", price: 35 },
  { id: "truck", label: "Truck", price: 40 },
  { id: "van", label: "Van", price: 38 },
];

const serviceTypes = [
  { id: "basic", label: "Basic Wash", price: 0, icon: Droplets },
  { id: "premium", label: "Premium Wash", price: 15, icon: Zap },
  { id: "deluxe", label: "Deluxe + Wax", price: 25, icon: Wind },
];

const availableTimes = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

export default function Index() {
  const [step, setStep] = useState<BookingStep>("services");
  const [booking, setBooking] = useState<BookingData>({
    name: "",
    email: "",
    phone: "",
    vehicleType: "",
    serviceType: "basic",
    date: "",
    time: "",
    paymentMethod: "card",
  });

  const selectedVehicle = vehicleTypes.find((v) => v.id === booking.vehicleType);
  const selectedService = serviceTypes.find((s) => s.id === booking.serviceType);
  const totalPrice =
    (selectedVehicle?.price || 0) + (selectedService?.price || 0);

  const handleSelectService = (serviceId: string, vehicleId: string) => {
    setBooking((prev) => ({
      ...prev,
      serviceType: serviceId,
      vehicleType: vehicleId,
    }));
    setStep("details");
  };

  const handleSelectTime = (date: string, time: string) => {
    setBooking((prev) => ({
      ...prev,
      date,
      time,
    }));
  };

  const handleSubmit = () => {
    if (
      booking.name &&
      booking.email &&
      booking.phone &&
      booking.date &&
      booking.time
    ) {
      // Create downloadable invoice
      const invoiceContent = `
CAR WASH APPOINTMENT INVOICE
=============================
Date: ${new Date().toLocaleDateString()}
Appointment Date: ${booking.date}
Appointment Time: ${booking.time}

CUSTOMER INFORMATION
--------------------
Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}

SERVICE DETAILS
---------------
Vehicle Type: ${selectedVehicle?.label}
Service: ${selectedService?.label}

PRICING
-------
Vehicle Base: $${selectedVehicle?.price || 0}.00
Service: $${selectedService?.price || 0}.00
---
TOTAL: $${totalPrice}.00

Payment Method: ${booking.paymentMethod === "card" ? "Credit/Debit Card" : "Payment Upon Arrival"}

Thank you for choosing our car wash service!
`;

      if (booking.paymentMethod === "invoice") {
        // Download invoice
        const element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," +
            encodeURIComponent(invoiceContent)
        );
        element.setAttribute("download", "car-wash-invoice.txt");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      // Reset and show confirmation
      alert("Appointment booked successfully!");
      setBooking({
        name: "",
        email: "",
        phone: "",
        vehicleType: "",
        serviceType: "basic",
        date: "",
        time: "",
        paymentMethod: "card",
      });
      setStep("services");
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-blue-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white text-primary rounded-full p-2">
              <Droplets className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">ShineFlow</h1>
          </div>
          <p className="text-blue-100">Professional Car Wash Appointments</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 mt-6">
          {(["services", "details", "payment"] as const).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  (
                    ["services", "details", "payment"] as const
                  ).indexOf(step) >= idx
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`h-1 w-8 mx-2 transition-all ${
                    (
                      ["services", "details", "payment"] as const
                    ).indexOf(step) > idx
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
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Choose Your Service
            </h2>
            <p className="text-gray-600 mb-6">
              Select your vehicle type and service package
            </p>

            {/* Vehicle Type Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Vehicle Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {vehicleTypes.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      booking.vehicleType === vehicle.id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 bg-white hover:border-primary hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      setBooking((prev) => ({
                        ...prev,
                        vehicleType: vehicle.id,
                      }))
                    }
                  >
                    <div className="font-semibold text-gray-900">
                      {vehicle.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      Base: ${vehicle.price}
                    </div>
                    {booking.vehicleType === vehicle.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Service Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Service Package
              </h3>
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
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          serviceType: service.id,
                        }))
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <ServiceIcon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {service.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              +${service.price}
                            </div>
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

            {/* Price Summary */}
            {booking.vehicleType && (
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span>Vehicle Base:</span>
                  <span>${selectedVehicle?.price || 0}.00</span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-400 pt-3 mb-4">
                  <span>Service:</span>
                  <span>${selectedService?.price || 0}.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-blue-400 pt-3">
                  <span>Total:</span>
                  <span>${totalPrice}.00</span>
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
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Your Information
            </h2>
            <p className="text-gray-600 mb-6">
              Provide your details and select a time slot
            </p>

            {/* Personal Information */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={booking.name}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-12 rounded-xl border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={booking.email}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="h-12 rounded-xl border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={booking.phone}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="h-12 rounded-xl border-gray-300"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  min={getMinDate()}
                  value={booking.date}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="h-12 rounded-xl border-gray-300 pl-12"
                />
              </div>
            </div>

            {/* Time Selection */}
            {booking.date && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Available Times
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSelectTime(booking.date, time)}
                      className={`p-3 rounded-lg font-medium text-sm transition-all border ${
                        booking.time === time
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                      }`}
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-medium text-gray-900">
                    {selectedVehicle?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium text-gray-900">
                    {selectedService?.label}
                  </span>
                </div>
                {booking.date && booking.time && (
                  <>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span>Date & Time:</span>
                      <span className="font-medium text-gray-900">
                        {booking.date} at {booking.time}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">${totalPrice}.00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("services")}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("payment")}
                disabled={!booking.name || !booking.email || !booking.phone || !booking.date || !booking.time}
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
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Payment Method
            </h2>
            <p className="text-gray-600 mb-6">
              Choose how you'd like to pay for your appointment
            </p>

            {/* Payment Options */}
            <div className="space-y-3 mb-8">
              <div
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  booking.paymentMethod === "card"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() =>
                  setBooking((prev) => ({
                    ...prev,
                    paymentMethod: "card",
                  }))
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Pay with Card
                    </div>
                    <div className="text-sm text-gray-600">
                      Secure payment now
                    </div>
                  </div>
                  {booking.paymentMethod === "card" && (
                    <div className="w-5 h-5 bg-primary rounded-full" />
                  )}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  booking.paymentMethod === "invoice"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() =>
                  setBooking((prev) => ({
                    ...prev,
                    paymentMethod: "invoice",
                  }))
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Pay on Arrival
                    </div>
                    <div className="text-sm text-gray-600">
                      Download invoice, pay at location
                    </div>
                  </div>
                  {booking.paymentMethod === "invoice" && (
                    <div className="w-5 h-5 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Card Payment Form */}
            {booking.paymentMethod === "card" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Card Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="h-12 rounded-xl border-gray-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        className="h-12 rounded-xl border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <Input
                        type="text"
                        placeholder="123"
                        maxLength="3"
                        className="h-12 rounded-xl border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Preview */}
            {booking.paymentMethod === "invoice" && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Invoice Preview
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{selectedVehicle?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedService?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total Amount Due:</span>
                    <span className="text-primary">${totalPrice}.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Final Summary */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span>Subtotal:</span>
                <span>${totalPrice}.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-blue-400 pt-3">
                <span>Total:</span>
                <span>${totalPrice}.00</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep("details")}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 bg-secondary hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
              >
                {booking.paymentMethod === "card"
                  ? "Complete Payment"
                  : "Download Invoice & Confirm"}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 px-4 text-gray-600 text-sm mt-8">
        <p>© 2024 ShineFlow. Professional Car Wash Services.</p>
      </footer>
    </div>
  );
}
