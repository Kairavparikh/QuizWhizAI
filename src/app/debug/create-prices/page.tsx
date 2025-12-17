"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Copy } from "lucide-react";

export default function CreatePricesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/stripe/create-prices", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, data });
      }
    } catch (error) {
      setResult({
        success: false,
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Stripe Price IDs</CardTitle>
          <CardDescription>
            This will create the Premium Plan ($4.99) and Education Plan ($9.99) in your Stripe
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This will create new products and prices in your Stripe test
              mode account. Make sure you&apos;re ready to use these for your subscription system.
            </p>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? "Prices created successfully!" : "Failed to create prices"}
              </AlertDescription>
            </Alert>
          )}

          {!result && (
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating Prices..." : "Create Stripe Prices"}
            </Button>
          )}

          {result?.success && result.data.results && (
            <div className="space-y-4 border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <h3 className="font-semibold text-lg">Success! Here are your new Price IDs:</h3>

              {result.data.results.premiumPlan && (
                <div className="border rounded p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Premium Plan ($4.99)</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.data.results.premiumPlan.priceId)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded block">
                    {result.data.results.premiumPlan.priceId}
                  </code>
                </div>
              )}

              {result.data.results.educationPlan && (
                <div className="border rounded p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Education Plan ($9.99)</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.data.results.educationPlan.priceId)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded block">
                    {result.data.results.educationPlan.priceId}
                  </code>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  {result.data.instructions?.nextSteps?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <Button
                onClick={() => {
                  if (result.data.results.premiumPlan && result.data.results.educationPlan) {
                    const message = `Send me these price IDs:\n\nPremium: ${result.data.results.premiumPlan.priceId}\nEducation: ${result.data.results.educationPlan.priceId}`;
                    alert(message);
                  }
                }}
                className="w-full mt-4"
                variant="outline"
              >
                Show Price IDs Again
              </Button>
            </div>
          )}

          {result?.data?.errors && result.data.errors.length > 0 && (
            <div className="text-sm text-red-600 dark:text-red-400 space-y-1">
              <strong>Errors:</strong>
              {result.data.errors.map((error: string, i: number) => (
                <div key={i}>• {error}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
