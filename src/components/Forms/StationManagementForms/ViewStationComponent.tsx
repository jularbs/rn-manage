//TODOS: Create skeleton loader for station details
import { fetcher } from "@/actions/swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getImageSource } from "@/lib/utils";
import { AtSignIcon, EditIcon, EllipsisVerticalIcon, LoaderCircle, MapIcon, PhoneIcon, PodcastIcon, TrashIcon, VideoIcon } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import RemoveStationForm from "./RemoveStationForm";
import { useState } from "react";
import UpdateStationForm from "./UpdateStationForm";
import { update } from "lodash";

export default function ViewStationComponent({ selectedStationId, className }: { selectedStationId: string, className?: string }) {

    const { data, isLoading, error } = useSWR(selectedStationId ? { url: "v1/stations/id/" + selectedStationId, token: getCookie("token") } : null, fetcher); // Placeholder for SWR or data fetching logic
    const [removeOpen, setRemoveOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    if (selectedStationId === null) {
        return (
            <>
                <div className={className}>
                    <div className="aspect-video border-1 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center bg-accent">
                        <PodcastIcon className="w-10 h-10 mb-2" />
                        <span className="text-sm font-light">Select a station to manage</span>
                    </div>
                </div>

            </>
        );
    }

    if (selectedStationId) {
        return (
            <>
                <RemoveStationForm open={removeOpen} onOpenChange={setRemoveOpen} id={selectedStationId} />
                <UpdateStationForm open={updateOpen} onOpenChange={setUpdateOpen} id={selectedStationId} />
                <div className={className}>
                    <Card>
                        <CardHeader className="flex justify-between">
                            <h2 className="font-bold uppercase text-xl flex items-center gap-2">Station Profile {isLoading && <LoaderCircle className="animate-spin w-4" />}</h2>
                            <div>
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
                                            ><EditIcon /> Edit Station</Button>
                                            <Button variant="ghost" size="sm" className="justify-start text-destructive"
                                                onClick={() => {
                                                    setRemoveOpen(true);
                                                }}
                                            ><TrashIcon /> Delete Station</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <p>Loading station details...</p>}
                            {error && <p>Error loading station details.</p>}
                            {data && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    <div>
                                        <div className="bg-accent w-[100px] h-[100px] mb-4">
                                            {data.data.logoImage ? (
                                                <Image
                                                    src={getImageSource(data.data.logoImage)}
                                                    width={100}
                                                    height={100}
                                                    alt="Station Logo"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                                                    No Logo
                                                </div>
                                            )}
                                        </div>
                                        <p className="uppercase text-sm leading-3 font-extrabold text-neutral-400">{data.data.locationGroup} station</p>
                                        <h2 className="text-xl font-bold mb-2">{data.data.frequency} {data.data.name}</h2>
                                        <p className="text-sm">{data.data.address}</p>
                                        <div className="mt-4">
                                            <label htmlFor="contactNumber" className="flex gap-2 items-center">
                                                <PhoneIcon className="w-4" />
                                                <span className="text-sm font-bold">Contact Number/s</span>
                                            </label>
                                            <p id="contactNumber" className="text-sm">{data.data.contactNumber ? data.data.contactNumber : "N/A"}</p>
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="emailAddress" className="flex gap-2 items-center">
                                                <AtSignIcon className="w-4" />
                                                <span className="text-sm font-bold">Email Address</span>
                                            </label>
                                            <p id="emailAddress" className="text-sm">{data.data.email ? data.data.email : "N/A"}</p>
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="audioStreamURL" className="flex gap-2 items-center">
                                                <PodcastIcon className="w-4" />
                                                <span className="text-sm font-bold">Audio Stream URL</span>
                                            </label>
                                            <p id="audioStreamURL" className="text-sm">{data.data.audioStreamURL ? data.data.audioStreamURL : "N/A"}</p>
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="videoStreamURL" className="flex gap-2 items-center">
                                                <VideoIcon className="w-4" />
                                                <span className="text-sm font-bold">Video Stream URL</span>
                                            </label>
                                            <p id="videoStreamURL" className="text-sm">{data.data.videoStreamURL ? data.data.videoStreamURL : "N/A"}</p>
                                        </div>
                                    </div>
                                    {/* Add more fields as necessary */}
                                    <div>
                                        <div className="relative w-full min-h-[300px] aspect-3/2 bg-neutral-200 justify-center items-center flex rounded-sm overflow-hidden">
                                            <MapIcon className="mr-2" />
                                            <span className="text-sm">No Google Maps Embed available</span>
                                            {data.data.mapEmbedCode &&
                                                <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: data.data.mapEmbedCode }}></div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
}