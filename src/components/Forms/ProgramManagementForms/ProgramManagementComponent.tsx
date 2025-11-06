"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DAYS_DATA, TIMES_DATA } from "@/lib/constants";
import { Program } from "@/types/programs";
import { LoaderCircle, PlusIcon } from "lucide-react";
import { useState } from "react"
import AddProgramComponent from "./AddProgramComponent";
import { fetcher } from "@/actions/swr";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import UpdateProgramComponent from "./UpdateProgramComponent";

const ProgramManagementComponent = () => {

    const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
    const [isUpdateProgramOpen, setIsUpdateProgramOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedProgram, setSelectedProgram] = useState(null);

    const { data: stationList, isLoading: isStationListLoading } = useSWR({ url: "v1/stations" }, fetcher, {
        onSuccess: (data) => {
            //Set selected station to index 0 in response
            if (data && data.data[0]) {
                setSelectedStation(data.data[0]._id)
            }
        }
    });

    const { data: programList, isLoading: isProgramsLoading } = useSWR(selectedStation ? { url: "v1/programs/schedule/station/" + selectedStation, token: getCookie("token") } : null, fetcher)

    const showHourSegmentLabels = () => {
        return TIMES_DATA.map((time) => {
            return (
                <div key={time.value} className="text-[10px] min-w-program-block-size -translate-x-[20px] font-bold">
                    {time.display}
                </div>
            )
        })
    }

    const showHourBlocks = () => {
        return TIMES_DATA.map((time) => {
            return (
                <div key={time.value} className="w-program-block-size h-program-block-size shrink-0 border-r-1 border-b-1 border-gray-200 box-border border-dashed"></div>
            )
        })
    }

    const showDailyBlocks = () => {
        return DAYS_DATA.map((day) => {
            return <div className="flex" key={day.value}>
                <div className="flex w-[150px] shrink-0 text-center text-sm items-center px-2 uppercase font-bold bg-neutral-100 border-b-1 border-gray-200">{day.display}</div>
                <div className="relative flex items-center">
                    {showHourBlocks()}
                    {showScheduledPrograms(day.value)}
                </div>
            </div>
        })
    }

    const calculateLength = (program: Partial<Program>) => {
        return (
            TIMES_DATA.map((item) => item.value).indexOf(program.endTime || "") -
            TIMES_DATA.map((item) => item.value).indexOf(program.startTime || "")
        );
    };

    const calculateOffset = (program: Partial<Program>) => {
        return TIMES_DATA.map((item) => item.value).indexOf(program.startTime || "");
    };

    const showScheduledPrograms = (dayOfWeek: number) => {
        return programList?.data
            .filter((item: Partial<Program>) => item.day?.includes(dayOfWeek))
            .map((item: Partial<Program>, key: React.Key) => {
                return (
                    <button
                        style={{
                            left: `calc(${calculateOffset(item)} * var(--spacing-program-block-size))`,
                            width: `calc(${calculateLength(item)} * var(--spacing-program-block-size))`,
                        }}
                        key={key}
                        className="absolute flex items-center justify-center text-center p-2.5 left-0 h-14 w-0 rounded-lg bg-radyonatin-blue cursor-pointer"
                        onClick={() => {
                            setSelectedProgram(item._id)
                            setIsUpdateProgramOpen(true)
                        }}
                    >
                        <p className="line-clamp-3 uppercase text-sm leading-none font-extrabold text-white">{item.name}</p>
                    </button>
                );
            });
    };

    return <>
        <UpdateProgramComponent open={isUpdateProgramOpen} onOpenChange={setIsUpdateProgramOpen} selectedProgram={String(selectedProgram)} />
        <AddProgramComponent open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen} />
        <Card className="p-0 !gap-0 overflow-x-scroll">
            <CardHeader className="flex justify-between items-center p-2">
                <Select onValueChange={(value) => setSelectedStation(value)} value={selectedStation}
                >
                    <SelectTrigger className="w-full max-w-md relative">
                        <SelectValue placeholder="Select Station" />
                        <LoaderCircle className={cn("animate-spin w-4 absolute right-8",
                            isStationListLoading || isProgramsLoading ? "block" : "hidden"
                        )} />
                    </SelectTrigger>
                    <SelectContent>
                        {stationList?.data?.map((station: { _id: string; name: string }) => (
                            <SelectItem key={station._id} value={station._id}>{station.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm"
                    onClick={() => {
                        setIsAddProgramOpen(true);
                    }}
                >
                    <PlusIcon />
                    <span className="hidden sm:block">New Program</span>
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <div className="flex">
                    <div className="w-0 grow overflow-x-auto pb-3">
                        <div className="relative flex items-center py-2">
                            <div className="w-[150px] shrink-0 text-center text-sm font-bold">DAY</div>
                            {showHourSegmentLabels()}
                        </div>
                        {showDailyBlocks()}
                    </div>
                </div>
            </CardContent>
        </Card>

    </>
}

export default ProgramManagementComponent;