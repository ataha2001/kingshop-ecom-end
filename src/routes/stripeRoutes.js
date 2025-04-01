import Fastify from "fastify";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
// const fastify = Fastify({ logger: true });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Get from Stripe Dashboard

export default async function stripeRoutes(fastify, options){
    fastify.post("/api/create-payment-intent", async (request, reply) => {
        try {
            console.log("Request body:", request.body); // Debugging log
          const { amount, currency } = request.body;
      
          const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in smallest currency unit (e.g., cents)
            currency, // e.g., "usd"
            payment_method_types: ["card"], // Accept only card payments
          });
      
          reply.send({status:true, clientSecret: paymentIntent.client_secret });
        } catch (error) {
          reply.status(500).send({status:false,  error: error.message });
        }
      });
      

}

// Create Payment Intent (for handling payments)

// Start Fastify server
// const start = async () => {
//   try {
//     await fastify.listen({ port: 5000 });
//     console.log("Server running on port 5000");
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// start();
