# GigFlow Smart Leads Dashboard

## Features
- User Authentication
- Role Based Access (Admin / Sales)
- Lead Management
- Search and Filter
- Pagination
- CSV Export
- Dark / Light Mode

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Setup Instructions

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

## Roles

### Admin
- Create Leads
- Edit Leads
- Delete Leads
- Export CSV

### Sales
- View Leads
- Search and Filter