package com.demo.websocketserver.model;

public class Flight {
    private String id;
    private String flightNumber;
    private String airline;
    private String arrival;
    private String departure;

    private Vector position;

    private Double heading;

    public Flight(String id, String flightNumber, String airline, String arrival, String departure, Vector position, Double heading) {
        this.id = id;
        this.flightNumber = flightNumber;
        this.airline = airline;
        this.arrival = arrival;
        this.departure = departure;
        this.position = position;
        this.heading = heading;
    }

    public void advance(Double meters) {
        Double la1 = this.position.getLatitude() * Math.PI / 180;
        Double lo1 = this.position.getLongitude() * Math.PI / 180;
        Double angularDistance = meters / 6371000;
        Double la2 = Math.asin(Math.sin(la1) * Math.cos(angularDistance) + Math.cos(la1) * Math.sin(angularDistance) * Math.cos(this.heading));
        Double lo2 = lo1 + Math.atan2(Math.sin(this.heading) * Math.sin(angularDistance) * Math.cos(la1), Math.cos(angularDistance) - Math.sin(la1) * Math.sin(la2));
        this.position.setLatitude(la2 * 180 / Math.PI);
        this.position.setLongitude(lo2 * 180 / Math.PI);
    }

    public String getId() {
        return id;
    }
    public String getFlightNumber() {
        return flightNumber;
    }

    public String getAirline() {
        return airline;
    }

    public String getArrival() {
        return arrival;
    }

    public String getDeparture() {
        return departure;
    }

    public Vector getPosition() {
        return position;
    }

    public Number getHeading() {
        return heading;
    }
}
