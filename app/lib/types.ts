// lib/types.ts
import { Models } from 'appwrite';

// Filter options (already used in your project)
export interface FilterOptions {
  category: string;
  location: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  guestCount: number;
  startDate: string | null;
  endDate: string | null;
}

// The structure for a property document in your properties collection
export interface Property {
  $id: string;
  name: string;
  type:
    | "House"
    | "Condo"
    | "Apartment"
    | "Townhouse"
    | "Villa"
    | "Cottage"
    | "Bungalow"
    | "Duplex"
    | "Loft"
    | "Penthouse"
    | "Studio"
    | "Mansion"
    | "Cabin"
    | "Farmhouse"
    | "Other";
  description: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  rating: "1" | "2" | "3" | "4" | "5";
  area: number;
  amenities: string[];
  houseRulesId: string;
  isFeatured: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
  pricePerNight: number;
  userId: string; // Owner's user ID
  geolocation: string;
  mainImage?: string;
  mediaIds: string[]; // Array of file IDs from your media bucket
  status: "active" | "pending" | "sold" | "delisted";
  catastro: string;
  vutNumber: string;
  approvalStatus: "pending" | "approved" | "rejected" | "reachout";
  descisionDate: string;
  hostId: string;
}

// Extend the Property interface to include Appwrite-specific metadata
export interface PropertyDocument extends Property {
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// The structure for a host profile document in your host collection
export interface HostProfile {
  $id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  hostDocumentId: string;
  descisionDate: string;
  termsAccepted: string;
  hostid: string;
}

// The structure for a role document in your roles collection
export interface RoleDocument {
  $id: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// (Optional) A simplified user interface – adjust as needed.
export interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
  avatarUrl?: string;  // Optional avatarUrl field
  hostProfile?: HostProfile | null;
  roles?: string[];
}

// The structure for an amenity document.
export interface Amenity {
  $id: string;
  name: string;      
  icon: string;
}

export interface HelpArticleFields {
  title: string;
  slug: string;
  content: string;
  summary: string;
  publishDate: string;
}

export interface HelpArticle {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    contentType: {
      sys: {
        id: string;
        type: string;
      };
    };
  };
  fields: HelpArticleFields;
}

export interface HouseRules {
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  petsAllowed: boolean;
  guestsMax: number;
  smokingAllowed: boolean;
}

export interface Review extends Models.Document {
  rating: number;
  propertyId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  userId: string;
  createdAt: string;
}

export interface Booking extends Models.Document {
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | string;
  appliedPriceRuleIds: string[];
  userId: string;
  adults: number;
  children: number;
  babies: number;
  cancellationPolicy: 'flexible' | 'strict' | string;
  propertyId: string;
  hostId: string;
}

export interface BookingRules extends Models.Document {
  instantBook: boolean;
  propertyId: string;
  minStay: number;
  maxStay: number;
  advanceNotice: number;
  cancellationPolicy: 'Firm' | 'Free' | 'Strict' | 'Non-refundable' | string;
}

export interface PriceRules extends Models.Document {
  basePricePerNight: number;
  basePricePerNightWeekend: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  cleaningFee: number;
  petFee: number;
  propertyId: string;
}

export interface PriceAdjustment extends Models.Document {
  propertyId: string;
  date: string;
  overridePrice: number;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
