import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView, { type WebViewNavigation } from 'react-native-webview';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// ₦2,000 = 200,000 kobo
const PRO_AMOUNT_KOBO = 200000;
const PRO_AMOUNT_NGN  = PRO_AMOUNT_KOBO / 100;

interface PaystackModalProps {
  visible:   boolean;
  userId:    string;
  email:     string;
  onSuccess: () => void;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Build the Paystack inline checkout HTML
// ---------------------------------------------------------------------------
function buildCheckoutHtml(publicKey: string, email: string, amount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #151130; display: flex; align-items: center; justify-content: center; height: 100vh; }
  </style>
</head>
<body>
  <script>
    var handler = PaystackPop.setup({
      key:       '${publicKey}',
      email:     '${email}',
      amount:    ${amount},
      currency:  'NGN',
      callback: function(response) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'success', reference: response.reference })
        );
      },
      onClose: function() {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'cancel' })
        );
      }
    });
    handler.openIframe();
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PaystackModal({ visible, userId, email, onSuccess, onDismiss }: PaystackModalProps) {
  const publicKey  = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const [loading, setLoading]       = useState(false);
  const [webReady, setWebReady]     = useState(false);
  const processed = useRef(false);

  const html = buildCheckoutHtml(publicKey, email, PRO_AMOUNT_KOBO);

  async function handleMessage(event: { nativeEvent: { data: string } }) {
    if (processed.current) return;

    let payload: { type: string; reference?: string };
    try { payload = JSON.parse(event.nativeEvent.data); }
    catch { return; }

    if (payload.type === 'cancel') {
      onDismiss();
      return;
    }

    if (payload.type === 'success' && payload.reference) {
      processed.current = true;
      setLoading(true);
      try {
        await supabase.from('transactions').insert({
          user_id:   userId,
          reference: payload.reference,
          amount:    PRO_AMOUNT_KOBO,
          currency:  'NGN',
          status:    'success',
        });
        await supabase.from('profiles').update({ plan: 'pro' }).eq('id', userId);
        onSuccess();
      } finally {
        setLoading(false);
        processed.current = false;
      }
    }
  }

  function handleNavChange(nav: WebViewNavigation) {
    // Paystack may redirect to a callback URL — intercept cancels
    if (nav.url.includes('paystack.co') === false && nav.url !== 'about:blank') {
      onDismiss();
    }
  }

  function handleDismiss() {
    if (!loading) {
      processed.current = false;
      onDismiss();
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleDismiss}
      statusBarTranslucent>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.headerTitle}>Upgrade · ₦{PRO_AMOUNT_NGN.toLocaleString()}</Text>
          </View>
          <Pressable
            onPress={handleDismiss}
            style={styles.closeBtn}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* WebView */}
        <WebView
          source={{ html }}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavChange}
          onLoadEnd={() => setWebReady(true)}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
          originWhitelist={['*']}
        />

        {/* Overlays */}
        {(!webReady || loading) && (
          <View style={styles.overlay}>
            <ActivityIndicator color={Brand.lavenderTonic} size="large" />
            <Text style={styles.overlayText}>
              {loading ? 'Confirming payment…' : 'Loading checkout…'}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.championBlue },

  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop:      56,
    paddingBottom:   Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2856',
  },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headerTitle:   { fontFamily: Fonts.bold, fontSize: 16, color: Brand.lavenderTonic },
  proBadge:      { backgroundColor: Brand.lavenderTonic, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  proBadgeText:  { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 1, color: Brand.championBlue },

  closeBtn:  { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: '#2d2856', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: Fonts.regular, fontSize: 13, color: Brand.lavenderTonic },

  webview: { flex: 1, backgroundColor: Brand.championBlue },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Brand.championBlue,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             Spacing.three,
  },
  overlayText: { fontFamily: Fonts.medium, fontSize: 15, color: Brand.lavenderTonic },
});
