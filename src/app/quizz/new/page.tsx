import UploadDoc from "../uploadDoc";
import { auth, signIn } from "@/auth";
import { getUserSubscriptions } from "@/app/actions/userSubscriptions";
import { checkFreeTrials } from "@/app/actions/checkFreeTrials";
import { Lock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {getStripe} from "@/lib/stripe-client";
import {useRouter} from "next/navigation";
import { PRICE_ID } from "@/lib/utils";
import UpgradePlan from "../UpgradePlan"

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if(!userId) {
    signIn();
    return;
  }
  
  const isSubscribed: boolean | undefined | null = await getUserSubscriptions({ userId });
  const freeTrialData = await checkFreeTrials();
  
  const onNaviagteToUpgrate = async (price:string) => {

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
  
  return (
    <div className="flex flex-col flex-1">
      <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
        {isSubscribed ? (
        <>
        <h2 className="text-3xl font-bold mb-4">
          What do you want to be quizzed about today?
        </h2>
        <UploadDoc />
        </>
        ) : freeTrialData.canUpload ? (
        <>
        <h2 className="text-3xl font-bold mb-4">
          What do you want to be quizzed about today?
        </h2>
        <div className="mb-4 text-sm text-gray-600">
          Free trials remaining: {freeTrialData.trialsRemaining} of {freeTrialData.limit}
        </div>
        <UploadDoc />
        </>
        ) : (
          <UpgradePlan/>
        )}
      </main>
    </div>
  );
};

export default Page;
