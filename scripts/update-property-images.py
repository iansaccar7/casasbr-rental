#!/usr/bin/env python3
import json
import os
import random

# Lista de fotos reais disponíveis
real_photos = [
    "69JWlufpg3qD.jpg",
    "iZsRIm7mOCJL.jpg",
    "5pKw3R2TErZS.jpg",
    "CW5D73CRJKt0.jpg",
    "4jUbcBvhp6Ws.jpg",
    "G3haG1EqPP6r.jpg",
    "WTbX0Itd0OED.jpg",
    "dHGCaeBD4Ff0.jpg",
    "yLgBI34MFjhZ.jpeg",
    "L2W3oyvnyPtx.jpg",
    "tTHBLCiUFlBf.jpg",
    "hnqopdP7l855.jpeg",
    "SfBmT7ZzttsK.jpg",
    "JxxODTsInW3h.jpg",
    "KY3vuDTbLLMd.jpg",
    "AWchvO7feMYE.jpg",
]

# Carregar dados existentes
with open('/home/ubuntu/casasbr-rental/scripts/seed-data.json', 'r', encoding='utf-8') as f:
    properties = json.load(f)

# Atualizar cada propriedade com fotos reais
for i, prop in enumerate(properties):
    # Escolher uma foto principal aleatória
    main_photo = random.choice(real_photos)
    prop['mainImage'] = f"/properties/{main_photo}"
    
    # Escolher 3-5 fotos adicionais para a galeria
    num_gallery = random.randint(3, 5)
    gallery_photos = random.sample(real_photos, min(num_gallery, len(real_photos)))
    prop['images'] = [f"/properties/{photo}" for photo in gallery_photos]

# Salvar dados atualizados
with open('/home/ubuntu/casasbr-rental/scripts/seed-data.json', 'w', encoding='utf-8') as f:
    json.dump(properties, f, ensure_ascii=False, indent=2)

print(f"✅ Atualizadas {len(properties)} propriedades com fotos reais!")

