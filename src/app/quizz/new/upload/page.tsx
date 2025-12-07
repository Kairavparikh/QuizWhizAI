import UploadDocModern from "../../uploadDocModern";
import { auth, signIn } from "@/auth";
import { getUserSubscriptions } from "@/app/actions/userSubscriptions";
import { checkFreeTrials } from "@/app/actions/checkFreeTrials";
import UpgradePlan from "../../UpgradePlan";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if(!userId) {
    signIn();
    return;
  }

  const isSubscribed: boolean | undefined | null = await getUserSubscriptions({ userId });
  const freeTrialData = await checkFreeTrials();

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <main className="py-16 flex flex-col items-center flex-1 px-4">
        {isSubscribed ? (
          <UploadDocModern />
        ) : freeTrialData.canUpload ? (
        <>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Free trials remaining: {freeTrialData.trialsRemaining} of {freeTrialData.limit}
              </span>
            </div>
          </div>
          <UploadDocModern />
        </>
        ) : (
          <UpgradePlan/>
        )}
      </main>
    </div>
  );
};

export default Page;
