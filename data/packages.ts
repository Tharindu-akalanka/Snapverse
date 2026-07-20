export interface Package {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export const packagesByCategory: Record<string, Package[]> = {
  Wedding: [
    {
      id: "wedding-bronze",
      name: "Bronze Package",
      price: "Contact for Pricing",
      features: [
        "1 Senior Photographer",
        "4 Hours of Continuous Coverage",
        "150 Retouched High-Resolution Images",
        "Online Private Gallery (1 Year)",
        "Pre-shoot Consultation Session"
      ]
    },
    {
      id: "wedding-silver",
      name: "Silver Package",
      price: "Contact for Pricing",
      features: [
        "1 Senior + 1 Assistant Photographer",
        "8 Hours of Continuous Coverage",
        "300 Retouched High-Resolution Images",
        "Standard Printed Photo Album (10x12, 30 Pages)",
        "Online Private Gallery (2 Years)"
      ]
    },
    {
      id: "wedding-gold",
      name: "Gold Package (Most Popular)",
      price: "Contact for Pricing",
      features: [
        "2 Senior Photographers",
        "Full Day Coverage (Up to 12 Hours)",
        "450 Retouched High-Resolution Images",
        "Premium Storybook Leather Album (12x15)",
        "Complementary 2-Hour Pre-wedding Shoot",
        "Private Digital Archive & USB Drive"
      ]
    }
  ],
  Engagement: [
    {
      id: "engagement-standard",
      name: "Standard Shoot",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "3 Hours Session",
        "1 Outdoor Location",
        "80 Retouched Digital Images",
        "Online Gallery Delivery"
      ]
    },
    {
      id: "engagement-premium",
      name: "Premium Session",
      price: "Contact for Pricing",
      features: [
        "1 Senior Photographer",
        "5 Hours Session",
        "Up to 2 Outdoor Locations",
        "150 Retouched Digital Images",
        "1 Signature Framed Photo (12x18)",
        "Online Gallery Delivery"
      ]
    }
  ],
  "Pre-shoot": [
    {
      id: "preshoot-standard",
      name: "Standard Pre-shoot",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "3 Hours Outdoor Session",
        "50 Retouched Digital Images",
        "Online Gallery Delivery"
      ]
    },
    {
      id: "preshoot-exclusive",
      name: "Exclusive Pre-shoot",
      price: "Contact for Pricing",
      features: [
        "1 Senior Photographer",
        "6 Hours Extended Session",
        "Multiple Costume Changes Supported",
        "100 Retouched Digital Images",
        "1 Premium Desktop Framed Portrait"
      ]
    }
  ],
  Graduation: [
    {
      id: "grad-essential",
      name: "Essential Session",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "1 Hour Session (Outdoor / Studio)",
        "20 Retouched Digital Images",
        "Individual & Family Portraits",
        "Online Gallery Delivery"
      ]
    },
    {
      id: "grad-deluxe",
      name: "Deluxe Session",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "2 Hours Session",
        "40 Retouched Digital Images",
        "Individual, Family, and Group Portraits",
        "1 Signature Framed Portrait (8x12)"
      ]
    }
  ],
  Events: [
    {
      id: "event-standard",
      name: "Standard Coverage",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "3 Hours Coverage",
        "Unlimited High-Quality Digital Captures",
        "Color-corrected JPEG Delivery in 7 Days"
      ]
    },
    {
      id: "event-premium",
      name: "Premium Coverage",
      price: "Contact for Pricing",
      features: [
        "2 Photographers",
        "6 Hours Coverage",
        "Unlimited High-Quality Digital Captures",
        "100 retouched highlight images",
        "USB Drive Delivery + Online Gallery"
      ]
    }
  ],
  Birthday: [
    {
      id: "bday-standard",
      name: "Standard Birthday",
      price: "Contact for Pricing",
      features: [
        "1 Photographer",
        "3 Hours Coverage",
        "Unlimited Digital Captures",
        "Retouched Highlights (30 Photos)",
        "Delivery in 5 Days via Online Link"
      ]
    },
    {
      id: "bday-premium",
      name: "Premium Birthday",
      price: "Contact for Pricing",
      features: [
        "1 Senior Photographer",
        "5 Hours Coverage",
        "Unlimited Digital Captures",
        "Retouched Highlights (60 Photos)",
        "1 Commemorative Photo Frame"
      ]
    }
  ],
  Commercial: [
    {
      id: "comm-half-day",
      name: "Half-Day Campaign",
      price: "Contact for Pricing",
      features: [
        "1 Senior Commercial Photographer",
        "4 Hours Shoot (Studio or On-site)",
        "Commercial Usage & Licensing Agreement",
        "High-End Retouched Campaign Images"
      ]
    },
    {
      id: "comm-full-day",
      name: "Full-Day Campaign",
      price: "Contact for Pricing",
      features: [
        "1 Senior Commercial Photographer + Assistant",
        "8 Hours Shoot (Studio or On-site)",
        "Extended Usage & Branding Licensing",
        "High-End Creative Retouching",
        "Expedited 4-Day Turnaround"
      ]
    }
  ]
};
