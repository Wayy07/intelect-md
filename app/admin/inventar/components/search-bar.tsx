import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoriePrincipala, Subcategorie, Produs } from "@prisma/client"

interface SearchResult {
  id: string
  nume: string
  type: "category" | "subcategory" | "product"
  categoryId?: string
  subcategoryId?: string
  cod?: string
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const searchItems = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchItems, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setShowResults(false)
    setQuery("")

    switch (result.type) {
      case "category":
        router.push(`/admin/inventar/${result.id}`)
        break
      case "subcategory":
        router.push(`/admin/inventar/${result.categoryId}/${result.id}`)
        break
      case "product":
        router.push(
          `/admin/inventar/${result.categoryId}/${result.subcategoryId}?product=${result.id}`
        )
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Caută categorii, subcategorii sau produse..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-9 pr-4"
        />
      </div>

      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute mt-1 w-full rounded-md border bg-white shadow-lg z-50">
          <div className="max-h-[300px] overflow-auto py-1">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Se caută...</div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.nume}</span>
                    <span className="text-xs text-gray-500">
                      {result.type === "category" && "Categorie"}
                      {result.type === "subcategory" && "Subcategorie"}
                      {result.type === "product" && `Produs (${result.cod})`}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Nu s-au găsit rezultate
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
