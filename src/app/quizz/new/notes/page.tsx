import NotesRecorder from "../../NotesRecorder";
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

  const userRole = (session?.user as any)?.role;
  const isStudent = userRole === "STUDENT";

  // Check subscription status for all users
  const isSubscribed: boolean | undefined | null = await getUserSubscriptions({ userId });
  const freeTrialData = await checkFreeTrials();

  // Only subscribed students or teachers with trials can access notes
  if (isStudent && !isSubscribed) {
    return (
      <div className="flex flex-col flex-1">
        <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
          <UpgradePlan />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
        {isSubscribed || freeTrialData.canUpload ? (
          <>
            <h2 className="text-3xl font-bold mb-4">
              Record Your Study Notes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Speak naturally and we&apos;ll transcribe your notes in real-time
            </p>
            {!isSubscribed && freeTrialData.canUpload && (
              <div className="mb-4 py-2 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Free trials remaining: <span className="text-blue-600 dark:text-blue-400 font-bold">{freeTrialData.trialsRemaining}</span> of {freeTrialData.limit}
                </p>
              </div>
            )}
            <NotesRecorder />
          </>
        ) : (
          <UpgradePlan />
        )}
      </main>
    </div>
  );
};

export default Page;
