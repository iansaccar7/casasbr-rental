import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home as HomeIcon, Shield, Star, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PropertyCard from "@/components/PropertyCard";
import Header from "@/components/Header";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProperties = trpc.properties.getFeatured.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation("/buscar");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Encontre a Casa dos Seus Sonhos
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Mais de 100 propriedades incríveis para alugar em todo o Brasil. 
              Conforto, segurança e os melhores preços.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por cidade, estado ou tipo de imóvel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                <Search className="h-5 w-5 mr-2" />
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <HomeIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Mais de 100 Propriedades</h3>
                <p className="text-muted-foreground">
                  Casas, apartamentos e chácaras em todo o Brasil
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Reserva Segura</h3>
                <p className="text-muted-foreground">
                  Sistema de pagamento protegido e garantia de qualidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Avaliações Verificadas</h3>
                <p className="text-muted-foreground">
                  Comentários reais de hóspedes que já se hospedaram
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Propriedades em Destaque</h2>
              <p className="text-muted-foreground">
                As melhores opções selecionadas especialmente para você
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/buscar")}>
              Ver Todas
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {featuredProperties.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : featuredProperties.data && featuredProperties.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.data.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma propriedade em destaque no momento.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Encontrar Seu Próximo Lar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece sua busca agora e descubra as melhores opções de aluguel
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/buscar")}>
            Explorar Propriedades
            <Search className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-primary" />
                CasasBR
              </h3>
              <p className="text-sm text-muted-foreground">
                A melhor plataforma de aluguel de imóveis do Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/buscar" className="text-muted-foreground hover:text-primary">
                    Buscar Imóveis
                  </a>
                </li>
                <li>
                  <a href="/buscar?featured=true" className="text-muted-foreground hover:text-primary">
                    Destaques
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 CasasBR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

