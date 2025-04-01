import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";

export default async function dashboardRoutes(fastify, options) {
  fastify.get("/api/dashboard/metrics", async (request, reply) => {
    try {
      const totalEarning = await Order.aggregate([
        { $match: { orderStatus: "Paid" } },
        { $group: { _id: null, totalEarning: { $sum: `$total` } } },
      ]);
      const totalOrders = await Order.countDocuments();
      const totalCustomer = await User.countDocuments({ role: "customer" });
      const totalProducts = await Product.countDocuments();

      reply
        .code(200)
        .send({
          status: true,
          data: { totalEarning, totalOrders, totalCustomer, totalProducts },
        });
    } catch (error) {
      reply.code(500).send({ status: false, msg: error.msg });
    }
  });

  fastify.get("/api/dashboard/order-stats", async (request, reply) => {
    try {
      const orderStats = await Order.aggregate([
        {
          $group: {
            _id: `$orderStatus`,
            count: { $sum: 1 },
          },
        },
      ]);
      reply.code(200).send({ status: true, data: orderStats });
    } catch (error) {
      reply.code(500).send({ status: false, msg: error.msg });
    }
  });

  fastify.get("/api/dashboard/summary", async (request, reply) => {
    try {
      const { startDate, endDate } = request.query;
      const start = new Date(startDate || "2024-03-1");
      const end = new Date(endDate || "2025-03-28");

      // sales Summary
      const salesResult = await Order.aggregate([
        {
          $match: {
            orderStatus: "Paid",
            orderDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            avgSalesPerDay: { $avg: "$total" },
          },
        },
      ]);
      const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
      console.log('totalSales',totalSales);
      
      const avgSalesPerDay =
        salesResult.length > 0 ? salesResult[0].avgSalesPerDay : 0;
      const totalOrders = await Order.countDocuments({
        orderDate: { $gte: start, $lte: end },
      });
      const orderStats = await Order.aggregate([
        { $match: { orderDate: { $gte: start, $lte: end } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]);
      const dailySales = await Order.aggregate([
        {
          $match: {
            orderStatus: "Paid",
            orderDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$orderDate" },
            total: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const orderStatusSummary = {
        Delivered: 0,
        Cancelled: 0,
        Rejected: 0,
      };
      orderStats.forEach((stat) => {
        if (orderStatusSummary[stat._id] !== undefined) {
          orderStatusSummary[stat._id] = stat.count;
        }
      });

      const customerActivity = await Order.aggregate([
        { $match: { orderDate: { $gte: start, $lte: end } } },
        { $group: { _id: { $hour: "$orderDate" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const topCustomers = await Order.aggregate([
        {
          $group: {
            _id: "$shippingAddress.email",
            fullName: { $first: "$shippingAddress.fullname" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalORders: -1 } },
        { $limit: 5 },
      ]);

      reply
        .code(200)
        .send({
          status: true,
          data: {
            salesSummary: { totalSales, avgSalesPerDay, dailySales },
            orderSummary: { totalOrders, orderStatusSummary },
            customerActivity,
            topCustomers,
          },
        });
    } catch (error) {
      reply.code(500).send({ status: false, msg: error.msg });
    }

      // console.log("🚀 ~ fastify.get ~ console:", console);

  });
}
