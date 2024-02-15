
INSERT INTO users (email, name, password, stripe_customer_id)
VALUES (
        'joel@joelburton.com',
        'Test User',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'asdf123'),
        (
        'violet@gmail.com',
         'Violet Konz',
         'qwerty',
         'asdf1234');


INSERT INTO admins (email, password)
VALUES ('hmkonz@yahoo.com',
        'qwerty'), 
        ('winston@gmail.com',
        NULL);



INSERT INTO products (id, name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3)
VALUES ('price_1OhYQuDDC8UyWYkqsAhwqhsz', 'Beef & Salmon', 'Grass-raised beef, wild-caught salmon, grass-raised beef liver, flaxseed, grass-raised beef heart, organic carrots, organic cranberries, wild-caught whole ground krill, organic green peas, whole ground pumpkin seeds, organic spinach, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '369 kcal/cup', 'DogFood', '98.49', '/images/DogFood_BeefSalmon.jpg', '/images/Beef&SalmonActualIngredients.jpg', '/images/Beef&SalmonGuaranteedAnalysis.jpg'), ('price_1OhYRmDDC8UyWYkq3ktrE7bQ', 'Duck & Trout', 'Duck, grass-raised beef, grass-raised beef liver, flaxseed, lentils, trout, organic green beans, organic apples, wild-caught whole ground krill, whole ground pumpkin seeds, organic spinach, organic tumeric, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '322 kcal/cup', 'DogFood', '98.49','/images/DogFood_DuckTrout.jpg', '/images/Duck&TroutActualIngredients.jpg', '/images/Duck&TroutGuaranteedAnalysis.jpg'), ('price_1OhYS8DDC8UyWYkq9owqgv54', 'Chicken & Turkey', 'Chicken, turkey, chicken hearts, flaxseed, sweet potato, chicken liver, organic carrots, wild-caught whole ground krill, whole ground pumpkin seeds, organic blueberries, organic spinach, organic cinnamon, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '349 kcal/cup', 'DogFood', '98.49', '/images/DogFood_ChickenTurkey.jpg', '/images/Chicken&TurkeyActualIngredients.jpg', '/images/Chicken&TurkeyGuaranteedAnalysis.jpg'), ('price_1OhYSTDDC8UyWYkqKm2Md4US', 'Bison', 'Bison, bison liver, egg, flaxseed, organic green beans, organic spinach, organic pumpkin, whole ground krill, organic beets, coconut oil, whole ground eggshell, potassium salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), sage, guava', '367 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Bison.png', '/images/Just_Real_Food.png', '/images/BisonIngredients&GuaranteedAnalysis_.jpg'), ('price_1OhYSkDDC8UyWYkqKCe3mfoQ', 'Duck', 'Duck, duck neck, duck heart, flaxseed, organic squash, organic carrots, organic kale, whole ground krill, organic blueberries, chia seeds, organic tumeric, sea salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), black pepper, fennel, guava', '345 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Duck.png', '/images/Duck&TroutActualIngredients.jpg', '/images/Duck&TroutGuaranteedAnalysis.jpg'), ('price_1OhYSzDDC8UyWYkqeVoGGNt5', 'Lamb', 'Lamb, lamb spleen, lamb heart, flaxseed, organic organic yams, organic spinach, whole ground krill, organic cranberries, pumpkin seeds, coconut oil, cod liver oil, whole ground eggshell, potassium salt, sea salt, dried yeast, dried kelp, mixed tocopherols (natural preservative), mint, guava', '374 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Lamb.png', '/images/LambActualIngredients.jpg', '/images/LambGuaranteedAnalysis.jpg'), ('price_1OhYTQDDC8UyWYkqZIOQ2v0t', 'Whitefish & Duck', 'Wild-caught whitefish, duck, chicken liver, flaxseed, lentils, wild-caught whole ground krill, organic blueberries, ground pumpkin seeds, organic turmeric, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '301 kcal/cup', 'CatFood', '72.99', '/images/CatFood_WhitefishDuck.png', '/images/Screenshot3.png', NULL), ('price_1OhYToDDC8UyWYkq0f9kVfWd', 'Salmon & Chicken', 'Wild-caught salmon, chicken, chicken liver, flaxseed, chicken hearts, organic cranberries, wild-caught whole ground krill, ground pumpkin seeds, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '344 kcal/cup', 'CatFood', '72.99', '/images/CatFood_SalmonChicken.png', '/images/Screenshot2.png', NULL), ('price_1OhYUADDC8UyWYkq5bI5SNGU', 'Chicken & Turkey', 'Chicken, turkey, chicken liver, flaxseed, sweet potato, chicken hearts, ground pumpkin seeds, organic cinnamon, wild-caught whole ground krill, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '354 kcal/cup', 'CatFood', '72.99', '/images/CatFood_ChickenTurkey.png', '/images/Screenshot1.png', NULL);





