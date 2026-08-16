package com.watchweb.app.domain.watch.service;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

@Component
public class WatchNameNormalizer {

    public String normalize(String value) {
        var normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "")
                .trim();

        return normalized;
    }
}
