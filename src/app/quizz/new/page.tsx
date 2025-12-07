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

  // Check subscription status for all users
  const isSubscribed: boolean | undefined | null = await getUserSubscriptions({ userId });

  // Students can access with or without subscription (limited features)
  // Teachers need subscription or free trials
  if (isStudent) {
    return <ChoiceScreen isSubscribed={isSubscribed || false} />;
  }

  // For teachers, check subscription status and free trials
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
    <>
      {isSubscribed ? (
        <ChoiceScreen isSubscribed={true} />
      ) : freeTrialData.canUpload ? (
        <div className="w-full">
          <div className="text-center mb-8 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800 mx-auto max-w-md">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Free trials remaining: <span className="text-blue-600 dark:text-blue-400 font-bold">{freeTrialData.trialsRemaining}</span> of {freeTrialData.limit}
            </p>
          </div>
          <ChoiceScreen isSubscribed={false} />
        </div>
      ) : (
        <div className="flex justify-center py-12">
          <UpgradePlan />
        </div>
      )}
    </>
  );
};

export default Page;
