import NextAuth from "next-auth";
import { Employee } from "@/interfaces";
declare module "next-auth" {
    interface Session {
        user: Employee;
        accessToken: string;
        refreshToken: string;
    }
} 