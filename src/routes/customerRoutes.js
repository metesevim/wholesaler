import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
// import { createCustomer, getCustomers } vs...

const router = express.Router();

// Get customer from DB (All roles who have VIEW_CUSTOMERS)
router.get("/", authJWT, requirePermission("VIEW_CUSTOMERS"), (req, res) => {
    res.json({ message: "Bütün müşterileri burada döndüreceğiz" });
});

// Adding customer (Needs EDIT_CUSTOMERS permission)
router.post(
    "/",
    authJWT,
    requirePermission("EDIT_CUSTOMERS"),
    (req, res) => {
        res.json({ message: "Yeni müşteri eklendi (dummy şimdilik)" });
    }
);

export default router;
