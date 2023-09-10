import { useEffect, useRef, useState } from "react";
import { useBinanceWebsocket } from "./useBinanceWebsocket";

// This websocket hook will only update the state one out of every n messages received,
// while still keeping track of messages internally.
export function useWebSocketNthTime(n: number) {
  const pricePointsRef = useRef<number>(0);
  const priceRef = useRef<number | null>(null);
  const [pricePoints, setPricePoints] = useState<number>(0);
  const [price, setPrice] = useState<number | null>(null);
  const { ready, websocket } = useBinanceWebsocket();

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (evt: { data: string }) => {
        const currentPrice: number | null =
          JSON.parse(evt.data ?? null)?.p ?? null;
        pricePointsRef.current++;
        priceRef.current = currentPrice;

        if (pricePointsRef.current % n === 0) {
          setPricePoints(pricePointsRef.current);
          setPrice(priceRef.current);
        }
      };
    }
  }, [n, websocket]);

  return { ready, price, pricePoints };
}
