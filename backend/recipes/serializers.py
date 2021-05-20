from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeIngredient

class IngredientSerializer(serializers.ModelSerializer):
   #  ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all())
    ingredient = serializers.CharField(source="ingredient.name")

    class Meta:
        model = RecipeIngredient
        fields = '__all__'
        # fields = ('id', 'ingredient')

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        # fields = '__all__'
        fields = ('id', 'name', 'ingredients')

    def get_ingredients(self, obj):
        qs = obj.ingredients.all()
        return IngredientSerializer(qs, many=True, read_only=True).data