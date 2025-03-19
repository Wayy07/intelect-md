"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Trash2,
  ExternalLink,
  ImageDown,
  Images,
  Link as LinkIcon,
  Edit,
  Eye,
  Grid2X2,
  Grid3X3,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useBannerStore,
  MainBanner,
  PromotionalBanner,
} from "../../lib/banner-data";

// Form validation schemas
const mainBannerSchema = z.object({
  id: z.string().optional(),
  desktopImageUrl: z.string().url({ message: "Please enter a valid URL" }),
  mobileImageUrl: z.string().url({ message: "Please enter a valid URL" }),
  title: z.string(),
  subtitle: z.string().optional(),
  linkUrl: z.string().min(1, { message: "Link URL is required" }),
  buttonText: z.string().optional(),
});

const promotionalBannerSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  imageSrc: z.string().url({ message: "Please enter a valid URL" }),
  alt: z.string().min(1, { message: "Alt text is required" }),
});

// Form types - ensure these match the MainBanner and PromotionalBanner interfaces
type MainBannerForm = z.infer<typeof mainBannerSchema>;
type PromotionalBannerForm = z.infer<typeof promotionalBannerSchema>;

export function BannerManagement() {
  // Get banner data and update functions from the store
  const { mainBanners, promoBanners, setMainBanners, setPromoBanners } =
    useBannerStore();

  // State for current editing/viewing items
  const [selectedMainBanner, setSelectedMainBanner] =
    useState<MainBanner | null>(null);
  const [selectedPromoBanner, setSelectedPromoBanner] =
    useState<PromotionalBanner | null>(null);
  const [isMainBannerModalOpen, setIsMainBannerModalOpen] = useState(false);
  const [isPromoBannerModalOpen, setIsPromoBannerModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");

  // Main banner form
  const mainBannerForm = useForm<MainBannerForm>({
    resolver: zodResolver(mainBannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      desktopImageUrl: "",
      mobileImageUrl: "",
      linkUrl: "",
      buttonText: "",
      id: "",
    },
  });

  // Promotional banner form
  const promoBannerForm = useForm<PromotionalBannerForm>({
    resolver: zodResolver(promotionalBannerSchema),
    defaultValues: {
      imageSrc: "",
      alt: "",
      id: "",
    },
  });

  // Reset and populate form when selected banner changes
  useEffect(() => {
    if (selectedMainBanner) {
      const formValues = {
        title: selectedMainBanner.title || "",
        subtitle: selectedMainBanner.subtitle || "",
        desktopImageUrl: selectedMainBanner.desktopImageUrl || "",
        mobileImageUrl: selectedMainBanner.mobileImageUrl || "",
        linkUrl: selectedMainBanner.linkUrl || "",
        buttonText: selectedMainBanner.buttonText || "",
        id: selectedMainBanner.id || "",
      };
      mainBannerForm.reset(formValues);
    } else {
      mainBannerForm.reset({
        title: "",
        subtitle: "",
        desktopImageUrl: "",
        mobileImageUrl: "",
        linkUrl: "",
        buttonText: "",
        id: "",
      });
    }
  }, [selectedMainBanner, mainBannerForm]);

  useEffect(() => {
    if (selectedPromoBanner) {
      const formValues = {
        imageSrc: selectedPromoBanner.imageSrc || "",
        alt: selectedPromoBanner.alt || "",
        id: selectedPromoBanner.id || "",
      };
      promoBannerForm.reset(formValues);
    } else {
      promoBannerForm.reset({
        imageSrc: "",
        alt: "",
        id: "",
      });
    }
  }, [selectedPromoBanner, promoBannerForm]);

  // Handle main banner form submission
  const onMainBannerSubmit = (data: MainBannerForm) => {
    if (mode === "add") {
      // Generate a new ID for the banner
      const newId = `banner${mainBanners.length + 1}`;
      const newBanner: MainBanner = {
        ...data,
        id: newId,
      };
      const newBanners = [...mainBanners, newBanner];
      setMainBanners(newBanners);
    } else {
      // Update existing banner
      const updatedBanners = mainBanners.map((banner: MainBanner) =>
        banner.id === selectedMainBanner?.id
          ? { ...data, id: banner.id }
          : banner
      );
      setMainBanners(updatedBanners);
    }

    setIsMainBannerModalOpen(false);
    setSelectedMainBanner(null);
  };

  // Handle promotional banner form submission
  const onPromoBannerSubmit = (data: PromotionalBannerForm) => {
    if (mode === "add") {
      // Generate a new ID for the banner
      const newId = promoBanners.length + 1;
      const newBanner: PromotionalBanner = {
        ...data,
        id: newId,
      };
      const newBanners = [...promoBanners, newBanner];
      setPromoBanners(newBanners);
    } else {
      // Update existing banner
      const updatedBanners = promoBanners.map((banner: PromotionalBanner) =>
        banner.id === selectedPromoBanner?.id
          ? { ...data, id: banner.id }
          : banner
      );
      setPromoBanners(updatedBanners);
    }

    setIsPromoBannerModalOpen(false);
    setSelectedPromoBanner(null);
  };

  // Delete main banner
  const deleteMainBanner = (id: string) => {
    const filteredBanners = mainBanners.filter(
      (banner: MainBanner) => banner.id !== id
    );
    setMainBanners(filteredBanners);
  };

  // Delete promotional banner
  const deletePromoBanner = (id: number | string) => {
    const filteredBanners = promoBanners.filter(
      (banner: PromotionalBanner) => banner.id !== id
    );
    setPromoBanners(filteredBanners);
  };

  // Open add modal for main banner
  const openAddMainBannerModal = () => {
    setSelectedMainBanner(null);
    setMode("add");
    mainBannerForm.reset({
      title: "",
      subtitle: "",
      desktopImageUrl: "",
      mobileImageUrl: "",
      linkUrl: "",
      buttonText: "",
      id: "",
    });
    setIsMainBannerModalOpen(true);
  };

  // Open edit modal for main banner
  const openEditMainBannerModal = (banner: MainBanner) => {
    setSelectedMainBanner(banner);
    setMode("edit");
    mainBannerForm.reset({
      ...banner,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      id: banner.id || "",
    });
    setIsMainBannerModalOpen(true);
  };

  // Open add modal for promotional banner
  const openAddPromoBannerModal = () => {
    setSelectedPromoBanner(null);
    setMode("add");
    promoBannerForm.reset({
      imageSrc: "",
      alt: "",
      id: "",
    });
    setIsPromoBannerModalOpen(true);
  };

  // Open edit modal for promotional banner
  const openEditPromoBannerModal = (banner: PromotionalBanner) => {
    setSelectedPromoBanner(banner);
    setMode("edit");
    promoBannerForm.reset({
      ...banner,
      id: banner.id || "",
    });
    setIsPromoBannerModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestionare Banere</h1>
      </div>

      <Tabs defaultValue="main-banners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main-banners" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            <span>Banere Principale</span>
          </TabsTrigger>
          <TabsTrigger
            value="promo-banners"
            className="flex items-center gap-2"
          >
            <Grid2X2 className="h-4 w-4" />
            <span>Banere Promoționale</span>
          </TabsTrigger>
        </TabsList>

        {/* Main Banners Tab */}
        <TabsContent value="main-banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Banere Slideshow Principal
            </h2>
            <Button
              onClick={openAddMainBannerModal}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Adaugă Banner</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagine</TableHead>
                    <TableHead>Titlu</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mainBanners.map((banner: MainBanner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={banner.desktopImageUrl}
                            alt={banner.title || "Banner image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {banner.title || `Banner ${banner.id}`}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={banner.linkUrl}
                          className="flex items-center text-blue-500 hover:underline"
                        >
                          {banner.linkUrl.length > 30
                            ? `${banner.linkUrl.substring(0, 30)}...`
                            : banner.linkUrl}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditMainBannerModal(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              deleteMainBanner(banner.id as string)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Previzualizare Banner Principal
              </CardTitle>
              <CardDescription>
                Cum va arăta primul banner din slideshow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mainBanners.length > 0 ? (
                <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border">
                  <Image
                    src={mainBanners[0].desktopImageUrl}
                    alt={mainBanners[0].title || "Preview banner"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Nu există banere de afișat</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotional Banners Tab */}
        <TabsContent value="promo-banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Banere Promoționale</h2>
            <Button
              onClick={openAddPromoBannerModal}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Adaugă Banner</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagine</TableHead>
                    <TableHead>Text Alt</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoBanners.map((banner: PromotionalBanner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={banner.imageSrc}
                            alt={banner.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {banner.alt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditPromoBannerModal(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              deletePromoBanner(banner.id as number | string)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Previzualizare Banere Promoționale
              </CardTitle>
              <CardDescription>Aranjament banere promoționale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoBanners.map((banner: PromotionalBanner) => (
                  <div
                    key={banner.id}
                    className="relative h-48 rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={banner.imageSrc}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {promoBanners.length === 0 && (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg col-span-2">
                    <p className="text-gray-500">Nu există banere de afișat</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Main Banner Dialog */}
      <Dialog
        open={isMainBannerModalOpen}
        onOpenChange={setIsMainBannerModalOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add"
                ? "Adaugă Banner Principal"
                : "Editează Banner Principal"}
            </DialogTitle>
            <DialogDescription>
              Completează detaliile pentru bannerul principal care va apărea în
              slideshow.
            </DialogDescription>
          </DialogHeader>

          <Form {...mainBannerForm}>
            <form
              onSubmit={mainBannerForm.handleSubmit(onMainBannerSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={mainBannerForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titlu</FormLabel>
                        <FormControl>
                          <Input placeholder="Titlu banner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mainBannerForm.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitlu (opțional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Subtitlu banner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mainBannerForm.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/page"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mainBannerForm.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Buton (opțional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Descoperă mai multe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={mainBannerForm.control}
                    name="desktopImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Imagine Desktop</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mainBannerForm.control}
                    name="mobileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Imagine Mobil</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/mobile-image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview */}
                  <div className="border rounded-lg p-2 mt-4">
                    <Label className="text-sm text-gray-500 mb-2 block">
                      Previzualizare Imagine
                    </Label>
                    {mainBannerForm.watch("desktopImageUrl") ? (
                      <div className="relative w-full h-32 rounded overflow-hidden">
                        <Image
                          src={mainBannerForm.watch("desktopImageUrl")}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <ImageDown className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsMainBannerModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button type="submit">
                  {mode === "add" ? "Adaugă Banner" : "Actualizează Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Promotional Banner Dialog */}
      <Dialog
        open={isPromoBannerModalOpen}
        onOpenChange={setIsPromoBannerModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add"
                ? "Adaugă Banner Promoțional"
                : "Editează Banner Promoțional"}
            </DialogTitle>
            <DialogDescription>
              Completează detaliile pentru bannerul promoțional.
            </DialogDescription>
          </DialogHeader>

          <Form {...promoBannerForm}>
            <form
              onSubmit={promoBannerForm.handleSubmit(onPromoBannerSubmit)}
              className="space-y-4"
            >
              <FormField
                control={promoBannerForm.control}
                name="imageSrc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Imagine</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={promoBannerForm.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Alt</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descriere imagine pentru accesibilitate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              <div className="border rounded-lg p-2">
                <Label className="text-sm text-gray-500 mb-2 block">
                  Previzualizare Imagine
                </Label>
                {promoBannerForm.watch("imageSrc") ? (
                  <div className="relative w-full h-40 rounded overflow-hidden">
                    <Image
                      src={promoBannerForm.watch("imageSrc")}
                      alt={promoBannerForm.watch("alt") || "Banner preview"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-100 rounded">
                    <ImageDown className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsPromoBannerModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button type="submit">
                  {mode === "add" ? "Adaugă Banner" : "Actualizează Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
