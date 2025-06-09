import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

declare global {
  var prisma: any | undefined
}

type RawMaterialPayload = {
  total_cost: Prisma.Decimal
  total_weight: Prisma.Decimal
  cost_per_gram: Prisma.Decimal
}

type RecipePayload = {
  total_cost: Prisma.Decimal
  batch_size: Prisma.Decimal | null
  cost_per_unit: Prisma.Decimal | null
  original_batch_size: Prisma.Decimal | null
  total_packaging_cost: Prisma.Decimal
}

type PackagingItemPayload = {
  cost: Prisma.Decimal
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    result: {
      rawMaterial: {
        total_cost: {
          needs: { total_cost: true },
          compute(rawMaterial: RawMaterialPayload) {
            return rawMaterial.total_cost ? parseFloat(rawMaterial.total_cost.toString()) : 0;
          },
        },
        total_weight: {
          needs: { total_weight: true },
          compute(rawMaterial: RawMaterialPayload) {
            return rawMaterial.total_weight ? parseFloat(rawMaterial.total_weight.toString()) : 0;
          },
        },
        cost_per_gram: {
          needs: { cost_per_gram: true },
          compute(rawMaterial: RawMaterialPayload) {
            return rawMaterial.cost_per_gram ? parseFloat(rawMaterial.cost_per_gram.toString()) : 0;
          },
        },
      },
      recipes: {
        total_cost: {
          needs: { total_cost: true },
          compute(recipe: RecipePayload) {
            return recipe.total_cost ? parseFloat(recipe.total_cost.toString()) : 0;
          },
        },
        batch_size: {
          needs: { batch_size: true },
          compute(recipe: RecipePayload) {
            return recipe.batch_size ? parseFloat(recipe.batch_size.toString()) : 0;
          },
        },
        cost_per_unit: {
          needs: { cost_per_unit: true },
          compute(recipe: RecipePayload) {
            return recipe.cost_per_unit ? parseFloat(recipe.cost_per_unit.toString()) : 0;
          },
        },
        original_batch_size: {
          needs: { original_batch_size: true },
          compute(recipe: RecipePayload) {
            return recipe.original_batch_size ? parseFloat(recipe.original_batch_size.toString()) : 0;
          },
        },
        total_packaging_cost: {
          needs: { total_packaging_cost: true },
          compute(recipe: RecipePayload) {
            return recipe.total_packaging_cost ? parseFloat(recipe.total_packaging_cost.toString()) : 0;
          },
        },
      },
      packagingItem: {
        cost: {
          needs: { cost: true },
          compute(packagingItem: PackagingItemPayload) {
            return packagingItem.cost ? parseFloat(packagingItem.cost.toString()) : 0;
          },
        },
      },
    },
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Ensure the prisma client is properly closed when the Node.js process exits
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma }; 