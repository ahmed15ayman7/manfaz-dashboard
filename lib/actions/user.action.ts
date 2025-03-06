"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
const secret =
  process.env.JWT_SECRET ||
  "34567890iuyghjkhgfehjkjhrtyoiu5787iuujhdfhjhmhgdfgjfhj"; // Replace the default in .env

export async function getUserData() {
  const cookieStore = cookies();
  const userDataCookie = (await cookieStore).get("userData");

  // console.error("iiiiiiiiiiiii-----",userDataCookie)
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie.value);
      // console.log(userData)
      return userData;
    } catch (error) {
      console.error("Error parsing user data cookie:", error);
    }
  }
  return null;
}
export async function SignOut() {
  const cookieStore = cookies();
  (await cookieStore).delete("userData");
  (await cookieStore).delete("authToken");

  return null;
}

export async function setUserData(data: any) {
  const token = jwt.sign(
    { userId: data.id, phone: data.phone, email: data.email}, // Include the role in the payload
    secret,
    { expiresIn: "30d" } // Token valid for 30 days
  );
  const cookieStore = cookies();
  (await cookieStore).set("userData", JSON.stringify(data));
  (await cookieStore).set("authToken", token,{
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    maxAge: 60 * 60 * 24 * 30, // Cookie expires in 30 days
    sameSite: "strict", // Protect against CSRF attacks
  });
  return null;
}