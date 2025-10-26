import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          ...input,
        });
        return { success: true };
      }),
  }),

  properties: router({
    list: publicProcedure
      .input(z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        propertyType: z.enum(["casa", "apartamento", "kitnet", "sobrado", "chacara"]).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        bedrooms: z.number().optional(),
        maxGuests: z.number().optional(),
        featured: z.boolean().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getAllProperties(input);
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.searchProperties(input.query);
      }),

    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        const property = await db.getPropertyById(input.id);
        if (!property) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Propriedade não encontrada",
          });
        }
        return property;
      }),

    getFeatured: publicProcedure.query(async () => {
      return await db.getAllProperties({ featured: true, limit: 8 });
    }),

    myProperties: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPropertiesByOwner(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        propertyType: z.enum(["casa", "apartamento", "kitnet", "sobrado", "chacara"]),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        pricePerNight: z.number(),
        bedrooms: z.number(),
        bathrooms: z.number(),
        maxGuests: z.number(),
        area: z.number().optional(),
        amenities: z.string(),
        images: z.string(),
        mainImage: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createProperty({
          ...input,
          ownerId: ctx.user.id,
          status: "disponivel",
          featured: false,
          rating: 0,
          reviewCount: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        pricePerNight: z.number().optional(),
        status: z.enum(["disponivel", "ocupado", "manutencao"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const property = await db.getPropertyById(input.id);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Propriedade não encontrada" });
        }
        if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }

        const { id, ...updates } = input;
        await db.updateProperty(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const property = await db.getPropertyById(input.id);
        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Propriedade não encontrada" });
        }
        if (property.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }

        await db.deleteProperty(input.id);
        return { success: true };
      }),
  }),

  bookings: router({
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        checkIn: z.date(),
        checkOut: z.date(),
        guests: z.number(),
        totalPrice: z.number(),
        specialRequests: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar disponibilidade
        const isAvailable = await db.checkPropertyAvailability(
          input.propertyId,
          input.checkIn,
          input.checkOut
        );

        if (!isAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Propriedade não disponível para as datas selecionadas",
          });
        }

        return await db.createBooking({
          ...input,
          userId: ctx.user.id,
          status: "pendente",
          paymentStatus: "pendente",
        });
      }),

    myBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBookingsByUser(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reserva não encontrada" });
        }
        if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return booking;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "confirmado", "cancelado", "concluido"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reserva não encontrada" });
        }
        if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }

        await db.updateBooking(input.id, { status: input.status });
        return { success: true };
      }),

    updatePaymentStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        paymentStatus: z.enum(["pendente", "pago", "reembolsado"]),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Reserva não encontrada" });
        }
        if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }

        await db.updateBooking(input.id, {
          paymentStatus: input.paymentStatus,
          paymentMethod: input.paymentMethod,
        });
        return { success: true };
      }),

    checkAvailability: publicProcedure
      .input(z.object({
        propertyId: z.number(),
        checkIn: z.date(),
        checkOut: z.date(),
      }))
      .query(async ({ input }) => {
        const isAvailable = await db.checkPropertyAvailability(
          input.propertyId,
          input.checkIn,
          input.checkOut
        );
        return { available: isAvailable };
      }),
  }),

  reviews: router({
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        bookingId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        cleanliness: z.number().min(1).max(5).optional(),
        accuracy: z.number().min(1).max(5).optional(),
        communication: z.number().min(1).max(5).optional(),
        location: z.number().min(1).max(5).optional(),
        value: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createReview({
          ...input,
          userId: ctx.user.id,
        });
      }),

    getByProperty: publicProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReviewsByProperty(input.propertyId);
      }),

    myReviews: protectedProcedure.query(async ({ ctx }) => {
      return await db.getReviewsByUser(ctx.user.id);
    }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFavoritesByUser(ctx.user.id);
    }),

    check: protectedProcedure
      .input(z.object({ propertyId: z.number() }))
      .query(async ({ ctx, input }) => {
        const isFav = await db.isFavorite(ctx.user.id, input.propertyId);
        return { isFavorite: isFav };
      }),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        propertyId: z.number().optional(),
        subject: z.string().optional(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createMessage({
          ...input,
          senderId: ctx.user.id,
          isRead: false,
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMessagesByUser(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.messageId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

