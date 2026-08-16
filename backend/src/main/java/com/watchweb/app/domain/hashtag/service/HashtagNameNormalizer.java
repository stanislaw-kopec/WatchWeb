package com.watchweb.app.domain.hashtag.service;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

@Component
public class HashtagNameNormalizer {

    public String normalize(String name) {
        if (name == null) {
            return "";
        }

        var withoutAccents = Normalizer.normalize(name.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return withoutAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }
}
