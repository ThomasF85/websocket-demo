import "./App.css";
import { useWebSocketInterval } from "./hooks/useWebsocketInterval";

function App() {
  return (
    <>
      <header>
        <h1>Websocket demo</h1>
      </header>
      <main>
        <Flights />
      </main>
    </>
  );
}

function Flights() {
  const { connected, planes } = useWebSocketInterval(250);
  return (
    <>
      <h2>Websocket</h2>
      <p>Websocket is connected: {connected.toString()}</p>
      <ul>
        {planes.map((plane) => (
          <li key={plane.id}>
            {plane.position.longitude} {plane.position.latitude}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
