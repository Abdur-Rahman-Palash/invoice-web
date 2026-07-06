# Invoice Management System

A modern web-based invoice management system built with Vite and Firebase.

## Features

- User authentication (email/password and Google sign-in)
- Invoice creation and management
- Product inventory management
- Payment tracking
- Dashboard with statistics
- Responsive design

## Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication, Firestore)
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js installed on your machine
- A Firebase project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase project credentials in the `.env` file

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
invoice web/
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── firebase-config.js
│       ├── invoice.js
│       ├── payment.js
│       ├── product.js
│       └── storage.js
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
