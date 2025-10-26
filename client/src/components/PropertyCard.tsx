import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Users, BedDouble, Star } from "lucide-react";
import { Property } from "../../../drizzle/schema";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const checkFavorite = trpc.favorites.check.useQuery(
    { propertyId: property.id },
    { enabled: isAuthenticated }
  );

  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Adicionado aos favoritos!");
      checkFavorite.refetch();
    },
  });

  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removido dos favoritos!");
      checkFavorite.refetch();
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Faça login para adicionar aos favoritos");
      return;
    }

    if (checkFavorite.data?.isFavorite) {
      removeFavorite.mutate({ propertyId: property.id });
    } else {
      addFavorite.mutate({ propertyId: property.id });
    }
  };

  const pricePerNight = property.pricePerNight / 100;
  const rating = (property.rating || 0) / 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <a href={`/propriedade/${property.id}`} className="block relative">
          <div className="relative h-64 overflow-hidden">
            <img
              src={property.mainImage}
              alt={property.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {property.featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                Destaque
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={`h-5 w-5 ${
                  checkFavorite.data?.isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
            </Button>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
              {property.reviewCount > 0 && (
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">
                {property.city}, {property.state}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <BedDouble className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} quartos</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{property.maxGuests} hóspedes</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">
                  R$ {pricePerNight.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">/ noite</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {property.propertyType}
              </Badge>
            </div>
          </CardContent>
      </a>
    </Card>
  );
}

