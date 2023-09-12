package com.demo.websocketserver;

import com.demo.websocketserver.model.Flight;
import com.demo.websocketserver.model.Vector;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class FlightController {

    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Flight createTestFlight(Vector vector) {
        return new Flight(UUID.randomUUID().toString(), "SIM" + Math.floor(Math.random() * 10000), "SIM", "FRA", "MUC", vector, Math.random() * 2 *Math.PI);
    }
}
