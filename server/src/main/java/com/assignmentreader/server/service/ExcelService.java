package com.assignmentreader.server.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Generates a styled .xlsx assignment tracker with columns:
 *   | Class | Assignment | Due Date | Additional Information |
 *
 * Input: plain pipe-separated text, one entry per line:
 *   CS 4390 | HW1 | 02/05 | HW - assigned 01/29, 15% total across 5 assignments
 *   CS 4390 | Exam I | 02/24 | EXAM - 20% of grade, covers weeks 1-5
 *   CS 4390 | Project | 04/30 | PROJECT - 20% of grade, team project using Java
 */
@Service
public class ExcelService {

    // Stripe colors cycled per unique class name
    private static final String[] ROW_STRIPE_PALETTE = {
            "FFF2CC", // light yellow
            "D9EAD3", // light green
            "CFE2F3", // light blue
            "F4CCCC", // light pink
            "D9D2E9", // light lavender
            "FCE5CD", // light peach
            "EAD1DC", // light rose
            "D0E4FF", // sky blue
    };

    // Additional Info column background color keyed by type keyword
    private static final Map<String, String[]> TYPE_COLORS = new HashMap<>();
    static {
        //                           bg       text
        TYPE_COLORS.put("EXAM",    new String[]{"F4CCCC", "CC0000"});
        TYPE_COLORS.put("HW",      new String[]{"D9EAD3", "38761D"});
        TYPE_COLORS.put("PROJECT", new String[]{"D9D2E9", "674EA7"});
        TYPE_COLORS.put("QUIZ",    new String[]{"FFF2CC", "B45F06"});
        TYPE_COLORS.put("LAB",     new String[]{"CFE2F3", "1155CC"});
    }

    public byte[] generateExcelFromParsedText(String parsedText) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Assignments");

        // ── Column widths ──
        sheet.setColumnWidth(0, 18 * 256); // Class
        sheet.setColumnWidth(1, 22 * 256); // Assignment
        sheet.setColumnWidth(2, 16 * 256); // Due Date
        sheet.setColumnWidth(3, 55 * 256); // Additional Information

        // ── Header row ──
        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(22f);
        String[] headers = {"Class", "Assignment", "Due Date", "Additional Information"};
        XSSFCellStyle headerStyle = buildHeaderStyle(workbook);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // ── Data rows ──
        String[] lines = parsedText.split("\n");
        int rowNum = 1;
        Map<String, Integer> classColorIndex = new HashMap<>();
        int colorCursor = 0;

        for (String line : lines) {
            String trimmed = line.trim();

            // Skip blank lines, markdown artifacts, and accidental header echoes
            if (trimmed.isEmpty()
                    || trimmed.startsWith("#")
                    || trimmed.startsWith("```")
                    || trimmed.startsWith("Class |")
                    || trimmed.startsWith("---")) {
                continue;
            }

            String[] parts = trimmed.split("\\|");

            // Pad to 4 fields so we never go out of bounds
            String[] fields = new String[4];
            for (int i = 0; i < 4; i++) {
                fields[i] = (i < parts.length) ? parts[i].trim() : "";
            }

            String className      = fields[0];
            String assignmentName = fields[1];
            String dueDate        = fields[2];
            String additionalInfo = fields[3];

            // Skip rows where both class and assignment are empty
            if (className.isEmpty() && assignmentName.isEmpty()) continue;

            // Assign a stripe color per unique class name
            if (!classColorIndex.containsKey(className)) {
                classColorIndex.put(className, colorCursor % ROW_STRIPE_PALETTE.length);
                colorCursor++;
            }
            String rowBg = ROW_STRIPE_PALETTE[classColorIndex.get(className)];

            Row row = sheet.createRow(rowNum++);
            row.setHeightInPoints(18f);

            // Col 0 — Class
            Cell classCell = row.createCell(0);
            classCell.setCellValue(className);
            classCell.setCellStyle(buildClassStyle(workbook, rowBg));

            // Col 1 — Assignment
            Cell assignmentCell = row.createCell(1);
            assignmentCell.setCellValue(assignmentName);
            assignmentCell.setCellStyle(buildPlainStyle(workbook, "FFFFFF", HorizontalAlignment.LEFT));

            // Col 2 — Due Date
            Cell dateCell = row.createCell(2);
            dateCell.setCellValue(dueDate);
            dateCell.setCellStyle(buildPlainStyle(workbook, "FFFFFF", HorizontalAlignment.CENTER));

            // Col 3 — Additional Information (color-coded by type)
            Cell infoCell = row.createCell(3);
            infoCell.setCellValue(additionalInfo);
            infoCell.setCellStyle(buildAdditionalInfoStyle(workbook, additionalInfo));
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Style builders
    // ─────────────────────────────────────────────────────────────────────────

    private XSSFCellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(hexToXSSFColor("434343"));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style, BorderStyle.THIN, "333333");

        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setColor(hexToXSSFColor("FFFFFF"));
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Arial");
        style.setFont(font);
        return style;
    }

    /** Class column — bold, unique pastel background per class */
    private XSSFCellStyle buildClassStyle(XSSFWorkbook wb, String bgHex) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(hexToXSSFColor(bgHex));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style, BorderStyle.THIN, "CCCCCC");

        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Arial");
        style.setFont(font);
        return style;
    }

    /** Generic data cell */
    private XSSFCellStyle buildPlainStyle(XSSFWorkbook wb, String bgHex, HorizontalAlignment align) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(hexToXSSFColor(bgHex));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style, BorderStyle.THIN, "DDDDDD");

        XSSFFont font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Arial");
        style.setFont(font);
        return style;
    }

    /**
     * Additional Information column — scans the text for a type keyword
     * (EXAM, HW, PROJECT, QUIZ, LAB) and applies the matching color.
     * Falls back to a neutral style if no keyword is found.
     */
    private XSSFCellStyle buildAdditionalInfoStyle(XSSFWorkbook wb, String info) {
        String upper = info.toUpperCase();
        String[] colors = new String[]{"F9F9F9", "333333"}; // default: light gray bg, dark text

        for (Map.Entry<String, String[]> entry : TYPE_COLORS.entrySet()) {
            if (upper.contains(entry.getKey())) {
                colors = entry.getValue();
                break;
            }
        }

        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(hexToXSSFColor(colors[0]));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorder(style, BorderStyle.THIN, "DDDDDD");

        XSSFFont font = wb.createFont();
        font.setColor(hexToXSSFColor(colors[1]));
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Arial");
        style.setFont(font);
        return style;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private XSSFColor hexToXSSFColor(String hex) {
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        return new XSSFColor(new byte[]{(byte) r, (byte) g, (byte) b}, null);
    }

    private void setBorder(XSSFCellStyle style, BorderStyle borderStyle, String colorHex) {
        XSSFColor color = hexToXSSFColor(colorHex);
        style.setBorderTop(borderStyle);
        style.setBorderBottom(borderStyle);
        style.setBorderLeft(borderStyle);
        style.setBorderRight(borderStyle);
        style.setTopBorderColor(color);
        style.setBottomBorderColor(color);
        style.setLeftBorderColor(color);
        style.setRightBorderColor(color);
    }
}