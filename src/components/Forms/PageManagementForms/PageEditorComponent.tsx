//TODOS: Handle images for SEO Images
"use client";
import { Button } from "@/components/ui/button";

import { Card, CardHeader } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";

import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { modules } from "@/lib/tinymce";

import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { getCookie } from "typescript-cookie";
import { LoaderCircleIcon } from "lucide-react";

// import FeaturedVideoManagement from "./FeaturedVideoManagement";
import { toast } from "sonner";
import Script from "next/script";

//react-hook-form and zod imports
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { setOption } from "@/actions/option";

const PageEditorComponent = ({ slug }: { slug: string }) => {
    const token = getCookie("token");
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [editorLoaded, setEditorLoaded] = useState<boolean>(false);

    //react-hook-form and zod schema for form validation
    const formSchema = z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            key: slug,
            value: "",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitLoading(true);
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        setOption({ data: formData, token }).then((res) => {
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
            mutate();
        }).catch((error) => {
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
        }).finally(() => {
            setSubmitLoading(false);
        });

    }

    //fetch post data if postId is present in the URL
    const { data, mutate, isLoading: pageLoading } = useSWR(slug ? {
        url: `v1/options/${slug}`,
        token
    } : null, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        onErrorRetry: (error) => {
            // Don't retry on 404 errors
            if (error.status === 404) {
                return;
            }
        }
    });

    const pageData = data?.data || null;

    useEffect(() => {
        if (pageData) {
            form.reset({
                key: slug,
                value: pageData.value || "",
            });
        }
    }, [form, slug, pageData]);

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

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

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

    const handlePreview = async () => {
        const values = form.getValues();
        const slugVal = values.key || 'preview';
        // Generate short-lived nonce for binding the handshake
        const nonce = (() => {
            try {
                const arr = new Uint8Array(16);
                window.crypto?.getRandomValues(arr);
                return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch {
                return Math.random().toString(36).slice(2) + Date.now().toString(36);
            }
        })();
        const previewWindow = window.open(`${process.env.NEXT_PUBLIC_WEB_DOMAIN}/page/${slugVal}?preview=1&nonce=${nonce}`, '_blank');
        if (!previewWindow) {
            toast.error('Popup blocked');
            return;
        }

        // Build lightweight payload once (async-safe)
        const payload: Record<string, unknown> = { ...values };

        let sent = false;
        let attempts = 0;
        let readyReceived = false;
        let interval: number | undefined;
        const maxAttempts = 15;

        const startSending = () => {
            if (sent) return;
            sent = true;
            interval = window.setInterval(() => {
                attempts++;
                try { previewWindow.postMessage({ type: 'RN_PREVIEW_PAGE', nonce, payload }, '*'); } catch { }
                if (attempts >= maxAttempts) {
                    if (interval) clearInterval(interval);
                    window.removeEventListener('message', acknowledgeHandler);
                    window.removeEventListener('message', readyHandler);
                }
            }, 500);
        };

        const acknowledgeHandler = (e: MessageEvent) => {
            if (!e.data || e.data.nonce !== nonce) return;
            if (e.data && e.data.type === 'RN_PREVIEW_RECEIVED') {
                if (interval) clearInterval(interval);
                window.removeEventListener('message', acknowledgeHandler);
                window.removeEventListener('message', readyHandler);
            }
        };

        const readyHandler = (e: MessageEvent) => {
            if (!e.data || e.data.nonce !== nonce) return;
            if (e.data && e.data.type === 'RN_PREVIEW_READY') {
                readyReceived = true;
                startSending();
            }
            if (e.data && e.data.type === 'RN_PREVIEW_REQUEST') {
                // Preview window explicitly requests data; start sending if not already
                readyReceived = true;
                startSending();
            }
        };

        window.addEventListener('message', acknowledgeHandler);
        window.addEventListener('message', readyHandler);

        // Fallback: start sending after 3s even if READY not captured
        window.setTimeout(() => {
            if (!readyReceived) startSending();
        }, 3000);
    }

    return (
        <>
            <Script src="https://www.tiktok.com/embed.js" async />
            <Script src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2" async />
            <Script src="https://www.instagram.com/embed.js" async />
            <Script src="https://platform.twitter.com/widgets.js" async />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1">
                        <div className="flex flex-col">
                            <Card className="p-2 !gap-0">
                                <CardHeader className="p-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="flex gap-2 items-center text-lg font-bold ml-2 uppercase">{slug.split("-").join(" ").split("_").join(" ")} page {pageLoading && <LoaderCircleIcon className="animate-spin h-5 w-5 text-neutral-500" />}</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handlePreview}
                                                disabled={pageLoading || submitLoading}
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={pageLoading || submitLoading}
                                            >
                                                <LoaderCircleIcon className={`h-5 w-5 ${submitLoading ? "animate-spin" : "hidden"}`} />
                                                {submitLoading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        {!editorLoaded && <div className="p-10 flex flex-col items-center justify-center bg-accent">
                                            <span className="mb-2 text-sm">Loading editor...</span>
                                            <LoaderCircleIcon className="animate-spin h-6 w-6 text-neutral-500" />
                                        </div>}
                                        <FormField
                                            control={form.control}
                                            name="value"
                                            render={({ field }) => (
                                                <FormItem className="gap-1">
                                                    <FormMessage className="text-xs ml-1" />
                                                    <FormControl>
                                                        <Editor
                                                            tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                                                            licenseKey="gpl"
                                                            init={modules}
                                                            initialValue={pageData?.value || ""}
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
                        </div>
                    </div>
                </form>
            </Form >
        </>
    );
}

export default PageEditorComponent;