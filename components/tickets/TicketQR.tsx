import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Radius } from '../../constants/theme';

export function TicketQR({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <View style={styles.wrap}>
      <QRCode value={value} size={size} backgroundColor="#FFFFFF" color={Colors.onSurface} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
