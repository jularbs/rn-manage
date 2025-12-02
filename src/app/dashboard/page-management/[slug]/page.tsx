import PageEditorComponent from "@/components/Forms/PageManagementForms/PageEditorComponent";
export default function Page({ params }: { params: { slug: string } }) {
    return (
        <div>
            <div className="flex flex-col flex-1 p-4 pt-0">
                <PageEditorComponent slug={params.slug} />
            </div>
        </div>
    )
}

