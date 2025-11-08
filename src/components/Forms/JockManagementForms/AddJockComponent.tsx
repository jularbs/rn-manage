import { useEffect, useState } from "react";
import { getCookie } from "typescript-cookie"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, PlusIcon, XIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/actions/swr";
import { cn, removeDuplicatesByField } from "@/lib/utils";
import { MultiSelect } from "@/components/multiselect"
import { createJock } from "@/actions/jock";
import { toast } from "sonner";

const AddJockComponent = ({ open, onOpenChange, defaultStation }:
    { open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>>, defaultStation?: string }) => {

    const token = getCookie("token");
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

    const { data: stationList, isLoading: isStationListLoading } = useSWR(
        open ? { url: "v1/stations", token } : null, fetcher
    );

    const formSchema = z.object({
        name: z.string().min(1, { message: "Jock name required" }),
        bio: z.string().optional(),
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
        programs: z.array(z.string()),
        station: z.string().min(1, { message: "Station is required" }),
        image:
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
            bio: "",
            facebook: "",
            twitter: "",
            instagram: "",
            tiktok: "",
            youtube: "",
            station: "",
            programs: [],
            image: undefined,
        },
    });

    const stationId = form.watch("station");

    const { data: programList, isLoading: isLoadingPrograms } = useSWR(
        stationId ? { url: "v1/programs/schedule/station/" + stationId, token } : null,
        fetcher
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        formData.append(key, item);
                    }
                } else {
                    formData.append(key, value);
                }
            }
        });

        createJock({ token, data: formData }).then((res) => {
            setLoading(false);
            onOpenChange(false);
            form.reset({
                name: "",
                bio: "",
                facebook: "",
                twitter: "",
                instagram: "",
                tiktok: "",
                station: "",
                programs: [],
                image: undefined,
            });
            setPreviewImage("")
            mutate({
                url: "v1/jocks",
                params: {
                    station: stationId
                },
                token
            })
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
        }).catch((error) => {
            setLoading(false);
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

    useEffect(() => {
        if (open && defaultStation && stationList)
            form.setValue("station", defaultStation)
    }, [open, defaultStation, stationList, form])

    return <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto top-10 translate-y-0 md:min-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Add new jock</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-3">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="image">
                                            <span className="text-primary">Jock Image</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="aspect-4/5 w-[200px] mx-auto bg-accent rounded-sm flex justify-center items-center">
                                                {previewImage ?
                                                    <div className="relative w-full aspect-4/5 rounded-sm overflow-hidden">
                                                        <Image
                                                            src={previewImage}
                                                            width={200}
                                                            height={250}
                                                            className="absolute w-full h-full object-cover object-center"
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
                                                    <label className=" text-neutral-300 shadow-xs border-3 border-dashed rounded-md p-2.5 text-xs font-semibold text-center cursor-pointer">
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
                                                        <span className="flex">
                                                            <PlusIcon className="size-12" />
                                                        </span>
                                                    </label>
                                                }

                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">
                                            <span className="text-primary">Jock Name</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                type="text"
                                                {...field}
                                                placeholder="e.g. DJ Juan dela Cruz"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="station"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="station">
                                            <span className="text-primary">Radio Station</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={cn("w-full",
                                                    form.formState.errors.station && "border-destructive"
                                                )}>
                                                    <SelectValue placeholder="Select Station" />
                                                    <LoaderCircle className={cn("animate-spin w-4 absolute right-8",
                                                        isStationListLoading ? "block" : "hidden"
                                                    )} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stationList?.data?.map((station: { _id: string; name: string }) => (
                                                        <SelectItem key={station._id} value={station._id}>{station.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="programs"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="programs">
                                            <span className="text-primary">Select Programs</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative flex items-center">
                                                <MultiSelect
                                                    // Remove duplicate programs with same name
                                                    options={
                                                        programList && programList.data.length > 0 ?
                                                            (removeDuplicatesByField(programList.data, "name") as { _id: string; name: string }[])
                                                                .map((program: { _id: string; name: string }) => ({
                                                                    label: program.name,
                                                                    value: program._id
                                                                }))
                                                            : []
                                                    }
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    hideSelectAll={true}
                                                    emptyIndicator={<p>No programs available</p>}
                                                    placeholder={!stationId ? "Pick station first" : "Choose programs"}
                                                    searchPlaceholder="Search Programs"
                                                    maxCount={2}
                                                    disabled={!stationId || isLoadingPrograms}

                                                />
                                                <LoaderCircle className={cn("animate-spin w-4 absolute right-8",
                                                    isLoadingPrograms ? "block" : "hidden"
                                                )} />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="bio">
                                            <span className="text-primary">Bio</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                id="bio"
                                                {...field}
                                                placeholder="Type bio here..."
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                        <FormItem className="md:col-span-2">
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
                            </div>
                            <div className="grid gap-2 mt-2">
                                <Button variant={"outline"}
                                    type="button"
                                    onClick={() => {
                                        form.reset({
                                            name: "",
                                            bio: "",
                                            facebook: "",
                                            twitter: "",
                                            instagram: "",
                                            tiktok: "",
                                            youtube: "",
                                            station: "",
                                            programs: [],
                                            image: undefined,
                                        });
                                        setPreviewImage("")
                                        onOpenChange(false);
                                    }}>Cancel</Button>
                                <Button type="submit">Add Jock
                                    {loading && <LoaderCircle className="animate-spin" />}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
};

export default AddJockComponent;