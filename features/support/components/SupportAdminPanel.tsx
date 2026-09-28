// app/admin/support/SupportAdminPanel.tsx
"use client";

import { useState, useEffect } from "react";
import gmail from '@/public/images/gmail.jpg';
import telegram from '@/public/images/telegram.jpg';
import whatsapp from '@/public/images/whatsapp.png';
import snapchat from '@/public/images/Snapchat.png';
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiSearch, FiX, FiChevronDown, FiEdit3, FiEyeOff } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import {
    FaInstagram,
    FaTiktok,
    FaXTwitter,
    FaFacebook,
    FaLinkedin,
    FaYoutube,
    FaSnapchat,
    FaDiscord,
    FaWhatsapp,
    FaTelegram,
    FaThreads,
    FaGithub,
    FaGlobe,
    FaEnvelope,
    FaPhone,
    FaCheck,
} from "react-icons/fa6";
import {
    createAdminSupportQuestion,
    updateAdminSupportQuestion,
    deleteAdminSupportQuestion,
    fetchAdminSupportQuestions,
    ISupportQuestion,
} from "@/lib/api/support-questions";
import {
    fetchAdminSupportCategories,
    ISupportCategory,
} from "@/lib/api/support-categories";
import {
    fetchAdminSupportChannels,
    createSupportChannel,
    updateSupportChannel,
    deleteSupportChannel,
    ISupportChannel,
} from "@/lib/api/support-channels";

interface Category {
    id: number;
    name: string;
    name_ar?: string;
    order_index?: number;
}

