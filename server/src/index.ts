import { WebSocketServer } from "ws";
import { createFlightService } from "./flightService";

const wss = new WebSocketServer({ port: 3042 });
const { subscribe, unsubscribe } = createFlightService(100);

wss.on("connection", (ws) => {
  const id = subscribe((flights) => {
    ws.send(JSON.stringify(flights));
  });

  ws.on("message", (data) => {
    console.log(`Client has sent us: ${data}`);
  });

  ws.on("close", () => {
    unsubscribe(id);
  });

  // handling client connection error
  ws.onerror = function () {
    console.log("Some Error occurred");
  };
});
