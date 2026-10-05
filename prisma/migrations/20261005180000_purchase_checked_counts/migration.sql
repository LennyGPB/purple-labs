-- Achats : cochée = compté dans le total, un nouvel article arrive décoché.
ALTER TABLE "Purchase" ALTER COLUMN "active" SET DEFAULT false;
