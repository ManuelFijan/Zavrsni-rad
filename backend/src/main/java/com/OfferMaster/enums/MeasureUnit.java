package com.OfferMaster.enums;

public enum MeasureUnit {
    M2("m²"),
    M3("m³"),
    KOM("kom");

    private final String label;
    MeasureUnit(String label) { this.label = label; }
    public String getLabel() { return label; }
}
