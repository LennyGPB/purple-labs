-- Budget : une seule signification pour la case, partout. done = « c'est fait »
-- (abonnement payé, achat acheté, salaire reçu). Remplace "active", dont le sens variait.

ALTER TABLE "Subscription" ADD COLUMN "done" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Purchase" ADD COLUMN "done" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Salary" ADD COLUMN "done" BOOLEAN NOT NULL DEFAULT false;

-- Conserve l'état des cases : pour les abonnements, une case cochée correspondait à active = false.
UPDATE "Subscription" SET "done" = NOT "active";
UPDATE "Purchase" SET "done" = "active";
UPDATE "Salary" SET "done" = "active";

ALTER TABLE "Subscription" DROP COLUMN "active";
ALTER TABLE "Purchase" DROP COLUMN "active";
ALTER TABLE "Salary" DROP COLUMN "active";
