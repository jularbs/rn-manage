import { fetcher } from "@/actions/swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";

export default function CategorySelector({ selectedCategories, setSelectedCategories }: {
    selectedCategories: string[],
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
}) {
    const token = getCookie("token");
    // Fetch categories using SWR
    const { data: categories } = useSWR({ url: "v1/categories", token }, fetcher)

    // Display selected categories
    const showCategories = () => {
        return categories?.data?.map((category: Record<string, string>
        ) => {
            return <Label key={category._id} className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-2 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                <Checkbox
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={(checked) => {
                        return checked
                            ? setSelectedCategories([...selectedCategories, category._id])
                            : setSelectedCategories(
                                selectedCategories?.filter(
                                    (value) => value !== category._id
                                )
                            )
                    }}
                />
                <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                        {category.name}
                    </p>
                </div>
            </Label>
        })

    }

    return <>
        <Card className="p-2 !gap-0">
            <CardHeader className="py-2 px-1 font-semibold">
                <div className="flex items-center justify-between">
                    <span>Category</span>
                    {selectedCategories.length > 0 && <Badge className={cn(
                        "font-semibold uppercase text-[10px]",
                    )} variant="secondary">{selectedCategories.length} selected</Badge>}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {showCategories()}
                </div>
            </CardContent>
        </Card>
    </>
}