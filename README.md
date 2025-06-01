Sure, Mayank! Here's a complete `README.md` for your **EXIT System (MERN Stack)** project, customized with backend setup, frontend, and environment variables.

---

````md
# 🚪 EXIT System

A full-stack MERN application that allows employees to resign from their job, tracks their last working day, and validates it against public holidays using the Calendarific API.

---

## 📦 Tech Stack

- **Frontend**: Next.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Testing**: Cypress
- **API**: [Calendarific](https://calendarific.com/)

---

## 🚀 Getting Started

### 🧰 Prerequisites

- Node.js (v18+ recommended)
- MongoDB URI (e.g. from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- A [Calendarific API Key](https://calendarific.com/signup)

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `backend/` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
CALENDARIFIC_API_KEY=your_calendarific_api_key
JWT_SECRET=your_jwt_secret
````

> **Note**: Do **not** commit the `.env` file. It's ignored by `.gitignore`.
> Instead, create a `.env.example` file to show required variables.

---

## 🧪 Run Locally

### 1. Clone the repo

```bash
git clone https://gitlab.com/your-username/exit-system.git
cd exit-system
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Start servers

```bash
# In one terminal (backend)
cd backend
npm start

# In another terminal (frontend)
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`
Backend will run on: `http://localhost:5000`

---

## ✅ Features

* 👤 Employee Login & Resignation
* 📆 Last Working Day Checker
* 🚫 Validates Against Public Holidays
* 🔐 Environment-Based Config
* 🧪 Cypress E2E Tests

---

## 🧪 Run Tests

Cypress test commands (from `assessment/` folder):

```bash
cd assessment
npm install
npx cypress open
```

---

## 📁 Folder Structure

```
exit-system/
├── backend/         # Express API
├── frontend/        # Next.js UI
├── assessment/      # Cypress test cases
└── README.md
```

---

## 📌 Git Best Practices

* `.env` is ignored via `.gitignore`
* Set your secrets under **GitLab CI/CD > Settings > Variables**

---

## 📄 License

MIT License Mayank Sagar

---

## 🙋‍♂️ Author

**Mayank Sagar**
GitLab: [@mayankrsagar](https://gitlab.com/mayankrsagar)

```

---

Would you like me to generate this file and push it directly to your GitLab project or output the `.env.example` too?
```
