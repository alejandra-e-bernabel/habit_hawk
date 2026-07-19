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
  USER_PROFILE_ICONS,
  UserProfileIcon,
  getUserProfileIconsByCategory,
  USER_PROFILE_CATEGORY_ORDER,
} from '@/constants/UserProfileIcons';

interface ProfileIconSelectorProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string) => void;
}

const ProfileIconSelector: React.FC<ProfileIconSelectorProps> = ({
  selectedIcon,
  onSelectIcon,
}) => {
  const iconsByCategory = getUserProfileIconsByCategory();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {USER_PROFILE_CATEGORY_ORDER.map((category) => {
        const categoryIcons = iconsByCategory[category];
        if (!categoryIcons || categoryIcons.length === 0) return null;

        return (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryLabel}>{category}</Text>
            <View style={styles.iconGrid}>
              {categoryIcons.map((icon) => (
                <ProfileIconChip
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

interface ProfileIconChipProps {
  icon: UserProfileIcon;
  isSelected: boolean;
  onPress: () => void;
}

const ProfileIconChip: React.FC<ProfileIconChipProps> = ({ icon, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.iconChip,
        isSelected && styles.iconChipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBackground, { backgroundColor: icon.backgroundColor }]}>
        <Ionicons
          name={icon.ionicon as any}
          size={22}
          color={icon.iconColor}
        />
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        </View>
      )}
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
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  iconChipSelected: {
    borderColor: '#10B981',
    borderWidth: 3,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
});

export default ProfileIconSelector;
