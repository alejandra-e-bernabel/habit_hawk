import React from "react";
import {
  Text,
  TextProps,
  StyleProp,
  TextStyle,
} from "react-native";

import { FONTS } from "@/constants/theme";

type FontWeight = "regular" | "semiBold" | "bold";

interface AppTextProps extends TextProps {
  weight?: FontWeight;
  style?: StyleProp<TextStyle>;
}

export function AppText({
  weight = "regular",
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: FONTS[weight],
        },
        style,
      ]}
    />
  );
}