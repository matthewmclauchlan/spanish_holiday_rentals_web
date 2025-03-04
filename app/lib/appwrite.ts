import { Client, Account, Databases, OAuthProvider, Query, Models } from 'appwrite';
import { FilterOptions, HouseRules, Review, Booking, BookingRules } from './types';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'project-id');

export const account = new Account(client);
export const databases = new Databases(client);

export const config = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  propertiesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || '',
  mediaCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MEDIA_COLLECTION_ID || '',
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID || '',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  hostCollectionId: process.env.NEXT_PUBLIC_APPWRITE_HOST_COLLECTION_ID || '',
  houseRulesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_HOUSE_RULES_COLLECTION_ID || '',
  reviewsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || '',
  bookingsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID || '',
  bookingRulesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_RULES_COLLECTION_ID || '',
};

export const getImageUrl = (id: string): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID;

  if (!endpoint || !projectId || !bucketId) {
    console.error('Missing one or more Appwrite environment variables.');
    return '';
  }

  // Construct the full URL for the media file.
  return `${endpoint}/storage/buckets/${bucketId}/files/${id}/view?project=${projectId}`;
};

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
 * Fetch host profile by userId.
 */
export async function getHostProfileByUserId(userId: string): Promise<Models.Document | null> {
  try {
    const hostCollId = config.hostCollectionId;
    if (!hostCollId) {
      throw new Error("Missing host collection ID (EXPO_PUBLIC_APPWRITE_HOST_COLLECTION_ID).");
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error fetching host profile:", errorMessage);
    return null;
  }
}

/**
 * Fetch single property by ID.
 */
export async function getPropertyById(id: string): Promise<Models.Document | null> {
  try {
    // Fetch the property document from Appwrite.
    const property = await databases.getDocument<Models.Document>(
      config.databaseId,
      config.propertiesCollectionId,
      id
    );
    
    // Fetch related media files by propertyId.
    const mediaFiles = await databases.listDocuments<Models.Document & { fileId: string }>(
      config.databaseId,
      config.mediaCollectionId,
      [Query.equal("propertyId", id)]
    );
    
    // Convert media file IDs into full image URLs.
    const mediaUrls = mediaFiles.documents.map(
      (media) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${config.bucketId}/files/${media.fileId}/preview?project=${config.projectId}`
    );
    
    // Use the mainImage attribute from the property if available.
    // Otherwise, if media files exist, fall back to the first media URL.
    const mainImage = property.mainImage || (mediaUrls.length > 0 ? mediaUrls[0] : undefined);
    
    // Return the property with additional fields:
    // - media: an array of image URLs
    // - mainImage: the designated main image
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

export async function getBookingsForProperty(propertyId: string): Promise<Booking[]> {
  try {
    const response = await databases.listDocuments<Booking>(
      config.databaseId,
      config.bookingsCollectionId, // Ensure this is set in your config
      [Query.equal("propertyId", propertyId)]
    );
    console.log("Bookings retrieved for property", propertyId, ":", response.documents);
    return response.documents;
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return [];
  }
}

export async function getBookingRulesForProperty(propertyId: string): Promise<BookingRules | null> {
  try {
    const response = await databases.listDocuments<BookingRules>(
      config.databaseId,
      process.env.NEXT_PUBLIC_APPWRITE_BOOKING_RULES_COLLECTION_ID || '', // make sure this env variable is set
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


export { OAuthProvider };
