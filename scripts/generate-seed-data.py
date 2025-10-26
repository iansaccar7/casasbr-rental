#!/usr/bin/env python3
import json
import random
from datetime import datetime, timedelta

# Estados brasileiros
estados = [
    {"nome": "São Paulo", "sigla": "SP"},
    {"nome": "Rio de Janeiro", "sigla": "RJ"},
    {"nome": "Minas Gerais", "sigla": "MG"},
    {"nome": "Bahia", "sigla": "BA"},
    {"nome": "Paraná", "sigla": "PR"},
    {"nome": "Rio Grande do Sul", "sigla": "RS"},
    {"nome": "Pernambuco", "sigla": "PE"},
    {"nome": "Ceará", "sigla": "CE"},
    {"nome": "Pará", "sigla": "PA"},
    {"nome": "Santa Catarina", "sigla": "SC"},
    {"nome": "Goiás", "sigla": "GO"},
    {"nome": "Maranhão", "sigla": "MA"},
    {"nome": "Amazonas", "sigla": "AM"},
    {"nome": "Espírito Santo", "sigla": "ES"},
    {"nome": "Paraíba", "sigla": "PB"},
]

# Cidades por estado
cidades = {
    "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba", "São José dos Campos"],
    "RJ": ["Rio de Janeiro", "Niterói", "Petrópolis", "Cabo Frio", "Angra dos Reis", "Búzios"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Ouro Preto", "Tiradentes"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Porto Seguro", "Ilhéus"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Foz do Iguaçu", "Cascavel"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canela", "Gramado", "Santa Maria"],
    "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Porto de Galinhas", "Fernando de Noronha"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Jericoacoara", "Canoa Quebrada"],
    "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Alter do Chão", "Salinópolis"],
    "SC": ["Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Itajaí", "Chapecó"],
    "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Caldas Novas", "Pirenópolis"],
    "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Barreirinhas", "Carolina"],
    "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Presidente Figueiredo", "Novo Airão"],
    "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Guarapari", "Domingos Martins"],
    "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Cabedelo", "Bayeux"],
}

# Tipos de propriedades
tipos_propriedade = ["casa", "apartamento", "kitnet", "sobrado", "chacara"]

# Comodidades possíveis
comodidades_disponiveis = [
    "WiFi", "TV", "Ar Condicionado", "Cozinha", "Estacionamento", "Piscina",
    "Academia", "Churrasqueira", "Varanda", "Jardim", "Lavanderia", "Segurança 24h",
    "Portaria", "Elevador", "Área de Serviço", "Pets Permitidos", "Aquecimento",
    "Lareira", "Vista para o Mar", "Vista para a Montanha"
]

# Nomes de ruas brasileiras
ruas = [
    "Rua das Flores", "Avenida Paulista", "Rua XV de Novembro", "Avenida Atlântica",
    "Rua da Praia", "Avenida Brasil", "Rua do Comércio", "Rua das Palmeiras",
    "Avenida Beira Mar", "Rua dos Coqueiros", "Rua Principal", "Avenida Central",
    "Rua das Acácias", "Rua do Sol", "Avenida das Américas", "Rua da Paz"
]

# Adjetivos para títulos
adjetivos = [
    "Aconchegante", "Moderna", "Espaçosa", "Luxuosa", "Charmosa", "Confortável",
    "Elegante", "Sofisticada", "Ampla", "Iluminada", "Tranquila", "Privilegiada",
    "Exclusiva", "Requintada", "Encantadora", "Deslumbrante"
]

# Descrições base
descricoes_base = [
    "Propriedade ideal para quem busca conforto e praticidade. Localização privilegiada com fácil acesso a comércio, restaurantes e transporte público.",
    "Imóvel completamente equipado e decorado com muito bom gosto. Perfeito para famílias ou grupos de amigos que desejam aproveitar a cidade.",
    "Espaço acolhedor e bem iluminado, com todos os itens necessários para uma estadia agradável. Ótima localização próxima aos principais pontos turísticos.",
    "Propriedade recém reformada com acabamentos de primeira qualidade. Ambiente tranquilo e seguro, ideal para relaxar após um dia de passeios.",
    "Imóvel amplo e confortável, perfeito para quem busca privacidade e comodidade. Área externa agradável para momentos de lazer."
]

