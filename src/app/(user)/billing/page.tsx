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
    <div className="w-full min-h-screen bg-white dark:bg-gray-950">
        {/* Manage Subscription Banner - Only show if subscribed */}
        {user?.subscribed && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <ManageSubscription />
                </div>
            </div>
        )}

        {/* Pricing Table */}
        <PricingTable isSubscribed={!!user?.subscribed} />
    </div>
    )
}

export default page;
