# Modern Web Development Technologies Guide

A quick reference guide for modern frontend and backend technologies.

---

## 🎨 shadcn/ui

**What it is:** A collection of beautifully designed, accessible, and customizable React components.

**Key Features:**
- **Not a component library** - Components are copied directly into your project
- **Built on Radix UI** - Accessible primitives under the hood
- **Tailwind CSS styling** - Easy to customize with utility classes
- **TypeScript first** - Full type safety

**Usage:**
```bash
npx shadcn@latest init
npx shadcn@latest add button
```

**Example:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline">Click me</Button>
```

**Website:** [ui.shadcn.com](https://ui.shadcn.com)

---

## 🔄 TanStack (React Query, Router, Table)

**What it is:** A collection of powerful, framework-agnostic libraries for data management.

### TanStack Query (React Query)
- **Server state management** - Fetch, cache, sync, and update server data
- **Automatic caching** - Smart background refetching
- **Devtools** - Built-in debugging tools

```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
})
```

### TanStack Router
- **Type-safe routing** - Full TypeScript support
- **File-based routing** - Automatic route generation
- **Built-in search params** - URL state management

### TanStack Table
- **Headless table logic** - Build any table UI
- **Sorting, filtering, pagination** - All built-in
- **Virtual scrolling** - Handle millions of rows

**Website:** [tanstack.com](https://tanstack.com)

---

## ⚡ Bun

**What it is:** An all-in-one JavaScript runtime, bundler, and package manager.

**Key Features:**
- **Fast** - Up to 4x faster than Node.js
- **Built-in bundler** - No need for webpack/vite
- **Native TypeScript** - Run .ts files directly
- **npm compatible** - Drop-in replacement for npm/yarn

**Usage:**
```bash
# Install packages (faster than npm)
bun install

# Run scripts
bun run dev

# Execute TypeScript directly
bun run script.ts

# Built-in test runner
bun test
```

**Comparison:**
| Feature | Node.js | Bun |
|---------|---------|-----|
| Speed | Baseline | 4x faster |
| TypeScript | Needs transpiler | Native |
| Package manager | npm/yarn | Built-in |
| Bundler | External | Built-in |

**Website:** [bun.sh](https://bun.sh)

---

## 🦊 Elysia.js

**What it is:** A fast, type-safe web framework for Bun.

**Key Features:**
- **End-to-end type safety** - Types flow from backend to frontend
- **High performance** - Built for Bun's speed
- **Elegant API** - Clean, expressive syntax
- **Plugin ecosystem** - JWT, CORS, Swagger, etc.

**Example:**
```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/', () => 'Hello World')
  .get('/user/:id', ({ params: { id } }) => `User ${id}`)
  .post('/login', ({ body }) => body)
  .listen(3000)
```

**With TypeScript validation:**
```typescript
import { Elysia, t } from 'elysia'

new Elysia()
  .post('/user', ({ body }) => body, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' })
    })
  })
```

**Website:** [elysiajs.com](https://elysiajs.com)

---

## 🎨 Tailwind CSS v4

**What it is:** A utility-first CSS framework (major update from v3).

**What's New in v4:**
- **Lightning CSS** - 10x faster builds
- **New config format** - CSS-based configuration
- **CSS-first approach** - Define theme in CSS, not JS
- **Smaller bundle** - Improved tree-shaking

**v3 Config (JavaScript):**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#3490dc',
      }
    }
  }
}
```

**v4 Config (CSS-based):**
```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-brand: #3490dc;
}
```

**Key Differences:**
| Feature | v3 | v4 |
|---------|----|----|
| Config | JavaScript | CSS-native |
| Build speed | Fast | 10x faster |
| Engine | PostCSS | Lightning CSS |
| Import | `@tailwind` directives | `@import "tailwindcss"` |

**Website:** [tailwindcss.com](https://tailwindcss.com)

---

## 🔗 How They Work Together

A modern full-stack setup could combine:

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
├─────────────────────────────────────────────────┤
│  React + TypeScript                              │
│  ├── shadcn/ui     → UI Components              │
│  ├── TanStack Query → Data Fetching             │
│  ├── TanStack Router → Navigation               │
│  └── Tailwind v4   → Styling                    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                   BACKEND                        │
├─────────────────────────────────────────────────┤
│  Bun Runtime                                     │
│  └── Elysia.js     → API Server                 │
│      ├── Type-safe routes                       │
│      ├── Validation (t.Object)                  │
│      └── Auto-generated OpenAPI                 │
└─────────────────────────────────────────────────┘
```

---

## 📚 Quick Comparison Table

| Tech | Category | Best For |
|------|----------|----------|
| shadcn/ui | UI Components | Beautiful, accessible React components |
| TanStack Query | Data Management | Server state, caching, sync |
| Bun | Runtime | Fast JS/TS execution, package management |
| Elysia.js | Backend Framework | Type-safe APIs on Bun |
| Tailwind v4 | CSS Framework | Utility-first styling, fast builds |

---

*Created: 2025-12-29*
