import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

// JWT CHECKER
// Valid: respond user info.
// Invalid: 401.
export const authJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 1) Does authorization header exists? format: Bearer <token>
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token doesn't exist or invalid" });
        }

        // 2) Split token part
        const token = authHeader.split(" ")[1];

        // 3) Verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // payload userId taşıyor
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return res.status(401).json({ error: "Kullanıcı bulunamadı" });
        }

        // 4) İsteğe user bilgisini ekle (include permissions if present)
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions || [], // expects a string[] field in DB
        };

        // 5) Bir sonraki middleware'e/geçişe devam et
        next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ error: "Geçersiz veya süresi dolmuş token" });
    }
};

//ROLE CHECKER
//requireRole("Admin") or requireRole("Admin", "Employee")
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Checking if authJWT worked.
        if (!req.user) {
            return res.status(401).json({ error: "Needs authentication." });
        }

        const userRole = req.user.role; // "Admin" or "Employee"

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: "You don't have the permission." });
        }

        next();
    };
};

// NEW: Permission checker
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Needs authentication." });
        }

        // Admin bypasses permission checks
        if (req.user.role === "Admin") return next();

        const userPermissions = req.user.permissions || [];

        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ error: "You don't have the required permission." });
        }

        next();
    };
};
