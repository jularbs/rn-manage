//TODOS: Create skeleton loader for jock details
import { fetcher } from "@/actions/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getImageSource } from "@/lib/utils";
import { EditIcon, EllipsisVerticalIcon, EyeIcon, FileUser, ListIcon, LoaderCircle, TrashIcon } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import RemoveJockComponent from "./RemoveJockComponent";
import UpdateJockComponent from "./UpdateJockComponent";

export default function ViewJockComponent({ selected, setSelected, className }: { selected: string, setSelected: React.Dispatch<React.SetStateAction<string | null>>, className?: string }) {

    const { data, isLoading, error } = useSWR(selected ? { url: "v1/jocks/id/" + selected, token: getCookie("token") } : null, fetcher); // Placeholder for SWR or data fetching logic
    const [removeOpen, setRemoveOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);

    const showPrograms = () => {
        return data.data.programs.map((item: { name: string }) => {
            return item.name;
        }).join(", ")
    }

    if (!selected) {
        return (
            <>
                <div className={className}>
                    <div className="aspect-video border-1 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center bg-accent">
                        <FileUser className="w-10 h-10 mb-2" />
                        <span className="text-sm font-light">Select jock to manage</span>
                    </div>
                </div>

            </>
        );
    }

    if (selected) {
        return (
            <>
                <UpdateJockComponent open={updateOpen} onOpenChange={setUpdateOpen} selected={selected} />
                <RemoveJockComponent open={removeOpen} onOpenChange={setRemoveOpen} selected={selected} setSelected={setSelected} />
                <div className={className}>
                    <Card className="p-3 gap-2">
                        <CardHeader className="flex justify-between items-center p-0">
                            <h2 className="font-bold text-xl flex items-center gap-2">Jock Profile {isLoading && <LoaderCircle className="animate-spin w-4" />}</h2>
                            <div className="flex gap-2">
                                <div>
                                    <Button
                                        size="sm"
                                        className="rounded-r-none pointer-cursor"
                                        variant={!previewMode ? "default" : "outline"}
                                        onClick={() => setPreviewMode(false)}

                                    >
                                        <ListIcon />
                                        <span className="hidden sm:flex">View Data</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-l-none pointer-cursor"
                                        variant={previewMode ? "default" : "outline"}
                                        onClick={() => setPreviewMode(true)}
                                    >
                                        <EyeIcon />
                                        <span className="hidden sm:flex">Preview</span>
                                    </Button>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm"><EllipsisVerticalIcon /> Actions</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-2 -translate-x-10">
                                        <div className="grid gap-2">
                                            <Button variant="ghost" size="sm" className="justify-start"
                                                onClick={() => {
                                                    setUpdateOpen(true)
                                                }}
                                            ><EditIcon /> Edit Jock</Button>
                                            <Button variant="ghost" size="sm" className="justify-start text-destructive"
                                                onClick={() => {
                                                    setRemoveOpen(true);
                                                }}
                                            ><TrashIcon /> Remove Jock</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && <p>Loading jock details...</p>}
                            {error && <p>Error loading jock details.</p>}
                            {data && (
                                previewMode ? (
                                    <Card className="p-0 border-0 shadow-none">
                                        <CardContent className="p-0">
                                            <div className="grid grid-cols-3 gap-5">
                                                <div className="relative aspect-4/5 w-full bg-gray-200 rounded-xl overflow-hidden">
                                                    {data.data.image && <Image src={getImageSource(data.data.image)} alt="Sample" fill
                                                        className="absolute inset-0 object-cover object-top" />}
                                                </div>
                                                <div className="col-span-2 text-radyonatin-blue flex flex-col justify-center gap-1">
                                                    <div>
                                                        <h3 className="font-extrabold text-2xl">{data.data.name}</h3>
                                                        <p className="mb-2 text-sm">{data.data.bio}</p>
                                                    </div>
                                                    <p className="font-light">Show/s: {showPrograms()}</p>
                                                    <small className="text-xs font-semibold mb-2">Follow and Subscribe</small>
                                                    <div className="flex gap-3">
                                                        {data.data.socialLinks.facebook &&
                                                            <a href={data.data.socialLinks.facebook} target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-radyonatin-blue text-white hover:bg-opacity-80 transition-colors">
                                                                <FaFacebookF className="w-4 h-4" />
                                                            </a>
                                                        }
                                                        {data.data.socialLinks.twitter &&
                                                            <a href={data.data.socialLinks.twitter} target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-radyonatin-blue text-white hover:bg-opacity-80 transition-colors">
                                                                <FaXTwitter className="w-4 h-4" />
                                                            </a>
                                                        }
                                                        {data.data.socialLinks.instagram &&
                                                            <a href={data.data.socialLinks.instagram} target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-radyonatin-blue text-white hover:opacity-80 transition-opacity">
                                                                <FaInstagram className="w-4 h-4" />
                                                            </a>
                                                        }
                                                        {data.data.socialLinks.tiktok &&
                                                            <a href={data.data.socialLinks.tiktok} target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-radyonatin-blue text-white hover:bg-opacity-80 transition-colors">
                                                                <FaTiktok className="w-4 h-4" />
                                                            </a>
                                                        }
                                                        {data.data.socialLinks.youtube &&
                                                            <a href={data.data.socialLinks.youtube} target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-radyonatin-blue text-white hover:bg-opacity-80 transition-colors">
                                                                <FaYoutube className="w-4 h-4" />
                                                            </a>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="p-0 border-0 shadow-none">
                                        <CardContent className="p-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="relative aspect-4/5 max-w-[400px] mx-auto w-full bg-gray-200 rounded-xl overflow-hidden">
                                                    {data.data.image && <Image src={getImageSource(data.data.image)} alt="Sample" fill
                                                        className="absolute inset-0 object-cover object-top" />}
                                                </div>
                                                <div className="md:col-span-2 flex flex-col gap-1">
                                                    <div>
                                                        <label htmlFor="name" className="text-sm font-bold mb-0">Name</label>
                                                        <p>{data.data.name}</p>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="slug" className="text-sm font-bold mb-0">Slug / Permalink</label>
                                                        <p>{data.data.slug}</p>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="bio" className="text-sm font-bold mb-0">Bio</label>
                                                        <p>{data.data.bio}</p>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="programs" className="text-sm font-bold mb-0">Programs</label>
                                                        <p>{showPrograms()}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <div>
                                                            <label htmlFor="facebook" className="text-sm font-bold mb-0">Facebook URL</label>
                                                            <p>{data.data.socialLinks.facebook ? data.data.socialLinks.facebook : "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="twitter" className="text-sm font-bold mb-0">Twitter X URL</label>
                                                            <p>{data.data.socialLinks.twitter ? data.data.socialLinks.twitter : "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="instagram" className="text-sm font-bold mb-0">Instagram URL</label>
                                                            <p>{data.data.socialLinks.instagram ? data.data.socialLinks.instagram : "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="tiktok" className="text-sm font-bold mb-0">TikTok URL</label>
                                                            <p>{data.data.socialLinks.tiktok ? data.data.socialLinks.tiktok : "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="youtube" className="text-sm font-bold mb-0">YouTube URL</label>
                                                            <p>{data.data.socialLinks.youtube ? data.data.socialLinks.youtube : "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )
                            }
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
}