import ChoiceScreen from "../ChoiceScreen";
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

  const userRole = (session?.user as any)?.role;
  const isStudent = userRole === "STUDENT";

  // Students always have access to the choice screen (for joining classes and taking notes)
  // Teachers need subscription or free trials
  if (isStudent) {
    return (
      <div className="flex flex-col flex-1">
        <main className="py-11 flex flex-col gap-4 flex-1 mt-24">
          <ChoiceScreen />
        </main>
      </div>
    );
  }

  // For teachers, check subscription status
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
      <main className="py-11 flex flex-col gap-4 flex-1 mt-24">
        {isSubscribed ? (
        <>
        <ChoiceScreen />
        </>
        ) : freeTrialData.canUpload ? (
        <>
        <div className="text-center mb-4 text-sm text-gray-600">
          Free trials remaining: {freeTrialData.trialsRemaining} of {freeTrialData.limit}
        </div>
        <ChoiceScreen />
        </>
        ) : (
          <div className="flex justify-center">
            <UpgradePlan/>
          </div>
        )}
      </main>
    </div>
  );
};

export default Page;
