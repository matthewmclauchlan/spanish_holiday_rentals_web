// lib/appwrite.ts

import {
  Client,
  Account,
  Databases,
  OAuthProvider,
  Query,
  Models,
  ID,
  Storage,
  Teams,
  Permission,
} from "appwrite";
import { FilterOptions, HouseRules, Review, Booking, BookingRules, PriceRules, PriceAdjustment } from "./types";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project-id");

// For server-side calls, add the API key if provided.
if (process.env.APPWRITE_API_KEY) {
  (client as unknown as { addHeader: (key: string, value: string) => void }).addHeader(
    "X-Appwrite-Key",
    process.env.APPWRITE_API_KEY
  );
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export { OAuthProvider, client };

export interface AppwriteConfig {
  endpoint: string;
  databaseId: string;
  propertiesCollectionId: string;
  mediaCollectionId: string;
  bucketId: string;
  projectId: string;
  hostCollectionId: string;
  houseRulesCollectionId: string;
  reviewsCollectionId: string;
  bookingsCollectionId: string;
  bookingRulesCollectionId: string;
  priceRulesCollectionId: string;
  priceAdjustmentsCollectionId: string;
  verificationBucketId: string;
  guestVerificationsCollectionId: string;
  glideApiKey: string;
  glideAppId: string;
  glideGuestApprovalWebhookSecret: string;
  rolesCollectionId: string;
}

export const config: AppwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  propertiesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || "",
  mediaCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MEDIA_COLLECTION_ID || "",
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID || "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  hostCollectionId: process.env.NEXT_PUBLIC_APPWRITE_HOST_COLLECTION_ID || "",
  houseRulesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_HOUSE_RULES_COLLECTION_ID || "",
  reviewsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || "",
  bookingsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID || "",
  bookingRulesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_RULES_COLLECTION_ID || "",
  priceRulesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PRICE_RULES_COLLECTION_ID || "",
  priceAdjustmentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PRICE_ADJUSTMENTS_COLLECTION_ID || "",
  verificationBucketId: process.env.NEXT_PUBLIC_APPWRITE_VERIFICATION_BUCKET_ID || "",
  guestVerificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_GUEST_VERIFICATIONS_COLLECTION_ID || "",
  glideApiKey: process.env.GLIDE_API_KEY || "",
  glideAppId: process.env.GLIDE_APP_ID || "",
  glideGuestApprovalWebhookSecret: process.env.GLIDE_GUEST_APPROVAL_WEBHOOK_SECRET || "",
  rolesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROLES_COLLECTION_ID || "",
};

export { ID };

/**
 * Fetch properties with FilterOptions.
 */
export async function getProperties({
  filter,
  query,
  limit = 6,
}: {
  filter: string;
  query: string;
  limit?: number;
}): Promise<Models.Document[]> {
  try {
    const filterOptions: FilterOptions = JSON.parse(filter);
    const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(limit)];

    if (filterOptions.category && filterOptions.category !== "All") {
      queries.push(Query.equal("type", filterOptions.category));
    }
    if (filterOptions.location && filterOptions.location.trim() !== "") {
      queries.push(Query.search("location", filterOptions.location));
    }
    if (
      filterOptions.priceMin !== undefined &&
      filterOptions.priceMax !== undefined &&
      filterOptions.priceMin <= filterOptions.priceMax
    ) {
      queries.push(Query.between("pricePerNight", filterOptions.priceMin, filterOptions.priceMax));
    }
    if (filterOptions.bedrooms && filterOptions.bedrooms > 0) {
      queries.push(Query.greaterThanEqual("bedrooms", filterOptions.bedrooms));
    }
    if (filterOptions.bathrooms && filterOptions.bathrooms > 0) {
      queries.push(Query.greaterThanEqual("bathrooms", filterOptions.bathrooms));
    }
    if (filterOptions.amenities && filterOptions.amenities.length > 0) {
      filterOptions.amenities.forEach((amenity: string) => {
        queries.push(Query.equal("amenities", amenity));
      });
    }
    if (filterOptions.guestCount && filterOptions.guestCount > 1) {
      queries.push(Query.greaterThanEqual("maxGuests", filterOptions.guestCount));
    }
    if (filterOptions.startDate) {
      queries.push(Query.greaterThanEqual("availableFrom", filterOptions.startDate));
    }
    if (filterOptions.endDate) {
      queries.push(Query.lessThanEqual("availableTo", filterOptions.endDate));
    }
    if (query && query.trim() !== "") {
      queries.push(Query.search("name", query));
    }

    const propertiesResponse = await databases.listDocuments<Models.Document>(
      config.databaseId,
      config.propertiesCollectionId,
      queries
    );
    if (propertiesResponse.documents.length === 0) return [];

    const propertyIds: string[] = propertiesResponse.documents.map((prop: Models.Document) => prop.$id);
    const mediaResponse = await databases.listDocuments<
      Models.Document & { propertyId: { $id: string }; fileId: string }
    >(
      config.databaseId,
      config.mediaCollectionId,
      [Query.equal("propertyId", propertyIds)]
    );
    const propertyMediaMap: Record<string, string[]> = {};
    mediaResponse.documents.forEach((media: Models.Document & { propertyId: { $id: string }; fileId: string }) => {
      const propertyId = media.propertyId.$id;
      const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${media.fileId}/preview?project=${config.projectId}`;
      if (!propertyMediaMap[propertyId]) {
        propertyMediaMap[propertyId] = [];
      }
      propertyMediaMap[propertyId].push(imageUrl);
    });

    return propertiesResponse.documents.map((property: Models.Document) => ({
      ...property,
      media: propertyMediaMap[property.$id] || [],
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error fetching properties:", errorMessage);
    throw error;
  }
}

/**
 * Fetch single property by ID.
 */
export async function getPropertyById(id: string): Promise<Models.Document | null> {
  try {
    const property = await databases.getDocument<Models.Document>(
      config.databaseId,
      config.propertiesCollectionId,
      id
    );
    
    const mediaFiles = await databases.listDocuments<Models.Document & { fileId: string }>(
      config.databaseId,
      config.mediaCollectionId,
      [Query.equal("propertyId", id)]
    );
    
    const mediaUrls = mediaFiles.documents.map(
      (media) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${media.fileId}/preview?project=${config.projectId}`
    );
    
    const mainImage = property.mainImage || (mediaUrls.length > 0 ? mediaUrls[0] : undefined);
    
    return { ...property, media: mediaUrls, mainImage };
  } catch (error) {
    console.error("❌ Error fetching property:", error);
    return null;
  }
}

