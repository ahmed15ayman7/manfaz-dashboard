import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// مفتاح التشفير - يجب تخزينه في متغيرات البيئة
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32);
const IV_LENGTH = 16;

export class SecurityService {
  // تشفير البيانات
  static encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  // فك تشفير البيانات
  static decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // تشفير كلمة المرور
  static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  // التحقق من تطابق كلمة المرور
  static verifyPassword(password: string, hash: string): boolean {
    const hashedPassword = this.hashPassword(password);
    return hashedPassword === hash;
  }

  // التحقق من صلاحية التوكن
  static async verifyToken(request: NextRequest) {
    const token = await getToken({ req: request });
    if (!token) {
      throw new Error('Unauthorized');
    }
    return token;
  }

  // التحقق من الصلاحيات
  static checkPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission);
  }

  // التحقق من الدور
  static checkRole(userRole: string, allowedRoles: string[]): boolean {
    return allowedRoles.includes(userRole);
  }

  // تنظيف البيانات من الأكواد الضارة
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // إزالة العلامات HTML
      .replace(/javascript:/gi, '') // إزالة روابط JavaScript
      .trim(); // إزالة المسافات الزائدة
  }

  // التحقق من صحة البريد الإلكتروني
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // التحقق من قوة كلمة المرور
  static validatePassword(password: string): {
    isValid: boolean;
    message: string;
  } {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid =
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar;

    if (!isValid) {
      let message = 'كلمة المرور يجب أن تحتوي على:';
      if (password.length < minLength) message += '\n- 8 أحرف على الأقل';
      if (!hasUpperCase) message += '\n- حرف كبير واحد على الأقل';
      if (!hasLowerCase) message += '\n- حرف صغير واحد على الأقل';
      if (!hasNumbers) message += '\n- رقم واحد على الأقل';
      if (!hasSpecialChar) message += '\n- رمز خاص واحد على الأقل';
      return { isValid, message };
    }

    return { isValid, message: 'كلمة المرور قوية' };
  }

  // إنشاء رمز تحقق
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // التحقق من عنوان IP
  static validateIPAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  // تسجيل محاولات تسجيل الدخول الفاشلة
  static async logFailedLoginAttempt(ip: string, email: string) {
    // يمكن إضافة المنطق الخاص بتسجيل المحاولات الفاشلة هنا
    // مثل حفظها في قاعدة البيانات أو إرسال تنبيه
  }

  // التحقق من محاولات تسجيل الدخول المتكررة
  static async checkLoginAttempts(ip: string, email: string): Promise<boolean> {
    // يمكن إضافة المنطق الخاص بالتحقق من عدد المحاولات هنا
    // وحظر المستخدم مؤقتاً إذا تجاوز الحد المسموح
    return true;
  }
} 