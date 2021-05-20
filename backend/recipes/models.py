from django.db import models

class Ingredient(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name

class Recipe(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):
    MEASUREMENTS = [
        ("Volume", (
                ("cup", "cups"),
                ("tbsp", "tbsp"),
                ("tsp", "tsp"),
            )
         ),
         ("Weight", (
                ("lb", "pounds"),
             )
         ),
    ]
    recipe = models.ForeignKey(Recipe, related_name='ingredients', default=None, on_delete=models.CASCADE)

    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField(blank=True)
    measurement = models.CharField(choices=MEASUREMENTS, blank=True, max_length=100)
    prepared = models.CharField(blank=True, max_length=100)
    optional = models.BooleanField(default=False)