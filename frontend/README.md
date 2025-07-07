# Kulcha - Restaurant Automation Platform

This is a Telegram Web App MVP for the Kulcha restaurant automation platform. It is designed to be integrated with Telegram and allows users to order food from various restaurants.

## Features

- City selection
- Restaurant selection
- Menu browsing with food items and prices
- Shopping cart functionality
- Delivery and pickup options
- User profile with order history
- Address management for deliveries

## Project Structure

```
kulcha-app/
├── public/               # Public assets and HTML
├── src/                  # Source code
│   ├── assets/           # Images and other static assets
│   ├── components/       # React components
│   ├── contexts/         # Context API files
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   └── styles/           # Styled components and global styles
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Setup and Installation

1. Make sure you have Node.js installed (v14+ recommended).
2. Clone the repository.
3. Install dependencies:

```bash
cd kulcha-app
npm install
```

4. Start the development server:

```bash
npm start
```

5. Build for production:

```bash
npm run build
```

## Integration with Telegram

This app is designed to be integrated with Telegram Web App. It uses the Telegram Web App SDK to communicate with the Telegram client.

## Backend Integration

The frontend is designed to work with a Django backend. API endpoints will need to be configured to match the backend implementation. 