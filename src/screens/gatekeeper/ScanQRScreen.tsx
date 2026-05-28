import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getVisits, checkinVisit, checkoutVisit } from '../../services/visits.service';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Camera as CameraIcon, RefreshCcw } from 'lucide-react-native';
import { Button } from '../../components/common/Button';

export const ScanQRScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);

    try {
      const visits = await getVisits();
      const visit = visits.find((v) => v.qrCode === data);

      if (!visit) {
        Alert.alert('Não encontrado', 'QR Code inválido ou visita não cadastrada.', [
          { text: 'Tentar novamente', onPress: () => setScanned(false) },
        ]);
        return;
      }

      if (visit.status === 'pending') {
        Alert.alert(
          'Visitante encontrado',
          `Nome: ${visit.visitorName}\nAnfitrião: ${visit.hostName ?? '—'}\n\nRegistrar entrada?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
            {
              text: 'Confirmar entrada', onPress: async () => {
                await checkinVisit(visit.id);
                Alert.alert('Check-in', `${visit.visitorName} entrou no condomínio.`);
                setScanned(false);
              },
            },
          ]
        );
      } else if (visit.status === 'checked_in') {
        Alert.alert(
          'Visitante no condomínio',
          `Nome: ${visit.visitorName}\nAnfitrião: ${visit.hostName ?? '—'}\n\nRegistrar saída?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
            {
              text: 'Confirmar saída', onPress: async () => {
                await checkoutVisit(visit.id);
                Alert.alert('Check-out', `${visit.visitorName} saiu do condomínio.`);
                setScanned(false);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Status da visita',
          `Nome: ${visit.visitorName}\nStatus: ${visit.status}`,
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch {
      Alert.alert('Erro', 'Falha ao processar QR Code.', [
        { text: 'Tentar novamente', onPress: () => setScanned(false) },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <CameraIcon size={60} color={Colors.textSecondary} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.permissionTitle}>Câmera necessária</Text>
        <Text style={styles.permissionText}>
          O porteiro precisa de acesso à câmera para ler QR Codes dos visitantes.
        </Text>
        <Button title="Conceder permissão" onPress={requestPermission} size="lg" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <View style={styles.instructionRow}>
            {processing ? <RefreshCcw size={20} color={Colors.white} /> : <CameraIcon size={20} color={Colors.white} />}
            <Text style={styles.instruction}>
              {processing ? 'Processando...' : 'Aponte para o QR Code do visitante'}
            </Text>
          </View>
          {scanned && !processing && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => setScanned(false)}>
              <RefreshCcw size={16} color={Colors.white} />
              <Text style={styles.resetTxt}>Escanear novamente</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const SCAN_SIZE = 250;
const CORNER_SIZE = 24;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  permissionContainer: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  permissionText: {
    fontSize: Typography.base, color: Colors.textMuted,
    textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22,
  },
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: Colors.overlay },
  middleRow: { flexDirection: 'row', height: SCAN_SIZE },
  sideOverlay: { flex: 1, backgroundColor: Colors.overlay },
  scanBox: {
    width: SCAN_SIZE, height: SCAN_SIZE,
    borderRadius: 4, overflow: 'hidden',
  },
  bottomOverlay: {
    flex: 1, backgroundColor: Colors.overlay,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: Spacing.xl,
  },
  instructionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  instruction: {
    color: Colors.white, fontSize: Typography.base,
    fontWeight: Typography.medium, textAlign: 'center',
  },
  resetBtn: {
    marginTop: Spacing.lg, paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  resetTxt: { color: Colors.textInverse, fontWeight: Typography.semiBold },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.accent, borderWidth: CORNER_WIDTH,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderRadius: 4 },
});
