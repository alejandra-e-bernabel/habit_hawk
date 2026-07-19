import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  HABIT_ICONS,
  HabitIcon,
  getIconsByCategory,
  CATEGORY_ORDER,
  DEFAULT_ICON,
} from '@/constants/HabitIcons';
import { Colors } from '@/constants/Colors';

interface IconSelectorProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onSelectIcon,
}) => {
  const iconsByCategory = getIconsByCategory();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {CATEGORY_ORDER.map((category) => {
        const categoryIcons = iconsByCategory[category];
        if (!categoryIcons || categoryIcons.length === 0) return null;

        return (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>{category}</Text>
            <View style={styles.iconGrid}>
              {categoryIcons.map((icon) => (
                <IconChip
                  key={icon.name}
                  icon={icon}
                  isSelected={selectedIcon === icon.name}
                  onPress={() => onSelectIcon(icon.name)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

interface IconChipProps {
  icon: HabitIcon;
  isSelected: boolean;
  onPress: () => void;
}

const IconChip: React.FC<IconChipProps> = ({ icon, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.iconChip,
        isSelected && styles.iconChipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon.ionicon as any}
        size={18}
        color={isSelected ? Colors.primary : Colors.textMuted}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconChipSelected: {
    backgroundColor: Colors.primaryTint,
    borderColor: Colors.primary,
  },
});

export default IconSelector;
