"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Produs } from "@prisma/client"
import { useRouter } from "next/navigation"
import { X, Plus, Image as ImageIcon } from "lucide-react"

const productSchema = z.object({
  cod: z.string().min(2, "Codul trebuie să aibă cel puțin 2 caractere"),
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().min(10, "Descrierea trebuie să aibă cel puțin 10 caractere"),
  pret: z.coerce.number().min(0, "Prețul nu poate fi negativ"),
  pretRedus: z.coerce.number().min(0, "Prețul redus nu poate fi negativ").optional(),
  stoc: z.coerce.number().min(0, "Stocul nu poate fi negativ"),
  stare: z.enum(["NOU", "UTILIZAT"]),
  imagini: z.array(z.string().url("URL invalid")).min(1, "Adăugați cel puțin o imagine"),
  specificatii: z.record(z.string(), z.string()).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  categoryId: string
  subcategoryId: string
  product?: Produs
  onClose?: () => void
}

export default function ProductForm({
  categoryId,
  subcategoryId,
  product,
  onClose,
}: ProductFormProps) {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<string[]>(product?.imagini || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    product?.specificatii as Record<string, string> || {}
  )
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      cod: product?.cod || "",
      nume: product?.nume || "",
      descriere: product?.descriere || "",
      pret: product?.pret || 0,
      pretRedus: product?.pretRedus || undefined,
      stoc: product?.stoc || 0,
      stare: product?.stare || "NOU",
      imagini: product?.imagini || [],
      specificatii: product?.specificatii as Record<string, string> || {},
    },
  })

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedUrls = [...imageUrls, newImageUrl]
      setImageUrls(updatedUrls)
      form.setValue("imagini", updatedUrls)
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (urlToRemove: string) => {
    const updatedUrls = imageUrls.filter(url => url !== urlToRemove)
    setImageUrls(updatedUrls)
    form.setValue("imagini", updatedUrls)
  }

  const handleAddSpecification = () => {
    if (newSpecKey && newSpecValue) {
      const updatedSpecs = { ...specifications, [newSpecKey]: newSpecValue }
      setSpecifications(updatedSpecs)
      form.setValue("specificatii", updatedSpecs)
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const handleRemoveSpecification = (key: string) => {
    const { [key]: _, ...rest } = specifications
    setSpecifications(rest)
    form.setValue("specificatii", rest)
  }

  async function onSubmit(data: ProductFormValues) {
    try {
      const url = product
        ? `/api/categories/${categoryId}/subcategories/${subcategoryId}/products/${product.id}`
        : `/api/categories/${categoryId}/subcategories/${subcategoryId}/products`

      const response = await fetch(url, {
        method: product ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      // Add logging for debugging
      console.log("Form data being sent:", data);
      console.log("Request URL:", url);
      console.log("Request method:", product ? "PATCH" : "POST");

      if (!response.ok) {
        let errorData;
        let errorMessage = "";

        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            errorData = await response.json();
            errorMessage = errorData?.message || errorData?.error || "";
          } else {
            errorMessage = await response.text();
          }

          // Log the error details with structured information
          console.error("Server error:", {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            method: product ? "PATCH" : "POST",
            errorData,
            errorMessage
          });

          form.setError("root", {
            type: "server",
            message: errorMessage
          });
          return;
        } catch (parseError) {
          console.warn("Error parsing response:", parseError);
          errorMessage = response.statusText || "Eroare la procesarea răspunsului";
        }

        const errorMessages: Record<number, string> = {
          400: "Date invalide. Verificați datele introduse.",
          401: "Nu aveți permisiunea de a efectua această acțiune.",
          404: "Produsul nu a fost găsit.",
          409: "Există deja un produs cu acest cod.",
          413: "Dimensiunea datelor este prea mare.",
          429: "Prea multe încercări. Încercați din nou mai târziu.",
          500: "Eroare internă de server. Vă rugăm să încercați din nou."
        };

        const finalError = errorMessage.trim() ||
          errorMessages[response.status] ||
          `Eroare ${response.status || "necunoscută"}: ${response.statusText || "Eroare la procesare"}`;

        // Create a safe error object for logging
        const errorDetails = {
          url,
          method: product ? "PATCH" : "POST",
          status: response.status,
          statusText: response.statusText || "No status text",
          error: finalError,
          ...(errorData && { serverError: errorData }),
        };

        // Log the error details
        console.error("Server error:", errorDetails);

        form.setError("root", {
          type: "server",
          message: finalError
        });
        return;
      }

      const result = await response.json();
      router.refresh();
      if (onClose) onClose();
    } catch (error) {
      // Create a safe error object for client-side errors
      const errorDetails = {
        type: "client_error",
        message: error instanceof Error ? error.message : "Eroare neașteptată",
        ...(error instanceof Error && {
          name: error.name,
          stack: error.stack
        })
      };

      console.error("Form submission error:", errorDetails);

      form.setError("root", {
        type: "server",
        message: errorDetails.message
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="rounded-md bg-destructive/15 p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </h3>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="cod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cod Produs</FormLabel>
              <FormControl>
                <Input placeholder="Cod produs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume</FormLabel>
              <FormControl>
                <Input placeholder="Nume produs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descriere</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descriere produs"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preț</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pretRedus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preț Redus (opțional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="stoc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stoc</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stare Produs</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="NOU">Nou</option>
                  <option value="UTILIZAT">Utilizat</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Imagini</FormLabel>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="URL imagine"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="button" onClick={handleAddImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Produs ${index + 1}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {form.formState.errors.imagini && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.imagini.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <FormLabel>Specificații</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Nume specificație"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
            />
            <Input
              placeholder="Valoare"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
            />
            <Button type="button" onClick={handleAddSpecification}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">{key}:</span> {value}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSpecification(key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-x-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
          )}
          <Button type="submit">
            {product ? "Salvează modificările" : "Adaugă produsul"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
