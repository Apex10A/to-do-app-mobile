import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default'    && styles.default,
        type === 'title'      && styles.title,
        type === 'subtitle'   && styles.subtitle,
        type === 'small'      && styles.small,
        type === 'smallBold'  && styles.smallBold,
        type === 'link'       && styles.link,
        type === 'linkPrimary'&& styles.linkPrimary,
        type === 'code'       && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.semibold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  small: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  linkPrimary: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
