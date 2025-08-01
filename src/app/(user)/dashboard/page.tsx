import {db} from "@/db"
import {eq} from "drizzle-orm"
import {quizzes} from "@/db/schema"
import {auth} from "@/auth"
import QuizzesTable, { Quizz } from "./quizzesTable";
import getUserMetrics from "@/app/actions/getUserMetrics";
import getHeatMapData from "@/app/actions/getHeatMapData";
import MetricCard from "./metricCard";
import Demo from "./heatMap"
import SubmissionsHeatMap from "./heatMap";
import SubscribeBtn from "../billing/SubscribeBtn";
import { PRICE_ID } from "@/lib/utils";


const page = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>User is not found.</p>;
  }

  const userQuizzes: Quizz[] = await db.query.quizzes.findMany({
    where: eq(quizzes.userId, userId),
  });

  const userData = await getUserMetrics();
  const heatMapData = await getHeatMapData();
  console.log(heatMapData);
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {userData && userData.length > 0 &&
        userData.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))
      }

      </div>
      
        <div>
        {heatMapData ? <SubmissionsHeatMap data={heatMapData.data} /> : null}
        </div>      
    <QuizzesTable quizzes={userQuizzes} />
    </>
    
  );
};

export default page;