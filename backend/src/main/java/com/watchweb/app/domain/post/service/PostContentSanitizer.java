package com.watchweb.app.domain.post.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class PostContentSanitizer {

    private static final String BASE_URI = "https://watchweb.local";

    private static final Safelist POST_CONTENT_SAFELIST = Safelist.none()
            .addTags("p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "h2", "h3", "blockquote", "a", "img")
            .addAttributes("a", "href", "title")
            .addProtocols("a", "href", "http", "https", "mailto")
            .addAttributes("img", "src", "alt", "title")
            .addProtocols("img", "src", "http", "https")
            .addEnforcedAttribute("a", "rel", "nofollow noopener noreferrer")
            .preserveRelativeLinks(true);

    private static final Document.OutputSettings OUTPUT_SETTINGS = new Document.OutputSettings()
            .prettyPrint(false);

    public String sanitize(String content) {
        return Jsoup.clean(content, BASE_URI, POST_CONTENT_SAFELIST, OUTPUT_SETTINGS).trim();
    }

    public boolean hasMeaningfulContent(String content) {
        var document = Jsoup.parseBodyFragment(content);
        return !document.body().text().isBlank() || !document.select("img").isEmpty();
    }
}
