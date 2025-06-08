package com.OfferMaster.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectStatus {
    AKTIVAN("Aktivan"),
    NA_CEKANJU("Na čekanju"),
    ZAVRSEN("Završen");

    private final String displayName;

    ProjectStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static ProjectStatus fromDisplayName(String displayName) {
        if (displayName == null) {
            return null;
        }
        for (ProjectStatus status : ProjectStatus.values()) {
            if (status.displayName.equalsIgnoreCase(displayName)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Nepoznata vrijednost '" + displayName + "' za ProjectStatus enum");
    }

    @Override
    public String toString() {
        return displayName;
    }
}