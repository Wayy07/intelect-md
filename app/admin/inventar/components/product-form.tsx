"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Produs } from "@prisma/client"
import { useRouter } from "next/navigation"
import { X, Plus, Image as ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExtendedProdus extends Omit<Produs, 'dimensiuni' | 'specificatii'> {
  dimensiuni?: {
    lungime?: number;
    latime?: number;
    inaltime?: number;
  };
  specificatii?: Record<string, Record<string, string>>;
  stare: 'NOU' | 'UTILIZAT';
  greutate?: number;
  culoare?: string;
}

const productSchema = z.object({
  // Required fields
  cod: z.string().min(2, "Codul trebuie să aibă cel puțin 2 caractere"),
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().min(10, "Descrierea trebuie să aibă cel puțin 10 caractere"),
  pret: z.coerce.number().min(0, "Prețul nu poate fi negativ"),
  stoc: z.coerce.number().min(0, "Stocul nu poate fi negativ"),
  imagini: z.array(z.string().url("URL invalid")).min(1, "Adăugați cel puțin o imagine"),

  // Optional fields
  pretRedus: z.coerce.number().min(0, "Prețul redus nu poate fi negativ").optional(),
  stare: z.enum(["NOU", "UTILIZAT"]).default("NOU"),
  culoare: z.string().optional(),
  dimensiuni: z.object({
    lungime: z.coerce.number().min(0, "Lungimea nu poate fi negativă").optional(),
    latime: z.coerce.number().min(0, "Lățimea nu poate fi negativă").optional(),
    inaltime: z.coerce.number().min(0, "Înălțimea nu poate fi negativă").optional(),
  }).optional(),
  greutate: z.coerce.number().min(0, "Greutatea nu poate fi negativă").optional(),
  specificatii: z.record(z.string(), z.record(z.string(), z.string())).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  categoryId: string
  subcategoryId: string
  product?: ExtendedProdus
  onClose?: () => void
}

// Helper function to parse JSON string safely
function safeJsonParse(jsonString: any, fallback: any = {}) {
  if (!jsonString) return fallback;
  if (typeof jsonString === 'object') return jsonString;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
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

  // Parse JSON fields from product data
  const parsedDimensiuni = product?.dimensiuni
    ? safeJsonParse(product.dimensiuni, {})
    : {};

  const parsedSpecificatii = product?.specificatii
    ? safeJsonParse(product.specificatii, {})
    : {};

  const [specifications, setSpecifications] = useState<Record<string, Record<string, string>>>(parsedSpecificatii)
  const [newSpecCategory, setNewSpecCategory] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [selectedSpecCategory, setSelectedSpecCategory] = useState<string>("")
  const [loading, setLoading] = useState(false)

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
      culoare: product?.culoare || "",
      dimensiuni: {
        lungime: parsedDimensiuni.lungime || 0,
        latime: parsedDimensiuni.latime || 0,
        inaltime: parsedDimensiuni.inaltime || 0
      },
      greutate: product?.greutate || 0,
      imagini: product?.imagini || [],
      specificatii: parsedSpecificatii,
    },
  })

  // For debugging purposes
  useEffect(() => {
    if (product) {
      console.log("Original product data:", product);
      console.log("Parsed dimensiuni:", parsedDimensiuni);
      console.log("Parsed specificatii:", parsedSpecificatii);
    }
  }, [product]);

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
    if (selectedSpecCategory && newSpecKey && newSpecValue) {
      const updatedSpecs = { ...specifications }
      if (!updatedSpecs[selectedSpecCategory]) {
        updatedSpecs[selectedSpecCategory] = {}
      }
      updatedSpecs[selectedSpecCategory][newSpecKey] = newSpecValue
      setSpecifications(updatedSpecs)
      form.setValue("specificatii", updatedSpecs)
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const handleAddSpecificationCategory = () => {
    if (newSpecCategory && !specifications[newSpecCategory]) {
      const updatedSpecs = { ...specifications, [newSpecCategory]: {} }
      setSpecifications(updatedSpecs)
      form.setValue("specificatii", updatedSpecs)
      setSelectedSpecCategory(newSpecCategory)
      setNewSpecCategory("")
    }
  }

  const handleRemoveSpecification = (category: string, key: string) => {
    const updatedSpecs = { ...specifications }
    delete updatedSpecs[category][key]
    if (Object.keys(updatedSpecs[category]).length === 0) {
      delete updatedSpecs[category]
    }
    setSpecifications(updatedSpecs)
    form.setValue("specificatii", updatedSpecs)
  }

  const handleRemoveSpecificationCategory = (category: string) => {
    const updatedSpecs = { ...specifications }
    delete updatedSpecs[category]
    setSpecifications(updatedSpecs)
    form.setValue("specificatii", updatedSpecs)
    if (selectedSpecCategory === category) {
      setSelectedSpecCategory("")
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      const formUrl = product
        ? `/api/categories/${categoryId}/subcategories/${subcategoryId}/products/${product.id}`
        : `/api/categories/${categoryId}/subcategories/${subcategoryId}/products`

      console.log(`[Form Submission] ${new Date().toISOString()} Submitting to:`, {
        url: formUrl,
        method: product ? "PATCH" : "POST",
        data: JSON.stringify(data, null, 2)
      })

      const response = await fetch(formUrl, {
        method: product ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorData = null
        let errorMessage = ""

        const statusMessages: Record<number, string> = {
          400: "Date invalide. Verificați toate câmpurile obligatorii.",
          401: "Nu sunteți autorizat să efectuați această acțiune.",
          403: "Nu aveți permisiunea de a efectua această acțiune.",
          404: "Resursa nu a fost găsită. Verificați URL-ul și încercați din nou.",
          409: "Conflict: Codul produsului există deja.",
          413: "Fișierul încărcat este prea mare.",
          429: "Prea multe cereri. Încercați din nou mai târziu.",
          500: "Eroare internă de server. Încercați din nou mai târziu.",
          502: "Serviciul temporar indisponibil. Încercați din nou mai târziu.",
          503: "Serviciul indisponibil. Încercați din nou mai târziu."
        }

        try {
          const contentType = response.headers.get("content-type") || ""

          if (contentType.includes("application/json")) {
            errorData = await response.json()
            errorMessage = errorData?.message || errorData?.error || ""
          } else {
            errorMessage = await response.text()
          }

          console.error(`[Form Error] ${new Date().toISOString()}`, {
            request: {
              url: formUrl,
              method: product ? "PATCH" : "POST",
              productId: product?.id || null,
              categoryId: categoryId || 'unknown_category',
              subcategoryId: subcategoryId || 'unknown_subcategory'
            },
            response: {
              status: response.status,
              statusText: response.statusText,
              contentType: contentType || 'unknown',
              errorData: errorData || null
            },
            errorMessage: errorMessage || 'No error message available'
          })

          const userMessage = statusMessages[response.status] || errorMessage || "A apărut o eroare la salvarea produsului"
          form.setError("root", { message: userMessage })
        } catch (parseError) {
          console.error(`[Form Error] ${new Date().toISOString()} Failed to parse error response:`, {
            parseError: parseError instanceof Error ? {
              message: parseError.message,
              name: parseError.name,
              stack: parseError.stack
            } : 'Unknown parse error',
            responseStatus: response.status,
            responseStatusText: response.statusText
          })

          form.setError("root", { message: "Eroare la procesarea răspunsului serverului" })
        }
        return
      }

      const savedProduct = await response.json()
      console.log("Product saved successfully:", savedProduct)

      if (onClose) {
        onClose()
      } else {
        // Refresh the data by redirecting (optional, can be removed if not desired)
        router.refresh();
      }
    } catch (clientError) {
      console.error(`[Form Error] ${new Date().toISOString()} Client error:`, {
        error: clientError instanceof Error ? {
          message: clientError.message,
          name: clientError.name,
          stack: clientError.stack,
          cause: clientError.cause
        } : 'Unknown client error',
        request: {
          url: product
            ? `/api/categories/${categoryId}/subcategories/${subcategoryId}/products/${product.id}`
            : `/api/categories/${categoryId}/subcategories/${subcategoryId}/products`,
          method: product ? "PATCH" : "POST",
          productId: product?.id || null,
          categoryId,
          subcategoryId
        }
      })

      form.setError("root", {
        message: "A apărut o eroare la comunicarea cu serverul. Verificați conexiunea și încercați din nou."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 bg-muted p-3 rounded-lg">
          <h3 className="font-semibold mb-1">Informații despre formular:</h3>
          <p className="text-sm mb-1">Câmpurile marcate cu <span className="text-destructive font-bold">*</span> sunt obligatorii.</p>
          <p className="text-sm">Restul câmpurilor sunt opționale și pot fi omise.</p>
        </div>

        {/* REQUIRED FIELDS */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-semibold text-primary">Informații de bază (obligatorii)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Cod Produs <span className="text-destructive font-bold">*</span></FormLabel>
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
                  <FormLabel className="font-medium">Nume <span className="text-destructive font-bold">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nume produs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descriere"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Descriere <span className="text-destructive font-bold">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descriere produs - minim 10 caractere"
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Preț <span className="text-destructive font-bold">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Stoc <span className="text-destructive font-bold">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel className="font-medium">Imagini <span className="text-destructive font-bold">*</span></FormLabel>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            <p className="text-xs text-muted-foreground">Adăugați cel puțin o imagine pentru produs.</p>
          </div>
        </div>

        {/* OPTIONAL FIELDS */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-semibold text-primary">Informații suplimentare (opționale)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pretRedus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preț Redus</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="culoare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culoare</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Negru, Alb, Albastru" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="greutate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greutate (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel>Dimensiuni</FormLabel>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="dimensiuni.lungime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Lungime (cm)"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensiuni.latime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Lățime (cm)"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensiuni.inaltime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Înălțime (cm)"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Specificații tehnice</FormLabel>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Nume categorie (ex: Generale)"
                value={newSpecCategory}
                onChange={(e) => setNewSpecCategory(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSpecificationCategory}
                disabled={!newSpecCategory}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {Object.keys(specifications).length > 0 && (
              <div className="space-y-3">
                <select
                  value={selectedSpecCategory}
                  onChange={(e) => setSelectedSpecCategory(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selectează categoria</option>
                  {Object.keys(specifications).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {selectedSpecCategory && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nume specificație"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Valoare"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSpecification}
                      disabled={!newSpecKey || !newSpecValue}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {Object.entries(specifications).map(([category, specs]) => (
                <div key={category} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSpecificationCategory(category)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <span className="text-muted-foreground">{key}</span>
                          <span>{value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpecification(category, key)}
                          className="h-5 w-5 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-x-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Se salvează..." : (product ? "Salvează modificările" : "Adaugă produsul")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
