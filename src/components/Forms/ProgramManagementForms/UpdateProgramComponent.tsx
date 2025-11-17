import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getCookie } from "typescript-cookie";
import { useEffect, useState } from "react";
import { DAYS_DATA, TIMES_DATA } from "@/lib/constants";
import { updateProgram } from "@/actions/program";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoaderCircle, PlusIcon, XIcon } from "lucide-react";
import { cn, getImageSource } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/actions/swr";
import RemoveProgramComponent from "./RemoveProgramComponent";

const UpdateProgramComponent = ({ open, onOpenChange, selectedProgram }: { open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>>, selectedProgram: string }) => {
    const token = getCookie("token");

    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [cacheToken, setCacheToken] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [stationMutateId, setStationMutateId] = useState("");

    const { data: stationList } = useSWR(
        open ? { url: "v1/stations", token, params: { limit: 0 } } : null, fetcher
        // fetcher
    );

    const { data: programData } = useSWR(
        open && stationList && selectedProgram ? { url: "v1/programs/" + selectedProgram, token, cacheToken } : null, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onSuccess: (data) => {
            //Set preview image
            setIsDataLoading(false);
            if (data && data.data && data.data.image) {
                setPreviewImage(getImageSource(data.data.image));
            }

            //Set form values
            if (data && data.data) {
                form.reset({
                    name: data.data.name || "",
                    slug: data.data.slug || "",
                    description: data.data.description || "",
                    startTime: data.data.startTime || "",
                    endTime: data.data.endTime || "",
                    day: data.data.day?.map((d: number) => String(d)) || [],
                    station: data.data.station ? data.data.station._id : "",
                    image: undefined
                });
            }
        }
    }
    );

    const formSchema = z.object({
        name: z.string().min(2, "Program name must be at least 2 characters").max(100, "Program name cannot exceed 100 characters"),
        slug: z.string().min(1, "Slug is required").max(250, "Slug cannot exceed 250 characters"),
        description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        day: z.array(z.string()).min(1, "Select at least one day"),
        station: z.string(),
        image:
            z.instanceof(File, { message: "Image is required" })
                .optional()
                .refine(file => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type), {
                    message: '.jpg, .jpeg, .png and .webp files are accepted.',
                })
                .refine(file => !file || file.size !== 0 || file.size <= 10 * 1024 * 1024, { message: "Max image size exceeded (10MB)" })
    }).refine((data) => {
        const startIndex = TIMES_DATA.findIndex(time => time.value === data.startTime);
        const endIndex = TIMES_DATA.findIndex(time => time.value === data.endTime);
        return startIndex < endIndex;
    }, {
        message: "End time must be after start time",
        path: ["endTime"]
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            startTime: "",
            endTime: "",
            day: [],
            station: "",
            image: undefined
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);

        //Build form data from values
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

        updateProgram({ token, data: formData, id: selectedProgram }).then((res) => {
            setLoading(false);
            onOpenChange(false);
            form.reset({});
            setPreviewImage("");
            mutate({ url: "v1/programs/schedule/station/" + values.station, token: getCookie("token") })
            mutate({ url: "v1/programs/schedule/station/" + programData.data.station._id, token: getCookie("token") })
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
        if (!open) {
            form.reset({
                name: "",
                description: "",
                startTime: "",
                endTime: "",
                day: [],
                station: "",
                image: undefined
            });
            setPreviewImage("");
            setIsDataLoading(true);
        } else {
            setCacheToken(String(new Date().getTime()));
        }
    }, [open, form, setIsDataLoading]);

    return <>
        <RemoveProgramComponent id={selectedProgram}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onUpdateOpenChange={onOpenChange}
            stationMutateId={stationMutateId} />
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto top-10 translate-y-0 md:min-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <span>Update Program Details</span>
                        {isDataLoading && <LoaderCircle className="animate-spin ml-2 size-4" />}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="name">
                                        <span className="text-primary">Program Name</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="name"
                                            type="text"
                                            {...field}
                                            placeholder="e.g. Lunas, Sunday Buffet All The Way"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-light" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="slug">
                                        <span className="text-primary">Program Slug/Permalink</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="slug"
                                            type="text"
                                            {...field}
                                            placeholder="e.g. sunday-buffet-all-the-way"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-light" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="description">
                                        <span className="text-primary">Description</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            id="description"
                                            {...field}
                                            placeholder="e.g. Enter program description here"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs font-light" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="day">
                                        <span className="text-primary">Scheduled Days</span>
                                    </FormLabel>
                                    <div className="flex justify-center flex-wrap gap-2">
                                        {DAYS_DATA.map((day) => (
                                            <Label key={day.value} className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                                                <Checkbox
                                                    id={`day-${day.value}`}
                                                    className="hidden"
                                                    checked={field.value?.includes(String(day.value))}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, String(day.value)])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== String(day.value)
                                                                )
                                                            )
                                                    }}
                                                />
                                                <div className="grid gap-1.5 font-normal">
                                                    <p className="text-sm leading-none font-medium">
                                                        {day.display}
                                                    </p>
                                                </div>
                                            </Label>

                                        ))}
                                    </div>

                                    <FormMessage className="text-xs font-light" />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="startTime">
                                            <span className="text-primary">Start Time</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={cn("w-full",
                                                    form.formState.errors.startTime && "border-destructive"
                                                )}>
                                                    <SelectValue placeholder="Select Start Time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIMES_DATA.map((time) => (
                                                        <SelectItem key={time.value} value={time.value}>{time.display}</SelectItem>
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
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="endTime">
                                            <span className="text-primary">End Time</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={cn("w-full",
                                                    form.formState.errors.startTime && "border-destructive"
                                                )}>
                                                    <SelectValue placeholder="Select End Time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIMES_DATA.map((time) => (
                                                        <SelectItem key={time.value} value={time.value}>{time.display}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="image">
                                        <span className="text-primary">Program Image</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="aspect-1/1 w-[200px] bg-accent rounded-sm flex justify-center items-center mx-auto">
                                            {previewImage ?
                                                <div className="relative w-full aspect-1/1 rounded-sm overflow-hidden">
                                                    <Image
                                                        src={previewImage}
                                                        width={200}
                                                        height={200}
                                                        className="absolute w-full h-full object-cover object-center"
                                                        quality={80}
                                                        alt="preview"
                                                        priority
                                                    />
                                                    <Button className="absolute top-2 right-2 w-5 h-5 cursor-pointer rounded-sm shadow-sm"
                                                        onClick={() => {
                                                            setPreviewImage("");
                                                            field.onChange(undefined);
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
                        <div className="grid gap-2 mt-2">
                            <Button variant="outline"
                                type="button"
                                onClick={() => {
                                    onOpenChange(false);
                                }}>
                                Cancel
                            </Button>
                            <Button variant="destructive"
                                type="button"
                                onClick={() => {
                                    setIsDeleteOpen(true);
                                    setStationMutateId(programData.data.station._id);
                                }}>
                                Delete Program
                            </Button>
                            <Button type="submit" >
                                Update Program
                                {loading && <LoaderCircle className="animate-spin" />}
                            </Button>
                        </div>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
}

export default UpdateProgramComponent;