---
name: tesgating 
description: Add test for business logic
---

## PDF generation flow

1. Viewmodel gathers rental + customer + vehicle + photo data.
2. A feature service (`features/rental/services/quotePdfTemplate.ts` /
   `summaryPdfTemplate.ts`) renders that data into an HTML string (inline
   CSS, `<img>` tags with `file://` URIs or base64 for photos).
3. `expo-print`'s `printToFileAsync` turns the HTML into a PDF file.
4. `expo-sharing`'s `shareAsync` opens the OS share sheet for that PDF.
5. The generated PDF path is also stored on the Rental record so the
   operator can re-share/view it later without regenerating.