interface Question {
    id: number;
    category_id: number;
    question: string;
    question_ar?: string;
    answer: string;
    answer_ar?: string;
    order_index?: number;
    is_active?: boolean;
    category?: { id: number; name: string } | null;
    category_name?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CanonicalChannelItem {
    id?: number | null;
    key: string;
    name: string;
    type: string;
    value: string;
    is_active: boolean;
    iconImg?: any;
    iconString: string;
    order_index: number;
    placeholder: string;
    isCustom?: boolean;
}

export interface SocialPlatformConfig {
    id: string;
    name: string;
    iconComponent: any;
    iconString: string;
    type: string;
    brandColor: string;
    bgClass: string;
    textClass: string;
    placeholder: string;
    exampleUrl: string;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
    {
        id: "instagram",
        name: "انستغرام",
        iconComponent: FaInstagram,
        iconString: "fa-brands fa-instagram",
        type: "link",
        brandColor: "#E1306C",
        bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
        textClass: "text-white",
        placeholder: "https://instagram.com/username أو @username",
        exampleUrl: "https://instagram.com/themiify",
    },
    {
        id: "tiktok",
        name: "تيك توك",
        iconComponent: FaTiktok,
        iconString: "fa-brands fa-tiktok",
        type: "link",
        brandColor: "#000000",
        bgClass: "bg-black",
        textClass: "text-white",
        placeholder: "https://tiktok.com/@username أو @username",
        exampleUrl: "https://tiktok.com/@themiify",
    },
    {
        id: "twitter",
        name: "إكس (تويتر)",
        iconComponent: FaXTwitter,
        iconString: "fa-brands fa-x-twitter",
        type: "link",
        brandColor: "#000000",
        bgClass: "bg-black",
        textClass: "text-white",
        placeholder: "https://x.com/username أو @username",
        exampleUrl: "https://x.com/themiify",
    },
    {
        id: "whatsapp",
        name: "واتساب",
        iconComponent: FaWhatsapp,
        iconString: "fa-brands fa-whatsapp",
        type: "link",
        brandColor: "#25D366",
        bgClass: "bg-[#25D366]",
        textClass: "text-white",
        placeholder: "+9665xxxxxxxx أو 05xxxxxxxx",
        exampleUrl: "+966500000000",
    },
    {
        id: "telegram",
        name: "تيليجرام",
        iconComponent: FaTelegram,
        iconString: "fa-brands fa-telegram",
        type: "link",
        brandColor: "#229ED9",
        bgClass: "bg-[#229ED9]",
        textClass: "text-white",
        placeholder: "https://t.me/username أو @username",
        exampleUrl: "https://t.me/themiify",
    },
    {
        id: "snapchat",
        name: "سناب شات",
        iconComponent: FaSnapchat,
        iconString: "fa-brands fa-snapchat",
        type: "link",
        brandColor: "#000000",
        bgClass: "bg-[#FFFC00]",
        textClass: "text-black",
        placeholder: "https://snapchat.com/add/username أو @username",
        exampleUrl: "https://snapchat.com/add/themiify",
    },
    {
        id: "facebook",
        name: "فيسبوك",
        iconComponent: FaFacebook,
        iconString: "fa-brands fa-facebook",
        type: "link",
        brandColor: "#1877F2",
        bgClass: "bg-[#1877F2]",
        textClass: "text-white",
        placeholder: "https://facebook.com/themiify",
        exampleUrl: "https://facebook.com/themiify",
    },
    {
        id: "youtube",
        name: "يوتيوب",
        iconComponent: FaYoutube,
        iconString: "fa-brands fa-youtube",
        type: "link",
        brandColor: "#FF0000",
        bgClass: "bg-[#FF0000]",
        textClass: "text-white",
        placeholder: "https://youtube.com/@channel",
        exampleUrl: "https://youtube.com/@themiify",
    },
    {
        id: "linkedin",
        name: "لينكد إن",
        iconComponent: FaLinkedin,
        iconString: "fa-brands fa-linkedin",
        type: "link",
        brandColor: "#0A66C2",
        bgClass: "bg-[#0A66C2]",
        textClass: "text-white",
        placeholder: "https://linkedin.com/in/username",
        exampleUrl: "https://linkedin.com/in/themiify",
    },
    {
        id: "discord",
        name: "ديسكورد",
        iconComponent: FaDiscord,
        iconString: "fa-brands fa-discord",
        type: "link",
        brandColor: "#5865F2",
        bgClass: "bg-[#5865F2]",
        textClass: "text-white",
        placeholder: "https://discord.gg/invite-code",
        exampleUrl: "https://discord.gg/themiify",
    },
    {
        id: "threads",
        name: "ثريدز",
        iconComponent: FaThreads,
        iconString: "fa-brands fa-threads",
        type: "link",
        brandColor: "#000000",
        bgClass: "bg-black",
        textClass: "text-white",
        placeholder: "https://threads.net/@username أو @username",
        exampleUrl: "https://threads.net/@themiify",
    },
    {
        id: "github",
        name: "جيت هاب",
        iconComponent: FaGithub,
        iconString: "fa-brands fa-github",
        type: "link",
        brandColor: "#24292e",
        bgClass: "bg-[#24292e]",
        textClass: "text-white",
        placeholder: "https://github.com/organization",
        exampleUrl: "https://github.com/themiify",
    },
    {
        id: "email",
        name: "بريد إلكتروني",
        iconComponent: FaEnvelope,
        iconString: "fa-solid fa-envelope",
        type: "email",
        brandColor: "#EA4335",
        bgClass: "bg-[#EA4335]",
        textClass: "text-white",
        placeholder: "support@themiify.com",
        exampleUrl: "support@themiify.com",
    },
    {
        id: "phone",
        name: "هاتف / اتصال",
        iconComponent: FaPhone,
        iconString: "fa-solid fa-phone",
        type: "phone",
        brandColor: "#10B981",
        bgClass: "bg-[#10B981]",
        textClass: "text-white",
        placeholder: "+9665xxxxxxxx",
        exampleUrl: "+966500000000",
    },
    {
        id: "website",
        name: "موقع ويب",
        iconComponent: FaGlobe,
        iconString: "fa-solid fa-globe",
        type: "link",
        brandColor: "#3B82F6",
        bgClass: "bg-[#3B82F6]",
        textClass: "text-white",
        placeholder: "https://themiify.com",
        exampleUrl: "https://themiify.com",
    },
];

export function getPlatformForChannel(item: {
    name?: string;
    type?: string;
    iconString?: string;
    key?: string;
    icon?: string;
}): SocialPlatformConfig | undefined {
    const key = (item.key || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    const icon = ((item as any).icon || item.iconString || "").toLowerCase();
    const name = (item.name || "").toLowerCase();

    return SOCIAL_PLATFORMS.find((p) => {
        if (p.id === key || p.id === type) return true;
        if (icon.includes(p.id)) return true;
        if (p.id === "twitter" && (icon.includes("x-twitter") || name.includes("تويتر") || name.includes("إكس") || name.includes("x"))) return true;
        if (p.id === "instagram" && (name.includes("انستغرام") || name.includes("انستقرام") || name.includes("instagram"))) return true;
        if (p.id === "tiktok" && (name.includes("تيك توك") || name.includes("tiktok"))) return true;
        if (p.id === "whatsapp" && (name.includes("واتساب") || name.includes("whatsapp"))) return true;
        if (p.id === "telegram" && (name.includes("تيليجرام") || name.includes("تليجرام") || name.includes("telegram"))) return true;
        if (p.id === "snapchat" && (name.includes("سناب") || name.includes("snapchat"))) return true;
        if (p.id === "facebook" && (name.includes("فيسبوك") || name.includes("facebook"))) return true;
        if (p.id === "youtube" && (name.includes("يوتيوب") || name.includes("youtube"))) return true;
        if (p.id === "linkedin" && (name.includes("لينكد") || name.includes("linkedin"))) return true;
        if (p.id === "discord" && (name.includes("ديسكورد") || name.includes("discord"))) return true;
        if (p.id === "threads" && (name.includes("ثريدز") || name.includes("threads"))) return true;
        if (p.id === "github" && (name.includes("جيت") || name.includes("github"))) return true;
        if (p.id === "email" && (name.includes("بريد") || name.includes("email") || type === "email")) return true;
        if (p.id === "phone" && (name.includes("هاتف") || name.includes("phone") || type === "phone")) return true;
        if (p.id === "website" && (name.includes("موقع") || name.includes("website") || name.includes("رابط"))) return true;
        return false;
    });
}

function renderChannelIcon(item: CanonicalChannelItem) {
    if (item.iconImg) {
        return (
            <img
                src={typeof item.iconImg === "string" ? item.iconImg : item.iconImg.src}
                alt={item.name}
                className="w-full h-full object-cover"
            />
        );
    }

    const platform = getPlatformForChannel(item);
    if (platform) {
        const IconComponent = platform.iconComponent;
        return (
            <div className={`w-full h-full ${platform.bgClass} ${platform.textClass} flex items-center justify-center shadow-inner`}>
                <IconComponent size={20} />
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {item.name ? item.name.charAt(0) : "🔗"}
        </div>
    );
}

const CANONICAL_CONFIGS = [
    {
        key: "email",
        name: "البريد الإلكتروني",
        type: "email",
        iconImg: gmail,
        iconString: "gmail",
        order_index: 1,
        placeholder: "@support",
    },
    {
        key: "whatsapp",
        name: "واتساب",
        type: "whatsapp",
        iconImg: whatsapp,
        iconString: "whatsapp",
        order_index: 2,
        placeholder: "@support",
    },
    {
        key: "telegram",
        name: "تليجرام",
        type: "telegram",
        iconImg: telegram,
        iconString: "telegram",
        order_index: 3,
        placeholder: "@support",
    },
    {
        key: "snapchat",
        name: "سناب شات",
        type: "snapchat",
        iconImg: snapchat,
        iconString: "snapchat",
        order_index: 4,
        placeholder: "@support",
    },
];

function buildInitialChannels(serverList: any[]): CanonicalChannelItem[] {
    const matchedIds = new Set<number>();

    const canonicalItems: CanonicalChannelItem[] = CANONICAL_CONFIGS.map((config) => {
        const found = (serverList || []).find((sc) => {
            const n = (sc.name || sc.name_ar || "").toLowerCase();
            const t = (sc.type || "").toLowerCase();
            const ic = (sc.icon || "").toLowerCase();
            if (config.key === "email" && (n.includes("بريد") || n.includes("email") || t.includes("email") || ic.includes("gmail") || ic.includes("envelope"))) return true;
            if (config.key === "whatsapp" && (n.includes("واتساب") || n.includes("whatsapp") || t.includes("whatsapp") || ic.includes("whatsapp"))) return true;
            if (config.key === "telegram" && (n.includes("تليجرام") || n.includes("تيليجرام") || n.includes("telegram") || t.includes("telegram") || ic.includes("telegram"))) return true;
            if (config.key === "snapchat" && (n.includes("سناب") || n.includes("snapchat") || t.includes("snapchat") || ic.includes("snapchat"))) return true;
            return false;
        });

        if (found) {
            if (found.id) matchedIds.add(found.id);
            return {
                id: found.id,
                key: config.key,
                name: config.name,
                type: found.type || config.type,
                value: found.value || "",
                is_active: Boolean(found.is_active),
                iconImg: config.iconImg,
                iconString: config.iconString,
                order_index: found.order_index ?? config.order_index,
                placeholder: config.placeholder,
                isCustom: false,
            };
        }

        return {
            id: null,
            key: config.key,
            name: config.name,
            type: config.type,
            value: "",
            is_active: false,
            iconImg: config.iconImg,
            iconString: config.iconString,
            order_index: config.order_index,
            placeholder: config.placeholder,
            isCustom: false,
        };
    });

    const customItems: CanonicalChannelItem[] = (serverList || [])
        .filter((sc) => sc.id && !matchedIds.has(sc.id))
        .map((sc) => {
            const plat = getPlatformForChannel(sc);
            return {
                id: sc.id,
                key: `custom_${sc.id}`,
                name: sc.name || plat?.name || "قناة إضافية",
                type: sc.type || plat?.type || "link",
                value: sc.value || "",
                is_active: Boolean(sc.is_active),
                iconImg: null,
                iconString: sc.icon || plat?.iconString || "fa-solid fa-link",
                order_index: sc.order_index ?? 99,
                placeholder: plat?.placeholder || "@support",
                isCustom: true,
            };
        });

    return [...canonicalItems, ...customItems];
}

interface Props {
    initialCategories: Category[];
    initialQuestions: Question[];
    initialChannels: any[];
    isSuperAdmin: boolean;
}

export default function SupportAdminPanel({
    initialCategories,
    initialQuestions,
    initialChannels,
    isSuperAdmin
}: Props) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [supportChannels, setSupportChannels] = useState<CanonicalChannelItem[]>(() =>
        buildInitialChannels(initialChannels || [])
    );
    const [isSavingChannels, setIsSavingChannels] = useState(false);
    const [showAddCustomModal, setShowAddCustomModal] = useState(false);
    const [editingCustomChannelItem, setEditingCustomChannelItem] = useState<CanonicalChannelItem | null>(null);
    const [selectedPlatformId, setSelectedPlatformId] = useState<string>("instagram");
    const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
    const [newCustomChannel, setNewCustomChannel] = useState({
        name: "انستغرام",
        type: "link",
        value: "",
        icon: "fa-brands fa-instagram",
        placeholder: "https://instagram.com/username أو @username",
    });
    const [editingChannel, setEditingChannel] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // جلب الفئات والأسئلة كـ Fallback في حال لم تمرر من الخادم
    useEffect(() => {
        if (!initialCategories || initialCategories.length === 0) {
            fetchAdminSupportCategories().then((cats) => {
                if (cats && cats.length > 0) setCategories(cats);
            });
        }
    }, [initialCategories]);

    useEffect(() => {
        if (!initialQuestions || initialQuestions.length === 0) {
            fetchAdminSupportQuestions().then((res) => {
                if (res.questions && res.questions.length > 0) setQuestions(res.questions);
            });
        }
    }, [initialQuestions]);

    // ========== إدارة الأسئلة بالـ Modal ==========
    const [showModal, setShowModal] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
    const [modalFormData, setModalFormData] = useState({
        category_id: categories[0]?.id || 1,
        question: "",
        answer: "",
        order_index: 1,
    });

    const openAddModal = () => {
        setEditingQuestionId(null);
        setModalFormData({
            category_id: selectedCategory || categories[0]?.id || 1,
            question: "",
            answer: "",
            order_index: questions.length + 1,
        });
        setShowModal(true);
    };

    const openEditModal = (q: Question) => {
        setEditingQuestionId(q.id);
        setModalFormData({
            category_id: q.category_id || categories[0]?.id || 1,
            question: q.question || q.question_ar || "",
            answer: q.answer || q.answer_ar || "",
            order_index: q.order_index || 1,
        });
        setShowModal(true);
    };

    const handleSubmitModal = async () => {
        if (!modalFormData.question.trim()) {
            toast.error("يرجى إدخال السؤال");
            return;
        }

        if (!modalFormData.category_id) {
            toast.error("يرجى اختيار تصنيف السؤال");
            return;
        }

        if (!modalFormData.answer.trim()) {
            toast.error("يرجى إدخال الإجابة");
            return;
        }

        setIsSubmittingQuestion(true);
        try {
            if (editingQuestionId) {
                const res = await updateAdminSupportQuestion(editingQuestionId, {
                    category_id: Number(modalFormData.category_id),
                    question: modalFormData.question.trim(),
                    answer: modalFormData.answer.trim(),
                    order_index: modalFormData.order_index,
                    is_active: true,
                });

                if (res.success) {
                    setQuestions(questions.map(q => q.id === editingQuestionId ? {
                        ...q,
                        category_id: Number(modalFormData.category_id),
                        question: modalFormData.question.trim(),
                        question_ar: modalFormData.question.trim(),
                        answer: modalFormData.answer.trim(),
                        answer_ar: modalFormData.answer.trim(),
                        order_index: modalFormData.order_index,
                        updated_at: new Date().toISOString(),
                    } : q));
                    setShowModal(false);
                    setEditingQuestionId(null);
                    toast.success("تم تحديث السؤال بنجاح");
                } else {
                    toast.error(res.error || "فشل تحديث السؤال");
                }
            } else {
                const res = await createAdminSupportQuestion({
                    category_id: Number(modalFormData.category_id),
                    question: modalFormData.question.trim(),
                    answer: modalFormData.answer.trim(),
                    order_index: questions.length + 1,
                    is_active: true,
                });

                if (res.success && res.data) {
                    setQuestions([res.data, ...questions]);
                    setShowModal(false);
                    toast.success("تم إضافة سؤال جديد بنجاح");
                } else {
                    toast.error(res.error || "فشل إضافة السؤال");
                }
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
        } finally {
            setIsSubmittingQuestion(false);
        }
    };

    const deleteQuestion = async (id: number) => {
        toast.custom((t) => (
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto border border-gray-200" dir="rtl">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <FiTrash2 size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من حذف هذا السؤال؟
                        <br />
                        <span className="text-sm text-gray-400">لا يمكن التراجع عن هذا الإجراء</span>
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={async () => {
                                toast.dismiss(t);
                                const res = await deleteAdminSupportQuestion(id);
                                if (res.success) {
                                    setQuestions(questions.filter(q => q.id !== id));
                                    toast.success("تم حذف السؤال بنجاح");
                                } else {
                                    toast.error(res.error || "فشل حذف السؤال");
                                }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-medium transition"
                        >
                            نعم، احذف
                        </button>
                        <button
                            onClick={() => toast.dismiss(t)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium transition"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: "top-center",
        });
    };


    // ========== إدارة قنوات التواصل ==========
    useEffect(() => {
        if (initialChannels && initialChannels.length > 0) {
            setSupportChannels(buildInitialChannels(initialChannels));
        } else {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("authToken") ||
                      localStorage.getItem("bearer_token") ||
                      localStorage.getItem("adminToken") ||
                      null
                    : null;
            fetchAdminSupportChannels(token).then((res) => {
                if (res.channels && res.channels.length > 0) {
                    setSupportChannels(buildInitialChannels(res.channels));
                }
            }).catch(() => {});
        }
    }, [initialChannels]);

    const handleToggleChannel = (key: string) => {
        setSupportChannels((prev) =>
            prev.map((ch) =>
                ch.key === key ? { ...ch, is_active: !ch.is_active } : ch
            )
        );
    };

    const handleValueChange = (key: string, value: string) => {
        setSupportChannels((prev) =>
            prev.map((ch) => (ch.key === key ? { ...ch, value } : ch))
        );
    };

    const handleSaveAllChannels = async () => {
        setIsSavingChannels(true);
        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("authToken") ||
                      localStorage.getItem("bearer_token") ||
                      localStorage.getItem("adminToken") ||
                      null
                    : null;

            let hasErrors = false;
            const updatedChannels = [...supportChannels];

            for (let i = 0; i < updatedChannels.length; i++) {
                const ch = updatedChannels[i];
                if (ch.id) {
                    // Update via PATCH: admin/support-channels/{id}
                    const res = await updateSupportChannel(
                        ch.id,
                        {
                            name: ch.name,
                            type: ch.type,
                            value: ch.value.trim(),
                            icon: ch.iconString || "fa-solid fa-check",
                            order_index: ch.order_index,
                            is_active: ch.is_active,
                        },
                        token
                    );
                    if (!res.success) {
                        hasErrors = true;
                        console.error(`Failed to update ${ch.name}:`, res.error);
                    }
                } else {
                    // Create via POST: admin/support-channels
                    if (ch.value.trim() || ch.is_active) {
                        const res = await createSupportChannel(
                            {
                                name: ch.name,
                                type: ch.type,
                                value: ch.value.trim() || "@support",
                                icon: ch.iconString || "fa-solid fa-check",
                                order_index: ch.order_index,
                                is_active: ch.is_active,
                            },
                            token
                        );
                        if (res.success && res.data?.id) {
                            updatedChannels[i] = {
                                ...ch,
                                id: res.data.id,
                            };
                        } else {
                            hasErrors = true;
                            console.error(`Failed to create ${ch.name}:`, res.error);
                        }
                    }
                }
            }

            setSupportChannels(updatedChannels);

            if (hasErrors) {
                toast.warning("تم حفظ بعض القنوات، يرجى مراجعة القنوات المتبقية");
            } else {
                toast.success("تم حفظ قنوات التواصل بنجاح!");
            }
        } catch (err: any) {
            console.error("Error saving support channels:", err);
            toast.error("حدث خطأ أثناء حفظ قنوات التواصل");
        } finally {
            setIsSavingChannels(false);
        }
    };

    const handleDeleteChannel = async (item: CanonicalChannelItem) => {
        if (!item.id) {
            setSupportChannels((prev) =>
                prev.map((ch) =>
                    ch.key === item.key ? { ...ch, value: "", is_active: false } : ch
                )
            );
            toast.success("تم مسح بيانات القناة");
            return;
        }

        if (!confirm(`هل أنت متأكد من حذف قناة "${item.name}"؟`)) return;

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("authToken") ||
                  localStorage.getItem("bearer_token") ||
                  localStorage.getItem("adminToken") ||
                  null
                : null;

        // Delete via DELETE: admin/support-channels/{id}
        const res = await deleteSupportChannel(item.id, token);
        if (res.success) {
            toast.success(`تم حذف قناة ${item.name} بنجاح`);
            if (item.isCustom) {
                setSupportChannels((prev) => prev.filter((ch) => ch.key !== item.key));
            } else {
                setSupportChannels((prev) =>
                    prev.map((ch) =>
                        ch.key === item.key
                            ? { ...ch, id: null, value: "", is_active: false }
                            : ch
                    )
                );
            }
        } else {
            toast.error(res.error || "فشل حذف القناة");
        }
    };

    const handleOpenAddCustomModal = () => {
        setEditingCustomChannelItem(null);
        setSelectedPlatformId("instagram");
        setNewCustomChannel({
            name: "انستغرام",
            type: "link",
            value: "",
            icon: "fa-brands fa-instagram",
            placeholder: "https://instagram.com/username أو @username",
        });
        setShowAddCustomModal(true);
    };

    const handleOpenEditCustomModal = (item: CanonicalChannelItem) => {
        setEditingCustomChannelItem(item);
        const plat = getPlatformForChannel(item);
        setSelectedPlatformId(plat?.id || "instagram");
        setNewCustomChannel({
            name: item.name,
            type: item.type,
            value: item.value,
            icon: item.iconString,
            placeholder: item.placeholder,
        });
        setShowAddCustomModal(true);
    };

    const handleSelectPlatform = (platform: SocialPlatformConfig) => {
        setSelectedPlatformId(platform.id);
        setNewCustomChannel((prev) => ({
            ...prev,
            name: platform.name,
            type: platform.type,
            icon: platform.iconString,
            placeholder: platform.placeholder,
        }));
    };

    const handleSaveCustomChannelModal = async () => {
        if (!newCustomChannel.name.trim()) {
            toast.error("يرجى إدخال اسم القناة");
            return;
        }

        const selectedPlat = SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatformId);
        const val = newCustomChannel.value.trim();

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("authToken") ||
                  localStorage.getItem("bearer_token") ||
                  localStorage.getItem("adminToken") ||
                  null
                : null;

        setIsSubmittingCustom(true);
        try {
            if (editingCustomChannelItem && editingCustomChannelItem.id) {
                // تعديل قناة موجودة
                const res = await updateSupportChannel(
                    editingCustomChannelItem.id,
                    {
                        name: newCustomChannel.name.trim(),
                        type: newCustomChannel.type || selectedPlat?.type || "link",
                        value: val,
                        icon: newCustomChannel.icon || selectedPlat?.iconString || "fa-solid fa-link",
                        order_index: editingCustomChannelItem.order_index,
                        is_active: editingCustomChannelItem.is_active,
                    },
                    token
                );

                if (res.success) {
                    toast.success(`تم تحديث قناة "${newCustomChannel.name}" بنجاح`);
                    setSupportChannels((prev) =>
                        prev.map((ch) =>
                            ch.key === editingCustomChannelItem.key
                                ? {
                                      ...ch,
                                      name: newCustomChannel.name.trim(),
                                      type: newCustomChannel.type || selectedPlat?.type || "link",
                                      value: val,
                                      iconString: newCustomChannel.icon || selectedPlat?.iconString || "fa-solid fa-link",
                                      placeholder: selectedPlat?.placeholder || ch.placeholder,
                                  }
                                : ch
                        )
                    );
                    setShowAddCustomModal(false);
                    setEditingCustomChannelItem(null);
                } else {
                    toast.error(res.error || "فشل تحديث القناة");
                }
            } else {
                // إضافة قناة جديدة
                const res = await createSupportChannel(
                    {
                        name: newCustomChannel.name.trim(),
                        type: newCustomChannel.type || selectedPlat?.type || "link",
                        value: val || "@support",
                        icon: newCustomChannel.icon || selectedPlat?.iconString || "fa-solid fa-link",
                        order_index: supportChannels.length + 1,
                        is_active: true,
                    },
                    token
                );

                if (res.success && res.data) {
                    toast.success(`تمت إضافة قناة "${newCustomChannel.name}" بنجاح`);
                    const newItem: CanonicalChannelItem = {
                        id: res.data.id,
                        key: `custom_${res.data.id}`,
                        name: res.data.name,
                        type: res.data.type || selectedPlat?.type || "link",
                        value: res.data.value,
                        is_active: res.data.is_active,
                        iconImg: null,
                        iconString: res.data.icon || selectedPlat?.iconString || "fa-solid fa-link",
                        order_index: res.data.order_index ?? supportChannels.length + 1,
                        placeholder: selectedPlat?.placeholder || "@support",
                        isCustom: true,
                    };
                    setSupportChannels((prev) => [...prev, newItem]);
                    setShowAddCustomModal(false);
                } else {
                    toast.error(res.error || "فشل إضافة القناة");
                }
            }
        } catch (e: any) {
            console.error("Error saving custom channel:", e);
            toast.error("حدث خطأ أثناء حفظ القناة");
        } finally {
            setIsSubmittingCustom(false);
        }
    };



    const filteredQuestions = questions.filter(q => {
        if (selectedCategory !== null && selectedCategory !== 0) {
            if (q.category_id !== selectedCategory) {
                return false;
            }
        }
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            const questionText = (q.question || q.question_ar || "").toLowerCase();
            const answerText = (q.answer || q.answer_ar || "").toLowerCase();
            return questionText.includes(query) || answerText.includes(query);
        }
        return true;
    });

    const getCategoryName = (categoryId: number, q?: Question) => {
        if (q?.category_name) return q.category_name;
        if (q?.category?.name) return q.category.name;
        const cat = categories.find(c => c.id === categoryId);
        return cat?.name || cat?.name_ar || "تخصيص الثيم";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "28 يناير 2026";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-8" dir="rtl">
            {/* ─── مودال إضافة / تعديل سؤال (يطابق التصميم المعطى) ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                {editingQuestionId ? "تعديل السؤال" : "إضافة سؤال جديد"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Field 1: السؤال * */}
                        <div className="mb-5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                                السؤال <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={modalFormData.question}
                                onChange={(e) => setModalFormData({ ...modalFormData, question: e.target.value })}
                                placeholder="ادخل السؤال هنا"
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.04)]"
                            />
                        </div>

                        {/* Field 2: اختر التصنيف * */}
                        <div className="mb-5">
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                                اختر التصنيف <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={modalFormData.category_id}
                                    onChange={(e) => setModalFormData({ ...modalFormData, category_id: Number(e.target.value) })}
                                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">اختر تصنيف السؤال</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name || cat.name_ar}
                                        </option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base" />
                            </div>
                        </div>

                        {/* Field 3: الاجابة * */}
                        <div className="mb-8">
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                                الاجابة <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={modalFormData.answer}
                                onChange={(e) => setModalFormData({ ...modalFormData, answer: e.target.value })}
                                placeholder="ادخل الاجابة هنا"
                                rows={4}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.04)]"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmitModal}
                                disabled={isSubmittingQuestion}
                                className="bg-[#2a303c] hover:bg-[#1e242d] disabled:opacity-50 text-white py-2.5 px-10 rounded-full font-medium text-sm transition-all shadow-md active:scale-95"
                            >
                                {isSubmittingQuestion
                                    ? "جاري الحفظ..."
                                    : editingQuestionId
                                    ? "حفظ التعديلات"
                                    : "إضافة سؤال"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── قسم بيانات الدعم والأسئلة الشائعة (يطابق تصميم الشاشة 0) ─── */}
            <div>
                {/* Header row */}
                <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        بيانات الدعم والأسئلة الشائعة
                    </h1>
                    {isSuperAdmin && (
                        <button
                            onClick={openAddModal}
                            className="bg-[#2a303c] hover:bg-[#1e242d] text-white px-6 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            <FiPlus size={16} />
                            <span>اضف سؤال</span>
                        </button>
                    )}
                </div>

