# Student Directory

A modern, full-stack student management system built with React, TypeScript, and Node.js. This application provides a comprehensive solution for managing student records, including personal information, academic details, and more.

## 🚀 Features

- **Modern UI/UX** - Built with Radix UI and Tailwind CSS for a beautiful, responsive interface
- **Type Safety** - Full TypeScript support for better developer experience
- **State Management** - Powered by React Query for efficient data fetching and caching
- **Form Handling** - Robust form validation with React Hook Form and Zod
- **Database** - PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication** - Secure authentication system with Passport.js
- **Data Import/Export** - Support for CSV/Excel file imports and exports
- **Responsive Design** - Works on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Data Validation**: Zod
- **State Management**: React Query
- **Build Tool**: Vite

## 📦 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StudentDirectory
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/student_directory
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   ```

4. **Set up the database**
   - Create a new PostgreSQL database
   - Update the `DATABASE_URL` in your `.env` file with your database credentials
   - Run database migrations:
     ```bash
     npm run db:push
     ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in your browser**
   The application will be available at `http://localhost:3000`

## 🏗 Project Structure

```
.
├── client/                 # Frontend React application
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   └── routes.ts          # API routes
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Shared Zod schemas
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## 📝 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run check` - Type-check the codebase
- `npm run db:push` - Push database schema changes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [Vite](https://vitejs.dev/) for fast development experience
