import { and, desc, eq, gte, lte, or, sql, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, properties, bookings, reviews, favorites, messages, InsertProperty, InsertBooking, InsertReview, InsertFavorite, InsertMessage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== PROPERTIES =====

export async function getAllProperties(filters?: {
  city?: string;
  state?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  maxGuests?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  
  if (filters?.city) {
    conditions.push(like(properties.city, `%${filters.city}%`));
  }
  if (filters?.state) {
    conditions.push(eq(properties.state, filters.state));
  }
  if (filters?.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters?.minPrice !== undefined) {
    conditions.push(gte(properties.pricePerNight, filters.minPrice));
  }
  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(properties.pricePerNight, filters.maxPrice));
  }
  if (filters?.bedrooms !== undefined) {
    conditions.push(gte(properties.bedrooms, filters.bedrooms));
  }
  if (filters?.maxGuests !== undefined) {
    conditions.push(gte(properties.maxGuests, filters.maxGuests));
  }
  if (filters?.featured !== undefined) {
    conditions.push(eq(properties.featured, filters.featured));
  }

  let query = db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.featured), desc(properties.rating));

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchProperties(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(properties).where(
    or(
      like(properties.title, `%${searchTerm}%`),
      like(properties.city, `%${searchTerm}%`),
      like(properties.description, `%${searchTerm}%`)
    )
  ).limit(50);
}

export async function getPropertiesByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
}

export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(properties).values(property);
  return result;
}

export async function updateProperty(id: number, updates: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(properties).set(updates).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(properties).where(eq(properties.id, id));
}

// ===== BOOKINGS =====

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingsByProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookings).where(eq(bookings.propertyId, propertyId)).orderBy(desc(bookings.checkIn));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBooking(id: number, updates: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set(updates).where(eq(bookings.id, id));
}

export async function checkPropertyAvailability(propertyId: number, checkIn: Date, checkOut: Date) {
  const db = await getDb();
  if (!db) return true;

  const conflictingBookings = await db.select().from(bookings).where(
    and(
      eq(bookings.propertyId, propertyId),
      inArray(bookings.status, ["confirmado", "pendente"]),
      or(
        and(gte(bookings.checkIn, checkIn), lte(bookings.checkIn, checkOut)),
        and(gte(bookings.checkOut, checkIn), lte(bookings.checkOut, checkOut)),
        and(lte(bookings.checkIn, checkIn), gte(bookings.checkOut, checkOut))
      )
    )
  );

  return conflictingBookings.length === 0;
}

// ===== REVIEWS =====

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(review);
  
  // Atualizar rating da propriedade
  await updatePropertyRating(review.propertyId);
  
  return result;
}

export async function getReviewsByProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(reviews).where(eq(reviews.propertyId, propertyId)).orderBy(desc(reviews.createdAt));
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
}

async function updatePropertyRating(propertyId: number) {
  const db = await getDb();
  if (!db) return;

  const propertyReviews = await db.select().from(reviews).where(eq(reviews.propertyId, propertyId));
  
  if (propertyReviews.length === 0) {
    await db.update(properties).set({ rating: 0, reviewCount: 0 }).where(eq(properties.id, propertyId));
    return;
  }

  const avgRating = propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length;
  await db.update(properties).set({
    rating: Math.round(avgRating * 100),
    reviewCount: propertyReviews.length
  }).where(eq(properties.id, propertyId));
}

// ===== FAVORITES =====

export async function addFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(favorites).values({ userId, propertyId });
}

export async function removeFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
  );
}

export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function isFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
  ).limit(1);

  return result.length > 0;
}

// ===== MESSAGES =====

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(messages).values(message);
}

export async function getMessagesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages).where(
    or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
  ).orderBy(desc(messages.createdAt));
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
}

