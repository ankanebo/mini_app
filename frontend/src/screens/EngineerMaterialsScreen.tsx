import { useMutation, useQuery } from '@apollo/client/react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ADD_FUNCTIONAL_CHAR,
  ADD_OPERATIONAL_CHAR,
  DELETE_FUNCTIONAL_CHAR,
  DELETE_OPERATIONAL_CHAR,
  GET_STANDS,
  GET_MATERIALS_FULL,
  UPDATE_FUNCTIONAL_CHAR,
  UPDATE_OPERATIONAL_CHAR,
} from '../graphql/queries';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EngineerMaterials'>;

type Mode = 'functional' | 'operational';

const EngineerMaterialsScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;
  const canEdit = role === 'engineer';

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('functional');

  const [editItem, setEditItem] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatAmount, setNewMatAmount] = useState('');
  const [newMatUnit, setNewMatUnit] = useState('');

  const [showAddFunctional, setShowAddFunctional] = useState(false);
  const [newFuncDesc, setNewFuncDesc] = useState('');
  const [newFuncValue, setNewFuncValue] = useState('');
  const [newFuncUnit, setNewFuncUnit] = useState('');

  const [showAddOperational, setShowAddOperational] = useState(false);
  const [newOpDesc, setNewOpDesc] = useState('');
  const [newOpValue, setNewOpValue] = useState('');
  const [newOpUnit, setNewOpUnit] = useState('');
  const [newOpStandId, setNewOpStandId] = useState('');
  const [newOpHrId, setNewOpHrId] = useState('');

  const materialsQuery = useQuery<any>(GET_MATERIALS_FULL);
  useQuery<any>(GET_STANDS); // для контекста стендов (можно расширить выбор позже)

  const [updateFunctional, { loading: updatingFunctional }] = useMutation(UPDATE_FUNCTIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });
  const [deleteFunctional, { loading: deletingFunctional }] = useMutation(DELETE_FUNCTIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });

  const [updateOperational, { loading: updatingOperational }] = useMutation(UPDATE_OPERATIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });
  const [deleteOperational, { loading: deletingOperational }] = useMutation(DELETE_OPERATIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });

  const [addFunctional] = useMutation(ADD_FUNCTIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });
  const [addOperational] = useMutation(ADD_OPERATIONAL_CHAR, {
    refetchQueries: [{ query: GET_MATERIALS_FULL }],
  });

  const [addMaterial] = useMutation(
    /* gql defined elsewhere */ 
  );

  const current = useMemo(() => {
    return materialsQuery.data?.materialsFull?.find(
      (m: any) => String(m.material.id) === String(selectedMaterialId),
    );
  }, [materialsQuery.data, selectedMaterialId]);

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditValue(String(item.value));
    setEditUnit(item.unit || '');
    setEditDesc(item.description || item.descriptionOfParametr || '');
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditValue('');
    setEditUnit('');
    setEditDesc('');
  };

  const handleSave = async () => {
    if (!editItem) return;
    const val = Number(editValue);
    if (!Number.isFinite(val)) {
      Alert.alert('Ошибка', 'Значение должно быть числом.');
      return;
    }
    try {
      if (mode === 'functional') {
        await updateFunctional({
          variables: {
            id: editItem.id,
            description: editDesc,
            value: val,
            unit: editUnit,
          },
        });
      } else {
        await updateOperational({
          variables: {
            id: editItem.id,
            description: editDesc,
            value: val,
            unit: editUnit,
          },
        });
      }
      closeEdit();
      Alert.alert('Готово', 'Запись обновлена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось обновить');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (mode === 'functional') {
        await deleteFunctional({ variables: { id: deleteId } });
      } else {
        await deleteOperational({ variables: { id: deleteId } });
      }
      setDeleteId(null);
      Alert.alert('Удалено', 'Запись удалена.');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message ?? 'Не удалось удалить');
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Материалы (инженер)</Text>
        <Text style={styles.subtitle}>
          Выбери материал сверху, затем режим «Функциональные» или «Операционные». Список ниже с
          возможностью редактировать/удалять.
        </Text>

        <Text style={styles.sectionTitle}>Материалы</Text>
        <View style={styles.chipRow}>
          {materialsQuery.data?.materialsFull?.map((m: any) => {
            const active = String(m.material.id) === String(selectedMaterialId);
            return (
              <Pressable
                key={m.material.id}
                onPress={() => setSelectedMaterialId(String(m.material.id))}
                style={[
                  styles.chip,
                  active && { backgroundColor: colors.accentSoft },
                ]}
              >
                <Text style={[styles.chipText, active && { color: '#041013' }]}>
                  {m.material.typeOfMaterial}
                </Text>
              </Pressable>
            );
          })}
          {canEdit && (
            <Pressable style={[styles.chip, { borderStyle: 'dashed' }]} onPress={() => setShowAddMaterial(true)}>
              <Text style={[styles.chipText, { color: colors.accent }]}>+ Добавить</Text>
            </Pressable>
          )}
        </View>

        {selectedMaterialId ? (
          <>
            <Text style={styles.sectionTitle}>Характеристики</Text>
            <View style={styles.catRow}>
              {(['functional', 'operational'] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[
                      styles.categoryButton,
                      active && { borderColor: colors.accent, backgroundColor: colors.cardStrong },
                    ]}
                  >
                    <Text style={styles.categoryText}>
                      {m === 'functional' ? 'Функциональные' : 'Операционные'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'functional' && current?.functional?.length ? (
              current.functional.map((f: any) => (
                <View key={f.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{f.description}</Text>
                  <Text style={styles.rowSubtitle}>
                    {f.value} {f.unit}
                  </Text>
                  {canEdit && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonSave, styles.actionButton, styles.actionButtonEdit]}
                        onPress={() => openEdit(f)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonCancel, styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => setDeleteId(String(f.id))}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : mode === 'functional' ? (
              <Text style={styles.helperText}>Функциональные характеристики отсутствуют.</Text>
            ) : null}
            {mode === 'functional' && canEdit && selectedMaterialId && (
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, { marginTop: 6 }]}
                onPress={() => setShowAddFunctional(true)}
              >
                <Text style={styles.modalButtonSaveText}>Добавить функциональную характеристику</Text>
              </Pressable>
            )}

            {mode === 'operational' && current?.operational?.length ? (
              current.operational.map((o: any) => (
                <View key={o.id} style={styles.row}>
                  <Text style={styles.rowTitle}>{o.description || 'Без описания'}</Text>
                  <Text style={styles.rowSubtitle}>
                    {o.value} {o.unit}
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    Стенд: {o.stand?.nameOfStand || o.stand?.id || '—'}
                  </Text>
                  {canEdit && (
                    <View style={styles.actionRow}>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonSave, styles.actionButton, styles.actionButtonEdit]}
                        onPress={() => openEdit(o)}
                      >
                        <Text style={styles.modalButtonSaveText}>Редактировать</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonCancel, styles.actionButton, styles.actionButtonDelete]}
                        onPress={() => setDeleteId(String(o.id))}
                      >
                        <Text style={styles.modalButtonDeleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : mode === 'operational' ? (
              <Text style={styles.helperText}>Операционные характеристики отсутствуют.</Text>
            ) : null}
            {mode === 'operational' && canEdit && selectedMaterialId && (
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, { marginTop: 6 }]}
                onPress={() => setShowAddOperational(true)}
              >
                <Text style={styles.modalButtonSaveText}>Добавить операционную характеристику</Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text style={styles.helperText}>Сначала выбери материал.</Text>
        )}
      </ScrollView>

      {/* Модалка редактирования */}
      <Modal
        visible={!!editItem}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать</Text>
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={editDesc}
              onChangeText={setEditDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={editUnit}
              onChangeText={setEditUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={closeEdit}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSave}
                disabled={updatingFunctional || updatingOperational}
              >
                <Text style={styles.modalButtonSaveText}>
                  {updatingFunctional || updatingOperational ? 'Сохраняем…' : 'Сохранить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Подтверждение удаления */}
      <Modal
        visible={!!deleteId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить запись?</Text>
            <Text style={styles.blockText}>Действие необратимо.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteId(null)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
                disabled={deletingFunctional || deletingOperational}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {deletingFunctional || deletingOperational ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление материала */}
      <Modal visible={showAddMaterial} transparent animationType="fade" onRequestClose={() => setShowAddMaterial(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить материал</Text>
            <TextInput
              style={styles.input}
              placeholder="Тип материала"
              placeholderTextColor={colors.textSecondary}
              value={newMatName}
              onChangeText={setNewMatName}
            />
            <TextInput
              style={styles.input}
              placeholder="Количество"
              placeholderTextColor={colors.textSecondary}
              value={newMatAmount}
              onChangeText={setNewMatAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newMatUnit}
              onChangeText={setNewMatUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowAddMaterial(false)}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  const amt = Number(newMatAmount);
                  if (!newMatName.trim() || !newMatUnit.trim() || !Number.isFinite(amt)) {
                    Alert.alert('Ошибка', 'Заполни тип, количество (число) и единицу.');
                    return;
                  }
                  try {
                    await addMaterial({
                      variables: {
                        typeOfMaterial: newMatName.trim(),
                        amount: amt,
                        unit: newMatUnit.trim(),
                      },
                    });
                    setShowAddMaterial(false);
                    setNewMatName('');
                    setNewMatAmount('');
                    setNewMatUnit('');
                    Alert.alert('Готово', 'Материал добавлен.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить материал');
                  }
                }}
              >
                <Text style={styles.modalButtonSaveText}>Сохранить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление функциональной характеристики */}
      <Modal
        visible={showAddFunctional}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFunctional(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить функциональную характеристику</Text>
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={newFuncDesc}
              onChangeText={setNewFuncDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={newFuncValue}
              onChangeText={setNewFuncValue}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newFuncUnit}
              onChangeText={setNewFuncUnit}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowAddFunctional(false)}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedMaterialId) return;
                  const val = Number(newFuncValue);
                  if (!newFuncDesc.trim() || !newFuncUnit.trim() || !Number.isFinite(val)) {
                    Alert.alert('Ошибка', 'Заполни описание, значение (число) и единицу.');
                    return;
                  }
                  try {
                    await addFunctional({
                      variables: {
                        materialId: selectedMaterialId,
                        description: newFuncDesc.trim(),
                        value: val,
                        unit: newFuncUnit.trim(),
                      },
                    });
                    setShowAddFunctional(false);
                    setNewFuncDesc('');
                    setNewFuncValue('');
                    setNewFuncUnit('');
                    Alert.alert('Готово', 'Характеристика добавлена.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить характеристику');
                  }
                }}
              >
                <Text style={styles.modalButtonSaveText}>Сохранить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Добавление операционной характеристики */}
      <Modal
        visible={showAddOperational}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddOperational(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить операционную характеристику</Text>
            <TextInput
              style={styles.input}
              placeholder="Описание"
              placeholderTextColor={colors.textSecondary}
              value={newOpDesc}
              onChangeText={setNewOpDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Значение"
              placeholderTextColor={colors.textSecondary}
              value={newOpValue}
              onChangeText={setNewOpValue}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Единица"
              placeholderTextColor={colors.textSecondary}
              value={newOpUnit}
              onChangeText={setNewOpUnit}
            />
            <TextInput
              style={styles.input}
              placeholder="ID стенда"
              placeholderTextColor={colors.textSecondary}
              value={newOpStandId}
              onChangeText={setNewOpStandId}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="ID требования оборудования"
              placeholderTextColor={colors.textSecondary}
              value={newOpHrId}
              onChangeText={setNewOpHrId}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowAddOperational(false)}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={async () => {
                  if (!selectedMaterialId) return;
                  const val = Number(newOpValue);
                  const standIdNum = Number(newOpStandId);
                  const hrIdNum = Number(newOpHrId);
                  if (
                    !newOpUnit.trim() ||
                    !Number.isFinite(val) ||
                    !Number.isFinite(standIdNum) ||
                    !Number.isFinite(hrIdNum)
                  ) {
                    Alert.alert('Ошибка', 'Заполни значение, единицу, ID стенда и ID требования (числа).');
                    return;
                  }
                  try {
                    await addOperational({
                      variables: {
                        materialId: selectedMaterialId,
                        standId: standIdNum,
                        hardwareRequirementId: hrIdNum,
                        description: newOpDesc.trim(),
                        value: val,
                        unit: newOpUnit.trim(),
                      },
                    });
                    setShowAddOperational(false);
                    setNewOpDesc('');
                    setNewOpValue('');
                    setNewOpUnit('');
                    setNewOpStandId('');
                    setNewOpHrId('');
                    Alert.alert('Готово', 'Характеристика добавлена.');
                  } catch (e: any) {
                    Alert.alert('Ошибка', e.message ?? 'Не удалось добавить характеристику');
                  }
                }}
              >
                <Text style={styles.modalButtonSaveText}>Сохранить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  catRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  categoryButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryText: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  rowTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  rowSubtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 2 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  actionButtonEdit: { marginRight: 6 },
  actionButtonDelete: { marginLeft: 6 },
  helperText: { color: colors.textSecondary, marginBottom: 10 },
  blockText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0e1a1e',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10252c',
  },
  modalTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },
  modalButtonCancel: { borderColor: colors.border, backgroundColor: colors.cardStrong },
  modalButtonSave: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalButtonDelete: { borderColor: colors.danger, backgroundColor: colors.danger },
  modalButtonText: { color: colors.textPrimary, fontWeight: '700' },
  modalButtonSaveText: { color: '#041013', fontWeight: '800' },
  modalButtonDeleteText: { color: '#0f0f0f', fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});

export default EngineerMaterialsScreen;
