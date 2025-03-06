import { apiUrl } from "@/constant";
import { toast } from "react-toastify";

export const verifyOTP = async (userId: string, otp: string) => {
    let toastId = toast.loading("يتم التحقق...");
    try {
        const response = await fetch(`${apiUrl}/auth/verify-account`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: userId, verificationCode: otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            toast.update(toastId, {
                render: "فشل التحقق من الرمز",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            throw new Error(data.message);
        }

        // استرجاع بيانات التسجيل المؤقتة
        const tempAuth = sessionStorage.getItem('temp_auth');
        if (tempAuth) {
            const authData = JSON.parse(tempAuth);
            data.data = {
                ...data.data,
                email: authData.email,
                phone: authData.phone,
            };
            // حذف البيانات المؤقتة
            sessionStorage.removeItem('temp_auth');
        }

        toast.update(toastId, {
            render: "تم التحقق بنجاح",
            type: "success",
            isLoading: false,
            autoClose: 3000
        });

        return data;
    } catch (error) {
        toast.update(toastId, {
            render: "حدث خطأ أثناء التحقق",
            type: "error",
            isLoading: false,
            autoClose: 3000
        });
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
};

export const resendOTP = async (userId: string) => {
    let toastId = toast.loading("يتم إرسال الرمز...");
    try {
        const response = await fetch(`${apiUrl}/auth/resend-verification-code`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: userId }),
        });

        if (!response.ok) {
            toast.update(toastId, { render: "فشل إعادة إرسال الرمز", type: "error", isLoading: false, autoClose: 3000 });
        }
        toast.update(toastId, { render: "تم إرسال الرمز بنجاح", type: "info", isLoading: false, autoClose: 3000 });
        return response.json();
    } catch (error) {
        toast.update(toastId, { render: "حدث خطأ أثناء إعادة إرسال الرمز", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
        toast.dismiss(toastId);
    }
}; 