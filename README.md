# Smart College Notes Exchange with AI Note Summarization

An intelligent full-stack college academic exchange platform where students upload, discover, and collaborate on syllabus notes, extract key concepts from lecture PDFs using Apache PDFBox, and generate structured university exam revision summaries and question banks via Google Gemini Generative AI.

---

## 1. Project Overview & Problem Statement

### Problem Statement
College students frequently face massive volumes of 50-to-100-page lecture slides, scattered syllabus PDFs, and unorganized handwritten notes across multiple semesters. Preparing for exams requires significant manual effort to distill core concepts, identify high-yield topics, and anticipate university exam questions (1-mark, 3-mark, and 6-mark formats).

### Key Objectives
1. **Centralized Academic Knowledge Sharing**: Categorized repository organized by department, semester, subject, and unit.
2. **AI-Powered Knowledge Distillation**: Automatically parse uploaded PDFs on the backend, chunk large documents safely, and synthesize concise executive summaries using Google Gemini.
3. **Automated Exam Question Generation**: Categorize questions into 1-mark (definitions), 3-mark (mechanisms/comparisons), and 6-mark (in-depth essays/architectures).
4. **Interactive AI Study Assistant**: Allow students to ask context-aware questions against specific uploaded notes without exposing client-side API keys.
5. **Quality & Academic Moderation**: Institutional moderation workflow where students upload pending notes and administrators review, approve, or reject materials before public dissemination.

---

## 2. Key Features

- **Student Authentication & Academic Profiles**: Role-based JWT authentication for students and administrators.
- **Notes Search & Discovery Engine**: Filter by department, semester, subject, and unit with full-text keyword search.
- **Drag-and-Drop PDF Upload**: Safe PDF file validation, size limits (up to 50MB), and storage outside public web root.
- **Apache PDFBox Text Extractor**: Backend text extraction and chunking pipeline for PDF documents.
- **Google Gemini 3.8 Flash Integration**: Executive summary, key points, important topics, and exam question generation.
- **Interactive AI Study Tutor**: Chatbot companion with voice narration (SpeechSynthesis), copy actions, and markdown formatting.
- **Admin Moderation Portal**: Dashboard for system statistics, user directory management, and note approval queue.
- **Bookmarks & Rating System**: Bookmark favorite notes and leave star ratings with feedback.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, JavaScript (ES6+), React Router v6, Axios, Lucide Icons, Pure Vanilla CSS |
| **Backend** | Java 17+, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Spring Security, JJWT (0.12.6) |
| **PDF Processing** | Apache PDFBox 3.0.3 |
| **AI Engine** | Google Gemini API (`gemini-3.8-flash` via Spring RestTemplate) |
| **Database** | MySQL 8.0+ (InnoDB, UTF-8 MB4) |
| **Build & Tooling** | Maven (Backend), Vite (Frontend) |

---

## 4. System Architecture & Workflows

### Architecture Diagram
```
[ React 18 Frontend (Vite) ]
           │
           │  HTTPS / REST (JWT Bearer Auth)
           ▼
[ Spring Boot 3 Backend Controller ]
           │
           ├──► [ Spring Security & JwtAuthenticationFilter ]
           ├──► [ FileStorageService (Local PDF Repository) ]
           ├──► [ PdfExtractionService (Apache PDFBox) ]
           ├──► [ GeminiService (Google Gemini REST API) ]
           │
           ▼
[ Spring Data JPA / Hibernate ]
           │
           ▼
[ MySQL 8.0 Database (smart_college_notes) ]
```

### PDF Processing & AI Workflow
```
Student Uploads PDF
       │
       ▼
FileStorageService (Validates MIME 'application/pdf', writes to uploads/notes/)
       │
       ▼
Note Record Created in MySQL (Status: PENDING)
       │
       ▼
Student Requests AI Summary / Chat Assistant
       │
       ▼
PdfExtractionService (Loads document via Apache PDFBox, extracts textual streams)
       │
       ▼
TextChunker (Divides text into 8,000–12,000 character overlapping chunks if document is large)
       │
       ▼
GeminiService (Sends request to Gemini API or executes local fallback extraction)
       │
       ▼
AiSummary Entity Cached in MySQL
```

---

## 5. Database Schema (`smart_college_notes`)

