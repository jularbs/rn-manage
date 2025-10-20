// TODOS: implement pagination
import { fetcher } from "@/actions/swr";
import { createTag } from "@/actions/tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";
import { getCookie } from "typescript-cookie";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import useSWR from "swr";

export default function TagSelector({ selectedTags, setSelectedTags }: {
    selectedTags: string[],
    setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
}) {
    const token = getCookie("token");
    const { ref, inView } = useInView({ threshold: .9 });

    const [limit,] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAllFetched, setIsAllFetched] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const {
        data: tags,
        mutate: tagsMutate,
        size,
        setSize,
        isLoading,
        error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = useSWRInfinite((index: number, previous: any) => {
        if (previous && previous.pagination && !previous.pagination.hasNextPage) {
            setIsAllFetched(true);
            return null; // No more data to fetch
        }
        return {
            url: "v1/tags",
            params: {
                page: index + 1,
                limit,
                search: searchQuery
            },
            token
        }
    },
        fetcher,
        {
            revalidateAll: true,    
            revalidateFirstPage: false
        }
    );

    const isLoadingMore =
        isLoading || (size > 0 && tags && typeof tags[size - 1] === "undefined");

    useEffect(() => {
        if (inView) {
            if (!isLoadingMore)
                setSize(size + 1);
        }
    }, [inView, setSize, size, isLoadingMore]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsAllFetched(false);
    };

    const debouncedOnChange = _.debounce(handleSearchChange, 400);

    const [isAddTagLoading, setIsAddTagLoading] = useState(false);

    const displayTags = () => {
        return tags?.map(page => {
            return page.data?.map((tag: Record<string, string>) => {
                return <Label key={tag._id} className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-2 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                    <Checkbox
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                        checked={selectedTags.includes(tag._id)}
                        onCheckedChange={(checked) => {
                            return checked
                                ? setSelectedTags([...selectedTags, tag._id])
                                : setSelectedTags(
                                    selectedTags?.filter(
                                        (value) => value !== tag._id
                                    )
                                )
                        }}
                    />
                    <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                            {tag.name}
                        </p>
                    </div>
                </Label>
            })
        })
    }

    const displaySelectedTags = () => {
        return selectedTagsData?.data?.map((tag: Record<string, string>) => {
            return <Label key={tag._id} className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-2 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                <Checkbox
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                    checked={selectedTags.includes(tag._id)}
                    onCheckedChange={(checked) => {
                        return checked
                            ? setSelectedTags([...selectedTags, tag._id])
                            : setSelectedTags(
                                selectedTags?.filter(
                                    (value) => value !== tag._id
                                )
                            )
                    }}
                />
                <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                        {tag.name}
                    </p>
                </div>
            </Label>
        })
    }

    const handleAddTag = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsAddTagLoading(true);
        if (searchQuery.trim() === "") return; // Prevent adding empty tags

        createTag({ data: { name: searchQuery }, token })
            .then((res) => {
                if (res) {
                    setIsAddTagLoading(false);
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
                    setSelectedTags([...selectedTags, res.data._id]);
                    //mutate to add the new tag to the top of the list
                    tagsMutate();
                }
            })
            .catch((err) => {
                setIsAddTagLoading(false);
                console.log("Error: ", err);
                toast.error("Invalid Request!", {
                    style: {
                        background: "rgba(220, 46, 46, 1)",
                        color: "white",
                        border: "none"
                    },
                    description: err.message,
                    duration: 5000,
                    position: "top-center"
                });
            });
    }

    //Selected Tags Fetcher
    const { data: selectedTagsData, isLoading: selectedTagsLoading } = useSWR(
        isSheetOpen && selectedTags.length > 0 ? {
            url: "v1/tags",
            params: {
                id: JSON.stringify(selectedTags),
                limit: 0
            },
            token
        } : null, fetcher);


    return <>
        <Card className="p-2 !gap-0">
            <CardHeader className="py-2 px-1 font-semibold">
                <div className="flex items-center justify-between">
                    <span>Tags</span>
                    {selectedTags.length > 0 && <Badge className={cn(
                        "font-semibold uppercase text-[10px] cursor-pointer",
                    )} variant="secondary" onClick={() => setIsSheetOpen(true)}>{selectedTags.length} selected</Badge>}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-2">
                <Input placeholder="Search Tags..." onChange={debouncedOnChange} />
                {searchQuery.trim() !== "" &&
                    <Button size={"sm"} variant="outline" className="w-full mt-2 border-black"
                        onClick={handleAddTag}>
                        Add &quot;{searchQuery}&quot;
                        {isAddTagLoading && <LoaderCircle className="animate-spin" />}
                    </Button>
                }
                <Separator />
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {displayTags()}
                    {isAllFetched ?
                        <div className="bg-transparent rounded-sm text-neutral-500 text-sm p-2 text-center font-bold">- All Tags Displayed -</div>
                        : null}
                    {!isAllFetched && !isLoadingMore && !error &&
                        <div ref={ref} className="text-sm p-2 text-center">Loading more...</div>
                    }
                </div>
            </CardContent>
        </Card>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="!gap-0">
                <SheetHeader>
                    <SheetTitle>Selected Tags</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 overflow-y-auto p-2">
                    {selectedTagsLoading && (
                        new Array(selectedTags.length).fill(0).map((_, index) => (
                            <div key={index} className="w-full h-8 bg-accent animate-pulse rounded-md" />
                        ))
                    )}
                    {displaySelectedTags()}
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    </>
}