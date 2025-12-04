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

  // Students always have access to take notes
  // Teachers need subscription or free trials
  if (isStudent) {
    return (
      <div className="flex flex-col flex-1">
        <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
          <h2 className="text-3xl font-bold mb-4">
            Record Your Study Notes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Speak naturally and we&apos;ll transcribe your notes in real-time
          </p>
          <NotesRecorder />
        </main>
      </div>
    );
  }

  // For teachers, check subscription status
  const isSubscribed: boolean | undefined | null = await getUserSubscriptions({ userId });
  const freeTrialData = await checkFreeTrials();

  return (
    <div className="flex flex-col flex-1">
      <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
        {isSubscribed ? (
        <>
        <h2 className="text-3xl font-bold mb-4">
          Record Your Study Notes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Speak naturally and we&apos;ll transcribe your notes in real-time
        </p>
        <NotesRecorder />
        </>
        ) : freeTrialData.canUpload ? (
        <>
        <h2 className="text-3xl font-bold mb-4">
          Record Your Study Notes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Speak naturally and we&apos;ll transcribe your notes in real-time
        </p>
        <div className="mb-4 text-sm text-gray-600">
          Free trials remaining: {freeTrialData.trialsRemaining} of {freeTrialData.limit}
        </div>
        <NotesRecorder />
        </>
        ) : (
          <UpgradePlan/>
        )}
      </main>
    </div>
  );
};

export default Page;