def gerar_propriedades(quantidade=120):
    propriedades = []
    
    for i in range(1, quantidade + 1):
        # Selecionar estado e cidade
        estado = random.choice(estados)
        cidade = random.choice(cidades[estado["sigla"]])
        
        # Tipo de propriedade
        tipo = random.choice(tipos_propriedade)
        
        # Características baseadas no tipo
        if tipo == "kitnet":
            quartos = 1
            banheiros = 1
            hospedes = random.randint(1, 2)
            area = random.randint(25, 45)
        elif tipo == "apartamento":
            quartos = random.randint(1, 3)
            banheiros = random.randint(1, 2)
            hospedes = quartos * 2
            area = random.randint(45, 120)
        elif tipo == "casa":
            quartos = random.randint(2, 4)
            banheiros = random.randint(2, 3)
            hospedes = quartos * 2
            area = random.randint(80, 200)
        elif tipo == "sobrado":
            quartos = random.randint(3, 5)
            banheiros = random.randint(2, 4)
            hospedes = quartos * 2
            area = random.randint(150, 300)
        else:  # chacara
            quartos = random.randint(3, 6)
            banheiros = random.randint(2, 4)
            hospedes = random.randint(8, 15)
            area = random.randint(500, 2000)
        
        # Preço baseado no tipo e localização
        base_price = {
            "kitnet": 80,
            "apartamento": 150,
            "casa": 250,
            "sobrado": 400,
            "chacara": 600
        }
        
        # Multiplicador por estado (capitais mais caras)
        multiplicador_estado = 1.0
        if estado["sigla"] in ["SP", "RJ"]:
            multiplicador_estado = 1.5
        elif estado["sigla"] in ["SC", "PR", "RS"]:
            multiplicador_estado = 1.3
        
        preco_por_noite = int(base_price[tipo] * multiplicador_estado * random.uniform(0.8, 1.5) * 100)
        
        # Comodidades (mais comodidades para propriedades maiores)
        num_comodidades = random.randint(5, min(15, 5 + quartos * 2))
        comodidades = random.sample(comodidades_disponiveis, num_comodidades)
        
        # Gerar URLs de imagens (usando placeholder)
        num_imagens = random.randint(4, 8)
        imagens = [f"https://picsum.photos/seed/{i}-{j}/800/600" for j in range(num_imagens)]
        
        # Título
        adjetivo = random.choice(adjetivos)
        titulo = f"{adjetivo} {tipo.capitalize()} em {cidade}"
        
        # Descrição
        descricao = random.choice(descricoes_base)
        descricao += f" A propriedade conta com {quartos} quarto(s), {banheiros} banheiro(s) e pode acomodar até {hospedes} hóspedes confortavelmente."
        
        # Endereço
        rua = random.choice(ruas)
        numero = random.randint(10, 9999)
        cep = f"{random.randint(10000, 99999)}-{random.randint(100, 999)}"
        
        # Rating (80% das propriedades têm avaliações)
        tem_avaliacoes = random.random() < 0.8
        if tem_avaliacoes:
            rating = random.randint(350, 500)  # 3.5 a 5.0
            review_count = random.randint(1, 50)
        else:
            rating = 0
            review_count = 0
        
        # Featured (20% são destaque)
        featured = random.random() < 0.2
        
        propriedade = {
            "title": titulo,
            "description": descricao,
            "propertyType": tipo,
            "address": f"{rua}, {numero}",
            "city": cidade,
            "state": estado["sigla"],
            "zipCode": cep,
            "latitude": str(random.uniform(-33.0, 5.0)),
            "longitude": str(random.uniform(-73.0, -34.0)),
            "pricePerNight": preco_por_noite,
            "bedrooms": quartos,
            "bathrooms": banheiros,
            "maxGuests": hospedes,
            "area": area,
            "amenities": json.dumps(comodidades),
            "images": json.dumps(imagens),
            "mainImage": imagens[0],
            "ownerId": 1,  # Admin user
            "status": "disponivel",
            "featured": featured,
            "rating": rating,
            "reviewCount": review_count
        }
        
        propriedades.append(propriedade)
    
    return propriedades

# Gerar as propriedades
propriedades = gerar_propriedades(120)

# Salvar em arquivo JSON
with open('/home/ubuntu/casasbr-rental/scripts/seed-data.json', 'w', encoding='utf-8') as f:
    json.dump(propriedades, f, ensure_ascii=False, indent=2)

print(f"✓ Geradas {len(propriedades)} propriedades")
print(f"✓ Arquivo salvo em: /home/ubuntu/casasbr-rental/scripts/seed-data.json")

