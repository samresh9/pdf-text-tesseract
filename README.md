# Tesseract OCR with Express

This project demonstrates a simple Express.js application for performing Optical Character Recognition (OCR) on uploaded PDF files with scanned documents using Tesseract.js. The application converts PDF files into image buffers using pdf-img-convert library, performs OCR on those images, and saves the extracted text into a result file in public/results.

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Getting Started

1. Clone this repository:

    git clone https://github.com/your-username/tesseract-ocr-express.git
   
2. Install dependencies:

    ```
    npm install
    ```

3. Start the server:

    ```
    npm start
    ```
4.Start the Application in Development Mode
      ```
    npm run dev
    ```
## Usage

1. Access the application via `http://localhost:5000`.

2. Choose a single PDF file and upload it to perform OCR.

3. Wait for the OCR process to complete.

4. The extracted text will be saved in a result file inside public/results folder.

## Folder Structure

- `public/` - Contains static assets (e.g., PDF files, images, results).
- `src/` - Contains the source code for the Express.js application.

## Technologies Used

- Express.js - Backend web framework for Node.js
- Tesseract.js - OCR library for extracting text from images
- Multer - Middleware for handling file uploads in Express.js
- pdf-img-convert - Library to convert PDF files to images


