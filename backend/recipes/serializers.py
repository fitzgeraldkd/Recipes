from rest_framework import serializers
from .models import Ingredient, Recipe, RecipeIngredient

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class RecipeIngredientSerializer(serializers.ModelSerializer):
    # ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all())
    ingredient_name = serializers.CharField(source="ingredient.name")

    class Meta:
        model = RecipeIngredient
        fields = '__all__'
        #fields = ('id', 'ingredient')
        read_only_fields = ['ingredient_name']

    def get_ingredient(self, obj):
        qs = obj.ingredient.all()
        return IngredientSerializer(qs).data

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        # fields = '__all__'
        fields = ('id', 'name', 'ingredients')

    def get_ingredients(self, obj):
        qs = obj.ingredients.all()
        return RecipeIngredientSerializer(qs, many=True).data