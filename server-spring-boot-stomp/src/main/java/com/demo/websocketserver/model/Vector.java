package com.demo.websocketserver.model;

public class Vector {
    private Double longitude;
    private Double latitude;

    public Vector(Double longitude, Double latitude) {
        this.longitude = longitude;
        this.latitude = latitude;
    }
    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    @Override
    public String toString() {
        return "Vector{" +
                "longitude=" + longitude +
                ", latitude=" + latitude +
                '}';
    }

}
