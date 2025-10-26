import { useState } from "react";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  BedDouble,
  Bath,
  Users,
  Star,
  Heart,
  Share2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function PropertyDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const propertyId = parseInt(params.id as string);
  const { isAuthenticated } = useAuth();

  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const property = trpc.properties.getById.useQuery({ id: propertyId });
  const reviews = trpc.reviews.getByProperty.useQuery({ propertyId });
  const checkFavorite = trpc.favorites.check.useQuery(
    { propertyId },
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

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Reserva criada com sucesso!");
      setLocation("/reservas");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (checkFavorite.data?.isFavorite) {
      removeFavorite.mutate({ propertyId });
    } else {
      addFavorite.mutate({ propertyId });
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Selecione as datas de check-in e check-out");
      return;
    }

    if (!property.data) return;

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.data.pricePerNight;

    createBooking.mutate({
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      specialRequests: specialRequests || undefined,
    });
  };

  if (property.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!property.data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Propriedade não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                A propriedade que você está procurando não existe ou foi removida.
              </p>
              <Button onClick={() => setLocation("/buscar")}>Voltar para Busca</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const prop = property.data;
  const images = JSON.parse(prop.images || '[]');
  const amenities = JSON.parse(prop.amenities || '[]');
  const pricePerNight = prop.pricePerNight / 100;
  const rating = (prop.rating || 0) / 100;

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  };

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <Button variant="ghost" onClick={() => setLocation("/buscar")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3">
            <img
              src={images[selectedImage]}
              alt={prop.title}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
            {images.slice(0, 4).map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`${prop.title} - ${idx + 1}`}
                className={`w-full h-20 lg:h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                  selectedImage === idx ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{prop.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {prop.address}, {prop.city} - {prop.state}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handleFavoriteClick}>
                    <Heart
                      className={`h-5 w-5 ${
                        checkFavorite.data?.isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="capitalize">
                  {prop.propertyType}
                </Badge>
                {prop.featured && <Badge className="bg-primary">Destaque</Badge>}
                {prop.reviewCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({prop.reviewCount} avaliações)</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Property Features */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{prop.bedrooms}</p>
                    <p className="text-sm text-muted-foreground">Quartos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{prop.bathrooms}</p>
                    <p className="text-sm text-muted-foreground">Banheiros</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{prop.maxGuests}</p>
                    <p className="text-sm text-muted-foreground">Hóspedes</p>
                  </div>
                </div>
                {prop.area && (
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium">{prop.area}m²</p>
                      <p className="text-sm text-muted-foreground">Área</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Comodidades</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Avaliações</h2>
              {reviews.data && reviews.data.length > 0 ? (
                <div className="space-y-4">
                  {reviews.data.slice(0, 3).map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary">R$ {pricePerNight.toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground ml-2">/ noite</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Check-in</Label>
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mt-2"
                  />
                </div>

                <div>
                  <Label>Check-out</Label>
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => !checkIn || date <= checkIn}
                    className="rounded-md border mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="guests">Número de Hóspedes</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={prop.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Pedidos Especiais (Opcional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Alguma solicitação especial?"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {checkIn && checkOut && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>R$ {pricePerNight.toFixed(0)} x {nights} noites</span>
                      <span>R$ {(pricePerNight * nights).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut || createBooking.isPending}
                >
                  {createBooking.isPending ? "Processando..." : "Reservar Agora"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Você não será cobrado ainda
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

