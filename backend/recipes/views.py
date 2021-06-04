from django.shortcuts import render
from rest_framework import viewsets
from .serializers import RecipeSerializer, RecipeIngredientSerializer
from .models import Recipe, RecipeIngredient

class RecipeIngredientView(viewsets.ModelViewSet):
    serializer_class = RecipeIngredientSerializer
    queryset = RecipeIngredient.objects.all()

class RecipeView(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    queryset = Recipe.objects.all()
