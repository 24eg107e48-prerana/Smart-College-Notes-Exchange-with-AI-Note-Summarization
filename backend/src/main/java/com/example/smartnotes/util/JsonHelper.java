package com.example.smartnotes.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

public class JsonHelper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            return "[]";
        }
    }

    public static List<String> fromJsonToList(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            // fallback if it's already comma or newline separated
            List<String> list = new ArrayList<>();
            String[] lines = json.split("[\r\n,]+");
            for (String line : lines) {
                if (!line.trim().isEmpty()) {
                    list.add(line.trim());
                }
            }
            return list;
        }
    }
}
