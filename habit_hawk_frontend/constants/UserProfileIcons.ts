/**
 * User Profile Icon Library
 * Colorful, fun icons for user avatars - distinct from habit icons
 * Each icon has an associated color/gradient for visual personality
 */

export interface UserProfileIcon {
  name: string;           // Unique identifier
  ionicon: string;        // Ionicons name
  category: string;       // Category for grouping
  label: string;          // Display label
  backgroundColor: string; // Solid color or gradient
  iconColor: string;      // Icon color (usually white or light)
}

export const USER_PROFILE_ICONS: UserProfileIcon[] = [
  // Animals - Vibrant & Playful
  {
    name: 'fox',
    ionicon: 'paw-outline',
    category: 'Animals',
    label: 'Fox',
    backgroundColor: '#FF6B35', // Orange
    iconColor: '#FFFFFF',
  },
  {
    name: 'cat',
    ionicon: 'fish-outline',
    category: 'Animals',
    label: 'Cat',
    backgroundColor: '#9B59B6', // Purple
    iconColor: '#FFFFFF',
  },
  {
    name: 'dog',
    ionicon: 'paw-outline',
    category: 'Animals',
    label: 'Dog',
    backgroundColor: '#E67E22', // Brown-orange
    iconColor: '#FFFFFF',
  },
  {
    name: 'owl',
    ionicon: 'eye-outline',
    category: 'Animals',
    label: 'Owl',
    backgroundColor: '#5D4E6D', // Deep purple
    iconColor: '#FFFFFF',
  },
  {
    name: 'penguin',
    ionicon: 'snow-outline',
    category: 'Animals',
    label: 'Penguin',
    backgroundColor: '#34495E', // Dark blue-grey
    iconColor: '#FFFFFF',
  },
  {
    name: 'butterfly',
    ionicon: 'bug-outline',
    category: 'Animals',
    label: 'Butterfly',
    backgroundColor: '#FF69B4', // Hot pink
    iconColor: '#FFFFFF',
  },
  {
    name: 'bee',
    ionicon: 'radio-outline',
    category: 'Animals',
    label: 'Bee',
    backgroundColor: '#FDB913', // Golden yellow
    iconColor: '#000000',
  },
  {
    name: 'turtle',
    ionicon: 'shield-outline',
    category: 'Animals',
    label: 'Turtle',
    backgroundColor: '#27AE60', // Green
    iconColor: '#FFFFFF',
  },

  // Nature - Fresh & Vibrant
  {
    name: 'tree',
    ionicon: 'leaf-outline',
    category: 'Nature',
    label: 'Tree',
    backgroundColor: '#2ECC71', // Bright green
    iconColor: '#FFFFFF',
  },
  {
    name: 'flower',
    ionicon: 'flower-outline',
    category: 'Nature',
    label: 'Flower',
    backgroundColor: '#E91E63', // Pink
    iconColor: '#FFFFFF',
  },
  {
    name: 'sun',
    ionicon: 'sunny-outline',
    category: 'Nature',
    label: 'Sun',
    backgroundColor: '#F39C12', // Bright orange
    iconColor: '#FFFFFF',
  },
  {
    name: 'moon',
    ionicon: 'moon-outline',
    category: 'Nature',
    label: 'Moon',
    backgroundColor: '#5B7C99', // Dusty blue
    iconColor: '#FFFFFF',
  },
  {
    name: 'star',
    ionicon: 'star-outline',
    category: 'Nature',
    label: 'Star',
    backgroundColor: '#FFD700', // Gold
    iconColor: '#000000',
  },
  {
    name: 'cloud',
    ionicon: 'cloud-outline',
    category: 'Nature',
    label: 'Cloud',
    backgroundColor: '#3498DB', // Sky blue
    iconColor: '#FFFFFF',
  },
  {
    name: 'raindrop',
    ionicon: 'water-outline',
    category: 'Nature',
    label: 'Rain',
    backgroundColor: '#1ABC9C', // Teal
    iconColor: '#FFFFFF',
  },
  {
    name: 'mountain',
    ionicon: 'triangle-outline',
    category: 'Nature',
    label: 'Mountain',
    backgroundColor: '#95A5A6', // Grey-blue
    iconColor: '#FFFFFF',
  },

  // Food & Drink - Fun & Colorful
  {
    name: 'pizza',
    ionicon: 'pizza-outline',
    category: 'Food',
    label: 'Pizza',
    backgroundColor: '#E74C3C', // Red
    iconColor: '#FFFFFF',
  },
  {
    name: 'coffee',
    ionicon: 'cafe-outline',
    category: 'Food',
    label: 'Coffee',
    backgroundColor: '#795548', // Brown
    iconColor: '#FFFFFF',
  },
  {
    name: 'icecream',
    ionicon: 'ice-cream-outline',
    category: 'Food',
    label: 'Ice Cream',
    backgroundColor: '#FF8ED4', // Pink
    iconColor: '#FFFFFF',
  },
  {
    name: 'donut',
    ionicon: 'ellipse-outline',
    category: 'Food',
    label: 'Donut',
    backgroundColor: '#FFA07A', // Light salmon
    iconColor: '#FFFFFF',
  },
  {
    name: 'apple',
    ionicon: 'nutrition-outline',
    category: 'Food',
    label: 'Apple',
    backgroundColor: '#C0392B', // Deep red
    iconColor: '#FFFFFF',
  },
  {
    name: 'avocado',
    ionicon: 'leaf-outline',
    category: 'Food',
    label: 'Avocado',
    backgroundColor: '#6C8F3F', // Avocado green
    iconColor: '#FFFFFF',
  },

  // Objects - Modern & Stylish
  {
    name: 'rocket',
    ionicon: 'rocket-outline',
    category: 'Objects',
    label: 'Rocket',
    backgroundColor: '#E74C3C', // Red
    iconColor: '#FFFFFF',
  },
  {
    name: 'crown',
    ionicon: 'trophy-outline',
    category: 'Objects',
    label: 'Crown',
    backgroundColor: '#F1C40F', // Yellow-gold
    iconColor: '#000000',
  },
  {
    name: 'gem',
    ionicon: 'diamond-outline',
    category: 'Objects',
    label: 'Gem',
    backgroundColor: '#9B59B6', // Purple
    iconColor: '#FFFFFF',
  },
  {
    name: 'music',
    ionicon: 'musical-notes-outline',
    category: 'Objects',
    label: 'Music',
    backgroundColor: '#E91E63', // Pink
    iconColor: '#FFFFFF',
  },
  {
    name: 'palette',
    ionicon: 'color-palette-outline',
    category: 'Objects',
    label: 'Palette',
    backgroundColor: '#FF6B9D', // Bright pink
    iconColor: '#FFFFFF',
  },
  {
    name: 'camera',
    ionicon: 'camera-outline',
    category: 'Objects',
    label: 'Camera',
    backgroundColor: '#34495E', // Dark slate
    iconColor: '#FFFFFF',
  },
  {
    name: 'umbrella',
    ionicon: 'umbrella-outline',
    category: 'Objects',
    label: 'Umbrella',
    backgroundColor: '#3498DB', // Blue
    iconColor: '#FFFFFF',
  },
  {
    name: 'balloon',
    ionicon: 'balloon-outline',
    category: 'Objects',
    label: 'Balloon',
    backgroundColor: '#FF4757', // Coral red
    iconColor: '#FFFFFF',
  },

  // Fantasy & Magic - Whimsical
  {
    name: 'magic',
    ionicon: 'sparkles-outline',
    category: 'Fantasy',
    label: 'Magic',
    backgroundColor: '#9B59B6', // Purple
    iconColor: '#FFFFFF',
  },
  {
    name: 'wizard',
    ionicon: 'flask-outline',
    category: 'Fantasy',
    label: 'Wizard',
    backgroundColor: '#5F27CD', // Deep purple
    iconColor: '#FFFFFF',
  },
  {
    name: 'bolt',
    ionicon: 'flash-outline',
    category: 'Fantasy',
    label: 'Lightning',
    backgroundColor: '#F1C40F', // Electric yellow
    iconColor: '#000000',
  },
  {
    name: 'fire',
    ionicon: 'flame-outline',
    category: 'Fantasy',
    label: 'Fire',
    backgroundColor: '#E74C3C', // Red-orange
    iconColor: '#FFFFFF',
  },
  {
    name: 'heart',
    ionicon: 'heart-outline',
    category: 'Fantasy',
    label: 'Heart',
    backgroundColor: '#E74C3C', // Red
    iconColor: '#FFFFFF',
  },

  // Sports & Activity - Energetic
  {
    name: 'basketball',
    ionicon: 'basketball-outline',
    category: 'Sports',
    label: 'Basketball',
    backgroundColor: '#FF6B35', // Orange
    iconColor: '#FFFFFF',
  },
  {
    name: 'football',
    ionicon: 'football-outline',
    category: 'Sports',
    label: 'Football',
    backgroundColor: '#8B4513', // Brown
    iconColor: '#FFFFFF',
  },
  {
    name: 'bike',
    ionicon: 'bicycle-outline',
    category: 'Sports',
    label: 'Cycling',
    backgroundColor: '#16A085', // Teal
    iconColor: '#FFFFFF',
  },
  {
    name: 'dumbbell',
    ionicon: 'barbell-outline',
    category: 'Sports',
    label: 'Fitness',
    backgroundColor: '#C0392B', // Dark red
    iconColor: '#FFFFFF',
  },

  // Ocean & Sea - Cool Tones
  {
    name: 'fish',
    ionicon: 'fish-outline',
    category: 'Ocean',
    label: 'Fish',
    backgroundColor: '#3498DB', // Blue
    iconColor: '#FFFFFF',
  },
  {
    name: 'boat',
    ionicon: 'boat-outline',
    category: 'Ocean',
    label: 'Boat',
    backgroundColor: '#1ABC9C', // Turquoise
    iconColor: '#FFFFFF',
  },
  {
    name: 'anchor',
    ionicon: 'boat-outline',
    category: 'Ocean',
    label: 'Anchor',
    backgroundColor: '#2C3E50', // Navy
    iconColor: '#FFFFFF',
  },
];

// Default fallback icon for user profiles
export const DEFAULT_USER_PROFILE_ICON: UserProfileIcon = {
  name: 'default',
  ionicon: 'person-outline',
  category: 'Default',
  label: 'Default',
  backgroundColor: '#95A5A6', // Grey
  iconColor: '#FFFFFF',
};

// Helper function to get icon by name
export const getUserProfileIconByName = (name: string | null | undefined): UserProfileIcon => {
  if (!name) return DEFAULT_USER_PROFILE_ICON;
  return USER_PROFILE_ICONS.find(icon => icon.name === name) || DEFAULT_USER_PROFILE_ICON;
};

// Helper function to group icons by category
export const getUserProfileIconsByCategory = (): Record<string, UserProfileIcon[]> => {
  const grouped: Record<string, UserProfileIcon[]> = {};

  USER_PROFILE_ICONS.forEach(icon => {
    if (!grouped[icon.category]) {
      grouped[icon.category] = [];
    }
    grouped[icon.category].push(icon);
  });

  return grouped;
};

// Category order for display
export const USER_PROFILE_CATEGORY_ORDER = [
  'Animals',
  'Nature',
  'Food',
  'Objects',
  'Fantasy',
  'Sports',
  'Ocean',
];
