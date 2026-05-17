import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { subscribeToSpaces, deleteSpace } from '../../../services/spaces.service';
import { Waves, Users, ClipboardList } from 'lucide-react-native';
import { Space } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing } from '../../../constants/typography';

export const SpacesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const isSyndic = userProfile?.role === 'syndic';

  useEffect(() => {
    const unsub = subscribeToSpaces(setSpaces);
    return unsub;
  }, []);

  const handleDelete = (space: Space) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir espaço "${space.name}"?`)) {
        deleteSpace(space.id);
      }
      return;
    }
    Alert.alert('Confirmar', `Excluir espaço "${space.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteSpace(space.id) },
    ]);
  };

  const renderSpace = ({ item }: { item: Space }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.spaceName}>{item.name}</Text>
          <View style={{flexDirection:"row", alignItems:"center", gap:4}}><Users size={14} color={Colors.textMuted}/><Text style={styles.capacity}>Até {item.capacity} pessoas</Text></View>
        </View>
        <Badge label={item.active ? 'Ativo' : 'Inativo'}
          color={item.active ? 'success' : 'error'} />
      </View>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
      {item.rules && (
        <Text style={styles.rules}>{item.rules}</Text>
      )}
      {isSyndic && (
        <View style={styles.actions}>
          <Button title="Editar" variant="outline" size="sm"
            onPress={() => navigation.navigate('CreateEditSpace', { space: item })} />
          <Button title="Excluir" variant="danger" size="sm"
            onPress={() => handleDelete(item)} />
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={spaces}
        keyExtractor={(item) => item.id}
        renderItem={renderSpace}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon={<Waves size={48} color={Colors.textMuted} />} title="Nenhum espaço cadastrado"
            subtitle={isSyndic ? 'Toque no + para adicionar.' : 'Aguarde o síndico cadastrar espaços.'} />
        }
      />
      {isSyndic && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEditSpace', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  card: { gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  spaceName: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary,
  },
  capacity: { fontSize: Typography.sm, color: Colors.textMuted },
  description: { fontSize: Typography.base, color: Colors.textSecondary },
  rules: { fontSize: Typography.sm, color: Colors.textMuted, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
