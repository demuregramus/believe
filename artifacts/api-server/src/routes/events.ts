import { Router, Response, type IRouter } from "express";

const router: IRouter = Router();

// Store active SSE clients
const sseClients: Response[] = [];

const handleSseConnection = (req: any, res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Send initial connection heartbeat
  res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);

  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
};

// GET /api/stream and GET /api/events/stream
router.get("/stream", handleSseConnection);
router.get("/events/stream", handleSseConnection);

/** Broadcast real-time event to all connected web, desktop & mobile clients */
export function broadcastSseEvent(type: "message" | "call" | "voicemail" | "contact" | "number-lock", data: unknown): void {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignore closed client writes
    }
  });
}

export default router;
