import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";
import { supabase } from "../db";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};

export const handleCreateAppointment: RequestHandler = async (req, res) => {
  console.log("Creating appointment with body:", JSON.stringify(req.body));
  console.log("Supabase URL:", process.env.SUPABASE_URL ? "set" : "NOT SET");
  console.log("Supabase Key:", process.env.SUPABASE_ANON_KEY ? "set" : "NOT SET");

  const {
    name,
    email,
    phone,
    address,
    address_details,
    license_plate,
    vehicle_type,
    vehicle_label,
    service_type,
    service_label,
    appointment_date,
    appointment_time,
    payment_method,
    vehicle_price,
    service_price,
    total_price,
  } = req.body;

  // Check for existing booking at same date and time
  const { data: existing, error: checkError } = await supabase
    .from("appointments")
    .select("id")
    .eq("appointment_date", appointment_date)
    .eq("appointment_time", appointment_time)
    .neq("status", "cancelled")
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Check error:", checkError);
    return res.status(500).json({ error: checkError.message });
  }

  if (existing) {
    return res.status(409).json({
      error: "This time slot is already booked. Please choose a different time.",
    });
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert([
      {
        name,
        email,
        phone,
        address,
        address_details,
        license_plate,
        vehicle_type,
        vehicle_label,
        service_type,
        service_label,
        appointment_date,
        appointment_time,
        payment_method,
        vehicle_price,
        service_price,
        total_price,
        status: "pending",
      },
    ])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("Appointment created:", data[0]?.id);
  res.status(201).json({ success: true, appointment: data[0] });
};

export const handleGetAppointments: RequestHandler = async (req, res) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ appointments: data });
};

export const handleCompleteAppointment: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true });
};

export const handleGetBookedTimes: RequestHandler = async (req, res) => {
  const { date } = req.params;

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const bookedTimes = data.map((apt) => apt.appointment_time);
  res.status(200).json({ bookedTimes });
};

export const handleCancelAppointment: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  if (appointment.status === "cancelled") {
    return res.status(400).json({ error: "This appointment has already been cancelled." });
  }

  if (appointment.status === "completed") {
    return res.status(400).json({ error: "Cannot cancel a completed appointment." });
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true, appointment });
};

export const handleGetAppointmentById: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  res.status(200).json({ appointment: data });
};