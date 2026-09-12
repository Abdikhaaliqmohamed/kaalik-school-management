# Kaalik School Management System

A full-stack school management web application designed to help manage students, teachers, courses, attendance, and academic records.

## 📌 Overview

Kaalik School Management System is a web-based application built to provide a centralized platform for managing common school administration tasks.

The project focuses on creating a simple and organized interface for managing academic information and school-related records.

## ✨ Features

- Student management
- Teacher management
- Course management
- Attendance management
- Academic record management
- Database integration
- Responsive web interface

## 🛠️ Technologies

- TypeScript
- React
- Vite
- Supabase
- PostgreSQL
- Tailwind CSS

## 📂 Project Structure

```text
kaalik-school-management/
├── src/                # Application source code
├── supabase/           # Supabase configuration and database resources
├── .env.example        # Environment variable template
├── .gitignore          # Files excluded from Git
├── package.json        # Project dependencies and scripts
└── vite.config.ts      # Vite configuration
````

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Abdikhaliqmohamed/kaalik-school-management.git
```

Move into the project directory:

```bash
cd kaalik-school-management
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a local `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your own Supabase project values to `.env`.

> Never commit your `.env` file or other secrets to GitHub.

### Run the Development Server

```bash
npm run dev
```

Then open the local URL provided by Vite in your browser.

## 🗄️ Database

The project uses Supabase for backend services and PostgreSQL database functionality.

## 🔐 Security

Environment variables and sensitive configuration should be stored locally and must not be committed to the repository.

## 🚀 Future Improvements

* Role-based authentication and authorization
* Improved reporting and analytics
* Dashboard statistics
* Automated attendance reports
* Additional school administration features

## 👨‍💻 Author

**Abdikhaliq Mohamed**

Computer Engineering Graduate

---

⭐ If you find this project useful, consider giving it a star.

```