The MySQL database schema is defined in [`database/schema.sql`](file:///c:/Users/CHROME/OneDrive/Desktop/smart-notes-ai/database/schema.sql):

1. **`users`**: User identity, hashed passwords, roles (`STUDENT`, `ADMIN`), department, year, semester.
2. **`subjects`**: Standardized catalog of college courses mapped to department and semester.
3. **`notes`**: Syllabus notes with title, subject, department, year, semester, unit, file path, file size, status (`PENDING`, `APPROVED`, `REJECTED`), views, and downloads.
4. **`bookmarks`**: Unique user-to-note bookmarks with timestamp.
5. **`downloads`**: Download history tracking student access to PDFs.
6. **`reviews`**: Ratings (1 to 5) and textual feedback from students per note.
7. **`ai_summaries`**: Stored Gemini summaries, key points, high-yield topics, keywords, and 1/3/6-mark question arrays.

---

## 6. Project Folder Structure

```
smart-notes-ai/
├── .env.example                       # Environment variable placeholders
├── .gitignore                          # Master Git ignore rules
├── README.md                           # Documentation & setup guide
├── database/
│   └── schema.sql                      # MySQL database schema and seed data
├── backend/
│   ├── pom.xml                         # Maven dependencies & build setup
│   └── src/
│       └── main/
│           ├── java/com/example/smartnotes/
│           │   ├── config/             # Security & CORS configuration
│           │   ├── controller/         # REST Controllers
│           │   ├── dto/                # Request & Response DTOs
│           │   ├── entity/             # JPA Entities
│           │   ├── exception/          # Custom Exception Handlers
│           │   ├── repository/         # Spring Data Repositories
│           │   ├── security/           # JWT & Auth Filters
│           │   ├── service/            # Business Logic & AI Services
│           │   └── util/               # Text Chunker & JSON Helpers
│           └── resources/
│               └── application.properties # Spring Boot configuration
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/                 # Navbar, Sidebar, NoteCard, StarRating
        ├── context/                    # AuthContext, ToastContext
        ├── hooks/                      # useAuth, useToast
        ├── pages/                      # Home, Library, NoteDetails, AI Summarizer, Chat Tutor, Admin
        ├── services/                   # Axios API service modules
        ├── utils/                      # Formatters & Helpers
        ├── App.jsx
        ├── main.jsx
        └── index.css                   # Custom Vanilla CSS Design System
```

---

## 7. Prerequisites

Before running the application, ensure you have installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Java Development Kit (JDK)**: Java 17 or higher
- **Apache Maven**: 3.8+ (or use included Maven wrapper if available)
- **MySQL Server**: 8.0 or higher

---

## 8. Environment Variable Setup

Create a `.env` file in the project root or configure values in `backend/src/main/resources/application.properties` based on `.env.example`:

```properties
# MySQL Database Configuration
DB_URL=jdbc:mysql://localhost:3306/smart_college_notes?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here

# Server Port
SERVER_PORT=8080

# Security (JWT)
JWT_SECRET=your_256_bit_secret_key_hex_or_base64_string_here
JWT_EXPIRATION_MS=86400000

# Google Gemini AI Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-3.8-flash
```

> **Note**: Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 9. Setup & Running Instructions

### Step 1: Initialize MySQL Database
Open your MySQL client or MySQL Workbench:
```sql
CREATE DATABASE smart_college_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_college_notes;
SOURCE database/schema.sql;
```

### Step 2: Run the Backend (Spring Boot)
Navigate to the `backend` directory and start the Spring Boot application:
```bash
cd backend
mvn clean spring-boot:run
```
*(The backend server will run on `http://localhost:8080`)*

### Step 3: Run the Frontend (React + Vite)
Open a new terminal window, navigate to the `frontend` directory, install packages and start Vite:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend application will run on `http://localhost:5173`)*

---

## 10. Default Credentials

Seed data automatically creates a default administrator account:
- **Email**: `admin@smartnotes.edu`
- **Password**: `admin123`

---

## 11. Common Troubleshooting Tips

1. **MySQL Access Denied or Table Missing**:
   * Verify your MySQL password in `application.properties` (`spring.datasource.password`).
   * Ensure database `smart_college_notes` is created before starting Spring Boot.
2. **Gemini API Error (404 / 403 / 429)**:
   * Google Gemini requires `gemini-3.8-flash` for current API versions.
   * If your key hits free tier rate limits (20 requests/day), the application gracefully falls back to local PDF text extraction without breaking the UI.
3. **CORS Issues**:
   * Ensure `cors.allowed-origins` in `application.properties` matches your Vite URL (`http://localhost:5173`).
