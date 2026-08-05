import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs";

export default function ArtisanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col px-4 sm:px-8 py-10 max-w-[1200px] mx-auto w-full gap-4 sm:gap-12">
            <div className="flex-1 min-w-0">
                <DynamicBreadcrumbs />
                {children}
            </div>
        </div>
    );
}