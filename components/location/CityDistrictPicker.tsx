import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { locationService } from '../../services/locationService';
import type { City, District, LocationSelection } from '../../types/location';
import { LocationPickerModal, type LocationPickerItem } from './LocationPickerModal';

export interface CityDistrictPickerProps {
  value: LocationSelection;
  onChange: (next: LocationSelection) => void;
  cityLabel?: string;
  districtLabel?: string;
  /** İlçe seçimi zorunlu değilse (çoğu ekranda böyle) placeholder "opsiyonel" belirtir. */
  districtOptional?: boolean;
  /** Sadece yatay iki kutu yerine dikey (alt alta) yerleşim istenirse. */
  layout?: 'row' | 'column';
}

/**
 * İl seçilince ilçe listesini otomatik çeker; il değişirse (farklı bir il
 * seçilirse) önceki ilçe seçimini otomatik temizler — backend'de ilçe her
 * zaman bir ile bağlı olduğundan tutarsız (il A + ilçe B) kombinasyon
 * oluşmasını engeller.
 */
export function CityDistrictPicker({
  value,
  onChange,
  cityLabel = 'Şehir',
  districtLabel = 'İlçe',
  districtOptional = true,
  layout = 'row',
}: CityDistrictPickerProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const [districts, setDistricts] = useState<District[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState<string | null>(null);

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    setCitiesError(null);
    try {
      const data = await locationService.getCities();
      setCities(data);
    } catch {
      setCitiesError('İl listesi yüklenemedi.');
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const loadDistricts = useCallback(async (cityId: string) => {
    setDistrictsLoading(true);
    setDistrictsError(null);
    try {
      const data = await locationService.getDistricts(cityId);
      setDistricts(data);
    } catch {
      setDistrictsError('İlçe listesi yüklenemedi.');
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  // İl önceden seçiliyse (örn. profil düzenleme ekranı açılırken) ilçe
  // listesini baştan hazırla — kullanıcı ilçe kutusuna dokununca beklemesin.
  useEffect(() => {
    if (value.cityId) {
      loadDistricts(value.cityId);
    } else {
      setDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.cityId]);

  function openCityModal() {
    if (cities.length === 0 && !citiesLoading) {
      loadCities();
    }
    setCityModalVisible(true);
  }

  function openDistrictModal() {
    if (!value.cityId) return;
    setDistrictModalVisible(true);
  }

  function handleCitySelect(item: LocationPickerItem) {
    setCityModalVisible(false);
    if (item.id === value.cityId) return;
    onChange({
      cityId: item.id,
      cityName: item.name,
      districtId: null,
      districtName: null,
    });
  }

  function handleDistrictSelect(item: LocationPickerItem) {
    setDistrictModalVisible(false);
    onChange({
      ...value,
      districtId: item.id,
      districtName: item.name,
    });
  }

  function clearDistrict(event?: any) {
    event?.stopPropagation?.();
    onChange({ ...value, districtId: null, districtName: null });
  }

  const cityItems: LocationPickerItem[] = cities.map((c) => ({ id: c.id, name: c.name, subtitle: c.plateCode }));
  const districtItems: LocationPickerItem[] = districts.map((d) => ({ id: d.id, name: d.name }));

  return (
    <View style={[styles.wrapper, layout === 'row' && styles.row]}>
      <View style={[styles.fieldGroup, layout === 'row' && styles.rowItem]}>
        <Text style={styles.label}>{cityLabel}</Text>
        <TouchableOpacity style={styles.field} onPress={openCityModal} activeOpacity={0.7}>
          <Text style={[styles.fieldText, !value.cityName && styles.fieldPlaceholder]} numberOfLines={1}>
            {value.cityName ?? 'Seç'}
          </Text>
          {citiesLoading ? (
            <ActivityIndicator size="small" color={Colors.outline} />
          ) : (
            <MaterialIcons name="expand-more" size={20} color={Colors.outline} />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.fieldGroup, layout === 'row' && styles.rowItem]}>
        <Text style={styles.label}>
          {districtLabel}
          {districtOptional ? ' (opsiyonel)' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.field, !value.cityId && styles.fieldDisabled]}
          onPress={openDistrictModal}
          activeOpacity={0.7}
          disabled={!value.cityId}
        >
          <Text
            style={[styles.fieldText, !value.districtName && styles.fieldPlaceholder]}
            numberOfLines={1}
          >
            {value.districtName ?? (value.cityId ? 'Seç' : 'Önce şehir seçin')}
          </Text>
          {value.districtName ? (
            <TouchableOpacity onPress={clearDistrict} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={16} color={Colors.outline} />
            </TouchableOpacity>
          ) : districtsLoading ? (
            <ActivityIndicator size="small" color={Colors.outline} />
          ) : (
            <MaterialIcons name="expand-more" size={20} color={Colors.outline} />
          )}
        </TouchableOpacity>
      </View>

      <LocationPickerModal
        visible={cityModalVisible}
        title="Şehir Seç"
        items={cityItems}
        selectedId={value.cityId}
        loading={citiesLoading}
        errorMessage={citiesError}
        searchPlaceholder="Şehir ara..."
        onSelect={handleCitySelect}
        onClose={() => setCityModalVisible(false)}
      />

      <LocationPickerModal
        visible={districtModalVisible}
        title="İlçe Seç"
        items={districtItems}
        selectedId={value.districtId}
        loading={districtsLoading}
        errorMessage={districtsError}
        searchPlaceholder="İlçe ara..."
        emptyMessage="Bu şehir için ilçe bulunamadı."
        onSelect={handleDistrictSelect}
        onClose={() => setDistrictModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  row: { flexDirection: 'row' },
  fieldGroup: { gap: Spacing.xs },
  rowItem: { flex: 1 },
  label: { ...Typography.labelMd, color: Colors.onSurfaceVariant },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: Spacing.xs,
  },
  fieldDisabled: { opacity: 0.6 },
  fieldText: { ...Typography.bodyLg, fontSize: 14, color: Colors.onSurface, flex: 1 },
  fieldPlaceholder: { color: Colors.onSurfaceVariant },
});
