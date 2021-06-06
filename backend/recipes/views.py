from django.shortcuts import render
from rest_framework import viewsets
from .serializers import RecipeSerializer, IngredientSerializer
from .models import Recipe, Ingredient

class IngredientView(viewsets.ModelViewSet):
    serializer_class = IngredientSerializer
    queryset = Ingredient.objects.all()

class RecipeView(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    queryset = Recipe.objects.all()
