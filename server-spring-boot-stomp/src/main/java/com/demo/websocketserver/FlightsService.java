package com.demo.websocketserver;

import com.demo.websocketserver.model.Area;
import com.demo.websocketserver.model.Flight;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@EnableScheduling
public class FlightsService {
    private ObjectWriter writer;
    private Flights flights;

    public FlightsService() {
        this.writer = new ObjectMapper().writer();
        this.flights = new Flights(1000, new Area(5.5, 15., 47.5, 54.));
    }

    @Autowired
    SimpMessagingTemplate template;

    @Scheduled(fixedRate = 50)
    public void publishFlights() throws JsonProcessingException {
        this.flights.advance();
        template.send("/topic/flights", new GenericMessage<>(this.writer.writeValueAsBytes(this.flights.getFlights())));
    }
}

class Flights {
    private final Double SPEED_METERS_PER_SECOND = 250d;
    private List<Flight> flights;
    private long latestUpdate;

    public Flights(int count, Area area) {
        this.flights = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            this.flights.add(new Flight(UUID.randomUUID().toString(), "SIM" + Math.floor(Math.random() * 10000), "SIM", "FRA", "MUC", area.randomPosition(), Math.random() * 2 *Math.PI));
        }
        this.latestUpdate = System.currentTimeMillis();
    }

    public List<Flight> getFlights() {
        return flights;
    }

    public void advance() {
        long now = System.currentTimeMillis();
        Double meters = SPEED_METERS_PER_SECOND * (now - this.latestUpdate) / 1000;
        this.latestUpdate = now;
        this.flights.forEach(flight -> flight.advance(meters));
    }
}