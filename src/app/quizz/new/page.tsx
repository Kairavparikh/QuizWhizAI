import UploadDoc from "../uploadDoc";
import { auth, signIn } from "@/auth";
import { getUserSubscriptions } from "@/app/actions/userSubscriptions";
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
  const isSubscribed: boolean | undefined  | null= await getUserSubscriptions({ userId });
  
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
        ) : (
          <div className="rounded-md bg-primary-foreground p-10 w-full sm:min-h-80">
            <div className="flex items-center flex-col cursor-pointer w-full h-full">
              <div className="flex-1 flex items-center flex-col">
            </div>
              <UpgradePlan/>
            </div>            
          </div>
        )}
      </main>
    </div>
  );
};

export default Page;
