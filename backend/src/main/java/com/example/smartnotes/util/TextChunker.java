package com.example.smartnotes.util;

import java.util.ArrayList;
import java.util.List;

public class TextChunker {

    private static final int DEFAULT_CHUNK_SIZE = 8000; // ~2000 tokens safe chunk size
    private static final int DEFAULT_OVERLAP = 500;

    public static List<String> chunkText(String text) {
        return chunkText(text, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP);
    }

    public static List<String> chunkText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return chunks;
        }

        String cleanText = text.trim();
        if (cleanText.length() <= chunkSize) {
            chunks.add(cleanText);
            return chunks;
        }

        int start = 0;
        while (start < cleanText.length()) {
            int end = Math.min(start + chunkSize, cleanText.length());

            // Try to break at paragraph or newline or space near the end
            if (end < cleanText.length()) {
                int lastNewline = cleanText.lastIndexOf("\n", end);
                if (lastNewline > start + (chunkSize / 2)) {
                    end = lastNewline;
                } else {
                    int lastSpace = cleanText.lastIndexOf(" ", end);
                    if (lastSpace > start + (chunkSize / 2)) {
                        end = lastSpace;
                    }
                }
            }

            String chunk = cleanText.substring(start, end).trim();
            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }

            if (end >= cleanText.length()) {
                break;
            }

            start = Math.max(end - overlap, start + 1);
        }

        return chunks;
    }
}
