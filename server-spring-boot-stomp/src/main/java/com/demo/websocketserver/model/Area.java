package com.demo.websocketserver.model;

public class Area {
    private Double minLongitude;
    private Double maxLongitude;
    private Double minLatitude;
    private Double maxLatitude;

    public Area(Double minLongitude, Double maxLongitude, Double minLatitude, Double maxLatitude) {
        this.minLongitude = minLongitude;
        this.maxLongitude = maxLongitude;
        this.minLatitude = minLatitude;
        this.maxLatitude = maxLatitude;
    }

    public Vector randomPosition() {
        return new Vector(this.minLongitude + Math.random() * (this.maxLongitude - this.minLongitude), this.minLatitude + Math.random() * (this.maxLatitude - this.minLatitude));
    }
}
