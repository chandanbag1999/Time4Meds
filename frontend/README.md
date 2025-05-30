# Time4Meds Frontend

The frontend application for Time4Meds - a comprehensive medication management system built with React, TypeScript, and Vite.

## 🛠️ Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   └── ...             # Feature-specific components
├── contexts/           # React contexts (Auth, Theme, Toast)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── services/           # API service layer
└── App.tsx             # Main application component
```

## 🎨 UI Components

The application uses a custom UI component library built with:
- **Tailwind CSS** for styling
- **Class Variance Authority** for component variants
- **Radix UI** patterns for accessibility
- **Dark mode support** throughout the application

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run serve` - Serve built application

## 🌙 Dark Mode Support

The application includes comprehensive dark mode support:
- System preference detection
- Manual toggle option
- Persistent theme selection
- All components optimized for both light and dark themes

## 🔐 Authentication

The frontend integrates with the backend authentication system:
- JWT token management
- Protected routes
- Automatic token refresh
- Secure logout functionality

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- Optimized for both desktop and mobile usage

## 🧪 Development Notes

### ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
