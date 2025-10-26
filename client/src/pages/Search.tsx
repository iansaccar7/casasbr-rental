import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const estados = [
  "SP", "RJ", "MG", "BA", "PR", "RS", "PE", "CE", "PA", "SC", "GO", "MA", "AM", "ES", "PB"
];

const tiposPropriedade = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "kitnet", label: "Kitnet" },
  { value: "sobrado", label: "Sobrado" },
  { value: "chacara", label: "Chácara" },
];

export default function Search() {
  const searchParams = useSearch();
  const queryParam = new URLSearchParams(searchParams).get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 100000,
    bedrooms: 0,
    maxGuests: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  const propertiesQuery = trpc.properties.list.useQuery({
    city: filters.city || undefined,
    state: filters.state && filters.state !== "todos" ? filters.state : undefined,
    propertyType: filters.propertyType && filters.propertyType !== "todos" ? (filters.propertyType as "casa" | "apartamento" | "kitnet" | "sobrado" | "chacara") : undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    bedrooms: filters.bedrooms || undefined,
    maxGuests: filters.maxGuests || undefined,
    limit: 50,
  });

  const searchResults = trpc.properties.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const properties = searchQuery ? searchResults.data : propertiesQuery.data;
  const isLoading = searchQuery ? searchResults.isLoading : propertiesQuery.isLoading;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      state: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 100000,
      bedrooms: 0,
      maxGuests: 0,
    });
    setSearchQuery("");
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search">Buscar</Label>
        <div className="relative mt-2">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Cidade, estado ou tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          type="text"
          placeholder="Ex: São Paulo"
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="state">Estado</Label>
        <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {estados.map((estado) => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyType">Tipo de Imóvel</Label>
        <Select
          value={filters.propertyType}
          onValueChange={(value) => handleFilterChange("propertyType", value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {tiposPropriedade.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Preço por Noite (R$)</Label>
        <div className="mt-4 px-2">
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => {
              handleFilterChange("minPrice", min);
              handleFilterChange("maxPrice", max);
            }}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>R$ {(filters.minPrice / 100).toFixed(0)}</span>
            <span>R$ {(filters.maxPrice / 100).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="bedrooms">Quartos Mínimos</Label>
        <Select
          value={filters.bedrooms.toString()}
          onValueChange={(value) => handleFilterChange("bedrooms", parseInt(value))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Qualquer</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="maxGuests">Hóspedes Mínimos</Label>
        <Select
          value={filters.maxGuests.toString()}
          onValueChange={(value) => handleFilterChange("maxGuests", parseInt(value))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Qualquer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Qualquer</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="6">6+</SelectItem>
            <SelectItem value="8">8+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        <X className="h-4 w-4 mr-2" />
        Limpar Filtros
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Buscar Propriedades</h1>
            <p className="text-muted-foreground">
              {properties ? `${properties.length} propriedades encontradas` : "Carregando..."}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-6 flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filtros
                </h2>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-64 bg-muted animate-pulse" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma propriedade encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

