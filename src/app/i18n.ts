import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      brand: "Marketly",
      nav: { property: "Property", motors: "Motors", classifieds: "Classifieds", signin: "Sign in", post: "Post Ad", logout: "Logout", hi: "Hi" },
      hero: {
        badge: "Over 470K active listings across the UAE",
        titleA: "Find anything.",
        titleB: "Sell everything.",
        sub: "The trusted marketplace for property, motors, and classifieds — with verified dealers, secure chat, and instant search.",
        searchPh: "Search cars, apartments, electronics...",
        all: "All UAE",
        search: "Search",
      },
      cats: { browse: "Browse all", ads: "ads", property: "Property", motors: "Motors", classifieds: "Classifieds" },
      featured: { title: "Featured listings", sub: "Hand-picked from verified dealers", viewAll: "View all", verified: "Verified" },
      features: {
        title1: "Verified dealers", desc1: "Every business profile is KYC-checked.",
        title2: "Secure chat", desc2: "Real-time encrypted messaging built-in.",
        title3: "Smart pricing", desc3: "AI-driven market estimates on every ad.",
      },
      footer: "© 2026 Marketly. Built for buyers, sellers and dealers across the UAE.",
      auth: {
        back: "Back to marketplace",
        welcome: "Welcome to Marketly",
        intro: "The trusted marketplace for property, motors and classifieds — with role-based access for customers, dealers and admins.",
        f1: "✓ Real-time secure chat", f2: "✓ Verified dealer badges", f3: "✓ AI-powered search & pricing",
        signin: "Sign in", signup: "Create account",
        welcomeBack: "Welcome back", subSignin: "Sign in to continue",
        join: "Join Marketly", subSignup: "Choose how you'll use Marketly",
        name: "Full name", email: "Email", password: "Password",
        signinAs: "Sign in as", create: "Create account", terms: "By continuing you agree to our Terms & Privacy.",
        customer: "Customer", customerD: "Buy & post personal ads",
        dealer: "Dealer", dealerD: "Bulk listings & verified badge",
        admin: "Admin", adminD: "Ninja dashboard access",
      },
      post: {
        title: "Post your ad", chooseCat: "Choose a category", chooseSub: "Pick the category that best fits your item.",
        sub: "Subcategory", continue: "Continue", back: "Back",
        details: "Listing details", basics: "fill in the basics and category specifics.",
        titleField: "Title", titlePh: "e.g. 2024 BMW X5 — Excellent condition",
        price: "Price (AED)", location: "Location", desc: "Description",
        descPh: "Describe condition, history, included accessories…",
        photos: "Photos & contact", photosSub: "Add up to 25 photos. The first one is your cover.",
        addPhoto: "Add photo", phone: "Phone number", submit: "Submit ad",
        success: "Ad submitted!", successSub: "Your listing is in review and typically goes live within 30 minutes.",
        backToMarket: "Back to marketplace",
        select: "Select…",
      },
      browse: {
        title: "Browse listings", results: "results", filters: "Filters", clear: "Clear",
        category: "Category", price: "Price range", minPrice: "Min", maxPrice: "Max",
        location: "Location", sort: "Sort", newest: "Newest", priceLow: "Price: low to high", priceHigh: "Price: high to low",
        none: "No listings match your filters.", chat: "Chat with seller",
      },
    },
  },
  ar: {
    translation: {
      brand: "ماركتلي",
      nav: { property: "عقارات", motors: "سيارات", classifieds: "إعلانات", signin: "تسجيل الدخول", post: "أضف إعلان", logout: "خروج", hi: "مرحبا" },
      hero: {
        badge: "أكثر من 470 ألف إعلان نشط في الإمارات",
        titleA: "ابحث عن أي شيء.",
        titleB: "بِع كل شيء.",
        sub: "السوق الموثوق للعقارات والسيارات والإعلانات المبوبة — مع تجار موثقين ومحادثات آمنة وبحث فوري.",
        searchPh: "ابحث عن سيارات، شقق، إلكترونيات...",
        all: "كل الإمارات",
        search: "بحث",
      },
      cats: { browse: "تصفح كل", ads: "إعلان", property: "عقارات", motors: "سيارات", classifieds: "إعلانات" },
      featured: { title: "إعلانات مميزة", sub: "مختارة من تجار موثقين", viewAll: "عرض الكل", verified: "موثق" },
      features: {
        title1: "تجار موثقون", desc1: "كل ملف تجاري تم التحقق منه.",
        title2: "محادثة آمنة", desc2: "رسائل مشفرة فورية مدمجة.",
        title3: "تسعير ذكي", desc3: "تقديرات سوقية بالذكاء الاصطناعي.",
      },
      footer: "© 2026 ماركتلي. منصة المشترين والبائعين والتجار في الإمارات.",
      auth: {
        back: "العودة للسوق",
        welcome: "مرحبا في ماركتلي",
        intro: "السوق الموثوق للعقارات والسيارات والإعلانات — بصلاحيات للعملاء والتجار والمدراء.",
        f1: "✓ محادثة آمنة فورية", f2: "✓ شارات تجار موثقين", f3: "✓ بحث وتسعير ذكي",
        signin: "تسجيل الدخول", signup: "إنشاء حساب",
        welcomeBack: "مرحبا بعودتك", subSignin: "سجل دخولك للمتابعة",
        join: "انضم لماركتلي", subSignup: "اختر طريقة استخدامك",
        name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور",
        signinAs: "دخول كـ", create: "إنشاء حساب", terms: "بمتابعتك فأنت توافق على الشروط والخصوصية.",
        customer: "عميل", customerD: "شراء ونشر إعلانات شخصية",
        dealer: "تاجر", dealerD: "إعلانات بالجملة وشارة موثق",
        admin: "مدير", adminD: "صلاحيات لوحة التحكم",
      },
      post: {
        title: "أضف إعلانك", chooseCat: "اختر فئة", chooseSub: "اختر الفئة الأنسب لإعلانك.",
        sub: "فئة فرعية", continue: "متابعة", back: "رجوع",
        details: "تفاصيل الإعلان", basics: "أدخل الأساسيات وتفاصيل الفئة.",
        titleField: "العنوان", titlePh: "مثال: BMW X5 موديل 2024 — حالة ممتازة",
        price: "السعر (درهم)", location: "الموقع", desc: "الوصف",
        descPh: "صف الحالة والتاريخ والملحقات…",
        photos: "الصور والتواصل", photosSub: "أضف حتى 25 صورة. الأولى هي الغلاف.",
        addPhoto: "إضافة صورة", phone: "رقم الهاتف", submit: "إرسال الإعلان",
        success: "تم إرسال الإعلان!", successSub: "إعلانك قيد المراجعة وعادة ينشر خلال 30 دقيقة.",
        backToMarket: "العودة للسوق",
        select: "اختر…",
      },
      browse: {
        title: "تصفح الإعلانات", results: "نتيجة", filters: "تصفية", clear: "مسح",
        category: "الفئة", price: "نطاق السعر", minPrice: "أدنى", maxPrice: "أعلى",
        location: "الموقع", sort: "ترتيب", newest: "الأحدث", priceLow: "السعر: من الأقل", priceHigh: "السعر: من الأعلى",
        none: "لا توجد إعلانات مطابقة.", chat: "تواصل مع البائع",
      },
    },
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  interpolation: { escapeValue: false },
});

export default i18n;
