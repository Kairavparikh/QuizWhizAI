"use client";
import { Lock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {getStripe} from "@/lib/stripe-client";
import { auth, signIn } from "@/auth";
import { getUserSubscriptions } from "@/app/actions/userSubscriptions";
import {useRouter} from "next/navigation";
import { PRICE_ID } from "@/lib/utils";

const onNaviagteToUpgrade = async (price:string) => {


try{
    const {sessionId} = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({price})
    }).then((res) => res.json());

    const stripe = await getStripe();
    stripe?.redirectToCheckout({sessionId});
}
catch(error){
    console.log('Subscribe Button Error', error);
}
}

const UpgradePlan = () => {
    return(
    <div className="rounded-md bg-primary-foreground p-10 w-full sm:min-h-80">
            <div className="flex items-center flex-col cursor-pointer w-full h-full">
              <div className="flex-1 flex items-center flex-col">
            <h2 className="text-xl font-bold mb-4">Subscribe to Upload Documents and Generate Quizzes</h2>
            <Lock className="w-12 h-12"/>
            </div>
              <Button onClick={() => onNaviagteToUpgrade(PRICE_ID)} className="bg-white p-3 hover:bg-primary-shadow rounded-full text-black flex flex-row items-end flex-row gap-2">
                <Flame />
                <p>Upgrade</p>
                </Button>
            </div>            
          </div>
    );
}

export default UpgradePlan;