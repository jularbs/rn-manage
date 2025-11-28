//TODOS: Handle images for SEO Images
"use client";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import slugify from "slugify";

import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { modules } from "@/lib/tinymce";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLocalStorage } from "usehooks-ts";
import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { getCookie } from "typescript-cookie";
import { ARTICLE_TYPE_BASIC, ARTICLE_TYPE_VIDEO } from "@/lib/constants";
import { Badge } from "@/components/ui/badge"
import { cn, getImageSource, ReplaceHtmlEntities } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ImageIcon, LoaderCircleIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import moment from "moment";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";

// import FeaturedVideoManagement from "./FeaturedVideoManagement";
import { toast } from "sonner";
import { createPost, updatePost } from "@/actions/post";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";
import FeaturedVideoManagement from "./FeaturedVideoManagement";
import Script from "next/script";

//react-hook-form and zod imports
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const EditorComponent = () => {
    const searchParams = useSearchParams();

    const token = getCookie("token");
    const [user,] = useLocalStorage("user", { _id: "", name: "", email: "", role: "", designation: "" })
    const [slug, setSlug] = useState<string>("");
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [editorLoaded, setEditorLoaded] = useState<boolean>(false);

    const generateSlug = () => {
        if (form.getValues("title")) {
            const slug = slugify(form.getValues("title"), { lower: true, strict: true });
            form.setValue("slug", slug);
        }
    }

    //react-hook-form and zod schema for form validation
    const formSchema = z.object({
        _id: z.string().optional(),
        title: z.string().min(1, "Title is required").max(300, "Title cannot exceed 300 characters"),
        slug: z.string()
            .min(1, "Permalink is required")
            .max(300, "Permalink cannot exceed 300 characters")
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Permalink must be URL-friendly: lowercase letters, numbers, and hyphens only (no spaces or special characters)"),
        content: z.string().min(1, "Content is required"),
        author: z.string().min(1, "Author is required"),
        type: z.string().min(1, "Article Type is required"),
        publishedAt: z.string().min(1, "Publish Date is required"),
        status: z.string().min(1, "Status is required"),
        categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category")).min(1, "At least one category must be selected"),
        tags: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tag")).min(1, "At least one tag must be selected"),
        videoSourceUrl: z.union([z.url("Video Source is invalid URL"), z.undefined(), z.literal("")]),
        featuredImageCaption: z.string().max(500, "Featured Image Caption cannot exceed 500 characters"),

        //SEO fields
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.string().optional(),
        canonicalUrl: z.union([z.url("Canonical URL is invalid URL"), z.undefined(), z.literal("")]),

        robotsIndex: z.boolean().optional(),
        robotsFollow: z.boolean().optional(),
        robotsArchive: z.boolean().optional(),
        robotsSnippet: z.boolean().optional(),
        robotsImageIndex: z.boolean().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogUrl: z.union([z.url("OG Url is invalid URL"), z.undefined(), z.literal("")]).optional(),
        ogType: z.string().optional(),
        ogSiteName: z.string().optional(),
        ogLocale: z.string().optional(),
        ogImageAlt: z.string().optional(),

        twitterCard: z.string().optional(),
        twitterTitle: z.string().optional(),
        twitterDescription: z.string().optional(),
        twitterSite: z.string().optional(),
        twitterCreator: z.string().optional(),
        twitterImageAlt: z.string().optional(),

        seoAuthor: z.string().optional(),
        publisher: z.string().optional(),
        focusKeyword: z.string().optional(),
        readingTime: z.string().optional(),

        featuredImage:
            z.instanceof(File, { message: "Image is required" })
                .optional()
                .refine(file => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"].includes(file.type), {
                    message: '.jpg, .jpeg, .png, .avif and .webp files are accepted for featured image.',
                })
                .refine(file => !file || (file.size > 0 && file.size <= 10 * 1024 * 1024), { message: "Max image size exceeded (10MB) for featured image" }),

        ogImage:
            z.instanceof(File, { message: "Image is required" })
                .optional()
                .refine(file => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"].includes(file.type), {
                    message: '.jpg, .jpeg, .png, .avif and .webp files are accepted for OG Image',
                })
                .refine(file => !file || (file.size > 0 && file.size <= 10 * 1024 * 1024), { message: "Max image size exceeded (10MB) for OG Image" }),

        twitterImage:
            z.instanceof(File, { message: "Image is required" })
                .optional()
                .refine(file => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"].includes(file.type), {
                    message: '.jpg, .jpeg, .png, .avif and .webp files are accepted for Twitter Image.',
                })
                .refine(file => !file || (file.size > 0 && file.size <= 10 * 1024 * 1024), { message: "Max image size exceeded (10MB) for Twitter Image" }),
    }).refine((data) => {
        // If status is "published", require either a new featuredImage or existing previewImage
        if (data.status === "published") {
            return data.featuredImage !== undefined || previewImage !== "";
        }
        return true;
    }, {
        message: "Featured image is required when publishing an article",
        path: ["featuredImage"]
    }).refine((data) => {
        // If type is ARTICLE_TYPE_VIDEO, require videoSourceUrl
        if (data.type === ARTICLE_TYPE_VIDEO) {
            return data.videoSourceUrl && data.videoSourceUrl.trim() !== "";
        }
        return true;
    }, {
        message: "Video source URL is required for video articles",
        path: ["videoSourceUrl"]
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: "",
            title: "",
            slug: "",
            content: "",
            author: user._id || "",
            type: ARTICLE_TYPE_BASIC,
            tags: [],
            categories: [],
            publishedAt: moment().format("YYYY-MM-DDTHH:mm"),
            status: "",
            featuredImageCaption: "",
            videoSourceUrl: "",
            //SEO defaults
            metaTitle: "",
            metaDescription: "",
            keywords: "",
            canonicalUrl: "",
            robotsIndex: true,
            robotsFollow: true,
            robotsArchive: true,
            robotsSnippet: true,
            robotsImageIndex: true,
            ogTitle: "",
            ogDescription: "",
            ogType: "article",
            ogUrl: "",
            ogSiteName: "",
            ogLocale: "en_US",
            twitterCard: "summary_large_image",
            twitterTitle: "",
            twitterDescription: "",
            twitterSite: "",
            twitterCreator: "",
            seoAuthor: "",
            publisher: "",
            focusKeyword: "",
            readingTime: "",
            ogImageAlt: "",
            twitterImageAlt: "",
            featuredImage: undefined,
            ogImage: undefined,
            twitterImage: undefined,
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitLoading(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        formData.append(key, item);
                    }
                } else if (typeof value === 'boolean') {
                    formData.append(key, value.toString());
                } else if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value);
                }
            }
        });

        if (postData) {
            updatePost({ data: formData, token }).then(res => {
                setSubmitLoading(false);
                toast.success("Success!", {
                    style: {
                        background: "rgb(56, 142, 60)",
                        color: "white",
                        border: "none",
                    },
                    description: res.message || "Post updated successfully!",
                    duration: 5000,
                    position: "top-center"
                });

                //reload data and update url with permalink if it has changed
                if (searchParams.get("slug") == formData.get("slug")) {
                    mutate();
                } else {
                    setSlug(formData.get("slug") as string);
                    const urlSearchParams = new URLSearchParams(searchParams.toString())
                    urlSearchParams.set('slug', formData.get("slug") as string)
                    window.history.pushState(null, '', `?${urlSearchParams.toString()}`)
                }
            }).catch((error) => {
                setSubmitLoading(false);
                toast.error("Invalid Request!", {
                    style: {
                        background: "rgba(220, 46, 46, 1)",
                        color: "white",
                        border: "none"
                    },
                    description: error.message,
                    duration: 5000,
                    position: "top-center"
                });
            });

        } else {
            //if postData does not exist, create a new article
            createPost({ data: formData, token }).then(res => {
                setSubmitLoading(false);
                toast.success("Success!", {
                    style: {
                        background: "rgb(56, 142, 60)",
                        color: "white",
                        border: "none"
                    },
                    description: res.message || "Post created successfully!",
                    duration: 5000,
                    position: "top-center"
                });

                // redirect to update post
                setSlug(formData.get("slug") as string);
                const urlSearchParams = new URLSearchParams(searchParams.toString())
                urlSearchParams.set('slug', formData.get("slug") as string)
                window.history.pushState(null, '', `?${urlSearchParams.toString()}`)

                // Update taskId if redirected from task management
            }).catch((error) => {
                setSubmitLoading(false);
                console.error("Error creating post:", error);
                toast.error("Invalid Request!", {
                    style: {
                        background: "rgba(220, 46, 46, 1)",
                        color: "white",
                        border: "none"
                    },
                    description: error.message,
                    duration: 5000,
                    position: "top-center"
                });
            });
        }
    }

    //fetch post data if postId is present in the URL
    const { data: postData, mutate, isLoading: postLoading } = useSWR(slug ? {
        url: `v1/posts/${slug}`,
        token
    } : null, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
    });

    const { data: users } = useSWR({
        url: "v1/users",
        token
    }, fetcher);

    //Add original author to authors list
    const authors = users && users.data &&
        users.data?.filter((u: Record<string, string | undefined>) => user._id == u._id || postData?.author?._id == u._id)
            .map((u: Record<string, string | undefined>) => ({
                value: u._id,
                label: u.fullName,
            }));

    //confirm close
    const [isUnsafeTabClose,] = useState(true);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isUnsafeTabClose) {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isUnsafeTabClose]);

    useEffect(() => {
        // Check if the searchParams contain a title
        if (searchParams.get("title")) {
            form.setValue("title", searchParams.get("title") || "");
        }

        if (searchParams.get("slug")) {
            setSlug(searchParams.get("slug") || "");
            form.setValue("slug", searchParams.get("slug") || "");
        }
    }, [form, searchParams]);

    useEffect(() => {
        if (postData) {
            form.setValue("_id", postData._id);
            form.setValue("title", postData.title);
            form.setValue("slug", postData.slug);
            form.setValue("content", postData.content);
            form.setValue("author", postData.author?._id);
            form.setValue("type", postData.type);
            form.setValue("publishedAt", moment(postData.publishedAt).format("YYYY-MM-DDTHH:mm"));
            form.setValue("status", postData.status);
            form.setValue("featuredImageCaption", postData.featuredImageCaption || "");
            form.setValue("categories", postData.categories?.map((c: Record<string, string>) => c._id) || []);
            form.setValue("tags", postData.tags?.map((t: Record<string, string>) => t._id) || []);
            form.setValue("videoSourceUrl", postData.videoSourceUrl);

            // Update SEO postData.data
            form.setValue("metaTitle", postData.metaTitle || "");
            form.setValue("metaDescription", postData.metaDescription || "");
            form.setValue("keywords", postData.keywords || "");
            form.setValue("canonicalUrl", postData.canonicalUrl || "");
            form.setValue("robotsIndex", postData.robotsIndex !== undefined ? postData.robotsIndex : true);
            form.setValue("robotsFollow", postData.robotsFollow !== undefined ? postData.robotsFollow : true);
            form.setValue("robotsArchive", postData.robotsArchive !== undefined ? postData.robotsArchive : true);
            form.setValue("robotsSnippet", postData.robotsSnippet !== undefined ? postData.robotsSnippet : true);
            form.setValue("robotsImageIndex", postData.robotsImageIndex !== undefined ? postData.robotsImageIndex : true);
            form.setValue("ogTitle", postData.ogTitle || "");
            form.setValue("ogDescription", postData.ogDescription || "");
            form.setValue("ogType", postData.ogType || "article");
            form.setValue("ogUrl", postData.ogUrl || "");
            form.setValue("ogSiteName", postData.ogSiteName || "");
            form.setValue("ogLocale", postData.ogLocale || "en_US");
            form.setValue("twitterCard", postData.twitterCard || "summary_large_image");
            form.setValue("twitterTitle", postData.twitterTitle || "");
            form.setValue("twitterDescription", postData.twitterDescription || "");
            form.setValue("twitterSite", postData.twitterSite || "");
            form.setValue("twitterCreator", postData.twitterCreator || "");
            form.setValue("twitterImageAlt", postData.twitterImageAlt || "");
            form.setValue("seoAuthor", postData.seoAuthor || "");
            form.setValue("publisher", postData.publisher || "");
            form.setValue("focusKeyword", postData.focusKeyword || "");
            form.setValue("readingTime", postData.readingTime || "");
            form.setValue("ogImageAlt", postData.ogImageAlt || "");
            form.setValue("twitterImageAlt", postData.twitterImageAlt || "");

            //update preview images
            if (postData.featuredImage)
                setPreviewImage(getImageSource(postData.featuredImage));
            if (postData.ogImage)
                setOgImagePreview(getImageSource(postData.ogImage));
            if (postData.twitterImage)
                setTwitterImagePreview(getImageSource(postData.twitterImage));
        }
    }, [form, postData])

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    // Preview Image States
    const [previewImage, setPreviewImage] = useState<string>("");
    const [ogImagePreview, setOgImagePreview] = useState<string>("");
    const [twitterImagePreview, setTwitterImagePreview] = useState<string>("");

    //Handle Dialogs
    const [isFeaturedVideoManagementOpen, setIsFeaturedVideoManagementOpen] = useState<boolean>(false);

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isSocialOpen, setIsSocialOpen] = useState(false);
    const [isRobotsOpen, setIsRobotsOpen] = useState(false);

    // Display toast when form has validation errors
    useEffect(() => {
        const errorCount = Object.keys(form.formState.errors).length;
        if (errorCount > 0 && form.formState.isSubmitted) {
            const errorMessages = Object.entries(form.formState.errors).map(([, error]) => error?.message).filter(Boolean);

            toast.error(`Form has ${errorCount} validation error${errorCount > 1 ? 's' : ''}`, {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                position: "top-center",
                description: (
                    <ul className="list-disc pl-4 mt-2">
                        {errorMessages.map((message, index) => (
                            <li key={index} className="text-sm">{message}</li>
                        ))}
                    </ul>
                ),
                duration: 5000,
            });
        }
    }, [form.formState.errors, form.formState.isSubmitted]);

    const generateMetaFromPost = () => {
        // Auto-generate meta title
        if (form.getValues("title")) {
            form.setValue("metaTitle", form.getValues("title").trim());
        }

        // Auto-generate meta description from content
        if (form.getValues("content")) {
            const plainText = ReplaceHtmlEntities(form.getValues("content").replace(/<[^>]*>/g, ''));

            const description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
            form.setValue("metaDescription", description.trim());
        }

        // Auto-generate canonical URL
        if (form.getValues("slug")) {
            form.setValue("canonicalUrl", `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/post/${form.getValues("slug")}`);
        }

        // Auto-fill Open Graph data using the newly generated values
        if (!form.getValues("ogTitle")) {
            form.setValue("ogTitle", form.getValues("metaTitle") || form.getValues("title"));
        }
        if (!form.getValues("ogDescription")) {
            form.setValue("ogDescription", form.getValues("metaDescription"));
        }
        if (!form.getValues("ogUrl")) {
            form.setValue("ogUrl", form.getValues("canonicalUrl"));
        }

        // Auto-fill Twitter data using the newly generated values
        if (!form.getValues("twitterTitle")) {
            form.setValue("twitterTitle", form.getValues("metaTitle") || form.getValues("title"));
        }
        if (!form.getValues("twitterDescription")) {
            form.setValue("twitterDescription", form.getValues("metaDescription"));
        }
    };

    const handleImageUpload = (field: 'ogImage' | 'twitterImage', file: File | undefined) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(field, file);
                const result = reader.result as string;
                if (field === 'ogImage') setOgImagePreview(result);
                else if (field === 'twitterImage') setTwitterImagePreview(result);
            };
            reader.readAsDataURL(file);
        } else {
            form.setValue(field, undefined);
            if (field === 'ogImage') setOgImagePreview("");
            else if (field === 'twitterImage') setTwitterImagePreview("");
        }
    };

    const getCharacterCount = (text: string, limit: number) => {
        const remaining = limit - text.length;
        return {
            count: text.length,
            remaining,
            isOverLimit: remaining < 0
        };
    };

    const SeoComponentForm = () => {
        return <Card className="p-2 !gap-0">
            <CardHeader className="py-2 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">SEO Meta Tags</span>
                        <Badge variant="secondary" className="text-xs">Essential for Rankings</Badge>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        onClick={generateMetaFromPost}
                        className="text-xs font-bold cursor-pointer"
                    >
                        Auto-Generate
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="px-1 space-y-4">
                {/* Basic SEO Fields */}
                <div className="space-y-3">
                    <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Meta Title *</FormLabel>
                                    <span className={cn(
                                        "text-xs",
                                        getCharacterCount(field.value as string, 60).isOverLimit ? "text-orange-300" : "text-gray-500"
                                    )}>
                                        {getCharacterCount(field.value as string, 60).count}/60
                                    </span>
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder="Optimized title for search engines (50-60 characters)"
                                        {...field}
                                        className={getCharacterCount(field.value as string, 60).isOverLimit ? "border-orange-300" : ""}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium">Meta Description *</FormLabel>
                                    <span className={cn(
                                        "text-xs",
                                        getCharacterCount(field.value as string, 160).isOverLimit ? "text-orange-300" : "text-gray-500"
                                    )}>
                                        {getCharacterCount(field.value as string, 160).count}/160
                                    </span>
                                </div>
                                <Textarea
                                    placeholder="Compelling description that appears in search results (120-160 characters)"
                                    {...field}
                                    className={cn(
                                        getCharacterCount(field.value as string, 160).isOverLimit ? "border-orange-300" : ""
                                    )}
                                />
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="focusKeyword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Focus Keyword</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Primary keyword for this post"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <div>
                                <FormLabel className="text-sm font-medium">Keywords (SEO Tags)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="keyword1, keyword2, keyword3 (comma-separated)"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs font-light" />
                                <p className="text-xs text-gray-500 mt-1">Add relevant keywords separated by commas</p>
                            </div>
                        )}
                    />
                </div>
                <Separator />

                {/* Social Media Meta Tags */}
                <Collapsible open={isSocialOpen} onOpenChange={setIsSocialOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Social Media Tags</span>
                            <Badge variant="outline" className="text-xs">Rich Sharing</Badge>
                        </div>
                        {isSocialOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4 pt-3">
                        {/* Open Graph (Facebook) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">Open Graph (Facebook, LinkedIn)</h4>
                                <Badge variant="secondary" className="text-xs">Facebook</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="ogTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">OG Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Title for social sharing"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ogType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">OG Type</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="article">Article</SelectItem>
                                                    <SelectItem value="video.other">Video</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )} />
                            </div>
                            <FormField
                                control={form.control}
                                name="ogDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">OG Description</FormLabel>
                                        <Textarea
                                            placeholder="Description for social sharing"
                                            {...field}
                                        />
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ogUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">OG Url</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="URL for social sharing"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="ogSiteName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Site Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your website name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ogLocale"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Locale</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="en_US"
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* OG Image */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Open Graph Image</FormLabel>
                                        {form.formState.errors.ogImage && <p className="text-xs text-red-600 mt-1">{form.formState.errors.ogImage.message as string}</p>}
                                        {ogImagePreview ? (
                                            <div className="relative aspect-video bg-accent rounded-sm overflow-hidden">
                                                <Image src={ogImagePreview} alt="OG image preview" fill className="object-cover" />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2 h-6 w-6"
                                                    onClick={() => handleImageUpload('ogImage', undefined)}
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="aspect-video bg-accent rounded-sm flex justify-center items-center cursor-pointer border-2 border-dashed">
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto mb-1" size={20} />
                                                    <span className="text-xs">OG Image</span>
                                                    <span className="block text-[10px] font-light">Defaults to featured image</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload('ogImage', e.target.files?.[0] || undefined)}
                                                />
                                            </label>
                                        )}
                                    </FormItem>
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="ogImageAlt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Alt Text</FormLabel>
                                                    <Textarea
                                                        placeholder="Alt text for OG image"
                                                        {...field}
                                                    />
                                                    <FormMessage className="text-xs font-light" />
                                                </FormItem>
                                            )} />
                                        <div className="text-xs text-gray-500">
                                            <p>• Uploaded featured image is used if none is provided</p>
                                            <p>• Recommended: 1200x630px (16:9)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Twitter Cards */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">Twitter Cards</h4>
                                <Badge variant="secondary" className="text-xs">Twitter</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="twitterCard"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Card Type</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select card type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="summary">Summary</SelectItem>
                                                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                                                    <SelectItem value="player">Player</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="twitterSite"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Twitter Site</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="@yourtwitterhandle"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="twitterTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Twitter Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Title for Twitter sharing"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="twitterCreator"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Creator</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="@authorhandle"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )} />
                            </div>

                            <FormField
                                control={form.control}
                                name="twitterDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Twitter Description</FormLabel>
                                        <Textarea
                                            placeholder="Description for Twitter sharing"
                                            {...field}
                                        />
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )} />

                            {/* Twitter Image */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Twitter Image</FormLabel>
                                        {form.formState.errors.twitterImage && <p className="text-xs text-red-600 mt-1">{form.formState.errors.twitterImage.message as string}</p>}
                                        {twitterImagePreview ? (
                                            <div className="relative aspect-video bg-accent rounded-sm overflow-hidden">
                                                <Image src={twitterImagePreview} alt="Twitter image preview" fill className="object-cover" />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2 h-6 w-6"
                                                    onClick={() => handleImageUpload('twitterImage', undefined)}
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="aspect-video bg-accent rounded-sm flex justify-center items-center cursor-pointer border-2 border-dashed">
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto mb-1" size={20} />
                                                    <span className="text-xs">Twitter Image</span>
                                                    <span className="block text-[10px] font-light">Defaults to featured image</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload('twitterImage', e.target.files?.[0] || undefined)}
                                                />
                                            </label>
                                        )}
                                    </FormItem>
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="twitterImageAlt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Alt Text</FormLabel>
                                                    <Textarea
                                                        placeholder="Alt text for Twitter image"
                                                        {...field}
                                                    />
                                                    <FormMessage className="text-xs font-light" />
                                                </FormItem>
                                            )} />
                                        <div className="text-xs text-gray-500">
                                            <p>• Uploaded featured image is used if none is provided</p>
                                            <p>• Recommended: 1200x630px (16:9)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Advanced SEO */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Advanced SEO</span>
                            <Badge variant="outline" className="text-xs">Technical</Badge>
                        </div>
                        {isAdvancedOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="canonicalUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Canonical URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://yourdomain.com/post/permalink"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                        <p className="text-xs text-gray-500 mt-1">Prevents duplicate content issues</p>
                                    </FormItem>
                                )} />
                            <FormField
                                control={form.control}
                                name="readingTime"
                                render={({ field }) => (
                                    <div>
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Reading Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="5 min read"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    </div>
                                )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="seoAuthor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Author</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Author name for structured data"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="publisher"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Publisher</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Publisher name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )} />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Robots Meta */}
                <Collapsible open={isRobotsOpen} onOpenChange={setIsRobotsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Robots & Indexing</span>
                            <Badge variant="outline" className="text-xs">Crawling Control</Badge>
                        </div>
                        {isRobotsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <FormField
                                    control={form.control}
                                    name="robotsIndex"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-sm font-medium">Index Page</FormLabel>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="robotsFollow"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-sm font-medium">Follow Links</FormLabel>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="robotsArchive"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-sm font-medium">Archive Page</FormLabel>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-3">
                                <FormField
                                    control={form.control}
                                    name="robotsSnippet"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-sm font-medium">Show Snippet</FormLabel>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="robotsImageIndex"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="text-sm font-medium">Index Images</FormLabel>
                                                </div>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                            <p className="font-medium mb-1">Robots Configuration:</p>
                            <p>• Index: Allow search engines to include this page in results</p>
                            <p>• Follow: Allow crawling of links on this page</p>
                            <p>• Archive: Allow caching/archiving of this page</p>
                            <p>• Snippet: Allow showing text snippets in search results</p>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    }

    return (
        <>
            <Script src="https://www.tiktok.com/embed.js" async />
            <Script src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2" async />
            <Script src="https://www.instagram.com/embed.js" async />
            <Script src="https://platform.twitter.com/widgets.js" async />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FeaturedVideoManagement
                        open={isFeaturedVideoManagementOpen}
                        onOpenChange={setIsFeaturedVideoManagementOpen}
                        form={form}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-4">
                        <div className="flex flex-col gap-4">
                            <Card className="p-2">
                                <div className="flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="gap-1">
                                                <FormMessage className="text-xs ml-1" />
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter title here..."
                                                        type="text"
                                                        {...field}
                                                    ></Input>
                                                </FormControl>
                                            </FormItem>

                                        )} />
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem className="gap-1">
                                                <FormMessage className="text-xs ml-1" />
                                                <FormControl>
                                                    <div className={cn(
                                                        "flex",
                                                        "dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                                                    )}
                                                        aria-invalid={!!form.formState.errors.slug}
                                                    >
                                                        <div
                                                            className="text-neutral-800 text-xs h-full flex items-center pl-3">{process.env.NEXT_PUBLIC_WEB_DOMAIN}/post/
                                                        </div>
                                                        <Input
                                                            className="h-full px-0 border-none shadow-none rounded-none !text-[12px]"
                                                            placeholder="enter-permalink-here"
                                                            {...field}
                                                        ></Input>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="rounded-md rounded-bl-none rounded-tl-none h-full text-[12px] font-semibold cursor-pointer"
                                                            onClick={generateSlug}
                                                        >Generate</Button>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    <div>
                                        {!editorLoaded && <div className="p-10 flex flex-col items-center justify-center bg-accent">
                                            <span className="mb-2 text-sm">Loading editor...</span>
                                            <LoaderCircleIcon className="animate-spin h-6 w-6 text-neutral-500" />
                                        </div>}
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem className="gap-1">
                                                    <FormMessage className="text-xs ml-1" />
                                                    <FormControl>
                                                        <Editor
                                                            tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                                                            licenseKey="gpl"
                                                            init={modules}
                                                            initialValue={postData?.content || ""}
                                                            onEditorChange={field.onChange}
                                                            onInit={(evt, editor) => {
                                                                editorRef.current = editor;
                                                                setEditorLoaded(true);
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </Card>
                            {/* SEO Handler */}
                            {SeoComponentForm()}
                        </div>
                        <div className="flex flex-col gap-4">
                            {/* Post Actions */}
                            <Card className="p-2 !gap-0">
                                <CardHeader className="py-2 px-1 font-semibold">
                                    <div className="flex items-center justify-between">
                                        <span>Actions</span>
                                        {postLoading ?
                                            <LoaderCircleIcon className="animate-spin h-4 w-4" /> :
                                            <Badge className={cn(
                                                "font-semibold uppercase text-[10px]",
                                                form.getValues("status") === "published" ? "bg-green-100 text-green-800" :
                                                    form.getValues("status") === "draft" ? "bg-orange-300 text-orange-900" :
                                                        ""
                                            )} variant="secondary">{form.getValues("status") ? form.getValues("status") : "New Post"}</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex flex-col gap-2">
                                    {/* Preview Post (no database changes) */}
                                    <Button
                                        type="button"
                                        className="bg-blue-600 text-white text-sm"
                                        onClick={() => {
                                            const values = form.getValues();
                                            const authorObj = Array.isArray(users?.data)
                                                ? (users!.data as Array<{ _id: string }>).find((u) => u._id === values.author)
                                                : undefined;
                                            // Build a lightweight payload for preview: strip large binary fields
                                            const payload: Record<string, unknown> = {
                                                ...values,
                                                author: authorObj || { _id: values.author },
                                                featuredImage: previewImage || null,
                                            };

                                            // Replace File objects with current preview URLs (Data URLs) or remove them
                                            if (payload.featuredImage instanceof File) {
                                                if (typeof previewImage === "string" && previewImage.length > 0) {
                                                    payload.featuredImage = previewImage; // use current featured preview
                                                } else {
                                                    delete payload.featuredImage;
                                                }
                                            }
                                            // Explicitly remove social image fields from preview payload
                                            delete payload.ogImage;
                                            delete payload.twitterImage;

                                            // Remove SEO/meta fields from preview payload to keep it lean
                                            const metaKeysToRemove: string[] = [
                                                // Core meta
                                                "metaTitle", "metaDescription", "keywords", "canonicalUrl",
                                                // Robots
                                                "robotsIndex", "robotsFollow", "robotsArchive", "robotsSnippet", "robotsImageIndex",
                                                // Open Graph
                                                "ogTitle", "ogDescription", "ogUrl", "ogType", "ogSiteName", "ogLocale", "ogImageAlt",
                                                // Twitter
                                                "twitterCard", "twitterTitle", "twitterDescription", "twitterSite", "twitterCreator", "twitterImageAlt",
                                                // Other SEO
                                                "seoAuthor", "publisher", "focusKeyword", "readingTime",
                                            ];
                                            for (const k of metaKeysToRemove) {
                                                if (k in payload) delete payload[k];
                                            }

                                            // Ensure undefined values are removed to reduce payload size
                                            for (const key of Object.keys(payload)) {

                                                const val = payload[key];
                                                if (val === undefined) delete payload[key];
                                            }

                                            try {
                                                // Encode JSON payload safely for URL in browser
                                                const json = JSON.stringify(payload);
                                                const base64 = btoa(encodeURIComponent(json));
                                                const slugVal = values.slug || 'preview';
                                                const url = `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/post/${slugVal}?preview=1&data=${encodeURIComponent(base64)}`;
                                                window.open(url, '_blank');
                                            } catch {
                                                toast.error('Unable to open preview');
                                            }
                                        }}
                                    >
                                        Preview Post
                                    </Button>
                                    <FormField
                                        control={form.control}
                                        name="author"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold ml-1">Author</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Author..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {authors?.map((author: Record<string, string>) => (
                                                            <SelectItem key={author.value} value={author.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">{author.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs ml-1" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold ml-1">Type</FormLabel>
                                                <Select value={field.value} onValueChange={(value) => {
                                                    if (value === ARTICLE_TYPE_BASIC) {
                                                        form.setValue("videoSourceUrl", "");
                                                    }
                                                    field.onChange(value);
                                                }}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Type..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={ARTICLE_TYPE_BASIC}>Basic Article</SelectItem>
                                                        <SelectItem value={ARTICLE_TYPE_VIDEO}>Video Article</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {field.value === ARTICLE_TYPE_VIDEO &&
                                                    <div>
                                                        {form.formState.errors.videoSourceUrl && <p className="text-xs text-red-600 mt-1">{form.formState.errors.videoSourceUrl.message as string}</p>}
                                                        <Button className="w-full mt-2 cursor-pointer"
                                                            type="button"
                                                            onClick={() => {
                                                                setIsFeaturedVideoManagementOpen(true);
                                                            }}>
                                                            Manage Featured Video
                                                        </Button>
                                                    </div>}
                                                <FormMessage className="text-xs ml-1" />
                                            </FormItem>
                                        )} />
                                    <FormField
                                        control={form.control}
                                        name="publishedAt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs ml-1 font-semibold">Publish Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="datetime-local"
                                                        placeholder="Select Publish Date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs ml-1" />
                                            </FormItem>
                                        )} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className="flex items-center justify-center bg-black text-white rounded-md text-sm p-2 font-semibold cursor-pointer mt-2">
                                            Save Changes
                                            {submitLoading && <LoaderCircleIcon className="animate-spin h-4 w-4 ml-2" />}
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                                            {/* <DropdownMenuItem className="py-3">Preview article</DropdownMenuItem> */}
                                            <DropdownMenuItem className="py-3"
                                                onClick={() => {
                                                    form.setValue("status", "draft");
                                                    form.handleSubmit(onSubmit)();
                                                }}>
                                                Save article as draft
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="font-semibold py-3"
                                                onClick={() => {
                                                    form.setValue("status", "published");
                                                    form.handleSubmit(onSubmit)();
                                                }}>
                                                Publish article
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardContent>
                            </Card>
                            {/* Featured Photo */}
                            <Card className="p-2 !gap-0">
                                <CardHeader className="py-2 px-1 font-semibold">
                                    Featured Photo
                                    {form.formState.errors.featuredImage && <p className="text-xs text-red-600 mt-1">{form.formState.errors.featuredImage.message as string}</p>}
                                </CardHeader>
                                <CardContent className="p-0 flex flex-col gap-2">
                                    <FormField
                                        control={form.control}
                                        name="featuredImage"
                                        render={({ field }) => (
                                            <div>
                                                {previewImage && <>
                                                    <div className="relative w-full aspect-3/2 rounded-sm overflow-hidden">
                                                        <Image
                                                            src={previewImage}
                                                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                                            width={600}
                                                            height={300}
                                                            className="absolute"
                                                            quality={80}
                                                            alt="preview"
                                                            priority
                                                        />
                                                        <Button className="absolute top-2 right-2 w-5 h-5 cursor-pointer rounded-sm shadow-sm"
                                                            type="button"
                                                            onClick={() => {
                                                                setPreviewImage("");
                                                                field.onChange(undefined);
                                                                form.setValue("featuredImageCaption", "");
                                                            }}
                                                            size="icon">
                                                            <XIcon></XIcon>
                                                        </Button>
                                                    </div>
                                                </>}
                                                {!previewImage && <>
                                                    <div className="aspect-3/2 bg-accent rounded-sm flex justify-center items-center">
                                                        <label className="bg-black text-white shadow-xs border rounded-md p-2.5 text-xs font-semibold text-center cursor-pointer">
                                                            <Input id="picture" type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    if (e.target?.files && e.target.files[0]) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setPreviewImage(reader.result as string);
                                                                            field.onChange(e.target.files![0]);
                                                                        };
                                                                        reader.readAsDataURL(e.target.files[0]);
                                                                    }
                                                                }} hidden />
                                                            <span className="flex gap-2 pr-1">
                                                                <ImageIcon className="size-4" />
                                                                Choose Featured Photo</span>
                                                        </label>
                                                    </div>
                                                </>
                                                }
                                            </div>
                                        )}
                                    />
                                    {previewImage && <>
                                        <FormField
                                            control={form.control}
                                            name="featuredImageCaption"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel className="text-xs ml-1 font-semibold">Photo Caption</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter photo caption here..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs ml-1" />
                                                </FormItem>
                                            )} />

                                    </>}
                                </CardContent>
                            </Card>
                            <CategorySelector form={form} />
                            <TagSelector form={form} />
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
}

export default EditorComponent;