package com.example.smartnotes.service;

import com.example.smartnotes.exception.FileStorageException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class PdfExtractionService {

    private static final Logger log = LoggerFactory.getLogger(PdfExtractionService.class);

    public String extractText(File pdfFile) {
        if (pdfFile == null || !pdfFile.exists()) {
            throw new FileStorageException("PDF file does not exist on disk for text extraction.");
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            if (document.isEncrypted()) {
                log.warn("PDF file is encrypted or password-protected: {}", pdfFile.getName());
                throw new FileStorageException("Cannot extract text from encrypted or password-protected PDF.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                log.warn("PDF appears to be scanned or contains no extractable text: {}", pdfFile.getName());
                return "Note: This PDF appears to contain scanned images or handwritten text with minimal digital text characters.";
            }

            return text.trim();
        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", pdfFile.getName(), e);
            throw new FileStorageException("Failed to extract text from PDF: " + e.getMessage(), e);
        }
    }
}
