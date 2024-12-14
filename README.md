# README

## Introduction
This project is a web application that uses React with Vite bundler for the frontend, Node.js with Express.js for the backend, and MongoDB for the database.

## Setup
1. Clone this repository to your local system:
   ```bash
   git clone <repository_url>
   ```
2. Open two terminals:
   - **Terminal 1 (Frontend)**:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
     The frontend will run on port `5173`.
   - **Terminal 2 (Backend)**:
     ```bash
     cd backend
     npm install
     npm run dev
     ```
     The backend will run on port `3000`.

## Functionalities
1. **Question Paper Parsing**:
   - Parse question paper PDFs using `pdf-parser` and any OCR tool.
   - Automatically generate questions along with their answers.

2. **Admin Question Management**:
   - Examine parsed questions and save them to the database.

3. **Questions Tab**:
   - View all saved questions along with their answers in the `/questions` tab.

4. **Quiz Tab**:
   - Display 10 random questions from the question tab.
   - Generate a time-bound quiz in the `/quiz` tab.

