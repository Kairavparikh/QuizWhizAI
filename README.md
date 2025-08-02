# QuizWhizAI 🧠

An AI-powered quiz generation platform that transforms documents into interactive learning experiences.

![QuizWhizAI Screenshot Quiz Screen](/images/quiz.png)
![QuizWhizAI Screenshot Dashboard](/images/dashboard.png)
![QuizWhizAI Screenshot Billing](https://github.com/Kairavparikh/QuizWhizAI/blob/main/public/images/billing.png)
PUBLIC LINK https://quiz-whiz-ai.vercel.app/
## ✨ Features

- **AI-Powered Quiz Generation**: Upload any document and instantly generate personalized quizzes using OpenAI's GPT-4
- **Interactive Learning Experience**: Real-time scoring, progress tracking, and immediate feedback on answers
- **Secure Authentication**: Google OAuth integration with NextAuth.js
- **Subscription Management**: Stripe-powered payment processing with real-time webhook handling
- **Analytics Dashboard**: Comprehensive user metrics, heat maps, and performance tracking
- **Responsive Design**: Modern UI built with Tailwind CSS and Shadcn/ui components

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM, PostgreSQL
- **AI/ML**: OpenAI GPT-4, LangChain
- **Authentication**: NextAuth.js, Google OAuth
- **Payments**: Stripe
- **Database**: PostgreSQL with Supabase hosting
- **Deployment**: Vercel

## 📊 Impact

- **20+ students** actively using the platform
- **300+ questions** answered across all quizzes
- **80+ quizzes** completed with real-time feedback

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Stripe account
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/QuizWhizAI.git
cd QuizWhizAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="your-postgresql-url"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_LOCAL_SECRET="your-stripe-webhook-secret"
```

4. **Set up the database**
```bash
npm run db:generate
npm run db:push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

1. **Sign in** with your Google account
2. **Upload a document** (PDF, DOC, etc.)
3. **Generate a quiz** - AI creates personalized questions
4. **Take the quiz** with real-time feedback
5. **Track your progress** in the analytics dashboard

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── (user)/        # Protected user routes
│   └── quizz/         # Quiz functionality
├── components/         # Reusable UI components
├── db/                # Database schema and connection
├── lib/               # Utility functions
└── auth.ts            # NextAuth configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 integration
- Vercel for hosting and deployment
- Shadcn/ui for beautiful components
- The amazing open-source community

---

**Built with ❤️ for better learning experiences**
