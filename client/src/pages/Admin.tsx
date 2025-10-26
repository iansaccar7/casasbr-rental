import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Calendar,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  DollarSign,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"disponivel" | "ocupado" | "manutencao">("disponivel");

  const myProperties = trpc.properties.myProperties.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const allProperties = trpc.properties.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const deleteProperty = trpc.properties.delete.useMutation({
    onSuccess: () => {
      toast.success("Propriedade excluída com sucesso!");
      myProperties.refetch();
      allProperties.refetch();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProperty = trpc.properties.update.useMutation({
    onSuccess: () => {
      toast.success("Propriedade atualizada com sucesso!");
      myProperties.refetch();
      allProperties.refetch();
      setEditDialogOpen(false);
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

  if (!isAuthenticated || user?.role !== "admin") {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-4">
                Você não tem permissão para acessar esta página.
              </p>
              <Button asChild>
                <a href="/">Voltar para Início</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDeleteClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (propertyId: number, currentStatus: string) => {
    setSelectedPropertyId(propertyId);
    setEditStatus(currentStatus as "disponivel" | "ocupado" | "manutencao");
    setEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPropertyId) {
      deleteProperty.mutate({ id: selectedPropertyId });
    }
  };

  const confirmEdit = () => {
    if (selectedPropertyId) {
      updateProperty.mutate({
        id: selectedPropertyId,
        status: editStatus,
      });
    }
  };

  const totalProperties = allProperties.data?.length || 0;
  const availableProperties = allProperties.data?.filter((p) => p.status === "disponivel").length || 0;
  const totalRevenue = allProperties.data?.reduce((sum, p) => sum + (p.pricePerNight * (p.reviewCount || 1)), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie propriedades, reservas e usuários</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Propriedades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {availableProperties} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Minhas Propriedades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProperties.data?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Propriedades cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalRevenue / 100).toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Baseado em reservas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalProperties > 0 ? Math.round((availableProperties / totalProperties) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Propriedades disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Todas as Propriedades</TabsTrigger>
            <TabsTrigger value="my-properties">Minhas Propriedades</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Propriedades</CardTitle>
              </CardHeader>
              <CardContent>
                {allProperties.isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : allProperties.data && allProperties.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Preço/Noite</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Avaliações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allProperties.data.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.id}</TableCell>
                            <TableCell className="max-w-xs truncate">{property.title}</TableCell>
                            <TableCell>{property.city}, {property.state}</TableCell>
                            <TableCell className="capitalize">{property.propertyType}</TableCell>
                            <TableCell>R$ {(property.pricePerNight / 100).toFixed(0)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  property.status === "disponivel"
                                    ? "default"
                                    : property.status === "ocupado"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="capitalize"
                              >
                                {property.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {property.reviewCount > 0 ? (
                                <span>
                                  {((property.rating || 0) / 100).toFixed(1)} ({property.reviewCount})
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Sem avaliações</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`/propriedade/${property.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(property.id, property.status)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(property.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma propriedade encontrada.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-properties">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Propriedades</CardTitle>
              </CardHeader>
              <CardContent>
                {myProperties.isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : myProperties.data && myProperties.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Cidade</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Preço/Noite</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myProperties.data.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.id}</TableCell>
                            <TableCell className="max-w-xs truncate">{property.title}</TableCell>
                            <TableCell>{property.city}, {property.state}</TableCell>
                            <TableCell className="capitalize">{property.propertyType}</TableCell>
                            <TableCell>R$ {(property.pricePerNight / 100).toFixed(0)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  property.status === "disponivel"
                                    ? "default"
                                    : property.status === "ocupado"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="capitalize"
                              >
                                {property.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={`/propriedade/${property.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(property.id, property.status)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(property.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não cadastrou nenhuma propriedade.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Propriedade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta propriedade? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProperty.isPending}
            >
              {deleteProperty.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Status da Propriedade</DialogTitle>
            <DialogDescription>
              Altere o status da disponibilidade da propriedade.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="status">Status</Label>
            <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmEdit} disabled={updateProperty.isPending}>
              {updateProperty.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

