import { WebSocketServer } from "ws";
import { subscribe, unsubscribe } from "./flightMonitor";

const wss = new WebSocketServer({ port: 3042 });

wss.on("connection", (ws) => {
  const id = subscribe((planes) => {
    ws.send(JSON.stringify(planes));
  });

  /*const closeWsCallback = setTimeout(() => {
    ws.close();
  }, 10000);*/

  ws.on("message", (data) => {
    console.log(`Client has sent us: ${data}`);
  });

  ws.on("close", () => {
    unsubscribe(id);
    //clearTimeout(closeWsCallback);
  });
  // handling client connection error
  ws.onerror = function () {
    console.log("Some Error occurred");
  };
});
