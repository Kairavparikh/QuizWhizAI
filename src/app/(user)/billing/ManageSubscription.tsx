"use client"
import {useState} from "react";
import {getStripe} from "@/lib/stripe-client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Loader2, Settings, ExternalLink, Shield} from "lucide-react";
import { motion } from "framer-motion";


const ManageSubscription = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const redirectToCustomerPortal = async () => {
        setLoading(true);
        console.log("Manage subscription button clicked");

        try {
          console.log("Making API call to create-portal");
          const response = await fetch('/api/stripe/create-portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            console.error("API error:", errorData);

            let errorMessage = `Error: ${errorData.error || 'Failed to load portal'}`;
            if (errorData.message) {
              errorMessage += `\n${errorData.message}`;
            }

            alert(errorMessage);
            setLoading(false);
            return;
          }

          const data = await response.json();
          console.log("Response data:", data);
          console.log("Type of data.url:", typeof data.url);

          if (!data.url || typeof data.url !== 'string') {
            console.error("No valid URL in response");
            alert("No valid portal URL received");
            setLoading(false);
            return;
          }

          console.log("Redirecting to customer portal");
          window.location.href = data.url;
        } catch (error) {
          setLoading(false);
          console.error('Subscribe Button Error', error);
          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

    return (
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg">Premium Active</h3>
            <p className="text-sm text-white/80">Manage your subscription anytime</p>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            disabled={loading}
            onClick={redirectToCustomerPortal}
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-6 py-6 rounded-xl shadow-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-5 w-5" />
                Manage Subscription
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    )
}

export default ManageSubscription;
