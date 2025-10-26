import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Users, CreditCard, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Booking } from "../../../drizzle/schema";

export default function MyBookings() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const bookings = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateStatus = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Reserva cancelada com sucesso!");
      bookings.refetch();
      setCancelDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePayment = trpc.bookings.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Pagamento processado com sucesso!");
      bookings.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      updateStatus.mutate({
        id: selectedBooking.id,
        status: "cancelado",
      });
    }
  };

  const handlePayment = (bookingId: number) => {
    // Simulação de pagamento
    updatePayment.mutate({
      id: bookingId,
      paymentStatus: "pago",
      paymentMethod: "Cartão de Crédito",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pendente: { variant: "secondary", label: "Pendente" },
      confirmado: { variant: "default", label: "Confirmado" },
      cancelado: { variant: "destructive", label: "Cancelado" },
      concluido: { variant: "outline", label: "Concluído" },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pendente: { variant: "secondary", label: "Pagamento Pendente" },
      pago: { variant: "default", label: "Pago" },
      reembolsado: { variant: "outline", label: "Reembolsado" },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterBookings = (status?: string) => {
    if (!bookings.data) return [];
    if (!status) return bookings.data;
    return bookings.data.filter((b) => b.status === status);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = booking.totalPrice / 100;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg mb-2">Reserva #{booking.id}</CardTitle>
              <div className="flex items-center space-x-2">
                {getStatusBadge(booking.status)}
                {getPaymentBadge(booking.paymentStatus)}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`/propriedade/${booking.propertyId}`}>
                Ver Propriedade
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Check-in</p>
                <p className="text-sm text-muted-foreground">
                  {checkIn.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Check-out</p>
                <p className="text-sm text-muted-foreground">
                  {checkOut.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Hóspedes</p>
                <p className="text-sm text-muted-foreground">{booking.guests} pessoa(s)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Total</p>
                <p className="text-sm text-muted-foreground">
                  R$ {totalPrice.toFixed(2)} ({nights} noite{nights > 1 ? "s" : ""})
                </p>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-1">Pedidos Especiais</p>
              <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4 border-t">
            {booking.status === "pendente" && booking.paymentStatus === "pendente" && (
              <>
                <Button onClick={() => handlePayment(booking.id)} className="flex-1">
                  Pagar Agora
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCancelBooking(booking)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </>
            )}
            {booking.status === "confirmado" && checkIn > new Date() && (
              <Button
                variant="outline"
                onClick={() => handleCancelBooking(booking)}
                className="flex-1"
              >
                Cancelar Reserva
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Reservas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas reservas em um só lugar</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Todas ({bookings.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pendente">
              Pendentes ({filterBookings("pendente").length})
            </TabsTrigger>
            <TabsTrigger value="confirmado">
              Confirmadas ({filterBookings("confirmado").length})
            </TabsTrigger>
            <TabsTrigger value="concluido">
              Concluídas ({filterBookings("concluido").length})
            </TabsTrigger>
            <TabsTrigger value="cancelado">
              Canceladas ({filterBookings("cancelado").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bookings.data && bookings.data.length > 0 ? (
              bookings.data.map((booking) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma reserva encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não fez nenhuma reserva. Explore nossas propriedades!
                  </p>
                  <Button asChild>
                    <Link href="/buscar">
                      <a>Buscar Propriedades</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {["pendente", "confirmado", "concluido", "cancelado"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterBookings(status).length > 0 ? (
                filterBookings(status).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma reserva {status === "pendente" ? "pendente" : status === "confirmado" ? "confirmada" : status === "concluido" ? "concluída" : "cancelada"}.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

