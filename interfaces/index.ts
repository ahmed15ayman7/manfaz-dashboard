export interface User {
    id: string;
    name: string;
    token: string;
    email: string;
    phone: string;
    password: string;
    imageUrl?: string;
    role: UserRole;
    verificationCode?: number;
    createdAt?: Date;
    updatedAt?: Date;
    Worker: Worker[];
    deliveryDrivers: DeliveryDriver[];
    Order: Order[];
    Wallet?: Wallet;
    locations: UserLocation[];
}

type UserRole = "user" | "store" | "worker";

export interface UserLocation {
    id: string;
    userId: string;
    user: User;
    name: string;
    address: string;
    apartment?: string;
    floor?: string;
    building?: string;
    street?: string;
    area?: string;
    city: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    type: "home" | "work" | "other";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceParameter {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    warranty?: number;
    installmentAvailable: boolean;
    installmentMonths?: number;
    monthlyInstallment?: number;
    serviceId: string;
    status: "active" | "inactive";
    sortOrder: number;
    rating?: number;
    ratingCount?: number;
    faqs?: Record<string, any>; // JSON field for FAQs
    whatIncluded?: Record<string, any>; // JSON field for included features
    createdAt: Date;
    updatedAt: Date;
}
export interface Category {
    id: string;
    name: string;
    subName?: string; // Optional field for subName
    slug: string;
    description?: string;
    info?: string; // Additional information
    price?: number;
    imageUrl?: string;
    type: "service" | "delivery"; // Enum for ServiceType
    status: "active" | "inactive" | "archived";
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    services: Service[]; // Array of related services
    stores: Store[]; // Array of related stores
}

export interface Service {
    id: string;
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    type: "service" | "delivery";
    subType?: "delivery_service" | "delivery_driver";
    price?: number;
    duration?: number;
    availability: boolean;
    imageUrl?: string;
    iconUrl?: string;
    rating: number;
    ratingCount: number;
    warranty?: number;
    installmentAvailable: boolean;
    installmentMonths?: number;
    monthlyInstallment?: number;
    createdAt: Date;
    updatedAt: Date;
    parameters: ServiceParameter[]; // Array of service parameters
}

export interface Store {
    id: string;
    name: string; // اسم المتجر
    description?: string; // وصف المتجر
    type: string; // التصنيف الرئيسي (مثل: مأكولات ومشروبات)
    logo?: string; // شعار المتجر
    coverImage?: string; // صورة الغلاف
    images: string[]; // صور إضافية للمتجر
    address: string; // عنوان المتجر
    locations: StoreLocation[]; // فروع المتجر
    phone?: string; // رقم الهاتف
    email?: string; // البريد الإلكتروني
    workingHours: StoreWorkingHours[];
    categoryId?: string;
    category?: Category;
    userId?: string;
    user?: User;
    rating: number; // التقييم
    reviewsCount: number; // عدد التقييمات
    isActive: boolean; // حالة المتجر
    status: "active" | "inactive" | "closed"; // حالة المتجر
    minOrderAmount?: number; // الحد الأدنى للطلب
    deliveryFee?: number; // رسوم التوصيل
    categories: StoreCategory[]; // تصنيفات المتجر الداخلية
    products: Product[]; // المنتجات
    offers: StoreOffer[]; // العروض
    orders: Order[]; // الطلبات
    createdAt: Date; // تاريخ الإنشاء
    updatedAt: Date; // آخر تحديث
    coupons: Coupon[]; // الكوبونات
    discounts: Discount[]; // الخصومات
    giftCards: GiftCard[]; // بطاقات الهدايا
    rewards: Reward[]; // المكافآت
    OrdersStore: OrdersStore[];
}
export interface Order {
    id: string;
    userId: string;
    user?: User;
    serviceId: string;
    service?: Service;
    providerId: string;
    provider?: Worker;
    deliveryDriverId?: string;
    deliveryDriver?: DeliveryDriver;
    description?: string;
    imageUrl?: string;
    locationId: string;
    location?: UserLocation;
    notes: string;
    price?: number;
    duration?: number;
    status: OrderStatus;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    createdAt?: Date;
    updatedAt?: Date;
    scheduleOrder?: ScheduleOrder
    store?: OrdersStore[];
}
export interface ProductsOrder {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    product: Product;
    quantity: number;
}
export interface OrdersStore {
    id: string;
    orderId: string;
    order: Order;
    storeId: string;
    store: Store;

