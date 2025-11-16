import UploadDoc from "../../uploadDoc";
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
