# Medivault - Secure Health Record Portal

A high-security MERN stack application featuring Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA), AES-256 Encryption for files, and Audit Logging.

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on default port 27017)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file (already created by agent) or ensure:
# MONGO_URI=mongodb://localhost:27017/medivault
# SESSION_SECRET=your_secret
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Features Walkthrough
1.  **Register**: Create an account (Patient or Doctor).
2.  **MFA**: Go to Dashboard -> "Security Settings" -> Setup MFA (Scan QR with Google Auth app).
3.  **Upload (Encryption)**: As a Patient, upload a file. It is encrypted (AES-256) on the server.
4.  **View (Decryption)**: Click "Decrypt & View" to download/view the original file.
5.  **Audit Logs**: Check `backend/security.log` to see JSON logs of every login and file access.
6.  **RBAC**: Doctors can see all files but cannot upload. Patients see only their own.

## Security Highlights
- **Identity**: Bcrypt (Cost 12), Passport.js, Speakeasy (TOTP).
- **Shield**: Rate Limiting (100 req/15min), Strict Sessions (HttpOnly), RBAC Middleware.
- **Data**: AES-256-CTR Encryption for at-rest file protection.