/**
 * Fetch house rules for a property.
 */
export async function getHouseRulesForProperty(propertyId: string): Promise<HouseRules | null> {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.houseRulesCollectionId,
      [Query.equal("propertyId", propertyId)]
    );
    if (response.documents.length > 0) {
      return response.documents[0] as unknown as HouseRules;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching house rules for property:", error);
    return null;
  }
}

/**
 * Fetch reviews for a property.
 */
export async function getReviewsForProperty(propertyId: string): Promise<Review[]> {
  try {
    const reviewsResponse = await databases.listDocuments<Review & Models.Document>(
      config.databaseId,
      config.reviewsCollectionId,
      [Query.equal('propertyId', propertyId)]
    );
    console.log('Raw reviews:', reviewsResponse.documents);
    return reviewsResponse.documents.map((doc) => doc as unknown as Review);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return [];
  }
}

/**
 * Fetch bookings for a property.
 */
export async function getBookingsForProperty(propertyId: string): Promise<Booking[]> {
  try {
    const response = await databases.listDocuments<Booking>(
      config.databaseId,
      config.bookingsCollectionId,
      [Query.equal("propertyId", propertyId)]
    );
    console.log("Bookings retrieved:", response.documents);
    return response.documents.map((doc) => doc as unknown as Booking);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return [];
  }
}

/**
 * Fetch booking rules for a property.
 */
