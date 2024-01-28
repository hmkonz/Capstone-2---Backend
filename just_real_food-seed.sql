
INSERT INTO users (id, email, first_name_billing, last_name_billing, billing_address, first_name_shipping, last_name_shipping, shipping_address, phone, password, stripe_customer_id)
VALUES ('1',
        'joel@joelburton.com',
        'Test',
        'User',
        '1000 Main Street Boston, MA 02215',
        'Test',
        'User',
        '1000 Main Street Boston, MA 02215',
        '515-555-1000',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'asdf123'),
        ('2',
        'violet@gmail.com',
         'Violet',
         'Konz',
         '3 Fader Place Marblehead MA 01945',
         'Violet',
         'Konz',
         '3 Fader Place Marblehead MA 01945',
         '617-794-9575',
         'qwerty',
         'asdf1234');


INSERT INTO admins (email, password)
VALUES ('hmkonz@yahoo.com',
        'qwerty'), 
        ('winston@gmail.com',
        NULL);


INSERT INTO orders(id, date, product_name, quantity, price, subtotal, payment_method, user_id)
VALUES ('1', 'January 17, 2024', 'Beef & Salmon', '2', '98.49', '196.98', 'Credit Card', '2'), ('2', 'January 17, 2024', 'Bison', '2', '98.49', '196.98', 'Credit Card', '2');


INSERT INTO products (id, name, ingredients, calorie_count, category, price, image_url1, image_url2, image_url3)
VALUES ('1', 'Beef & Salmon - Dog Food', 'Grass-raised beef, wild-caught salmon, grass-raised beef liver, flaxseed, grass-raised beef heart, organic carrots, organic cranberries, wild-caught whole ground krill, organic green peas, whole ground pumpkin seeds, organic spinach, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '369 kcal/cup', 'DogFood', '98.49', '/images/DogFood_BeefSalmon.jpg', '/images/Beef&SalmonActualIngredients.jpg', '/images/Beef&SalmonGuaranteedAnalysis.jpg'), ('2', 'Duck & Trout - Dog Food', 'Duck, grass-raised beef, grass-raised beef liver, flaxseed, lentils, trout, organic green beans, organic apples, wild-caught whole ground krill, whole ground pumpkin seeds, organic spinach, organic tumeric, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '322 kcal/cup', 'DogFood', '98.49','/images/DogFood_DuckTrout.jpg', '/images/Duck&TroutActualIngredients.jpg', '/images/Duck&TroutGuaranteedAnalysis.jpg'), ('3', 'Chicken & Turkey - Dog Food', 'Chicken, turkey, chicken hearts, flaxseed, sweet potato, chicken liver, organic carrots, wild-caught whole ground krill, whole ground pumpkin seeds, organic blueberries, organic spinach, organic cinnamon, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '349 kcal/cup', 'dog food', '98.49', '/images/DogFood_ChickenTurkey.jpg', '/images/Chicken&TurkeyActualIngredients.jpg', '/images/Chicken&TurkeyGuaranteedAnalysis.jpg'), ('4', 'Bison - Dog Food', 'Bison, bison liver, egg, flaxseed, organic green beans, organic spinach, organic pumpkin, whole ground krill, organic beets, coconut oil, whole ground eggshell, potassium salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), sage, guava', '367 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Bison.png', '/images/Just_Real_Food.png', '/images/BisonIngredients&GuaranteedAnalysis_.jpg'), ('5', 'Duck - Dog Food', 'Duck, duck neck, duck heart, flaxseed, organic squash, organic carrots, organic kale, whole ground krill, organic blueberries, chia seeds, organic tumeric, sea salt, cod liver oil, dried kelp, dried yeast, mixed tocopherols (natural preservative), black pepper, fennel, guava', '345 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Duck.png', '/images/Duck&TroutActualIngredients.jpg', '/images/Duck&TroutGuaranteedAnalysis.jpg'), ('6', 'Lamb - Dog Food', 'Lamb, lamb spleen, lamb heart, flaxseed, organic organic yams, organic spinach, whole ground krill, organic cranberries, pumpkin seeds, coconut oil, cod liver oil, whole ground eggshell, potassium salt, sea salt, dried yeast, dried kelp, mixed tocopherols (natural preservative), mint, guava', '374 kcal/cup', 'DogFood', '98.49', '/images/DogFood_Lamb.png', '/images/LambActualIngredients.jpg', '/images/LambGuaranteedAnalysis.jpg'), ('7', 'Whitefish & Duck - Cat Food', 'Wild-caught whitefish, duck, chicken liver, flaxseed, lentils, wild-caught whole ground krill, organic blueberries, ground pumpkin seeds, organic turmeric, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '301 kcal/cup', 'CatFood', '72.99', '/images/CatFood_WhitefishDuck.png', '/images/Screenshot3.png', NULL), ('8', 'Salmon & Chicken - Cat Food', 'Wild-caught salmon, chicken, chicken liver, flaxseed, chicken hearts, organic cranberries, wild-caught whole ground krill, ground pumpkin seeds, organic ginger, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '344 kcal/cup', 'CatFood', '72.99', '/images/CatFood_SalmonChicken.png', '/images/Screenshot2.png', NULL), ('9', 'Chicken & Turkey - Cat Food', 'Chicken, turkey, chicken liver, flaxseed, sweet potato, chicken hearts, ground pumpkin seeds, organic cinnamon, wild-caught whole ground krill, sea salt, dried kelp, dried yeast, mixed tocopherols (natural preservative)', '354 kcal/cup', 'CatFood', '72.99', '/images/CatFood_ChickenTurkey.png', '/images/Screenshot1.png', NULL);

INSERT INTO carts (id, product_name, product_quantity, product_price, user_id, product_id)
VALUES ('1', 'Beef&Salmon', '2', '98.49', '2', '1');




