import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";

interface SocketServer extends NetSocket {
  server: HTTPServer & { io?: IOServer };
}

interface SocketResponse extends NextApiResponse {
  socket: SocketServer;
}

export const config = {
  api: { bodyParser: false },
};



export default function handler(req: NextApiRequest, res: SocketResponse) {
  if (!res.socket.server.io) {
    console.log("⚡ Socket.IO initialisiert");

    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    res.socket.server.io = io;
    

    io.on("connection", (socket: Socket) => {
        console.log("⏩ Neuer Client:", socket.id);
  
        // Beispiel: Audio-Chunks empfangen
        socket.on("audio", (chunk: Buffer) => {
            console.log("🎶 Audio-Chunk erhalten:", chunk.length, "Bytes");
    
            // Hier könntest du STT/TTS einbauen
            // Testdaten zurücksenden
            socket.emit("text", "✅ Ich habe dich verstanden (Test).");
            socket.emit("tts", "Das ist eine Test-KI-Antwort.");
        });
  
        // Stop-Signal behandeln
        socket.on("stop", () => {
            console.log("⏹ Stop-Signal erhalten");
            socket.emit("stopped", { ok: true, message: "Prozess gestoppt." });
        });
  
        // Optional: Verbindung schließen
        socket.on("disconnect", () => {
            console.log("🚪 Client getrennt:", socket.id);
        });
    });
  }

  res.end();
}
