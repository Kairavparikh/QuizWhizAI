"use client";

type ConfidenceLevel = "low" | "medium" | "high";

interface ConfidenceSelectorProps {
  onSelect: (confidence: ConfidenceLevel) => void;
  disabled?: boolean;
  selectedConfidence?: ConfidenceLevel | null;
}

export default function ConfidenceSelector({ onSelect, disabled, selectedConfidence }: ConfidenceSelectorProps) {
  const confidenceOptions: { value: ConfidenceLevel; label: string; emoji: string; color: string }[] = [
    {
      value: "low",
      label: "Guessing",
      emoji: "🤔",
      color: "from-red-400 to-orange-400"
    },
    {
      value: "medium",
      label: "Unsure",
      emoji: "🤷",
      color: "from-yellow-400 to-amber-400"
    },
    {
      value: "high",
      label: "Confident",
      emoji: "💪",
      color: "from-green-400 to-emerald-400"
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        How confident are you in your answer?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {confidenceOptions.map((option) => {
          const isSelected = selectedConfidence === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border-2
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? `bg-gradient-to-br ${option.color} border-transparent text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }
              `}
            >
              <span className="text-3xl mb-2">{option.emoji}</span>
              <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