                {/* Card containing Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 overflow-hidden">
                    {/* Top Row: Search on right & Category filter on left */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        {/* Search Input (on right in RTL) */}
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="ابحث عن سؤال معين..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50/70 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-full py-2 px-4 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                            <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX size={15} />
                                </button>
                            )}
                        </div>

                        {/* Category Filter Dropdown (on left in RTL) */}
                        <div className="relative w-full sm:w-56">
                            <select
                                value={selectedCategory !== null ? String(selectedCategory) : ""}
                                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full appearance-none bg-gray-50/70 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700 rounded-full py-2 px-4 pr-4 pl-10 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                            >
                                <option value="">اختر تصنيف</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name || cat.name_ar}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-right" dir="rtl">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                    <th className="py-4 px-4 text-right">السؤال</th>
                                    <th className="py-4 px-4 text-center">التصنيف</th>
                                    <th className="py-4 px-4 text-center">اخر تحديث</th>
                                    {isSuperAdmin && (
                                        <th className="py-4 px-4 text-center">الاجراءات</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 4 : 3} className="text-center py-16 text-gray-500">
                                            لا توجد أسئلة تطابق بحثك
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQuestions.map((q) => {
                                        const catName = getCategoryName(q.category_id, q);
                                        return (
                                            <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                                {/* السؤال */}
                                                <td className="py-4 px-4 font-medium text-gray-900 dark:text-white text-sm sm:text-base max-w-md">
                                                    {q.question || q.question_ar}
                                                </td>

                                                {/* التصنيف (Badge) */}
                                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                                    <span className="inline-block bg-[#fff3eb] dark:bg-orange-950/40 text-[#ff7714] dark:text-orange-400 text-xs font-semibold px-3 py-1 rounded-full">
                                                        {catName}
                                                    </span>
                                                </td>

                                                {/* اخر تحديث */}
                                                <td className="py-4 px-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(q.updated_at || q.created_at)}
                                                </td>

                                                {/* الاجراءات */}
                                                {isSuperAdmin && (
                                                    <td className="py-4 px-4 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {/* Edit Button */}
                                                            <button
                                                                onClick={() => openEditModal(q)}
                                                                className="size-9 rounded-full border border-gray-200 dark:border-zinc-700 hover:border-orange-500 text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                                                title="تعديل السؤال"
                                                            >
                                                                <FiEdit2 size={15} />
                                                            </button>

                                                            {/* Delete Button */}
                                                            <button
                                                                onClick={() => deleteQuestion(q.id)}
                                                                className="size-9 rounded-full border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                                                title="حذف السؤال"
                                                            >
                                                                <FiTrash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm" dir="rtl">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">قنوات التواصل</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            إدارة طرق الاتصال المعروضة للمستخدمين
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={handleOpenAddCustomModal}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <FiPlus size={14} /> إضافة وسيلة تواصل اجتماعي
                        </button>
                    )}
                </div>

                {/* شبكة القنوات */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {supportChannels.map((item) => (
                        <div
                            key={item.key}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            {/* الرأس: الأيقونة والاسم والحالة على اليمين، والسويتش على اليسار */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100 shadow-sm shrink-0">
                                        {renderChannelIcon(item)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
                                        <span
                                            className={`text-xs font-semibold block transition-colors ${
                                                item.is_active ? "text-emerald-500" : "text-gray-400"
                                            }`}
                                        >
                                            {item.is_active ? "مفعل" : "غير مفعل"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {item.isCustom && item.id && isSuperAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditCustomModal(item)}
                                            title="تعديل القناة"
                                            className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5 cursor-pointer"
                                        >
                                            <FiEdit2 size={15} />
                                        </button>
                                    )}
                                    {item.id && isSuperAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteChannel(item)}
                                            title="حذف القناة"
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={item.is_active}
                                        onClick={() => isSuperAdmin && handleToggleChannel(item.key)}
                                        disabled={!isSuperAdmin}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed ${
                                            item.is_active ? "bg-emerald-500" : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-all duration-200 ease-in-out ${
                                                item.is_active ? "-translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* حقل الإدخال */}
                            <div className="relative mt-auto">
                                <input
                                    type="text"
                                    value={item.value}
                                    disabled={!isSuperAdmin}
                                    onChange={(e) => handleValueChange(item.key, e.target.value)}
                                    placeholder={item.placeholder || "@support"}
                                    className="w-full !bg-transparent rounded-full px-5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-gray-800 placeholder:text-gray-400 border border-gray-200 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] text-center sm:text-right disabled:bg-gray-50"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* زر الحفظ */}
                {isSuperAdmin && (
                    <div className="flex justify-start mt-8">
                        <button
                            type="button"
                            onClick={handleSaveAllChannels}
                            disabled={isSavingChannels}
                            className="bg-[#1e2337] hover:bg-[#282f49] active:scale-95 text-white px-10 py-2.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isSavingChannels ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <span>حفظ</span>
                            )}
                        </button>
                    </div>
                )}

                {/* مودال إضافة وتعديل وسيلة تواصل اجتماعي */}
                {showAddCustomModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] flex flex-col">
                            {/* رأس المودال */}
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const plat = SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatformId);
                                        if (plat) {
                                            const IconC = plat.iconComponent;
                                            return (
                                                <div className={`w-11 h-11 rounded-2xl ${plat.bgClass} ${plat.textClass} flex items-center justify-center shadow-md shrink-0 transition-transform`}>
                                                    <IconC size={22} />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {editingCustomChannelItem ? "تعديل قناة التواصل" : "إضافة وسيلة تواصل اجتماعي"}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            اختر منصة السوشيال ميديا وأدخل الرابط أو اسم المعرف
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddCustomModal(false);
                                        setEditingCustomChannelItem(null);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            {/* محتوى المودال */}
                            <div className="space-y-4 py-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pl-1">
                                {/* 1. شبكة اختيار السوشيال ميديا مع الأيقونة لكل منصة */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">
                                        اختر المنصة:
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 border border-gray-100 rounded-2xl bg-gray-50/50">
                                        {SOCIAL_PLATFORMS.map((platform) => {
                                            const IconComponent = platform.iconComponent;
                                            const isSelected = selectedPlatformId === platform.id;
                                            return (
                                                <button
                                                    key={platform.id}
                                                    type="button"
                                                    onClick={() => handleSelectPlatform(platform)}
                                                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer group ${
                                                        isSelected
                                                            ? "border-primary bg-white shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                                                            : "border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/80"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-8 h-8 rounded-xl ${platform.bgClass} ${platform.textClass} flex items-center justify-center shadow-xs mb-1 transition-transform group-hover:scale-110`}
                                                    >
                                                        <IconComponent size={16} />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-gray-700 truncate max-w-full text-center">
                                                        {platform.name}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center text-[8px] shadow-sm">
                                                            <FaCheck size={7} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. اسم القناة أو العنوان */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-800">
                                            اسم أو عنوان القناة <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-gray-400">يمكنك تعديل الاسم المعروض</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={newCustomChannel.name}
                                        onChange={(e) => setNewCustomChannel({ ...newCustomChannel, name: e.target.value })}
                                        placeholder="مثال: انستغرام، تيك توك..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium transition"
                                    />
                                </div>

                                {/* 3. نوع الرابط / التنسيق */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                                        نوع الرابط / التنسيق
                                    </label>
                                    <select
                                        value={newCustomChannel.type}
                                        onChange={(e) => setNewCustomChannel({ ...newCustomChannel, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-primary text-sm bg-white cursor-pointer"
                                    >
                                        <option value="link">رابط ويب مباشر (URL Link)</option>
                                        <option value="text">اسم مستخدم أو معرّف (Username / @Handle)</option>
                                        <option value="phone">رقم اتصال / واتساب (Phone Number)</option>
                                        <option value="email">بريد إلكتروني (Email Address)</option>
                                    </select>
                                </div>

                                {/* 4. الرابط أو المعرف أو القيمة */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-800">
                                            الرابط أو اسم الحساب <span className="text-red-500">*</span>
                                        </label>
                                        {(() => {
                                            const plat = SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatformId);
                                            return plat?.exampleUrl ? (
                                                <span className="text-[11px] text-gray-400 font-mono" dir="ltr">
                                                    مثال: {plat.exampleUrl}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>
                                    <input
                                        type="text"
                                        value={newCustomChannel.value}
                                        onChange={(e) => setNewCustomChannel({ ...newCustomChannel, value: e.target.value })}
                                        placeholder={newCustomChannel.placeholder || "@username أو https://..."}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-mono placeholder:font-sans transition"
                                        dir="ltr"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        يمكنك إدخال الرابط كاملاً مثل https:// أو كتابة اسم المعرف مباشرة مثل @username
                                    </p>
                                </div>
                            </div>

                            {/* أزرار الإجراء */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-1">
                                <button
                                    type="button"
                                    onClick={handleSaveCustomChannelModal}
                                    disabled={isSubmittingCustom}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-bold transition text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingCustom ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiPlus size={16} />
                                            <span>{editingCustomChannelItem ? "حفظ التعديل" : "إضافة وسيلة التواصل"}</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddCustomModal(false);
                                        setEditingCustomChannelItem(null);
                                    }}
                                    disabled={isSubmittingCustom}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}