import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { createApartment, updateApartment, getBlocks } from '../../../services/structure.service';
import { Apartment, ApartmentType, ApartmentStatus, Block } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { DoorOpen, Building2, LayoutList, AlignLeft, Users } from 'lucide-react-native';
import { ApartmentTypeLabels, ApartmentStatusLabels } from '../../../constants/roles';

export const CreateEditApartmentScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Apartment | undefined = route.params?.apartment;
  
  const [number, setNumber] = useState(existing?.number ?? '');
  const [blockId, setBlockId] = useState(existing?.blockId ?? '');
  const [type, setType] = useState<ApartmentType>(existing?.type ?? 'apartment');
  const [status, setStatus] = useState<ApartmentStatus>(existing?.status ?? 'available');
  const [floor, setFloor] = useState(existing?.floor ?? '');
  const [observations, setObservations] = useState(existing?.observations ?? '');
  const [maxResidents, setMaxResidents] = useState(existing?.maxResidents?.toString() ?? '');
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBlocks().then(res => {
      setBlocks(res);
      setLoadingBlocks(false);
    });
  }, []);

  const handleSave = async () => {
    if (!number.trim()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Número é obrigatório.' });
      return;
    }

    setLoading(true);
    const selectedBlock = blocks.find(b => b.id === blockId);

    try {
      if (existing) {
        await updateApartment(existing.id, {
          number: number.trim(),
          blockId: blockId || undefined,
          blockName: selectedBlock?.name,
          type,
          status,
          floor: floor.trim(),
          observations: observations.trim(),
          maxResidents: maxResidents.trim() ? parseInt(maxResidents.trim(), 10) : undefined,
        });
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Unidade atualizada com sucesso.' });
      } else {
        await createApartment({
          number: number.trim(),
          blockId: blockId || undefined,
          blockName: selectedBlock?.name,
          type,
          status,
          floor: floor.trim(),
          observations: observations.trim(),
          maxResidents: maxResidents.trim() ? parseInt(maxResidents.trim(), 10) : undefined,
          createdAt: Date.now(),
        });
        Toast.show({ type: 'success', text1: 'Cadastrado', text2: 'Unidade criada com sucesso.' });
      }
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao salvar unidade.' });
    } finally {
      setLoading(false);
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onSelect: (val: any) => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionBtn, isActive && styles.optionBtnActive]}
              onPress={() => onSelect(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{existing ? 'Editar Unidade' : 'Nova Unidade'}</Text>
      
      <View style={styles.form}>
        <Input
          label="Número/Identificação *"
          value={number}
          onChangeText={setNumber}
          placeholder="Ex: 101, Casa 5"
          leftIcon={<DoorOpen size={20} color={Colors.textSecondary} />}
        />

        {/* Block Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bloco (Opcional)</Text>
          {loadingBlocks ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blocksScroll}>
              <TouchableOpacity
                style={[styles.optionBtn, !blockId && styles.optionBtnActive]}
                onPress={() => setBlockId('')}
              >
                <Text style={[styles.optionText, !blockId && styles.optionTextActive]}>Sem bloco</Text>
              </TouchableOpacity>
              {blocks.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.optionBtn, blockId === b.id && styles.optionBtnActive, { marginLeft: 8 }]}
                  onPress={() => setBlockId(b.id)}
                >
                  <Text style={[styles.optionText, blockId === b.id && styles.optionTextActive]}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {renderSelect('Tipo', type, [
          { value: 'apartment', label: 'Apt' },
          { value: 'house', label: 'Casa' },
          { value: 'penthouse', label: 'Cobertura' },
          { value: 'commercial', label: 'Comercial' },
        ], setType)}

        {renderSelect('Status', status, [
          { value: 'available', label: 'Disponível' },
          { value: 'occupied', label: 'Ocupado' },
          { value: 'inactive', label: 'Inativo' },
        ], setStatus)}

        <Input
          label="Andar (Opcional)"
          value={floor}
          onChangeText={setFloor}
          placeholder="Ex: 1º Andar, Térreo"
          leftIcon={<LayoutList size={20} color={Colors.textSecondary} />}
        />
        
        <Input
          label="Limite de moradores (Opcional)"
          value={maxResidents}
          onChangeText={setMaxResidents}
          keyboardType="numeric"
          placeholder="Ex: 4"
          leftIcon={<Users size={20} color={Colors.textSecondary} />}
        />
        
        <Input
          label="Observações"
          value={observations}
          onChangeText={setObservations}
          placeholder="Observações adicionais..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          leftIcon={<AlignLeft size={20} color={Colors.textSecondary} />}
        />
        
        <Button
          title={existing ? 'Salvar alterações' : 'Criar unidade'}
          onPress={handleSave}
          loading={loading}
          size="lg"
          style={styles.saveBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 100 },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
  },
  inputGroup: { marginBottom: Spacing.sm },
  label: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  blocksScroll: { flexDirection: 'row' },
  optionBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  optionBtnActive: { backgroundColor: Colors.accent + '15', borderColor: Colors.accent },
  optionText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  optionTextActive: { color: Colors.accent, fontWeight: Typography.bold },
  saveBtn: { marginTop: Spacing.md },
});
