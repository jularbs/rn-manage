import { useState } from "react";
import { getCookie } from "typescript-cookie"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageIcon, LoaderCircle, XIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createStation } from "@/actions/station";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddStationComponent({ open, onOpenChange }:
    { open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>>, type?: string }) {

    const token = getCookie("token");

    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    const formSchema = z.object({
        name: z.string().min(1, { message: "Station name required" }),
        frequency: z.string().optional(),
        address: z.string().optional(),
        locationGroup: z.string().min(1, { message: "Location required" }),
        contactNumber: z.string().optional(),
        email: z.union([z.email({ message: "Invalid email address" }),
        z.string().length(0)]),
        facebook: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        twitter: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        instagram: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        tiktok: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        youtube: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        mapEmbedCode: z.string().optional(),
        audioStreamURL: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        videoStreamURL: z.union([z.url({ message: "Invalid URL" }),
        z.string().length(0)]),
        logoImage:
            z.instanceof(File, { message: "Image is required" })
                .optional()
                .refine(file => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type), {
                    message: '.jpg, .jpeg, .png and .webp files are accepted.',
                })
                .refine(file => !file || file.size !== 0 || file.size <= 10 * 1024 * 1024, { message: "Max image size exceeded (10MB)" })
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            frequency: "",
            address: "",
            locationGroup: "",
            contactNumber: "",
            email: "",
            facebook: "",
            twitter: "",
            instagram: "",
            tiktok: "",
            youtube: "",
            mapEmbedCode: "",
            audioStreamURL: "",
            videoStreamURL: "",
            logoImage: undefined,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        createStation({ token: token, data: formData }).then((res) => {
            //handle created data
            mutate({
                url: "v1/stations", token, params: {
                    limit: 0
                }
            });
            form.reset({});
            setPreviewImage("");
            toast.success("Success!", {
                style: {
                    background: "rgb(56, 142, 60)",
                    color: "white",
                    border: "none"
                },
                description: res.message,
                duration: 5000,
                position: "top-center"
            })
            onOpenChange(false);
        }).catch(e => {
            console.log("Error at createStation: ", e)
            toast.error("Invalid Request!", {
                style: {
                    background: "rgba(220, 46, 46, 1)",
                    color: "white",
                    border: "none"
                },
                description: e.message,
                duration: 5000,
                position: "top-center"
            })
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto top-10 translate-y-0">
                <DialogHeader>
                    <DialogTitle>Add new station</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-2">
                            <label htmlFor="basic information"
                                className="font-bold uppercase text-gray-700 text-lg my-1"
                            >Basic Information</label>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Display Name</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. Radyo Natin Metro Manila"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="frequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="frequency">
                                            <span className="text-primary">Frequency</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="frequency"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. 101.1 FM"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="address">
                                            <span className="text-primary">Address</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="locationGroup"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="locationGroup">
                                            <span className="text-primary">Location Group</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={cn("w-full",
                                                    form.formState.errors.locationGroup && "border-destructive"
                                                )}>
                                                    <SelectValue placeholder="Select Location Group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={"luzon"}>Luzon</SelectItem>
                                                    <SelectItem value={"visayas"}>Visayas</SelectItem>
                                                    <SelectItem value={"mindanao"}>Mindanao</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <label htmlFor="contact information"
                                className="font-bold uppercase text-gray-700 text-lg my-1"
                            >Social Media Links</label>
                            <FormField
                                control={form.control}
                                name="facebook"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Facebook URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="facebook"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="twitter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Twitter X URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="twitter"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instagram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Instagram URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="instagram"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tiktok"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="tiktok">
                                            <span className="text-primary">Tiktok URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="tiktok"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="youtube"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="tiktok">
                                            <span className="text-primary">Youtube URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="youtube"
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <label htmlFor="contact information"
                                className="font-bold uppercase text-gray-700 text-lg my-1"
                            >Contact Information</label>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">
                                            <span className="text-primary">Email Address</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. infometromanila@radyonatin.com.ph"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="contactNumber">
                                            <span className="text-primary">Contact Number</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="contactNumber"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. +632 8493 4345, +632 8451 4560"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mapEmbedCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="mapEmpedCode">
                                            <span className="text-primary">Google Maps Embed Code</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="mapEmbedCode"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <label htmlFor="streaming information"
                                className="font-bold uppercase text-gray-700 text-lg my-1"
                            >Streaming Information</label>
                            <FormField
                                control={form.control}
                                name="audioStreamURL"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="audioStreamURL">
                                            <span className="text-primary">Audio Stream URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="audioStreamURL"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. https://streaming.example.com/audio"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="videoStreamURL"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="videoStreamURL">
                                            <span className="text-primary">Video Stream URL</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="videoStreamURL"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. https://streaming.example.com/video"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <span className="font-bold uppercase text-gray-700 text-lg my-1">Station Logo</span>
                            <FormField
                                control={form.control}
                                name="logoImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="aspect-16/9 bg-accent rounded-sm flex justify-center items-center">
                                                {previewImage ?
                                                    <div className="relative w-full aspect-16/9 rounded-sm overflow-hidden">
                                                        <Image
                                                            src={previewImage}
                                                            width={600}
                                                            height={300}
                                                            className="absolute w-full h-full object-contain"
                                                            quality={80}
                                                            alt="preview"
                                                            priority
                                                        />
                                                        <Button className="absolute top-2 right-2 w-5 h-5 cursor-pointer rounded-sm shadow-sm"
                                                            onClick={() => {
                                                                setPreviewImage("");
                                                                //clear logoImage field in react form values
                                                            }}
                                                            size="icon">
                                                            <XIcon></XIcon>
                                                        </Button>
                                                    </div>
                                                    :
                                                    <label className="bg-black text-white shadow-xs border rounded-md p-2.5 text-xs font-semibold text-center cursor-pointer">
                                                        <Input id="picture" type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target?.files && e.target.files[0]) {
                                                                    // setFeaturedImage(e.target.files[0]);
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setPreviewImage(reader.result as string);
                                                                        field.onChange(e.target.files![0])
                                                                    };
                                                                    reader.readAsDataURL(e.target.files[0]);
                                                                }
                                                            }} hidden />
                                                        <span className="flex gap-2 pr-1">
                                                            <ImageIcon className="size-4" />
                                                            Choose station logo image</span>
                                                    </label>
                                                }

                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-2 mt-2">
                                <Button variant={"outline"} onClick={() => {
                                    form.reset({});
                                    onOpenChange(false);
                                }}>Cancel</Button>
                                <Button type="submit">Add Radio Station
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}