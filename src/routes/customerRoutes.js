import express from "express";
import { authJWT, requireRole } from "../middleware/authMiddleware.js";
// import { createCustomer, getCustomers } vs...

const router = express.Router();

// Get customer from DB (All roles)
router.get("/", authenticate, (req, res) => {
    res.json({ message: "Bütün müşterileri burada döndüreceğiz" });
});

// Adding customer (Only Admin)
router.post(
    "/",
    authenticate,
    requireRole("Admin"),
    (req, res) => {
        res.json({ message: "Yeni müşteri eklendi (dummy şimdilik)" });
    }
);

export default router;
