import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side - Copyright and Creator */}
          <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-col md:flex-row items-center gap-2">
            <p>&copy; {new Date().getFullYear()} QuizWhiz AI. All rights reserved.</p>
            <span className="hidden md:inline">•</span>
            <p>
              Created by{" "}
              <a
                href="https://www.linkedin.com/in/kairav-parikh07/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
              >
                Kairav Parikh
              </a>
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/api/auth/signin"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/billing"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
