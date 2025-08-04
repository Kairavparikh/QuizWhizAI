"use client"
import {useState} from "react";
import {getStripe} from "@/lib/stripe-client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";


const ManageSubscription = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const redirectToCustomerPortal = async() => {
    setLoading(true);
    console.log("Manage subscription button clicked");

    try{
        console.log("Making API call to create-portal");
        const response = await fetch('api/stripe/create-portal', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            });
            
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API error:", errorText);
            alert(`API Error: ${response.status} - ${errorText}`);
            setLoading(false);
            return;
        }

        const data = await response.json();
        console.log("Response data:", data);
        
        if (!data.url) {
            console.error("No URL in response");
            alert("No portal URL received");
            setLoading(false);
            return;
        }

        console.log("Redirecting to customer portal");
        router.push(data.url);
    }
    catch(error){
            setLoading(false);
        console.error('Subscribe Button Error', error);
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
    return (
        <Button disabled={loading} onClick={redirectToCustomerPortal}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please Wait
    </>
  ) : (
    "Change Your Subscription"
  )}
</Button>
    )
}

export default ManageSubscription;