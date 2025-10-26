import { useEffect, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Property } from "../../../drizzle/schema";

export default function Favorites() {
  const { isAuthenticated, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);

  const favorites = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    if (favorites.data && favorites.data.length > 0) {
      // Buscar detalhes das propriedades favoritas
      const fetchProperties = async () => {
        const props: Property[] = [];
        for (const fav of favorites.data) {
          try {
            const prop = await utils.properties.getById.fetch({ id: fav.propertyId });
            if (prop) {
              props.push(prop);
            }
          } catch (error) {
            console.error("Error fetching property:", error);
          }
        }
        setProperties(props);
      };
      fetchProperties();
    } else {
      setProperties([]);
    }
  }, [favorites.data, utils]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Heart className="h-8 w-8 mr-3 text-primary" />
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground">
            {properties.length > 0
              ? `${properties.length} propriedade${properties.length > 1 ? "s" : ""} salva${properties.length > 1 ? "s" : ""}`
              : "Nenhuma propriedade favoritada ainda"}
          </p>
        </div>

        {favorites.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-xl mb-2">Nenhum favorito ainda</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Explore nossas propriedades incríveis e adicione suas favoritas clicando no ícone de
                coração.
              </p>
              <Button asChild size="lg">
                <Link href="/buscar">
                  <a className="inline-flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Explorar Propriedades
                  </a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

