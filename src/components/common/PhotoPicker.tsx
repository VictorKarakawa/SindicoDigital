import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';

interface PhotoPickerProps {
  value?: string | null;
  onChange: (base64: string) => void;
  size?: number;
  label?: string;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  value,
  onChange,
  size = 100,
  label = 'Foto',
}) => {
  const [loading, setLoading] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      setLoading(true);

      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        ...(source === 'camera'
          ? { mediaTypes: ['images'] }
          : { mediaTypes: ['images'] }),
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (source === 'camera') {
        const cameraResult = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
        });
        if (!cameraResult.canceled && cameraResult.assets[0]?.base64) {
          onChange(`data:image/jpeg;base64,${cameraResult.assets[0].base64}`);
        }
        return;
      }

      if (!result.canceled && result.assets[0]?.base64) {
        onChange(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setLoading(false);
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Câmera', 'Galeria'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickImage('camera');
          else if (index === 2) pickImage('gallery');
        }
      );
    } else {
      // On Android/Web, default to gallery with a simple selector
      Alert.alert('Escolher foto', 'De onde deseja selecionar a foto?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📷 Câmera', onPress: () => pickImage('camera') },
        { text: '🖼️ Galeria', onPress: () => pickImage('gallery') },
      ]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={showOptions}
        activeOpacity={0.75}
        disabled={loading}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <User size={size * 0.35} color={Colors.textMuted} />
          </View>
        )}

        {/* Camera overlay */}
        <View style={styles.cameraOverlay}>
          <Camera size={16} color={Colors.white} />
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>Toque para {value ? 'alterar' : 'adicionar'} foto</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    marginBottom: Spacing.sm,
  },
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: Spacing.xs,
  },
});
