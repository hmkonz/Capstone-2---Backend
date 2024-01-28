\echo 'Delete and recreate just_real_food db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE just_real_food;
CREATE DATABASE just_real_food;
\connect just_real_food

\i just_real_food-schema.sql
\i just_real_food-seed.sql

\echo 'Delete and recreate just_real_food_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE just_real_food_test;
CREATE DATABASE just_real_food_test;
\connect just_real_food_test

\i just_real_food-schema.sql
