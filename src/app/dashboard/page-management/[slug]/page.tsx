import PageEditorComponent from "@/components/Forms/PageManagementForms/PageEditorComponent";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div>
            <div className="flex flex-col flex-1 p-4 pt-0">
                <PageEditorComponent slug={slug} />
            </div>
        </div>
    )
}

