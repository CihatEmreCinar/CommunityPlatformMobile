import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, type DateData } from 'react-native-calendars';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';
import type { CalendarEvent } from '../services/calendarService';
import { CALENDAR_EVENT_COLORS } from '../services/calendarService';

function toDateKey(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeRange(startAt: string, endAt: string): string {
  const start = new Date(startAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const end = new Date(endAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return `${start} – ${end}`;
}

const TYPE_LABELS: Record<CalendarEvent['type'], string> = {
  workshop: 'Atölye',
  booking: 'Rezervasyon',
  'booking-pending': 'Bekleyen Rezervasyon',
};

interface CalendarWidgetProps {
  events: CalendarEvent[];
  loading: boolean;
}

export function CalendarWidget({ events, loading }: CalendarWidgetProps) {
  const [visible, setVisible] = useState(false);
  const todayKey = toDateKey(new Date().toISOString());
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const key = toDateKey(event.startAt);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [events]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const [date, dayEvents] of Object.entries(eventsByDate)) {
      const seenColors = new Set<string>();
      const dots = dayEvents
        .filter((e) => {
          if (seenColors.has(e.color)) return false;
          seenColors.add(e.color);
          return true;
        })
        .map((e) => ({ key: e.type, color: e.color }));
      marks[date] = { dots };
    }

    marks[selectedDate] = {
      ...(marks[selectedDate] ?? { dots: [] }),
      selected: true,
      selectedColor: Colors.primary,
    };

    return marks;
  }, [eventsByDate, selectedDate]);

  const todayEvents = eventsByDate[todayKey] ?? [];
  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const legendTypes = useMemo(() => {
    const seen = new Set<CalendarEvent['type']>();
    for (const e of events) seen.add(e.type);
    return Array.from(seen);
  }, [events]);

  const todayLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const selectedLabel = new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

  return (
    <>
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => setVisible(true)}>
        <View style={styles.cardIconWrap}>
          <MaterialIcons name="calendar-today" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{todayLabel}</Text>
          <Text style={styles.cardSubtitle}>
            {loading ? 'Yükleniyor…' : todayEvents.length === 0 ? 'Bugün etkinlik yok' : `Bugün ${todayEvents.length} etkinlik`}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={Colors.outline} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Takvim</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <MaterialIcons name="close" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Calendar
                current={selectedDate}
                markingType="multi-dot"
                markedDates={markedDates}
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                theme={{
                  todayTextColor: Colors.primary,
                  arrowColor: Colors.primary,
                  selectedDayBackgroundColor: Colors.primary,
                }}
              />

              <View style={styles.legendRow}>
                {legendTypes.map((type) => (
                  <View key={type} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CALENDAR_EVENT_COLORS[type] }]} />
                    <Text style={styles.legendText}>{TYPE_LABELS[type]}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.selectedDateLabel}>{selectedLabel}</Text>

              {selectedEvents.length === 0 ? (
                <View style={styles.emptyDay}>
                  <MaterialIcons name="event-busy" size={28} color={Colors.outline} />
                  <Text style={styles.emptyDayText}>Bu gün için etkinlik yok</Text>
                </View>
              ) : (
                selectedEvents
                  .sort((a, b) => a.startAt.localeCompare(b.startAt))
                  .map((event) => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                      <View style={styles.eventTextWrap}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                        <Text style={styles.eventTime}>{formatTimeRange(event.startAt, event.endAt)}</Text>
                      </View>
                      <View style={[styles.eventBadge, { backgroundColor: event.color + '1A' }]}>
                        <Text style={[styles.eventBadgeText, { color: event.color }]}>{TYPE_LABELS[event.type]}</Text>
                      </View>
                    </View>
                  ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { ...Typography.labelMd, color: Colors.onSurface },
  cardSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: 2 },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  modalTitle: { ...Typography.h3, color: Colors.onSurface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.sm },
  legendRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13 },
  selectedDateLabel: { ...Typography.labelMd, color: Colors.onSurface, marginTop: Spacing.md, textTransform: 'capitalize' },
  emptyDay: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs },
  emptyDayText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceVariant,
    padding: Spacing.sm,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventTextWrap: { flex: 1 },
  eventTitle: { ...Typography.labelMd, color: Colors.onSurface },
  eventTime: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, fontSize: 13, marginTop: 2 },
  eventBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  eventBadgeText: { ...Typography.labelSm, fontWeight: '700' },
});