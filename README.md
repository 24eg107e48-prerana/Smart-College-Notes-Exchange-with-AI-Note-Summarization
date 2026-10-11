# Smart College Notes Exchange with AI Note Summarization

An intelligent full-stack college academic exchange platform where students upload, discover, and collaborate on syllabus notes, extract key concepts from lecture PDFs using Apache PDFBox, and generate structured university exam revision summaries and question banks via Google Gemini Generative AI.

---

## 1. Project Overview & Architecture

### System Architecture
```
[ React 18 Frontend (Netlify) ]
           │
           │  HTTPS / REST (JWT Bearer Auth)
           ▼
[ Spring Boot 3 Backend on Render (Docker, Java 21) ]
           │
           ├──► [ Spring Security & JwtAuthenticationFilter ]
           ├──► [ FileStorageService (PDF Repository) ]
           ├──► [ PdfExtractionService (Apache PDFBox 3.0.3) ]
           ├──► [ GeminiService (Google Gemini REST API - Server Side Only) ]
           │
           ▼
[ Remote MySQL Database (Aiven / Clever Cloud / Railway / RDS) ]
```

### Deployment Topology (Classroom Method)
- **Frontend**: React 18 + Vite deployed on **Netlify** (Static SPA with client-side routing redirects).
- **Backend**: Spring Boot 3.3.4 (Java 21) containerized with multi-stage Docker and deployed on **Render**.
- **Database**: MySQL 8.0+ hosted separately on a cloud database provider.
- **AI Engine**: Google Gemini API invoked exclusively server-side by the Spring Boot backend (client never exposes AI keys).

---

## 2. Key Features

- **Student Authentication & Academic Profiles**: Role-based JWT authentication for students and administrators.
- **Notes Search & Discovery Engine**: Filter by department, semester, subject, and unit with full-text keyword search.
- **PDF Upload & Storage**: PDF file validation, size limits (up to 50MB), and isolated storage.
- **Apache PDFBox Text Extractor**: Backend text extraction and chunking pipeline for PDF documents.
- **Google Gemini Integration**: Server-side executive summary, key points, important topics, and 1/3/6-mark exam question generation.
- **Interactive AI Study Tutor**: Chatbot companion with voice narration, copy actions, and markdown formatting.
- **Admin Moderation Portal**: Dashboard for system statistics, user directory management, and note approval queue.
- **Bookmarks & Rating System**: Bookmark favorite notes and leave star ratings with feedback.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide Icons, Pure Vanilla CSS |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Spring Security, JJWT (0.12.6) |
| **PDF Processing** | Apache PDFBox 3.0.3 |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash` called via Spring `RestTemplate`) |
| **Database** | MySQL 8.0+ (InnoDB, UTF-8 MB4) |
| **Containerization** | Docker (Multi-stage build: Maven 3.9 + Eclipse Temurin JDK 21 -> JRE 21) |
| **Hosting** | Netlify (Frontend), Render (Backend Web Service Docker), Remote MySQL |

---

## 4. Environment Variables Reference

Never commit `.env` or sensitive credentials to GitHub. Configure these variables directly in your hosting dashboards.

### Backend Environment Variables (Configure in Render)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `DB_URL` | **Yes** | JDBC connection string to remote MySQL | `jdbc:mysql://host:port/dbname?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | **Yes** | Remote MySQL username | `admin` / `avnadmin` |
| `DB_PASSWORD` | **Yes** | Remote MySQL password | `your_secret_password` |
| `PORT` | Auto | Port for Spring Boot container | `8080` (Render sets this dynamically) |
| `JWT_SECRET` | **Yes** | 256-bit (32+ character) secret string for token signing | `replace_with_a_secure_random_256_bit_secret_key_minimum_32_characters` |
| `JWT_EXPIRATION_MS` | No | Token expiration duration in milliseconds | `86400000` (24 hours) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key from Google AI Studio | `AIzaSy...` |
| `GEMINI_MODEL` | No | Gemini model name | `gemini-1.5-flash` |
| `ALLOWED_ORIGINS` | **Yes** | Comma-separated list of allowed frontend URLs | `https://your-app.netlify.app,http://localhost:5173` |
| `UPLOAD_DIR` | No | Relative path for temporary PDF storage in container | `uploads/notes` |

### Frontend Environment Variables (Configure in Netlify)

| Variable | Required | Description | Example / Recommended Value |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | URL of deployed Render Spring Boot backend | `https://your-backend.onrender.com/api` (or without `/api`) |

---

## 5. Complete Step-by-Step Deployment Guide

Follow these sequential steps to deploy the application:

```
Step 1: Host MySQL Database ➔ Step 2: Push to GitHub ➔ Step 3: Deploy Backend on Render ➔ Step 4: Deploy Frontend on Netlify ➔ Step 5: Connect URLs
```

### Step 1: Remote MySQL Database Setup

1. Choose a remote MySQL provider (such as Aiven, Clever Cloud, Railway, PlanetScale, or AWS RDS).
2. Create a new MySQL service or database.
3. Note your connection details:
   - **Host**
   - **Port** (typically `3306` or provider port)
   - **Database Name** (e.g. `smart_college_notes` or provider default like `defaultdb`)
   - **User**
   - **Password**
