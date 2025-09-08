# 🚀 Next.js Supabase Starter Template

### To-do
- [x] Lections
- [x] Secure Websockets and add authentication / session

#### Later
- [x] Prompt Engineer
- [ ] different lections for different products
- [ ] profile pictures
- [ ] Streak
- [ ] Save conversations
- [ ] Leaderboard
- [ ] Dashboard
- [ ] Improvement Tips -> AI Analyses historical conversations

A minimalistic starter template for Next.js with Supabase, featuring:

- 🔐 Supabase Auth
- 💅 TailwindCSS
- 🗃️ Prisma ORM
- 🎨 shadcn/ui

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)

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

Happy coding! 🎉
