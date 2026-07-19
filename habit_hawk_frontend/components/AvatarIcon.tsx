import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfileIconByName } from '@/constants/UserProfileIcons';

interface AvatarIconProps {
  firstName?: string;
  lastName?: string;
  username: string;
  profileIconName?: string;
  profileImageUrl?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  borderColor?: string;
  borderWidth?: number;
}

const AvatarIcon: React.FC<AvatarIconProps> = ({
  firstName,
  lastName,
  username,
  profileIconName,
  profileImageUrl,
  size = 'medium',
  borderColor = '#C0E5C8',
  borderWidth = 3,
}) => {
  // Size configurations
  const sizeConfig = {
    small: { container: 40, icon: 20, text: 16 },
    medium: { container: 70, icon: 32, text: 24 },
    large: { container: 90, icon: 40, text: 32 },
    xlarge: { container: 120, icon: 52, text: 42 },
  };

  // Handle both preset sizes and custom numeric sizes
  const config = typeof size === 'number'
    ? { container: size, icon: size * 0.5, text: size * 0.4 }
    : sizeConfig[size];
  const radius = config.container / 2;

  // Helper to get initials from name or username
  const getInitials = () => {
    if (firstName || lastName) {
      const first = firstName?.[0] || '';
      const last = lastName?.[0] || '';
      return (first + last).toUpperCase();
    }

    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderContent = () => {
    // Priority 1: Profile image URL
    if (profileImageUrl) {
      return (
        <Image
          source={{ uri: profileImageUrl }}
          style={[styles.image, { width: config.container, height: config.container, borderRadius: radius }]}
        />
      );
    }

    // Priority 2: Profile icon from library (with colorful background)
    if (profileIconName) {
      const icon = getUserProfileIconByName(profileIconName);
      return (
        <View style={[styles.iconContainer, { backgroundColor: icon.backgroundColor }]}>
          <Ionicons
            name={icon.ionicon as any}
            size={config.icon}
            color={icon.iconColor}
          />
        </View>
      );
    }

    // Priority 3: Initials fallback
    return (
      <Text style={[styles.initials, { fontSize: config.text }]}>
        {getInitials()}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: config.container,
          height: config.container,
          borderRadius: radius,
          borderColor: borderColor,
          borderWidth: borderWidth,
        },
      ]}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: 'bold',
    color: '#666',
  },
});

export default AvatarIcon;
