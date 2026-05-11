import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  handleDemo,
  handleCreateAppointment,
  handleGetAppointments,
  handleCompleteAppointment,
  handleGetBookedTimes,
  handleCancelAppointment,
  handleGetAppointmentById,
} from "./routes/demo";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/appointments", handleCreateAppointment);
  app.get("/api/appointments/booked-times/:date", handleGetBookedTimes);
  app.get("/api/appointments/:id", handleGetAppointmentById);
  app.get("/api/appointments", handleGetAppointments);
  app.patch("/api/appointments/:id/complete", handleCompleteAppointment);
  app.patch("/api/appointments/:id/cancel", handleCancelAppointment);

  return app;
}