"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, XIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn, ReplaceHtmlEntities } from "@/lib/utils";

interface SEOData {
    // Basic SEO
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    canonicalUrl: string;

    // Robots & Indexing
    robotsIndex: boolean;
    robotsFollow: boolean;
    robotsArchive: boolean;
    robotsSnippet: boolean;
    robotsImageIndex: boolean;

    // Open Graph (Facebook)
    ogTitle: string;
    ogDescription: string;
    ogType: string;
    ogUrl: string;
    ogSiteName: string;
    ogLocale: string;

    // Twitter Cards
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterSite: string;
    twitterCreator: string;

    // Additional SEO
    author: string;
    publisher: string;
    focusKeyword: string;
    readingTime: string;

    // SEO Images
    metaImage: File | null;
    metaImageAlt: string;
    ogImage: File | null;
    ogImageAlt: string;
    twitterImage: File | null;
    twitterImageAlt: string;
}

interface SEOFormProps {
    seoData: SEOData;
    setSeoData: (data: SEOData) => void;
    postTitle: string;
    postContent: string;
    postSlug: string;
}

const SEOForm = ({ seoData, setSeoData, postTitle, postContent, postSlug }: SEOFormProps) => {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isSocialOpen, setIsSocialOpen] = useState(false);
    const [isRobotsOpen, setIsRobotsOpen] = useState(false);

    const [metaImagePreview, setMetaImagePreview] = useState<string>("");
    const [ogImagePreview, setOgImagePreview] = useState<string>("");
    const [twitterImagePreview, setTwitterImagePreview] = useState<string>("");

    const updateSeoData = <K extends keyof SEOData>(field: K, value: SEOData[K]) => {
        setSeoData({
            ...seoData,
            [field]: value
        });
    };

    const generateMetaFromPost = () => {
        const updatedData = { ...seoData };

        // Auto-generate meta title
        if (postTitle) {
            updatedData.metaTitle = postTitle;
        }

        // Auto-generate meta description from content
        if (postContent) {
            const plainText = ReplaceHtmlEntities(postContent.replace(/<[^>]*>/g, ''));

            const description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
            updatedData.metaDescription = description;
        }

        // Auto-generate canonical URL
        if (postSlug) {
            updatedData.canonicalUrl = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/post/${postSlug}`;
        }

        // Auto-fill Open Graph data using the newly generated values
        if (!updatedData.ogTitle) {
            updatedData.ogTitle = updatedData.metaTitle || postTitle;
        }
        if (!updatedData.ogDescription) {
            updatedData.ogDescription = updatedData.metaDescription;
        }
        if (!updatedData.ogUrl) {
            updatedData.ogUrl = updatedData.canonicalUrl;
        }

        // Auto-fill Twitter data using the newly generated values
        if (!updatedData.twitterTitle) {
            updatedData.twitterTitle = updatedData.metaTitle || postTitle;
        }
        if (!updatedData.twitterDescription) {
            updatedData.twitterDescription = updatedData.metaDescription;
        }

        // Update all data at once
        setSeoData(updatedData);
    }; const handleImageUpload = (field: 'metaImage' | 'ogImage' | 'twitterImage', file: File | null) => {
        updateSeoData(field, file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (field === 'metaImage') setMetaImagePreview(result);
                else if (field === 'ogImage') setOgImagePreview(result);
                else if (field === 'twitterImage') setTwitterImagePreview(result);
            };
            reader.readAsDataURL(file);
        } else {
            if (field === 'metaImage') setMetaImagePreview("");
            else if (field === 'ogImage') setOgImagePreview("");
            else if (field === 'twitterImage') setTwitterImagePreview("");
        }
    };

    const getCharacterCount = (text: string, limit: number) => {
        const remaining = limit - text.length;
        return {
            count: text.length,
            remaining,
            isOverLimit: remaining < 0
        };
    };

    return (
        <>
            <Card className="p-2 !gap-0">
                <CardHeader className="py-2 px-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">SEO Meta Tags</span>
                            <Badge variant="secondary" className="text-xs">Essential for Rankings</Badge>
                        </div>
                        <Button
                            size="sm"
                            onClick={generateMetaFromPost}
                            className="text-xs font-bold cursor-pointer"
                        >
                            Auto-Generate
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                    {/* Basic SEO Fields */}
                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label className="text-sm font-medium">Meta Title *</Label>
                                <span className={cn(
                                    "text-xs",
                                    getCharacterCount(seoData.metaTitle, 60).isOverLimit ? "text-orange-300" : "text-gray-500"
                                )}>
                                    {getCharacterCount(seoData.metaTitle, 60).count}/60
                                </span>
                            </div>
                            <Input
                                placeholder="Optimized title for search engines (50-60 characters)"
                                value={seoData.metaTitle}
                                onChange={(e) => updateSeoData('metaTitle', e.target.value)}
                                className={getCharacterCount(seoData.metaTitle, 60).isOverLimit ? "border-orange-300" : ""}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label className="text-sm font-medium">Meta Description *</Label>
                                <span className={cn(
                                    "text-xs",
                                    getCharacterCount(seoData.metaDescription, 160).isOverLimit ? "text-orange-300" : "text-gray-500"
                                )}>
                                    {getCharacterCount(seoData.metaDescription, 160).count}/160
                                </span>
                            </div>
                            <Textarea
                                placeholder="Compelling description that appears in search results (120-160 characters)"
                                value={seoData.metaDescription}
                                onChange={(e) => updateSeoData('metaDescription', e.target.value)}
                                className={cn(
                                    "h-20",
                                    getCharacterCount(seoData.metaDescription, 160).isOverLimit ? "border-orange-300" : ""
                                )}
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-1">Focus Keyword</Label>
                            <Input
                                placeholder="Primary keyword for this post"
                                value={seoData.focusKeyword}
                                onChange={(e) => updateSeoData('focusKeyword', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-1">Keywords (SEO Tags)</Label>
                            <Input
                                placeholder="keyword1, keyword2, keyword3 (comma-separated)"
                                value={seoData.keywords}
                                onChange={(e) => updateSeoData('keywords', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Add relevant keywords separated by commas</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Meta Image */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-sm font-medium mb-1">SEO Meta Image</Label>
                                {metaImagePreview ? (
                                    <div className="relative aspect-video bg-accent rounded-sm overflow-hidden">
                                        <Image
                                            src={metaImagePreview}
                                            alt="Meta image preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => handleImageUpload('metaImage', null)}
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="aspect-video bg-accent rounded-sm flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto mb-2" />
                                            <span className="text-sm">Choose Meta Image</span>
                                            <span className="block text-[10px] font-light">Defaults to featured image</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                handleImageUpload('metaImage', file);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <Label className="text-sm font-medium mb-1">Alt Text *</Label>
                                    <Textarea
                                        placeholder="Describe the image for accessibility and SEO"
                                        value={seoData.metaImageAlt}
                                        onChange={(e) => updateSeoData('metaImageAlt', e.target.value)}
                                        className="h-20"
                                    />
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>• Uploaded featured image is used if none is provided</p>
                                    <p>• Recommended: 1200x630px (16:9)</p>
                                    <p>• Used for search results and social sharing</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Social Media Meta Tags */}
                    <Collapsible open={isSocialOpen} onOpenChange={setIsSocialOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Social Media Tags</span>
                                <Badge variant="outline" className="text-xs">Rich Sharing</Badge>
                            </div>
                            {isSocialOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-4 pt-3">
                            {/* Open Graph (Facebook) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">Open Graph (Facebook, LinkedIn)</h4>
                                    <Badge variant="secondary" className="text-xs">Facebook</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm font-medium mb-1">OG Title</Label>
                                        <Input
                                            placeholder="Title for social sharing"
                                            value={seoData.ogTitle}
                                            onChange={(e) => updateSeoData('ogTitle', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-1">OG Type</Label>
                                        <Select value={seoData.ogType} onValueChange={(value) => updateSeoData('ogType', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="article">Article</SelectItem>
                                                <SelectItem value="video.other">Video</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mb-1">OG Description</Label>
                                    <Textarea
                                        placeholder="Description for social sharing"
                                        value={seoData.ogDescription}
                                        onChange={(e) => updateSeoData('ogDescription', e.target.value)}
                                        className="h-16"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Site Name</Label>
                                        <Input
                                            placeholder="Your website name"
                                            value={seoData.ogSiteName}
                                            onChange={(e) => updateSeoData('ogSiteName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Locale</Label>
                                        <Input
                                            placeholder="en_US"
                                            value={seoData.ogLocale}
                                            onChange={(e) => updateSeoData('ogLocale', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* OG Image */}
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm font-medium mb-1">Open Graph Image</Label>
                                            {ogImagePreview ? (
                                                <div className="relative aspect-video bg-accent rounded-sm overflow-hidden">
                                                    <Image src={ogImagePreview} alt="OG image preview" fill className="object-cover" />
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 h-6 w-6"
                                                        onClick={() => handleImageUpload('ogImage', null)}
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="aspect-video bg-accent rounded-sm flex justify-center items-center cursor-pointer border-2 border-dashed">
                                                    <div className="text-center">
                                                        <ImageIcon className="mx-auto mb-1" size={20} />
                                                        <span className="text-xs">OG Image</span>
                                                        <span className="block text-[10px] font-light">Defaults to featured image</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload('ogImage', e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-sm font-medium mb-1">Alt Text</Label>
                                                <Textarea
                                                    placeholder="Alt text for OG image"
                                                    value={seoData.ogImageAlt}
                                                    onChange={(e) => updateSeoData('ogImageAlt', e.target.value)}
                                                    className="h-16"
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <p>• Uploaded featured image is used if none is provided</p>
                                                <p>• Recommended: 1200x630px (16:9)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Twitter Cards */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm">Twitter Cards</h4>
                                    <Badge variant="secondary" className="text-xs">Twitter</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Card Type</Label>
                                        <Select value={seoData.twitterCard} onValueChange={(value) => updateSeoData('twitterCard', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select card type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="summary">Summary</SelectItem>
                                                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                                                <SelectItem value="player">Player</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Twitter Site</Label>
                                        <Input
                                            placeholder="@yourtwitterhandle"
                                            value={seoData.twitterSite}
                                            onChange={(e) => updateSeoData('twitterSite', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Twitter Title</Label>
                                        <Input
                                            placeholder="Title for Twitter sharing"
                                            value={seoData.twitterTitle}
                                            onChange={(e) => updateSeoData('twitterTitle', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-1">Creator</Label>
                                        <Input
                                            placeholder="@authorhandle"
                                            value={seoData.twitterCreator}
                                            onChange={(e) => updateSeoData('twitterCreator', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mb-1">Twitter Description</Label>
                                    <Textarea
                                        placeholder="Description for Twitter sharing"
                                        value={seoData.twitterDescription}
                                        onChange={(e) => updateSeoData('twitterDescription', e.target.value)}
                                        className="h-16"
                                    />
                                </div>

                                {/* Twitter Image */}
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-sm font-medium mb-1">Twitter Image</Label>
                                            {twitterImagePreview ? (
                                                <div className="relative aspect-video bg-accent rounded-sm overflow-hidden">
                                                    <Image src={twitterImagePreview} alt="Twitter image preview" fill className="object-cover" />
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 h-6 w-6"
                                                        onClick={() => handleImageUpload('twitterImage', null)}
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label className="aspect-video bg-accent rounded-sm flex justify-center items-center cursor-pointer border-2 border-dashed">
                                                    <div className="text-center">
                                                        <ImageIcon className="mx-auto mb-1" size={20} />
                                                        <span className="text-xs">Twitter Image</span>
                                                        <span className="block text-[10px] font-light">Defaults to featured image</span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload('twitterImage', e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <Label className="text-sm font-medium mb-1">Alt Text</Label>
                                                <Textarea
                                                    placeholder="Alt text for Twitter image"
                                                    value={seoData.twitterImageAlt}
                                                    onChange={(e) => updateSeoData('twitterImageAlt', e.target.value)}
                                                    className="h-16"
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <p>• Uploaded featured image is used if none is provided</p>
                                                <p>• Recommended: 1200x630px (16:9)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    {/* Advanced SEO */}
                    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Advanced SEO</span>
                                <Badge variant="outline" className="text-xs">Technical</Badge>
                            </div>
                            {isAdvancedOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-4 pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-sm font-medium mb-1">Canonical URL</Label>
                                    <Input
                                        placeholder="https://yourdomain.com/post/slug"
                                        value={seoData.canonicalUrl}
                                        onChange={(e) => updateSeoData('canonicalUrl', e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Prevents duplicate content issues</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium mb-1">Reading Time</Label>
                                    <Input
                                        placeholder="5 min read"
                                        value={seoData.readingTime}
                                        onChange={(e) => updateSeoData('readingTime', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-sm font-medium mb-1">Author</Label>
                                    <Input
                                        placeholder="Author name for structured data"
                                        value={seoData.author}
                                        onChange={(e) => updateSeoData('author', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium mb-1">Publisher</Label>
                                    <Input
                                        placeholder="Publisher name"
                                        value={seoData.publisher}
                                        onChange={(e) => updateSeoData('publisher', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    {/* Robots Meta */}
                    <Collapsible open={isRobotsOpen} onOpenChange={setIsRobotsOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Robots & Indexing</span>
                                <Badge variant="outline" className="text-xs">Crawling Control</Badge>
                            </div>
                            {isRobotsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-4 pt-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium mb-1">Index Page</Label>
                                            <InfoIcon className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <Switch
                                            checked={seoData.robotsIndex}
                                            onCheckedChange={(checked) => updateSeoData('robotsIndex', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium mb-1">Follow Links</Label>
                                        <Switch
                                            checked={seoData.robotsFollow}
                                            onCheckedChange={(checked) => updateSeoData('robotsFollow', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium mb-1">Archive Page</Label>
                                        <Switch
                                            checked={seoData.robotsArchive}
                                            onCheckedChange={(checked) => updateSeoData('robotsArchive', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium mb-1">Show Snippet</Label>
                                        <Switch
                                            checked={seoData.robotsSnippet}
                                            onCheckedChange={(checked) => updateSeoData('robotsSnippet', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium mb-1">Index Images</Label>
                                        <Switch
                                            checked={seoData.robotsImageIndex}
                                            onCheckedChange={(checked) => updateSeoData('robotsImageIndex', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                                <p className="font-medium mb-1">Robots Configuration:</p>
                                <p>• Index: Allow search engines to include this page in results</p>
                                <p>• Follow: Allow crawling of links on this page</p>
                                <p>• Archive: Allow caching/archiving of this page</p>
                                <p>• Snippet: Allow showing text snippets in search results</p>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
        </>
    );
};

export default SEOForm;