export async function getBookingRulesForProperty(propertyId: string): Promise<BookingRules | null> {
  try {
    const response = await databases.listDocuments<BookingRules>(
      config.databaseId,
      config.bookingRulesCollectionId,
      [Query.equal("propertyId", propertyId)]
    );
    if (response.documents.length > 0) {
      return response.documents[0] as unknown as BookingRules;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching booking rules:", error);
    return null;
  }
}

/**
 * Fetch price rules for a property.
 */
export async function getPriceRulesForProperty(propertyId: string): Promise<PriceRules | null> {
  try {
    const response = await databases.listDocuments<PriceRules>(
      config.databaseId,
      config.priceRulesCollectionId,
      [Query.equal("propertyId", propertyId)]
    );
    if (response.documents.length > 0) {
      return response.documents[0] as unknown as PriceRules;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching price rules:", error);
    return null;
  }
}

/**
 * Fetch price adjustments for a property.
 */
export async function getPriceAdjustmentsForProperty(propertyId: string): Promise<PriceAdjustment[]> {
  try {
    const response = await databases.listDocuments<PriceAdjustment>(
      config.databaseId,
      config.priceAdjustmentsCollectionId,
      [Query.equal("propertyId", propertyId)]
    );
    return response.documents.map((doc) => doc as unknown as PriceAdjustment);
  } catch (error) {
    console.error("❌ Error fetching price adjustments:", error);
    return [];
  }
}

/**
 * Create a new booking in Appwrite.
 */
export interface BookingData {
  userId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  hostId?: string;
  paymentId?: string;
  customerEmail?: string;
}

export async function createBooking(bookingData: BookingData): Promise<Models.Document> {
  try {
    const requiredFields: (keyof BookingData)[] = [
      "userId",
      "propertyId",
      "startDate",
      "endDate",
      "totalPrice",
      "bookingReference",
      "createdAt",
      "updatedAt",
      "status",
    ];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (!bookingData.hostId) {
      // Fetch property to get hostId (if the property exists)
      try {
        const property = await getPropertyById(bookingData.propertyId);
        if (property && (property as { hostId?: string }).hostId) {
          bookingData.hostId = (property as { hostId?: string }).hostId;
        } else {
          console.warn("Property not found or hostId missing for propertyId:", bookingData.propertyId);
        }
      } catch (e) {
        console.warn("Error fetching property for hostId:", e);
      }
    }
    const response = await databases.createDocument(
      config.databaseId,
      config.bookingsCollectionId,
      ID.unique(), // Let Appwrite generate a unique document ID.
      bookingData
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error creating booking:", errorMessage);
    throw error;
  }
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  try {
    const response = await databases.listDocuments<Booking>(
      config.databaseId,
      config.bookingsCollectionId,
      [Query.equal('userId', userId)]
    );
    return response.documents.map((doc) => doc as Booking);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error fetching bookings for user:", errorMessage);
    throw error;
  }
}

export const getAvatarUrl = (fileId: string): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID;
  if (!endpoint || !projectId || !bucketId) {
    console.error("Missing Appwrite env variables for avatar URL.");
    return '';
  }
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
};

/**
 * getImageUrl
 * Returns the URL for an image file stored in your media bucket.
 */
export const getImageUrl = (id: string): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID;
  if (!endpoint || !projectId || !bucketId) {
    console.error("Missing one or more Appwrite environment variables.");
    return "";
  }
  return `${endpoint}/storage/buckets/${bucketId}/files/${id}/view?project=${projectId}`;
};

/**
 * upsertHostProfile
 * Creates (or updates) a host profile document in the host collection.
 */
interface HostProfilePayload {
  userId: string;
  fullName: string;
  phoneNumber: string;
  hostDocumentUrl: string;
  termsAccepted?: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

export async function upsertHostProfile(data: {
  userId: string;
  fullName: string;
  phoneNumber: string;
  hostDocumentUrl: string;
  termsAccepted?: boolean;
}): Promise<Models.Document> {
  const collectionId = config.hostCollectionId;
  if (!collectionId) {
    throw new Error("Missing host collection ID.");
  }
  const now = new Date().toISOString();
  const payload: HostProfilePayload = {
    userId: data.userId,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    hostDocumentUrl: data.hostDocumentUrl,
    termsAccepted: data.termsAccepted,
    approvalStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };
  try {
    const hostDoc = await databases.createDocument(
      config.databaseId,
      collectionId,
      ID.unique(),
      payload,
      [
        Permission.read(`user:${data.userId}`),
        Permission.update(`user:${data.userId}`),
        Permission.delete(`user:${data.userId}`)
      ]
    );
    return hostDoc;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Error creating/updating host profile:", errorMessage);
    throw error;
  }
}

/**
 * addOwnerRole
 * Assigns the "owner" role to a user.
 */
export async function addOwnerRole(userId: string): Promise<Models.Document> {
  const now = new Date().toISOString();
  try {
    const response = await databases.createDocument(
      config.databaseId,
      config.rolesCollectionId,
      ID.unique(),
      {
        userId,
        role: "owner",
        createdAt: now,
        updatedAt: now,
      }
    );
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Error adding owner role:", errorMessage);
    throw error;
  }
}

/**
 * uploadFile
 * Uploads a File object (from an HTML input) to your storage bucket.
 */
export async function uploadFile(file: File): Promise<Models.Document> {
  try {
    // Pass the file directly; the createFile method expects a File from the browser.
    const response = await storage.createFile(
      config.bucketId,
      ID.unique(),
      file
    ) as unknown as Models.Document;
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Error uploading file:", errorMessage);
    throw error;
  }
}

/**
 * Fetch host profile by userId.
 */
export async function getHostProfileByUserId(userId: string): Promise<Models.Document | null> {
  try {
    const hostCollId = config.hostCollectionId;
    if (!hostCollId) {
      throw new Error("Missing host collection ID.");
    }
    const result = await databases.listDocuments<Models.Document>(
      config.databaseId,
      hostCollId,
      [Query.equal("userId", userId)]
    );
    if (result.documents.length > 0) {
      return result.documents[0];
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching host profile:", error);
    return null;
  }
}

export async function getUserVerificationStatus(userId: string): Promise<string | null> {
  try {
    const verificationCollectionId = process.env.NEXT_PUBLIC_APPWRITE_GUEST_VERIFICATIONS_COLLECTION_ID;
    if (!verificationCollectionId) {
      throw new Error("Missing guest verifications collection ID.");
    }
    const result = await databases.listDocuments<Models.Document>(
      config.databaseId,
      verificationCollectionId,
      [Query.equal("userId", userId)]
    );
    if (result.documents.length > 0) {
      return result.documents[0].status as string;
    }
    return null;
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return null;
  }
}
