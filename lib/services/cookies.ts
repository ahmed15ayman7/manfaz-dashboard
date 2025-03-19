"use server";

import { cookies } from "next/headers";
export default async function createCookiesInstance() {
    return new Cookies();
}
class Cookies {
    static async getInstance() {
        return new Cookies();
    }

    async setCookie(name: string, value: string, options: any) {
        const Cookies = await cookies();
        Cookies.set(name, value, options);
    }

    async getCookie(name: string) {
        const Cookies = await cookies();
        return Cookies.get(name);
    }

    async deleteCookie(name: string) {
        const Cookies = await cookies();
        Cookies.delete(name);
    }
    async getAllCookies() {
        const Cookies = await cookies();
        return Cookies.getAll();
    }
}