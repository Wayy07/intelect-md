import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CategoriePrincipala } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Plus, X } from "lucide-react"
import Image from "next/image"

const categorySchema = z.object({
  nume: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  descriere: z.string().optional(),
  imagine: z.string().url("URL-ul imaginii nu este valid").optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: CategoriePrincipala
  onClose?: () => void
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(category?.imagine || null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nume: category?.nume || "",
      descriere: category?.descriere || "",
      imagine: category?.imagine || "",
    },
  })

  async function onSubmit(data: CategoryFormValues) {
    try {
      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories"

      const response = await fetch(url, {
        method: category ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Something went wrong")
      }

      router.refresh()
      if (onClose) onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleImagePreview = (url: string) => {
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume</FormLabel>
              <FormControl>
                <Input placeholder="Nume categorie" {...field} />
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
                  placeholder="Descriere categorie (opțional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagine</FormLabel>
              <div className="space-y-4">
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="URL imagine (opțional)"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleImagePreview(e.target.value)
                      }}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          field.onChange("")
                          setImagePreview(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </FormControl>
                {imagePreview ? (
                  <div className="relative aspect-square w-32 overflow-hidden rounded-lg border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-32 items-center justify-center rounded-lg border border-dashed">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-x-2">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
          )}
          <Button type="submit">
            {category ? "Salvează modificările" : "Adaugă categoria"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
