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
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "usehooks-ts";
import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { getCookie } from "typescript-cookie";
import { ARTICLE_TYPE_BASIC, ARTICLE_TYPE_VIDEO } from "@/lib/constants";
import { Badge } from "@/components/ui/badge"
import { cn, getImageSource } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ImageIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import moment from "moment";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";

// import FeaturedVideoManagement from "./FeaturedVideoManagement";
import { toast } from "sonner";
import { createPost, updatePost } from "@/actions/post";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";
import FeaturedVideoManagement from "./FeaturedVideoManagement";
import SEOForm from "./SEOForm";
import Script from "next/script";
import { forEach } from "lodash";

const EditorComponent = () => {
    const searchParams = useSearchParams();

    const token = getCookie("token");
    const [user,] = useLocalStorage("user", { _id: "", name: "", email: "", role: "", designation: "" })
    const [slug, setSlug] = useState<string>("");
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [editorLoaded, setEditorLoaded] = useState<boolean>(false);

    const generateSlug = () => {
        if (title) {
            const slug = slugify(title, { lower: true, strict: true });
            setPermalink(slug);
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
        onSuccess: (data) => {
            //update local states
            setTitle(data.title);
            setPermalink(data.slug);
            setContent(data.content);
            setAuthor(data.author?._id);
            setType(data.type);
            setPublishedAt(moment(data.publishedAt).format("YYYY-MM-DDTHH:mm"));
            setStatus(data.status);
            setFeaturedImageCaption(data.featuredImageCaption || "");
            setPreviewImage(getImageSource(data.thumbnailImage));
            setSelectedCategories(data.categories?.map((c: Record<string, string>) => c._id));
            setSelectedTags(data.tags?.map((t: Record<string, string>) => t._id));
            setVideoSourceUrl(data.videoSourceUrl);

            // Update SEO data
            setSeoData({
                metaTitle: data.metaTitle || "",
                metaDescription: data.metaDescription || "",
                keywords: data.keywords || "",
                canonicalUrl: data.canonicalUrl || "",
                robotsIndex: data.robotsIndex !== undefined ? data.robotsIndex : true,
                robotsFollow: data.robotsFollow !== undefined ? data.robotsFollow : true,
                robotsArchive: data.robotsArchive !== undefined ? data.robotsArchive : true,
                robotsSnippet: data.robotsSnippet !== undefined ? data.robotsSnippet : true,
                robotsImageIndex: data.robotsImageIndex !== undefined ? data.robotsImageIndex : true,
                ogTitle: data.ogTitle || "",
                ogDescription: data.ogDescription || "",
                ogType: data.ogType || "article",
                ogUrl: data.ogUrl || "",
                ogSiteName: data.ogSiteName || "",
                ogLocale: data.ogLocale || "en_US",
                twitterCard: data.twitterCard || "summary_large_image",
                twitterTitle: data.twitterTitle || "",
                twitterDescription: data.twitterDescription || "",
                twitterSite: data.twitterSite || "",
                twitterCreator: data.twitterCreator || "",
                author: data.seoAuthor || "",
                publisher: data.publisher || "",
                focusKeyword: data.focusKeyword || "",
                readingTime: data.readingTime || "",
                metaImage: null,
                metaImageAlt: data.metaImageAlt || "",
                ogImage: null,
                ogImageAlt: data.ogImageAlt || "",
                twitterImage: null,
                twitterImageAlt: data.twitterImageAlt || "",
            });
        }
    });

    const { data: users } = useSWR({
        url: "v1/users",
        token
    }, fetcher);

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
            setTitle(searchParams.get("title") || "");
        }

        if (searchParams.get("slug")) {
            setSlug(searchParams.get("slug") || "");
        }
    }, [searchParams]);

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    //FormValues
    const [title, setTitle] = useState<string>("");
    const [permalink, setPermalink] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [author, setAuthor] = useState(user._id || "");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [type, setType] = useState<string>(ARTICLE_TYPE_BASIC);
    const [featuredImage, setFeaturedImage] = useState<File | null>(null); // For Featured Photo Management
    const [featuredImageCaption, setFeaturedImageCaption] = useState<string>(""); // For Featured Photo Management
    const [status, setStatus] = useState<string>("");
    const [publishedAt, setPublishedAt] = useState<string>(moment().format("YYYY-MM-DDTHH:mm")); // Default to current date and time

    const [previewImage, setPreviewImage] = useState<string>("");
    const [videoSourceUrl, setVideoSourceUrl] = useState<string>("");

    // SEO Data State
    const [seoData, setSeoData] = useState({
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
        author: "",
        publisher: "",
        focusKeyword: "",
        readingTime: "",
        metaImage: null as File | null,
        metaImageAlt: "",
        ogImage: null as File | null,
        ogImageAlt: "",
        twitterImage: null as File | null,
        twitterImageAlt: "",
    });

    //Handle Dialogs
    const [isFeaturedVideoManagementOpen, setIsFeaturedVideoManagementOpen] = useState<boolean>(false);

    const handleSubmit = (status: string) => () => {
        // e.preventDefault();
        setSubmitLoading(true);

        //validate required fields
        if (!title || !permalink || !author || !type || !publishedAt) {
            setSubmitLoading(false);
            toast.error("Failed to save changes", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none",
                },
                position: "top-center",
                description: "Please fill in all required fields. (title, permalink, author, type, publish date)",
                duration: 5000
            });

            return;
        }

        if (selectedCategories.length === 0) {
            setSubmitLoading(false);
            toast.error("Failed to save changes", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: "Please select at least one category.",
                duration: 5000
            });
            return;
        }

        if (selectedTags.length === 0) {
            setSubmitLoading(false);
            toast.error("Failed to save changes", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: "Please select at least one tag.",
                duration: 5000
            });
            return;
        }

        //Prepare data to be sent
        const formData = new FormData();

        formData.append("title", title);
        formData.append("slug", permalink);
        formData.append("content", content);
        formData.append("author", author);
        formData.append("type", type);
        formData.append("publishedAt", publishedAt);
        formData.append("status", status);

        forEach(selectedCategories, (category) => {
            formData.append("categories", category);
        });
        forEach(selectedTags, (tag) => {
            formData.append("tags", tag);
        });

        formData.append("videoSourceUrl", videoSourceUrl);

        // SEO Fields
        if (seoData.metaTitle) formData.append("metaTitle", seoData.metaTitle);
        if (seoData.metaDescription) formData.append("metaDescription", seoData.metaDescription);
        if (seoData.keywords) formData.append("keywords", seoData.keywords);
        if (seoData.canonicalUrl) formData.append("canonicalUrl", seoData.canonicalUrl);

        formData.append("robotsIndex", seoData.robotsIndex.toString());
        formData.append("robotsFollow", seoData.robotsFollow.toString());
        formData.append("robotsArchive", seoData.robotsArchive.toString());
        formData.append("robotsSnippet", seoData.robotsSnippet.toString());
        formData.append("robotsImageIndex", seoData.robotsImageIndex.toString());

        if (seoData.ogTitle) formData.append("ogTitle", seoData.ogTitle);
        if (seoData.ogDescription) formData.append("ogDescription", seoData.ogDescription);
        if (seoData.ogType) formData.append("ogType", seoData.ogType);
        if (seoData.ogUrl) formData.append("ogUrl", seoData.ogUrl);
        if (seoData.ogSiteName) formData.append("ogSiteName", seoData.ogSiteName);
        if (seoData.ogLocale) formData.append("ogLocale", seoData.ogLocale);
        if (seoData.ogImageAlt) formData.append("ogImageAlt", seoData.ogImageAlt);

        if (seoData.twitterCard) formData.append("twitterCard", seoData.twitterCard);
        if (seoData.twitterTitle) formData.append("twitterTitle", seoData.twitterTitle);
        if (seoData.twitterDescription) formData.append("twitterDescription", seoData.twitterDescription);
        if (seoData.twitterSite) formData.append("twitterSite", seoData.twitterSite);
        if (seoData.twitterCreator) formData.append("twitterCreator", seoData.twitterCreator);
        if (seoData.twitterImageAlt) formData.append("twitterImageAlt", seoData.twitterImageAlt);

        if (seoData.author) formData.append("seoAuthor", seoData.author);
        if (seoData.publisher) formData.append("publisher", seoData.publisher);
        if (seoData.focusKeyword) formData.append("focusKeyword", seoData.focusKeyword);
        if (seoData.readingTime) formData.append("readingTime", seoData.readingTime);
        if (seoData.metaImageAlt) formData.append("metaImageAlt", seoData.metaImageAlt);

        // SEO Images
        if (seoData.metaImage instanceof File) formData.append("metaImage", seoData.metaImage);
        if (seoData.ogImage instanceof File) formData.append("ogImage", seoData.ogImage);
        if (seoData.twitterImage instanceof File) formData.append("twitterImage", seoData.twitterImage);

        if (featuredImage instanceof File) {
            formData.append("featuredImage", featuredImage);
        }
        if (featuredImageCaption) {
            formData.append("featuredImageCaption", featuredImageCaption);
        }

        if (type === ARTICLE_TYPE_VIDEO) {
            if (videoSourceUrl) {
                formData.append("videoSourceUrl", videoSourceUrl);
            }
        }

        if (postData) {
            //if postData exists, append it to the formData
            formData.append("_id", postData._id);
            updatePost({ data: formData, token }).then(res => {
                setSubmitLoading(false);
                toast.success("Success!", {
                    style: {
                        background: "rgb(56, 142, 60)",
                        color: "white",
                        border: "none",
                    },
                    description: res.message,
                    duration: 5000,
                    position: "top-center"
                });

                //reload data and update url with permalink if it has changed
                if (searchParams.get("slug") == permalink) {
                    mutate();
                } else {
                    setSlug(permalink);
                    const urlSearchParams = new URLSearchParams(searchParams.toString())
                    urlSearchParams.set('slug', permalink)
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
                    description: res.message,
                    duration: 5000,
                    position: "top-center"
                });

                // redirect to update post
                setSlug(permalink);
                const urlSearchParams = new URLSearchParams(searchParams.toString())
                urlSearchParams.set('slug', permalink)
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

    return (
        <>
            <Script src="https://www.tiktok.com/embed.js" async />
            <Script src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2" async />
            <Script src="https://www.instagram.com/embed.js" async />
            <Script src="https://platform.twitter.com/widgets.js" async />
            <FeaturedVideoManagement
                open={isFeaturedVideoManagementOpen}
                onOpenChange={setIsFeaturedVideoManagementOpen}
                videoURL={videoSourceUrl}
                setVideoURL={setVideoSourceUrl}
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-4">
                <div className="flex flex-col gap-4">
                    <Card className="p-2">
                        <div className="flex flex-col gap-2">
                            <Input placeholder="Enter title here..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            ></Input>
                            <div className="flex">
                                <Button variant={"outline"}
                                    // disabled
                                    size={"sm"}
                                    className=" text-neutral-800 rounded-br-none rounded-tr-none text-[12px] pl-2 pr-0 border-r-0">{process.env.NEXT_PUBLIC_WEBSITE_URL}/post/</Button>
                                <Input className="rounded-none h-[32px] px-0 border-l-0 !text-[12px]"
                                    value={permalink}
                                    placeholder="enter-permalink-here"
                                    onChange={(e) => setPermalink(e.target.value)}
                                    onBlur={() => {
                                        setPermalink(slugify(permalink, { lower: true, strict: true }))
                                    }}
                                ></Input>
                                <Button
                                    size="sm"
                                    className="rounded-bl-none rounded-tl-none h-[32px] text-[12px] font-semibold cursor-pointer"
                                    onClick={generateSlug}
                                >Generate</Button>
                            </div>
                            <div>
                                {!editorLoaded && <div className="p-10 flex flex-col items-center justify-center bg-accent">
                                    <span className="mb-2 text-sm">Loading editor...</span>
                                    <LoaderCircleIcon className="animate-spin h-6 w-6 text-neutral-500" />
                                </div>}
                                <Editor
                                    tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                                    licenseKey="gpl"
                                    init={modules}
                                    initialValue={postData?.content || ""}
                                    onEditorChange={e => setContent(e)}
                                    onInit={(evt, editor) => {
                                        editorRef.current = editor;
                                        setEditorLoaded(true);
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                    {/* SEO Handler */}
                    <SEOForm
                        seoData={seoData}
                        setSeoData={setSeoData}
                        postTitle={title}
                        postContent={content}
                        postSlug={permalink}
                    />
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
                                        status === "published" ? "bg-green-100 text-green-800" :
                                            status === "draft" ? "bg-orange-300 text-orange-900" :
                                                ""
                                    )} variant="secondary">{status ? status : "New Post"}</Badge>}

                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col gap-2">
                            <div>
                                <Label className="text-xs font-semibold mb-1 px-1">Author</Label>
                                <Select value={author} onValueChange={(value) => {
                                    setAuthor(value);
                                }}>
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
                            </div>
                            <div>
                                <Label className="text-xs font-semibold mb-1 px-1">Type</Label>
                                <Select value={type} onValueChange={(value) => {
                                    setType(value);
                                }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ARTICLE_TYPE_BASIC}>Basic Article</SelectItem>
                                        <SelectItem value={ARTICLE_TYPE_VIDEO}>Video Article</SelectItem>
                                    </SelectContent>
                                </Select>
                                {type === ARTICLE_TYPE_VIDEO && <Button className="w-full mt-2 cursor-pointer"
                                    onClick={() => {
                                        setIsFeaturedVideoManagementOpen(true);
                                    }}>
                                    Manage Featured Video
                                </Button>}
                            </div>
                            <div>
                                <Label className="text-xs font-semibold mb-1 px-1">Publish Date</Label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border shadow-xs 
                                        border-input rounded-md outline-none text-sm"
                                    placeholder="Select Publish Date"
                                    value={publishedAt}
                                    onChange={(e) => {
                                        setPublishedAt(e.target.value);
                                        // Handle publish date change
                                    }}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className="flex items-center justify-center bg-black text-white rounded-md text-sm p-2 font-semibold cursor-pointer mt-2">
                                    Save Changes
                                    {submitLoading && <LoaderCircleIcon className="animate-spin h-4 w-4 ml-2" />}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                                    {/* <DropdownMenuItem className="py-3">Preview article</DropdownMenuItem> */}
                                    <DropdownMenuItem className="py-3"
                                        onClick={handleSubmit("draft")}>
                                        Save article as draft
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="font-semibold py-3"
                                        onClick={handleSubmit("published")}>
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
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col gap-2">
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
                                        onClick={() => {
                                            setPreviewImage("");
                                            setFeaturedImage(null);
                                            setFeaturedImageCaption("");
                                        }}
                                        size="icon">
                                        <XIcon></XIcon>
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder="Enter photo caption here..."
                                    value={featuredImageCaption}
                                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                                />
                            </>}

                            {!previewImage && <>
                                <div className="aspect-3/2 bg-accent rounded-sm flex justify-center items-center">
                                    <label className="bg-black text-white shadow-xs border rounded-md p-2.5 text-xs font-semibold text-center cursor-pointer">
                                        <Input id="picture" type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target?.files && e.target.files[0]) {
                                                    setFeaturedImage(e.target.files[0]);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPreviewImage(reader.result as string);
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

                        </CardContent>
                    </Card>

                    <CategorySelector selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
                    <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
                </div>
            </div>

        </>
    );
}

export default EditorComponent;