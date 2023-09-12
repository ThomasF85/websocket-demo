import { useState } from "react";
import "./App.css";
import WebsocketMap from "./components/WebsocketMap";
import StompMap from "./components/StompMap";

function App() {
  const [interval, setInterval] = useState(250);
  const [stomp, setStomp] = useState(false);

  return (
    <>
      <header>
        <h1>Websocket demo</h1>
      </header>
      <main>
        <div className="subtitle">
          <label>
            Interval for State updates:{" "}
            <select
              name="interval"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value))}
            >
              <option value={50}>50 ms</option>
              <option value={100}>100 ms</option>
              <option value={250}>250 ms</option>
              <option value={500}>500 ms</option>
              <option value={1000}>1000 ms</option>
            </select>
          </label>
          <label>
            Choose connection:{" "}
            <select
              name="stomp"
              value={stomp.toString()}
              onChange={(e) => setStomp(e.target.value === "true")}
            >
              <option value={"true"}>Stomp</option>
              <option value={"false"}>Websocket</option>
            </select>
          </label>
        </div>
        {stomp ? (
          <StompMap interval={interval} />
        ) : (
          <WebsocketMap interval={interval} />
        )}
      </main>
    </>
  );
}

export default App;
