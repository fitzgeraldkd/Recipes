from rest_framework import serializers
from .models import Ingredient, Recipe

#class IngredientSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = Ingredient
#        fields = '__all__'

class IngredientSerializer(serializers.ModelSerializer):
    # ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all())
    # ingredient_name = serializers.CharField(source="ingredient.name")

    class Meta:
        model = Ingredient
        fields = '__all__'

    #def get_ingredient(self, obj):
    #    qs = obj.ingredient.all()
    #    return IngredientSerializer(qs).data

class RecipeSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        # fields = '__all__'
        fields = ('id', 'name', 'ingredients')

    def get_ingredients(self, obj):
        qs = obj.ingredients.all()
        return IngredientSerializer(qs, many=True).data