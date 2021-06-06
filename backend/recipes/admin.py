from django.contrib import admin
from .models import Ingredient, Recipe

class IngredientInline(admin.TabularInline):
    model = Ingredient

class IngredientAdmin(admin.ModelAdmin):
    pass

class RecipeAdmin(admin.ModelAdmin):
    inlines = [IngredientInline]

#admin.site.register(Ingredient, IngredientAdmin)
admin.site.register(Recipe, RecipeAdmin)
