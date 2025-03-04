// /lib/propertyTypes.ts

// Define the union type for property categories.
export type PropertyCategory =
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
  | "Farmhouse";

// Define an interface for a property type item.
export interface PropertyType {
  type: PropertyCategory;
  icon: string; // URL or local asset path for the icon.
  label: string;
}

// Create an array of property types.
export const propertyTypes: PropertyType[] = [
  { type: "House", icon: "/assets/icons/house.png", label: "House" },
  { type: "Condo", icon: "/assets/icons/condo.png", label: "Condo" },
  { type: "Apartment", icon: "/assets/icons/apartment.png", label: "Apartment" },
  { type: "Townhouse", icon: "/assets/icons/townhouse.png", label: "Townhouse" },
  { type: "Villa", icon: "/assets/icons/villa.png", label: "Villa" },
  { type: "Cottage", icon: "/assets/icons/cottage.png", label: "Cottage" },
  { type: "Bungalow", icon: "/assets/icons/bungalow.png", label: "Bungalow" },
  { type: "Duplex", icon: "/assets/icons/duplex.png", label: "Duplex" },
  { type: "Loft", icon: "/assets/icons/loft.png", label: "Loft" },
  { type: "Penthouse", icon: "/assets/icons/penthouse.png", label: "Penthouse" },
  { type: "Studio", icon: "/assets/icons/studio.png", label: "Studio" },
  { type: "Mansion", icon: "/assets/icons/mansion.png", label: "Mansion" },
  { type: "Cabin", icon: "/assets/icons/cabin.png", label: "Cabin" },
  { type: "Farmhouse", icon: "/assets/icons/farmhouse.png", label: "Farmhouse" },
];
