<div align="center">
   <h1 className="text-5xl">Number Link</h1>
</div>

# Logic Link 
A modern, interactive React application. Built with Vite for optimal performance and TypeScript for type safety.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### Local Development Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Set your `GEMINI_API_KEY`:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

---

## 📦 Available Scripts

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview production build locally         |

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Package Manager:** npm

---

## 📁 Project Structure

```
.
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # React DOM entry point
│   └── components/       # React components
├── public/               # Static assets
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
└── README.md             # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Never commit `.env.local` to version control.**

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This generates a `dist/` directory with optimized production assets.

### Deployment Options

- **AI Studio:** Deploy directly through the [AI Studio dashboard](https://ai.studio/apps/d46c40e5-36b2-4a63-9f5f-a8feb64d17a7)
- **Vercel:** Connect your GitHub repo for automatic deployments
- **Netlify:** Upload the `dist/` folder
- **Traditional Hosting:** Serve the `dist/` folder with any HTTP server

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: describe your changes"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

