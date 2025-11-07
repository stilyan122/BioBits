# 🧬 BioBits

**BioBits** is a full-stack genetics learning platform built with **ASP.NET Core + React Native (Expo)**.  
It helps students explore DNA operations, transcription, and translation interactively — while teachers and admins can manage users and monitor activity.

---

## 🚀 Features

### 🧪 For Students
- **DNA Tools**
  - Clean and reverse-complement DNA sequences  
  - Live transcription (DNA → RNA) and translation (RNA → Amino Acids)  
  - Adjustable reading frames and stop-codon trimming  
  - Save every operation automatically to your account history  

- **Quiz Module**
  - Codon ↔ Amino Acid quizzes with configurable question count  
  - Tracks score, average response time, and detailed review table  
  - Results automatically saved to your user history  

- **Personal History**
  - View your past DNA tool logs and quiz results (fetched directly from the database)  
  - Fully synced per user — no shared or local storage  

---

### 🧰 For Admins
- **User Management**
  - List all registered users  
  - Create, promote/demote (Student ↔ Admin), or delete accounts  
  - Safeguards prevent deleting yourself or the only Admin  

- **Activity Overview**
  - Browse all DNA/Quiz logs with filters by user and type  
  - Delete individual history entries if needed  

- **Platform Stats**
  - Total users, DNA logs, and quiz logs  
  - Active users (last 7 days)  
  - Average quiz completion time  

---

## ⚙️ Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- Axios for API communication
- Context API for authentication
- Secure token storage (JWT)
- Expo Haptics, Clipboard, and custom Toast UI

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core
- Identity with JWT authentication
- SQL Server (local or Azure)
- Role-based authorization (`Student`, `Admin`)

---

## 🧩 Project Structure

```
biobits/
│
├── app/                 # React Native screens
│   ├── tools.tsx        # DNA tools
│   ├── quiz.tsx         # Quiz engine
│   ├── history.tsx      # Personal history
│   └── admin.tsx        # Admin dashboard
│   ├── ...
│
├── context/
│   └── AuthContext.tsx  # JWT + user session logic
│   └── AuthProvicer.tsx  
│
├── lib/
│   ├── api.ts           # Axios instance + interceptors
│   ├── adminApi.ts      # Admin endpoints
│   ├── historyApi.ts    # History endpoints
│   ├── dna.ts           # DNA/RNA/AA helper functions
│   └── routes.ts        # API route definitions
BioBits.Api/
    ├── Controllers/
    │   ├── AuthController.cs\
    │   ├── HistoryController.cs\
    │   └── AdminController.cs
    ├── Models/
    ├── Data/
    └── Program.cs
```

---

## 🧠 How to Run Locally

### 1️⃣ Clone & setup
```bash
git clone https://github.com/stilyan122/BioBits.git
cd BioBits
```

### 2️⃣ Backend (API)
```bash
cd server
dotnet restore
dotnet ef database update
dotnet run
```
Your API will start at [http://localhost:5000](http://localhost:5000).

### 3️⃣ Frontend (Expo app)
```bash
cd biobits
npm install
npx expo start
```
Run on:
- 📱 **Mobile:** scan QR code in Expo Go  
- 💻 **Web:** press `w`  

> Make sure `API_URL` in `lib/config.ts` points to `http://localhost:5000`.

---

## 🔐 Roles & Permissions

| Role | Description |
|------|--------------|
| **Student** | Can use DNA tools, take quizzes, and view personal history |
| **Admin** | Can manage users, delete history entries, and view platform stats |

---

## 🧾 Example Admin Endpoints

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users` | POST | Create new user |
| `/api/admin/users/{id}/role` | POST | Promote/Demote user |
| `/api/admin/users/{id}` | DELETE | Delete user |
| `/api/admin/history/dna` | GET | View all DNA logs |
| `/api/admin/history/quiz` | GET | View all quiz logs |
| `/api/admin/stats` | GET | Global statistics |

---

## 🧡 About the Project

Developed by **Stilyan**  
Created for the **Erasmus+ Program in Leipzig, Germany** and designed to make genetics education interactive, visual, and fun.  
Combines software engineering, biology, and modern UX into a single learning experience. 🌱
