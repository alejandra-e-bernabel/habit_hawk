/**
 * Habit Icon Library
 * Using Ionicons (outline style) for consistency with the app
 * Icons are grouped by category for easier selection
 */

export interface HabitIcon {
  name: string;           // Unique identifier
  ionicon: string;        // Ionicons name
  category: string;       // Category for grouping
  label: string;          // Display label
}

export const HABIT_ICONS: HabitIcon[] = [
  // Exercise & Fitness
  { name: 'run', ionicon: 'walk-outline', category: 'Exercise', label: 'Run/Walk' },
  { name: 'bicycle', ionicon: 'bicycle-outline', category: 'Exercise', label: 'Cycling' },
  { name: 'barbell', ionicon: 'barbell-outline', category: 'Exercise', label: 'Strength' },
  { name: 'fitness', ionicon: 'fitness-outline', category: 'Exercise', label: 'Workout' },
  { name: 'basketball', ionicon: 'basketball-outline', category: 'Exercise', label: 'Sports' },
  { name: 'football', ionicon: 'football-outline', category: 'Exercise', label: 'Football' },

  // Wellness & Health
  { name: 'yoga', ionicon: 'body-outline', category: 'Wellness', label: 'Yoga' },
  { name: 'meditation', ionicon: 'hand-right-outline', category: 'Wellness', label: 'Meditation' },
  { name: 'heart', ionicon: 'heart-outline', category: 'Wellness', label: 'Health' },
  { name: 'water', ionicon: 'water-outline', category: 'Wellness', label: 'Hydration' },
  { name: 'moon', ionicon: 'moon-outline', category: 'Wellness', label: 'Sleep' },
  { name: 'sunny', ionicon: 'sunny-outline', category: 'Wellness', label: 'Morning' },
  { name: 'nutrition', ionicon: 'nutrition-outline', category: 'Wellness', label: 'Nutrition' },

  // Learning & Growth
  { name: 'book', ionicon: 'book-outline', category: 'Learning', label: 'Reading' },
  { name: 'language', ionicon: 'language-outline', category: 'Learning', label: 'Language' },
  { name: 'school', ionicon: 'school-outline', category: 'Learning', label: 'Study' },
  { name: 'bulb', ionicon: 'bulb-outline', category: 'Learning', label: 'Ideas' },
  { name: 'pencil', ionicon: 'pencil-outline', category: 'Learning', label: 'Writing' },
  { name: 'laptop', ionicon: 'laptop-outline', category: 'Learning', label: 'Coding' },

  // Productivity
  { name: 'checkmark', ionicon: 'checkmark-circle-outline', category: 'Productivity', label: 'Tasks' },
  { name: 'calendar', ionicon: 'calendar-outline', category: 'Productivity', label: 'Planning' },
  { name: 'time', ionicon: 'time-outline', category: 'Productivity', label: 'Time' },
  { name: 'list', ionicon: 'list-outline', category: 'Productivity', label: 'Organize' },
  { name: 'briefcase', ionicon: 'briefcase-outline', category: 'Productivity', label: 'Work' },

  // Creative
  { name: 'brush', ionicon: 'brush-outline', category: 'Creative', label: 'Art' },
  { name: 'camera', ionicon: 'camera-outline', category: 'Creative', label: 'Photography' },
  { name: 'musical-notes', ionicon: 'musical-notes-outline', category: 'Creative', label: 'Music' },
  { name: 'color-palette', ionicon: 'color-palette-outline', category: 'Creative', label: 'Design' },

  // Home & Lifestyle
  { name: 'home', ionicon: 'home-outline', category: 'Home', label: 'Home' },
  { name: 'sparkles', ionicon: 'sparkles-outline', category: 'Home', label: 'Cleaning' },
  { name: 'leaf', ionicon: 'leaf-outline', category: 'Home', label: 'Plants' },
  { name: 'restaurant', ionicon: 'restaurant-outline', category: 'Home', label: 'Cooking' },
  { name: 'shirt', ionicon: 'shirt-outline', category: 'Home', label: 'Laundry' },

  // Social
  { name: 'people', ionicon: 'people-outline', category: 'Social', label: 'Social' },
  { name: 'call', ionicon: 'call-outline', category: 'Social', label: 'Call' },
  { name: 'chatbubble', ionicon: 'chatbubble-outline', category: 'Social', label: 'Message' },
  { name: 'gift', ionicon: 'gift-outline', category: 'Social', label: 'Kindness' },

  // Finance
  { name: 'wallet', ionicon: 'wallet-outline', category: 'Finance', label: 'Budget' },
  { name: 'card', ionicon: 'card-outline', category: 'Finance', label: 'Finance' },
  { name: 'trending-up', ionicon: 'trending-up-outline', category: 'Finance', label: 'Invest' },

  // Miscellaneous
  { name: 'star', ionicon: 'star-outline', category: 'Other', label: 'Goal' },
  { name: 'flag', ionicon: 'flag-outline', category: 'Other', label: 'Milestone' },
  { name: 'trophy', ionicon: 'trophy-outline', category: 'Other', label: 'Achievement' },
  { name: 'pizza', ionicon: 'pizza-outline', category: 'Other', label: 'Food' },
  { name: 'cafe', ionicon: 'cafe-outline', category: 'Other', label: 'Coffee' },
];

// Default fallback icon when no icon is selected
export const DEFAULT_ICON: HabitIcon = {
  name: 'circle-dashed',
  ionicon: 'ellipse-outline',
  category: 'Other',
  label: 'Default',
};

// Helper function to get icon by name
export const getIconByName = (name: string | null | undefined): HabitIcon => {
  if (!name) return DEFAULT_ICON;
  return HABIT_ICONS.find(icon => icon.name === name) || DEFAULT_ICON;
};

// Helper function to group icons by category
export const getIconsByCategory = (): Record<string, HabitIcon[]> => {
  const grouped: Record<string, HabitIcon[]> = {};

  HABIT_ICONS.forEach(icon => {
    if (!grouped[icon.category]) {
      grouped[icon.category] = [];
    }
    grouped[icon.category].push(icon);
  });

  return grouped;
};

// Category order for display
export const CATEGORY_ORDER = [
  'Exercise',
  'Wellness',
  'Learning',
  'Productivity',
  'Creative',
  'Home',
  'Social',
  'Finance',
  'Other',
];
