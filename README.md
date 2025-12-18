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
- **Misconception Tracking System**:
  - Three-status tracking (Active, Resolving, Resolved)
  - Misconception strength metric (1-10 scale)
  - Automatic status updates based on performance
  - Concept grouping for related misconceptions
  - Individual and bulk misconception management

### 🎯 Adaptive Study Assistant
- **Smart Review Interface**: AI chatbot for personalized study assistance
- **Learning State Feedback**: Color-coded feedback with detailed explanations
- **Misconception Detection**: Identify and address knowledge gaps
- **Adaptive Quiz Generation**: Create targeted practice quizzes based on weak areas
- **Follow-up Questions**: AI-generated follow-up questions for wrong answers

### 📊 Comprehensive Dashboard
- **Performance Metrics**: Track quiz attempts, scores, and improvement over time
- **Activity Heatmap**: Visual representation of learning activity patterns and submission trends
- **Knowledge Galaxy Visualization**: Interactive force-directed graph showing misconception networks
  - Color-coded nodes by status (Active/Resolving/Resolved)
  - Node size represents misconception strength
  - Visual learning path tracking
- **Learning Analytics**: Detailed breakdown of strengths and weaknesses
- **Progress Tracking**: Monitor improvement across different topics and time periods
- **Metric Cards**: Animated summary cards with key performance indicators

### 💳 Subscription Management
- **Free Trial System**: Limited quiz generation for new users
- **Premium Subscriptions**: Unlimited quiz generation and advanced features
- **Multiple Pricing Tiers**: Student ($4.99/month) and Education ($9.99/month) plans
- **Stripe Integration**: Secure payment processing with webhook support
- **Subscription Portal**: Self-service billing management
- **Plan Upgrades & Downgrades**: Seamless plan changes with automatic proration
- **Mid-Cycle Plan Changes**: Update subscriptions at any time with fair billing

### 🔒 Security & Authentication
- **Google OAuth**: Secure authentication with NextAuth.js
- **Protected Routes**: User-specific content and data isolation
- **Session Management**: Secure session handling and user state management

### 👨‍🏫 Teacher Features
- **Class Management**: Create and manage multiple classes
- **Assignment Distribution**: Post quizzes to entire classes
- **Comprehensive Analytics Dashboard**:
  - Class-level performance metrics and mastery levels
  - Learning state distribution across all students
  - Topic mastery analysis with misconception tracking
  - Performance trends over time
  - AI-generated recommendations for intervention
  - Student-by-student performance breakdowns
- **Announcement System**:
  - Post class-wide announcements
  - Optional email delivery to all students
  - Read tracking and engagement analytics
  - Real-time read status updates
- **Student Roster Management**: Track student enrollment and activity

### 📧 Email Notification System
- **Automated Notifications** via Resend:
  - Assignment posted alerts
  - Quiz graded notifications with scores
  - Class announcements
  - Student enrollment confirmations
- **Professional Email Templates**: HTML-formatted with branding
- **Contextual Information**: Due dates, scores, class details
- **Direct Links**: One-click access to assignments and results

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
- **Misconceptions**: Tracking system with status and strength metrics
- **Classes & Enrollments**: Teacher-student relationships
- **Announcements & Notifications**: Communication system
- **Analytics**: Performance tracking and reporting

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
- **Adaptive Quiz Generation**: Create targeted practice quizzes for specific misconceptions
- **Concept Grouping**: Automatically groups related misconceptions for focused study

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

# Email Notifications
RESEND_API_KEY="re_..."

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

## 📊 Platform Metrics

- **Active Users** across multiple educational institutions
- **Comprehensive Analytics** tracking every interaction
- **Misconception Resolution** tracking with strength metrics
- **High Engagement** with interactive visualizations and adaptive learning
- **Email Delivery** for seamless communication between teachers and students

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (user)/              # Protected user routes
│   │   ├── dashboard/       # Student analytics and metrics
│   │   │   ├── misconceptions/  # Misconception tracking
│   │   │   │   └── graph/       # Knowledge Galaxy visualization
│   │   │   └── heatMap.tsx      # Activity heatmap
│   │   └── billing/         # Subscription management
│   ├── teacher/             # Teacher-specific routes
│   │   └── classes/         # Class management
│   │       └── [classId]/   # Individual class features
│   │           └── analytics/   # Teacher analytics dashboard
│   ├── api/                 # Backend API routes
│   │   ├── quizz/          # Quiz generation and management
│   │   ├── stripe/         # Payment processing
│   │   │   └── update-subscription/  # Plan changes
│   │   ├── misconception/  # Misconception tracking
│   │   │   ├── update-on-correct/   # Status updates
│   │   │   └── generate-adaptive-quiz/  # Adaptive quizzes
│   │   └── classes/        # Class management
│   │       └── [classId]/
│   │           ├── analytics/     # Class analytics API
│   │           └── announcements/ # Announcement system
│   ├── quizz/              # Core quiz functionality
│   │   ├── QuizzQuestions.tsx    # Quiz interface
│   │   ├── SmartReviewInterface.tsx  # AI study assistant
│   │   ├── LearningStateFeedback.tsx # Learning analytics
│   │   └── PersonalizedStudyPlan.tsx # Study recommendations
│   └── actions/            # Server actions
├── components/             # Reusable UI components
│   ├── misconceptions/     # Misconception components
│   │   └── KnowledgeGalaxy.tsx   # Force-directed graph
│   ├── AnnouncementModal.tsx     # Create announcements
│   └── AnnouncementsHistory.tsx  # View announcements
├── db/                    # Database schema and connection
├── lib/                   # Utilities and configurations
│   └── email.ts           # Email notification system
└── auth.ts               # Authentication setup
```

---

## 🔮 Future Enhancements

- **Mobile App**: React Native version for iOS/Android
- **Collaborative Learning**: Team quizzes and shared study sessions
- **Advanced ML Analytics**: Pattern recognition for learning predictions
- **Content Library**: Pre-built quizzes for common subjects
- **LMS Integration**: Connect with Canvas, Blackboard, Moodle
- **Offline Mode**: Download quizzes for offline study
- **Parent Portal**: Track student progress for parents
- **Gamification**: Achievement badges and leaderboards

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
- **Resend** for email delivery
- **Shadcn/ui** for beautiful UI components
- **Drizzle** for type-safe database operations
- **react-force-graph** for knowledge visualization

---

<div align="center">

**Built with ❤️ for better learning experiences**

[Report Bug](https://github.com/Kairavparikh/QuizWhizAI/issues) · [Request Feature](https://github.com/Kairavparikh/QuizWhizAI/issues) · [Documentation](https://github.com/Kairavparikh/QuizWhizAI/wiki)

</div>
