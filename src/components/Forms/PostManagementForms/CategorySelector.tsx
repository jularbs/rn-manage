import { fetcher } from "@/actions/swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { getCookie } from "typescript-cookie";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";

export default function CategorySelector({ form }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
}) {
    const token = getCookie("token");
    // Fetch categories using SWR
    const { data: categories } = useSWR({ url: "v1/categories", token }, fetcher)

    const selectedCategories = form.watch("categories");
    // Display selected categories
    const showCategories = () => {
        return categories?.data?.map((category: Record<string, string>
        ) => {
            return <FormField
                key={category._id}
                name="categories"
                control={form.control}
                render={({ field }) => (
                    <FormItem key={category._id}>
                        <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-2 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                            <Checkbox
                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                checked={field.value.includes(category._id)}
                                onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...selectedCategories, category._id])
                                        : field.onChange(selectedCategories.filter(
                                            (value: string) => value !== category._id
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
                    </FormItem>)}
            />

        })

    }

    return <>
        <Card className="p-2 !gap-0">
            <CardHeader className="py-2 px-1 font-semibold">
                <div className="flex items-center justify-between">
                    <span>Category</span>
                    {form.getValues("categories").length > 0 && <Badge className={cn(
                        "font-semibold uppercase text-[10px]",
                    )} variant="secondary">{form.getValues("categories").length} selected</Badge>}
                </div>
                {form.formState.errors.categories && <p className="text-xs text-red-600 mt-1">{form.formState.errors.categories.message as string}</p>}
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {showCategories()}
                </div>
            </CardContent>
        </Card>
    </>
}