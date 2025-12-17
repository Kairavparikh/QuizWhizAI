import {stripe} from "@/lib/stripe"
import { auth } from "@/auth";
import { db } from "@/db";
import {eq} from "drizzle-orm";
import {users} from "@/db/schema";


export const POST = async (req: Request) => {

    const{price, quantity = 1} = await req.json();
    console.log("Received price:", price);
    
    const userSession = await auth();
    const userId = userSession?.user?.id;

    if(!userId){
        return new Response(
            JSON.stringify({
                error: "Unauthorized"
            }),
            {
                status: 401
            }
        )
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) {
        return new Response(
            JSON.stringify({
                error: "User not found"
            }),
            {
                status: 404
            }
        )
    }

    let customer;
    if(user?.stripeCustomerId){
        // Verify customer exists in Stripe
        try {
            const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
            if (existingCustomer.deleted) {
                throw new Error("Customer was deleted");
            }
            customer = {
                id: user.stripeCustomerId
            };
            console.log("Using existing customer:", customer.id);
        } catch (customerError: any) {
            // Customer doesn't exist in Stripe, create new one
            console.log("Customer not found in Stripe, creating new customer");
            const response = await stripe.customers.create({
                email: user.email || undefined,
                metadata: {
                    dbId: userId
                }
            });

            customer = {id: response.id};
            console.log("Created new customer:", customer.id);

            // Update database with new customer ID
            await db.update(users).set({
                stripeCustomerId: customer.id,
            })
            .where(eq(users.id, userId));
        }
    }
    else{
        console.log("Creating new customer for user:", userId);
        const customerData: {
            metadata: {
                dbId: string
            };
            email?: string;
        } = {
            metadata: {
                dbId: userId
            }
        }

        if (user.email) {
            customerData.email = user.email;
        }

        const response = await stripe.customers.create(
            customerData
        );

        customer = {id :response.id};
        console.log("Created new customer:", customer.id);

        await db.update(users).set({
            stripeCustomerId: customer.id,
        })
        .where(eq(users.id, userId))
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    console.log("Base URL:", baseUrl);

    try{
        console.log("Creating checkout session with price:", price);
        const session = await stripe.checkout.sessions.create(
            {
                success_url: `${baseUrl}/billing/payment/success`,
                customer: customer.id,
                payment_method_types: [
                    "card"
                ],
                line_items: [
                    {
                        price, 
                        quantity
                    }
                ],
                mode: "subscription"
            }
        )
        console.log("Checkout session created:", session.id);
        if(session){
             return new Response(
                JSON.stringify({
                    sessionId: session.id
                }),
                {
                    status: 200
                }
             )
        }
        else{
            console.log("Session creation failed");
            return new Response(
                JSON.stringify({
                    error: "Failed to create a session"
                }),
                {
                    status: 500
                }
             )
        }
    }
    catch(error){
        console.error("Error creating checkout session:", error);
        return new Response(
                JSON.stringify({
                    error: error instanceof Error ? error.message : "Unknown error",
                }),
                {
                    status: 500
                }
             )
    }
}