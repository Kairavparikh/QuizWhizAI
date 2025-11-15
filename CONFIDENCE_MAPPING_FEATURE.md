# Adaptive Confidence Mapping Feature

## Overview

This feature implements an intelligent learning system that tracks both answer correctness and user confidence for every quiz question. It classifies responses into four learning states and provides personalized feedback, AI-generated explanations, and implements spaced repetition for optimal learning.

## Features Implemented

### 1. Database Schema Updates
- **New Enums**: `confidence_level` (low, medium, high) and `learning_state` (4 states)
- **New Tables**:
  - `question_responses`: Tracks each answer with confidence and learning state
  - `ai_explanations`: Stores AI-generated explanations for each response
  - `follow_up_questions`: AI-generated follow-up questions based on learning state
  - `spaced_repetition`: Manages review scheduling with priority-based system

### 2. Four Learning States

#### HIGH_CONFIDENCE_WRONG (Red)
- **Interpretation**: Misconception / illusion of mastery
- **Priority**: 1 (Highest)
- **Next Review**: 1 day
- **Behavior**:
  - Corrective explanation
  - Follow-up question with same difficulty, different phrasing
  - High priority in spaced repetition

#### LOW_CONFIDENCE_WRONG (Orange)
- **Interpretation**: Known weakness
- **Priority**: 2
- **Next Review**: 3 days
- **Behavior**:
  - Foundational explanation
  - Easier follow-up question
  - Standard spaced repetition

#### LOW_CONFIDENCE_CORRECT (Yellow)
- **Interpretation**: Underconfident mastery
- **Priority**: 3
- **Next Review**: 7 days
- **Behavior**:
  - Encouraging message
  - Slightly harder follow-up question
  - Medium priority review

#### HIGH_CONFIDENCE_CORRECT (Green)
- **Interpretation**: True mastery
- **Priority**: 5 (Lowest)
- **Next Review**: 14 days
- **Behavior**:
  - Confirmation message
  - Challenge question to validate mastery
  - Low priority, occasional reviews

### 3. User Interface Components

#### ConfidenceSelector
- Three-button interface (Guessing, Unsure, Confident)
- Visual feedback with emojis and gradient colors
- Required before answering questions

#### LearningStateFeedback
- Color-coded feedback box matching learning state
- AI-generated personalized explanations
- Follow-up questions for wrong answers
- Priority and next review date display
- Loading state during AI generation

### 4. API Endpoints

#### `/api/quizz/generate-explanation` (POST)
Generates AI explanations and follow-up questions based on learning state.

**Request Body**:
```json
{
  "learningState": "HIGH_CONFIDENCE_WRONG",
  "questionText": "...",
  "correctAnswer": "...",
  "userAnswer": "...",
  "concept": "..."
}
```

**Response**:
```json
{
  "explanation": "...",
  "followUpQuestion": "..." // null for correct answers
}
```

#### `/api/quizz/spaced-repetition` (GET)
Fetches items due for review, ordered by priority.

**Response**:
```json
{
  "reviewItems": [...],
  "totalDue": 5
}
```

#### `/api/quizz/spaced-repetition` (POST)
Updates spaced repetition item after review.

**Request Body**:
```json
{
  "itemId": 123,
  "newPriority": 3,
  "nextReviewDays": 7
}
```

### 5. Server Actions

#### `saveQuestionResponse`
Saves individual question response with confidence and learning state classification.

#### `saveAllQuestionResponses`
Batch saves all responses at quiz submission and updates spaced repetition scheduling.

## Database Migration Required

Before using this feature, you need to run database migrations to create the new tables and enums:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

## Usage Flow

1. **Start Quiz**: User sees intro screen with updated tips
2. **Select Confidence**: Before answering, user selects confidence level (Guessing/Unsure/Confident)
3. **Answer Question**: Answer buttons are disabled until confidence is selected
4. **Get Feedback**: After answering, user sees:
   - Learning state indicator (color-coded)
   - Personalized message
   - AI-generated explanation
   - Follow-up question (if wrong)
   - Priority and next review date
5. **Submit Quiz**: All responses saved with confidence data
6. **Spaced Repetition**: System schedules reviews based on learning states

## Files Added/Modified

### New Files
- `/src/lib/confidenceMapping.ts` - Core classification logic
- `/src/app/quizz/ConfidenceSelector.tsx` - Confidence UI component
- `/src/app/quizz/LearningStateFeedback.tsx` - Feedback display component
- `/src/app/api/quizz/generate-explanation/route.ts` - AI explanation API
- `/src/app/api/quizz/spaced-repetition/route.ts` - Review scheduling API
- `/src/app/actions/saveQuestionResponse.ts` - Server actions for responses

### Modified Files
- `/src/db/schema.ts` - Added new tables and enums
- `/src/app/quizz/QuizzQuestions.tsx` - Integrated confidence tracking
- `/src/app/quizz/uploadDoc.tsx` - Enhanced loading states (previous feature)
- `/src/lib/utils.ts` - Added shuffleArray function (previous feature)

## Future Enhancements

1. **Review Dashboard**: Dedicated page showing all items due for review
2. **Progress Analytics**: Visualize learning state distribution over time
3. **Adaptive Difficulty**: Automatically adjust quiz difficulty based on performance
4. **Concept Clustering**: Group related concepts for more efficient review
5. **Export Data**: Allow users to export their learning analytics

## Technical Details

### Spaced Repetition Algorithm
- Priority-based scheduling (1-5 scale)
- Dynamic review intervals based on learning state
- Conflict resolution for existing items
- User-specific tracking

### AI Integration
- Uses OpenAI GPT-4o for explanations and follow-up questions
- Context-aware prompts based on learning state
- Temperature: 0.7 for balanced creativity
- Fallback handling for API failures

## Notes

- Confidence selection is mandatory before answering
- All responses are tracked in the database for analytics
- Spaced repetition automatically updates on quiz submission
- AI explanations are generated on-demand to reduce costs
