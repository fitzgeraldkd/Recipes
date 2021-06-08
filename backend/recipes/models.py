from django.db import models

class Recipe(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name

class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='ingredients', default=None, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default="Ingredient")
    quantity = models.FloatField(blank=True)
    unit = models.CharField(blank=True, max_length=100)
    prepared = models.CharField(blank=True, max_length=100)
    optional = models.BooleanField(default=False)

    def __str__(self):
        return self.name