4. Connect to your remote database using a MySQL client (DBeaver, MySQL Workbench, or CLI).
5. Open [`database/schema.sql`](file:///c:/Users/CHROME/OneDrive/Desktop/smart-notes-ai/database/schema.sql):
   - *Note*: If your cloud database provider restricts creating new databases, omit the `CREATE DATABASE` and `USE smart_college_notes;` lines at the top of `schema.sql` and execute the `CREATE TABLE` and initial seed data directly inside your assigned database.
6. Ensure tables (`users`, `subjects`, `notes`, `bookmarks`, `downloads`, `reviews`, `ai_summaries`) and seed data are created.
7. Construct your JDBC URL:
   ```
   jdbc:mysql://<HOST>:<PORT>/<DATABASE_NAME>?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```

---

### Step 2: Push Repository to GitHub

1. Ensure secrets (`.env`) are not tracked (verify with `.gitignore`).
2. Initialize and push your repository to your personal GitHub account:
   ```bash
   git add .
   git commit -m "Prepare project for Render Docker and Netlify deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

### Step 3: Deploy Backend on Render (Docker)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `smart-college-notes-backend` (or your chosen name)
   - **Region**: Choose the region closest to your MySQL database (e.g. Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (or if Root Directory is left empty, set Dockerfile Path to `backend/Dockerfile`)
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add the following keys:
   - `DB_URL`: `jdbc:mysql://<HOST>:<PORT>/<DATABASE_NAME>?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true`
   - `DB_USERNAME`: `<your_db_username>`
   - `DB_PASSWORD`: `<your_db_password>`
   - `JWT_SECRET`: A random string of at least 32 characters (e.g., `mySuperSecureJwtSecretKeyForSmartNotesCollegeProject2026`)
   - `GEMINI_API_KEY`: Your key from [Google AI Studio](https://aistudio.google.com/)
   - `GEMINI_MODEL`: `gemini-1.5-flash`
   - `ALLOWED_ORIGINS`: Temporary placeholder `http://localhost:5173` (you will add your Netlify domain in Step 5)
6. Click **Create Web Service**.
7. Render will build the multi-stage Docker image (Maven packaging + Java 21 runtime) and start the service.
8. Once the build finishes and shows `Your service is live`, copy your Render service URL:
   `https://smart-college-notes-backend.onrender.com`

---

### Step 4: Deploy Frontend on Netlify

1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub account and select your repository.
4. Configure Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (or `frontend/dist` if configuring at root)
5. Under **Environment variables**, click **Add a variable**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://<your-render-backend-name>.onrender.com/api`
6. Click **Deploy site**.
7. Netlify will build the React application and deploy it.
8. Once deployed, note your Netlify production domain:
   `https://<your-site-name>.netlify.app`

> **Note on Routing**: The repository includes `_redirects` in `frontend/public/` and `netlify.toml` in both root and frontend, ensuring that page refreshes on React Router routes (such as `/library`, `/notes/:id`, `/login`) do not result in Netlify 404 errors.

---

### Step 5: Connect Frontend and Backend (Update CORS)

1. Return to your [Render Dashboard](https://dashboard.render.com/).
2. Select your `smart-college-notes-backend` web service.
3. Navigate to **Environment**.
4. Update the `ALLOWED_ORIGINS` variable to include your Netlify site URL:
   ```
   https://<your-site-name>.netlify.app,http://localhost:5173
   ```
5. Click **Save Changes**. Render will automatically restart the service with the updated CORS policy.
6. Open your Netlify URL in your browser and test:
   - Logging in with the default admin account.
   - Registering a new student account.
   - Searching notes and testing AI summarization.

---

## 6. Local Development Instructions

To run the application locally on your machine:

### 1. Database
```sql
CREATE DATABASE smart_college_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_college_notes;
SOURCE database/schema.sql;
```

### 2. Backend (Spring Boot)
Ensure Java 21 is installed:
```bash
cd backend
mvn clean spring-boot:run
```
*(Runs on `http://localhost:8080`)*

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173` with Vite reverse proxy forwarding `/api` to `http://localhost:8080`)*

---

## 7. Default Credentials

The initial seed data in `database/schema.sql` creates a default administrator account:
- **Email**: `admin@smartnotes.edu`
- **Password**: `admin123`

---

## 8. Common Troubleshooting Tips

1. **Render Free Tier Cold Start**:
   - On Render's free tier, inactive services spin down after 15 minutes of idle time. The first request after spin-down may take 30–50 seconds to wake up the service.
2. **CORS Error (`Access-Control-Allow-Origin`)**:
   - Ensure `ALLOWED_ORIGINS` on Render matches your exact Netlify domain (`https://<your-app>.netlify.app`) without trailing slashes.
3. **Remote MySQL Connection Failure**:
   - Ensure your remote database URL includes `useSSL=true` and `allowPublicKeyRetrieval=true`.
   - Verify cloud security group / IP allowlist rules on your database provider allow connections from `0.0.0.0/0` (Render uses dynamic outbound IP addresses).
4. **Netlify 404 on Page Refresh**:
   - Netlify requires `/* /index.html 200` rewrite rule. This project includes `frontend/public/_redirects` and `netlify.toml` to handle this automatically.
5. **Gemini API Limits or Errors**:
   - Ensure `GEMINI_API_KEY` is set in Render environment variables.
   - If no key is set or the key exceeds free tier quotas, `GeminiService` gracefully falls back to local text extraction without failing the application.
