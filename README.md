<div align="center">
   <h1 className="text-5xl">Logic Link</h1>
   <p>A premium Number Link puzzle experience</p>
</div>

# Logic Link 
Logic Link is a modern, interactive puzzle game built with React and TypeScript. It features a curated collection of handcrafted levels, a "Liquid Glass" design system, and dynamic scaling that ensures a perfect experience on any grid size.

---

## ✨ Core Features

-   **Liquid Glass UI**: A premium, vibrant design system with smooth animations and glassmorphism.
-   **Handcrafted Levels**: 100+ curated levels ranging from 5x5 to 9x9 grids.
-   **Thinking Brain Logic**: Sophisticated level design where matching endpoints are strategically placed to maximize challenge.
-   **Dynamic Grid Scaling**: Intelligent layout system that automatically adjusts padding, node size, and stroke widths for 8x8 and 9x9 grids.
-   **Persistent Progress**: Automatically saves your current level and completed missions.
-   **Haptic Feedback**: Integrated vibration support for a tactile gameplay experience.

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

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

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

**Never commit `.env.local` to version control.**

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This generates a `dist/` directory with optimized production assets.


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

---

