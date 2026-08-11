package com.watchweb.app.domain.watch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.math.BigDecimal;

@Embeddable
public class WatchDetails {

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", length = 30)
    private MovementType movementType;

    @Column(length = 100)
    private String caliber;

    @Column(name = "case_diameter_mm", precision = 5, scale = 2)
    private BigDecimal caseDiameterMm;

    @Column(name = "case_thickness_mm", precision = 5, scale = 2)
    private BigDecimal caseThicknessMm;

    @Column(name = "lug_to_lug_mm", precision = 5, scale = 2)
    private BigDecimal lugToLugMm;

    @Column(name = "strap_width_mm", precision = 5, scale = 2)
    private BigDecimal strapWidthMm;

    @Column(name = "water_resistance_m")
    private Integer waterResistanceM;

    @Column(name = "crystal_type", length = 100)
    private String crystalType;

    @Column(name = "case_material", length = 100)
    private String caseMaterial;

    protected WatchDetails() {
    }

    public WatchDetails(
            MovementType movementType,
            String caliber,
            BigDecimal caseDiameterMm,
            BigDecimal caseThicknessMm,
            BigDecimal lugToLugMm,
            BigDecimal strapWidthMm,
            Integer waterResistanceM,
            String crystalType,
            String caseMaterial
    ) {
        this.movementType = movementType;
        this.caliber = caliber;
        this.caseDiameterMm = caseDiameterMm;
        this.caseThicknessMm = caseThicknessMm;
        this.lugToLugMm = lugToLugMm;
        this.strapWidthMm = strapWidthMm;
        this.waterResistanceM = waterResistanceM;
        this.crystalType = crystalType;
        this.caseMaterial = caseMaterial;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public String getCaliber() {
        return caliber;
    }

    public BigDecimal getCaseDiameterMm() {
        return caseDiameterMm;
    }

    public BigDecimal getCaseThicknessMm() {
        return caseThicknessMm;
    }

    public BigDecimal getLugToLugMm() {
        return lugToLugMm;
    }

    public BigDecimal getStrapWidthMm() {
        return strapWidthMm;
    }

    public Integer getWaterResistanceM() {
        return waterResistanceM;
    }

    public String getCrystalType() {
        return crystalType;
    }

    public String getCaseMaterial() {
        return caseMaterial;
    }
}
