<h1 align="center"> 🚀 SalesTrainer</h1>

<p align="center">
   Fast API responses by <a href="https://groq.com/">Groq</a> • Responsive • Great User Experience by Design • Fullstack <a href="https://nextjs.org/">Next.js</a> Project
</p>

<div align="center">
<video src="https://github.com/user-attachments/assets/c72f695c-6c02-40bb-a1e5-abeb0bf870f9" width="200" controls>
</video>
</div>

---

- [📒 To-do](#to-do)
    * [Advanced To-dos (for later)](#advanced-to-dos-for-later)
- [💡 Naming conventions](#naming-conventions)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🔑 Setting up Social Auth with Supabase](#-setting-up-social-auth-with-supabase)
- [📚 Learn More](#-learn-more)

### 📒 To-do
- [x] Lections
- [x] Secure Websockets and add authentication / session
- [x] Prompt Engineer
- [x] Save conversations
    - [x] 🐛 FIX: seems to only save first conversation, but maybe thats not true -> test

#### Advanced To-dos (for later)
- [x] Different lections for different products -> categorise lections and use common products for different lections
- [x] Improvement Tips -> AI Analyses historical conversations
    - [x] Pass conversation logs to AI as context
    - [x] Save AI Chats to DB
    - [x] Build "Past Chats" Front- & Backend
        - [x] Use API pagination
    - [x] 🐛 Unexpected AI API Stream end (frontend) 
    - [x] Rate limit AI calls
        -> New implementation required for Edge cases/scaling -> use Redis
    - [x] Ability to delete past chats (context menu or button)
- [x] `/log-in`: If already authenticated, redirect to `/dashboard`
- [ ] Streak
- [ ] Conversation Log Caching
- [ ] Clean up `call.tsx` component for better readability -> use hook
- [x] Dashboard
- [x] Show Messages in Conversation Log
- [ ] Profile Pictures
- [ ] Leaderboard
- [ ] Payment, then hide the lessons client-side that require payment
- [ ] Voices for characters not consistent

### 💡 Naming conventions
A **lection** is the name used for an AI Call lesson in the frontend, a **lesson** is the name used in the backend code. Conversations are being stored to the DB as **Conversations**.

## 🛠️ Tech Stack

- [⚡ Next.js](https://nextjs.org/)
- [🔐 Supabase & Supabase Auth](https://supabase.com/)
- [💅 TailwindCSS](https://tailwindcss.com/)
- [🗃️ Prisma](https://www.prisma.io/)
- [🎨 shadcn/ui](https://ui.shadcn.com/)

## 🚀 Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run the development server: `npm run dev`

## 🔑 Setting up Social Auth with Supabase

To set up social authentication:

1. Go to your [Supabase project dashboard](https://app.supabase.com)
2. Navigate to Authentication > Providers
3. Enable and configure the desired social providers (e.g., Google, GitHub, Facebook)
4. For each provider, add the necessary credentials and redirect URLs
5. In your Next.js app, use the Supabase Auth UI component or custom buttons to initiate social login

For detailed instructions on setting up specific providers like Google, refer to the [Supabase documentation](https://supabase.com/docs/guides/auth/social-login)[6].

## 📚 Learn More

To learn more about the technologies used in this template, check out their respective documentation:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
