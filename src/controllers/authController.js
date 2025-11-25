import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// REGISTER
export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username  || !password || !role)
            return res.status(400).json({ error: "Please enter all required fields." });

        // Checking userName
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Checking role
        if (!["Admin", "Employee"].includes(role)) {
            return res.status(400).json({ error: "Role must be Admin or Employee." });
        }

        // Password hashing
        const hashedPass = await bcrypt.hash(password, 10);

        // 2) Saving user to Prisma (DB)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPass,
                role,
            },
        });

        // 3) Output
        res.json({ message: "User created.", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Checking if username exists
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) return res.status(400).json({ error: "User not found." });

        // 2) Checking if pass is true
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ error: "Wrong password." });

        // 3) Creating admin token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Expires after 1 week.
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