    products: ProductsOrder[]
}
export type OrderStatus = "pending" | "in_progress" | "completed" | "canceled";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Worker {
    id: string;
    userId: string;
    user?: User;
    title: string;
    description: string;
    isAvailable: boolean;
    isFavorite: boolean;
    hourlyRate: number;
    jobSuccessRate: number;
    totalEarned: number;
    skills: string[];
    rating: number;
    reviewsCount: number;
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    totalJobsDone: number;
    about?: string;
    experiences: WorkExperience[];
    reviews: Review[];
    orders: Order[];
    earnings: {
        date: string;
        amount: number;
    }[];
    schedules: Schedule[];
}
// Enums
export enum StatusEnum {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
}

export enum ShiftEnum {
    MORNING = "MORNING",
    EVENING = "EVENING",
    NIGHT = "NIGHT",
}

export enum WorkerTypeEnum {
    DRIVER = "DRIVER",
    TECHNICIAN = "TECHNICIAN",
    ELECTRICIAN = "ELECTRICIAN",
    PLUMBER = "PLUMBER",
    OTHER = "OTHER",
}

export enum PriorityEnum {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
}
export interface ScheduleOrder {
    id: string;
    scheduleId: string;
    orderId: string;
    order: Order;
    schedule: Schedule;
    createdAt: Date;
    updatedAt: Date;
}

// Schedule Interface
export interface Schedule {
    id: string;
    workerId: string;
    scheduledTime: Date;
    date: Date;
    day: string; // e.g., "Monday", "Tuesday"
    shiftType: ShiftEnum;
    worker: Worker;
    location?: string;
    scheduleOrders: ScheduleOrder[]; // Array of Order IDs
    maxOrders: number;
    ordersCount: number;
    isFull: boolean;
    status: StatusEnum;
    priority: PriorityEnum;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkExperience {
    id: string;
    workerId: string;
    worker: Worker;
    title: string;
    company: string;
    duration: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Review {
    id: string;
    workerId: string;
    worker: Worker;
    userId: string;
    orderId: string;
    order: Order;
    user: User;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface DeliveryDriver {
    id: string;
    userId: string;
    user?: User;
    vehicleType?: string;
    license?: string;
    availability: boolean;
    rating: number;
    reviewsCount: number;
    completedOrders: number;
    earnings: number;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
}
export interface Wallet {
    id: string;
    userId: string;
    user?: User;
    balance: number;
    transactions: Transaction[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Transaction {
    id: string;
    walletId: string;
    wallet?: Wallet;
    type: "deposit" | "withdrawal";
    amount: number;
    status: "pending" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
}

// موقع المتجر (فرع)
export interface StoreLocation {
    id: string;
    name: string; // اسم الفرع
    address: string; // العنوان
    latitude: number;
    longitude: number;
    phone?: string; // رقم الهاتف
}
// العروض الخاصة بالمتجر
export interface StoreOffer {
    id: string;
    title: string; // عنوان العرض
    description?: string; // وصف العرض
    discountPercentage?: number; // نسبة الخصم
    discountAmount?: number; // قيمة الخصم
    applicableProducts?: string[]; // قائمة المنتجات التي يشملها العرض
    applicableCategories?: string[]; // قائمة التصنيفات التي يشملها العرض
    startDate: Date; // تاريخ بدء العرض
    endDate: Date; // تاريخ انتهاء العرض
    isActive: boolean; // هل العرض متاح حاليًا
    image?: string; // صورة العرض
}

// أوقات العمل
export interface StoreWorkingHours {
    id: string;
    storeId: string;
    store: Store;
    dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
    isOpen: boolean;
    openTime: string; // Format: "HH:mm"
    closeTime: string; // Format: "HH:mm"
    breakStart?: string; // Optional: Break start time
    breakEnd?: string; // Optional: Break end time
    isSpecialDay: boolean; // If it's a special holiday or occasion
    specialDate?: Date; // Date of the special day
    note?: string; // Additional notes
    createdAt: Date;
    updatedAt: Date;
}


// تصنيفات داخل المتجر
export interface StoreCategory {
    id: string;
    name: string; // اسم التصنيف
    description?: string;
    image?: string;
}

// المنتج داخل المتجر
export interface Product {
    id: string;
    name: string; // اسم المنتج
    description?: string;
    price: number; // سعر المنتج
    discountPrice?: number; // السعر بعد الخصم
    images: string[]; // صور المنتج
    categoryId: string; // التصنيف التابع له المنتج
    stock: number; // الكمية المتاحة
    isAvailable: boolean; // متاح أم لا
    rating: number; // التقييم
    reviewsCount: number; // عدد التقييمات
    createdAt: Date;
    updatedAt: Date;
}

// الكوبونات (كود خصم)
export interface Coupon {
    id: string;
    code: string; // كود الخصم
    discountPercentage?: number; // نسبة الخصم
    discountAmount?: number; // قيمة الخصم
    minOrderAmount?: number; // الحد الأدنى للطلب لاستخدام الكوبون
    maxDiscount?: number; // الحد الأقصى للخصم
    expiryDate: Date; // تاريخ الانتهاء
    isActive: boolean;
}

// الخصومات
export interface Discount {
    id: string;
    productId: string; // المنتج الذي ينطبق عليه الخصم
    percentage?: number; // نسبة الخصم
    amount?: number; // قيمة الخصم
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

// بطاقة الهدايا
export interface GiftCard {
    id: string;
    code: string; // كود البطاقة
    amount: number; // القيمة المالية للبطاقة
    expiryDate: Date; // تاريخ الانتهاء
    isRedeemed: boolean; // هل تم استخدامها
}

// المكافآت
export interface Reward {
    id: string;
    userId: string; // المستخدم المستفيد
    points: number; // النقاط المكتسبة
    description?: string; // وصف المكافأة
    createdAt: Date;
}

// نوع دور الموظف
export type EmployeeRole = "customer_service" | "sales" | "supervisor" | "admin";

// واجهة صلاحيات الموظف
export interface EmployeePermissions {
    // إدارة الطلبات
    viewOrders: boolean;
    updateOrders: boolean;
    deleteOrders: boolean;

    // إدارة العملاء
    viewCustomers: boolean;
    updateCustomers: boolean;
    deleteCustomers: boolean;

    // إدارة المواقع والعناوين
    viewLocations: boolean;
    createLocations: boolean;
    updateLocations: boolean;
    deleteLocations: boolean;

    // إدارة الخدمات
    viewServices: boolean;
    createServices: boolean;
    updateServices: boolean;
    deleteServices: boolean;

    // إدارة العروض والخصومات
    viewOffers: boolean;
    createOffers: boolean;
    updateOffers: boolean;
    deleteOffers: boolean;

    // إدارة التصنيفات
    viewCategories: boolean;
    createCategories: boolean;
    updateCategories: boolean;
    deleteCategories: boolean;

    // إدارة المتاجر
    viewStores: boolean;
    createStores: boolean;
    updateStores: boolean;
    deleteStores: boolean;

    // إدارة مقدمي الخدمات
    viewProviders: boolean;
    createProviders: boolean;
    approveProviders: boolean;
    updateProviders: boolean;
    deleteProviders: boolean;

    // إدارة المحافظ والمدفوعات
    viewWallets: boolean;
    manageTransactions: boolean;

    // إدارة التقارير
    viewBasicReports: boolean;
    viewAdvancedReports: boolean;
    exportReports: boolean;

    // إدارة الموظفين
    viewEmployees: boolean;
    createEmployees: boolean;
    updateEmployees: boolean;
    deleteEmployees: boolean;
    managePermissions: boolean;

    // إدارة النظام
    manageSettings: boolean;
    viewAuditLogs: boolean;
    manageBackups: boolean;

    // المكافآت
    viewRewards: boolean;
    createRewards: boolean;
    updateRewards: boolean;
    deleteRewards: boolean;

    // المواعيد
    viewSchedules: boolean;
    createSchedules: boolean;
    updateSchedules: boolean;
    deleteSchedules: boolean;

    // التقييمات
    viewReviews: boolean;
    createReviews: boolean;
    updateReviews: boolean;
    deleteReviews: boolean;

    // المدفوعات
    viewPayments: boolean;
    createPayments: boolean;
    updatePayments: boolean;
    deletePayments: boolean;

    // الكوبونات
    viewCoupons: boolean;
    createCoupons: boolean;
    updateCoupons: boolean;
    deleteCoupons: boolean;

    // الخصومات
    viewDiscounts: boolean;
    createDiscounts: boolean;
    updateDiscounts: boolean;
    deleteDiscounts: boolean;

    // البطاقات
    viewGiftCards: boolean;
    createGiftCards: boolean;
    updateGiftCards: boolean;
    deleteGiftCards: boolean;


}

// واجهة نشاط الموظف
export interface EmployeeActivity {
    id: string;
    employeeId: string;
    action: string;
    details: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    createdAt: Date;
}

// واجهة الموظف
export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    imageUrl?: string;
    token?: string;
    role: EmployeeRole;
    permissions: EmployeePermissions;
    isActive: boolean;
    lastLoginAt?: Date;
    activities?: EmployeeActivity[];
    createdAt: Date;
    updatedAt: Date;
}
