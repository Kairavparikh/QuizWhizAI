import ManageSubscription from "./ManageSubscription";
import {stripe} from "@/lib/stripe"
import { auth, signIn } from "@/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {users} from "@/db/schema";
import React from 'react'
import PricingTable from "./PricingTable";

const page = async () => {
    const session = await auth();

    if(!session || !session.user || !session.user.id){
        signIn();
        return null;
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    })
    const plan = user?.subscribed ? 'premium' : 'free';

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16">
        <PricingTable isSubscribed={!!user?.subscribed} />

        {user?.subscribed && (
            <div className="flex justify-center mt-16">
                <ManageSubscription/>
            </div>
        )}
    </div>
    )
}

export default page;