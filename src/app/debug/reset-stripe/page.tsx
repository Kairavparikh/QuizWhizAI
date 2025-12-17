"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ResetStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/stripe/reset-customer", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Failed to reset" });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Stripe Customer Data</CardTitle>
          <CardDescription>
            Use this tool to reset your Stripe customer information if you're experiencing
            subscription errors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This will clear your current Stripe customer ID and
              subscription status. Use this only if you're getting errors like "No such customer".
            </p>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full"
            variant={result?.success ? "outline" : "default"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Resetting..." : result?.success ? "Reset Again" : "Reset Customer Data"}
          </Button>

          {result?.success && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your customer data has been reset. Now you can:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Go to the billing page</li>
                <li>Click on an upgrade button</li>
                <li>Complete the checkout process</li>
              </ol>
              <Button
                onClick={() => (window.location.href = "/billing")}
                className="w-full mt-4"
                variant="outline"
              >
                Go to Billing Page
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
