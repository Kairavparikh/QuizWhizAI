# QuizWhizAI 🧠

An AI-powered quiz generation platform that transforms documents into interactive learning experiences with advanced learning analytics and adaptive study features.

<div align="center">
  
![QuizWhizAI Screenshot Quiz Screen](https://github.com/Kairavparikh/QuizWhizAI/blob/main/public/images/quiz.png)

**🔗 [Live Demo](https://quiz-whiz-ai.vercel.app/)**

</div>

---

## ✨ Core Features

### 🤖 AI-Powered Quiz Generation
- **Document Upload**: Support for PDF, DOC, and other document formats
- **Intelligent Question Creation**: GPT-4 powered quiz generation with contextual questions
- **Smart Answer Shuffling**: Randomized answer choices to prevent pattern memorization
- **Instant Quiz Creation**: Generate comprehensive quizzes in seconds

### 🧠 Advanced Learning Analytics
- **Confidence Mapping**: Track both answer correctness and user confidence levels
- **Four Learning States Classification**:
  - 🔥 **High Confidence Wrong** (Misconceptions) - Priority 1
  - 📚 **Low Confidence Wrong** (Known Weaknesses) - Priority 2  
  - 💡 **Low Confidence Correct** (Underconfident Mastery) - Priority 3
  - ✅ **High Confidence Correct** (True Mastery) - Priority 4
- **Spaced Repetition System**: Automated review scheduling based on learning states
- **Personalized Study Plans**: AI-generated recommendations for optimal learning paths

### 🎯 Adaptive Study Assistant
- **Smart Review Interface**: AI chatbot for personalized study assistance
- **Learning State Feedback**: Color-coded feedback with detailed explanations
- **Misconception Detection**: Identify and address knowledge gaps
- **Adaptive Quiz Generation**: Create targeted practice quizzes based on weak areas
- **Follow-up Questions**: AI-generated follow-up questions for wrong answers

### 📊 Comprehensive Dashboard
- **Performance Metrics**: Track quiz attempts, scores, and improvement over time
- **Activity Heatmap**: Visual representation of learning activity patterns
- **Learning Analytics**: Detailed breakdown of strengths and weaknesses
- **Progress Tracking**: Monitor improvement across different topics and time periods

### 💳 Subscription Management
- **Free Trial System**: Limited quiz generation for new users
- **Premium Subscriptions**: Unlimited quiz generation and advanced features
- **Stripe Integration**: Secure payment processing with webhook support
- **Subscription Portal**: Self-service billing management

### 🔒 Security & Authentication
- **Google OAuth**: Secure authentication with NextAuth.js
- **Protected Routes**: User-specific content and data isolation
- **Session Management**: Secure session handling and user state management

---

## 🚀 Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: React hooks and server actions
- **UI Components**: Radix UI primitives with custom styling

### Backend Infrastructure
- **API**: Next.js API Routes with server actions
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4 with LangChain
- **File Processing**: PDF parsing with LangChain loaders
- **Payments**: Stripe with webhook support

### Database Schema
- **Users**: Authentication and subscription data
- **Quizzes & Questions**: Quiz content and structure
- **Learning Analytics**: Confidence tracking and spaced repetition
- **Subscription Management**: Billing and usage tracking

---

## 📈 Advanced Features Deep Dive

### Confidence Mapping System
The platform tracks not just whether answers are correct, but how confident users feel:

```typescript
// Four distinct learning states based on confidence + correctness
type LearningState = 
  | "HIGH_CONFIDENCE_WRONG"    // 🔥 Misconceptions (Priority 1)
  | "LOW_CONFIDENCE_WRONG"     // 📚 Known gaps (Priority 2)
  | "LOW_CONFIDENCE_CORRECT"   // 💡 Underconfidence (Priority 3)
  | "HIGH_CONFIDENCE_CORRECT"  // ✅ True mastery (Priority 4)
```

### Spaced Repetition Algorithm
- **Dynamic Scheduling**: Review intervals based on learning state priority
- **Automatic Updates**: System updates review schedules on quiz submission
- **Conflict Resolution**: Handles overlapping review items intelligently
- **Performance Tracking**: Monitors improvement over time

### AI Study Assistant Features
- **Context-Aware Explanations**: Tailored explanations based on learning state
- **Interactive Chat**: Natural language conversations about quiz topics
- **Misconception Addressing**: Targeted explanations for common mistakes
- **Adaptive Difficulty**: Adjusts explanation complexity based on user performance

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)
- OpenAI API key
- Stripe account for payments
- Google OAuth credentials

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# AI Integration
OPENAI_API_KEY="sk-..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payment Processing
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_PUBLISHABLE_KEY="pk_..."

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Installation & Setup

1. **Clone and Install**
```bash
git clone https://github.com/Kairavparikh/QuizWhizAI.git
cd QuizWhizAI
npm install
```

2. **Database Setup**
```bash
# Generate database schema
npm run db:generate

# Apply migrations
npm run db:push

# Optional: Open Drizzle Studio
npm run db:studio
```

3. **Development Server**
```bash
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Apply schema changes
- `npm run db:studio` - Open Drizzle Studio

---

## 📊 Usage Analytics

- **20+ Active Users** across multiple educational institutions
- **300+ Questions** answered with detailed analytics
- **80+ Quizzes** completed with learning insights
- **95% User Satisfaction** with AI-generated explanations

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (user)/              # Protected user routes
│   │   ├── dashboard/       # Analytics and metrics
│   │   └── billing/         # Subscription management
│   ├── api/                 # Backend API routes
│   │   ├── quizz/          # Quiz generation and management
│   │   └── stripe/         # Payment processing
│   ├── quizz/              # Core quiz functionality
│   │   ├── QuizzQuestions.tsx    # Quiz interface
│   │   ├── SmartReviewInterface.tsx  # AI study assistant
│   │   ├── LearningStateFeedback.tsx # Learning analytics
│   │   └── PersonalizedStudyPlan.tsx # Study recommendations
│   └── actions/            # Server actions
├── components/             # Reusable UI components
├── db/                    # Database schema and connection
├── lib/                   # Utilities and configurations
└── auth.ts               # Authentication setup
```

---

## 🔮 Future Enhancements

- **Mobile App**: React Native version for iOS/Android
- **Collaborative Learning**: Team quizzes and shared study sessions
- **Advanced Analytics**: ML-powered learning pattern recognition
- **Content Library**: Pre-built quizzes for common subjects
- **API Integration**: Connect with learning management systems
- **Offline Mode**: Download quizzes for offline study

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 integration
- **Vercel** for hosting and deployment
- **Stripe** for payment processing
- **Shadcn/ui** for beautiful UI components
- **Drizzle** for type-safe database operations

---

<div align="center">

**Built with ❤️ for better learning experiences**

[Report Bug](https://github.com/Kairavparikh/QuizWhizAI/issues) · [Request Feature](https://github.com/Kairavparikh/QuizWhizAI/issues) · [Documentation](https://github.com/Kairavparikh/QuizWhizAI/wiki)

</div>
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
