package com.demo.websocketserver.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FlightTest {

    @Test
    void advance() {
        // given
        Flight flight = new Flight("1", "FN1", "AL1", "AR1", "DP1", new Vector(20.5, 40.5), 0.8);

        // when
        flight.advance(2400.);

        // then
        assertEquals(flight.getPosition().getLatitude(), 40.51503573416, 0.00000001);
        assertEquals(flight.getPosition().getLongitude(), 20.520366336130, 0.00000001);
    }
}