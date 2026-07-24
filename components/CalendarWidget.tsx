import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Icon } from './ui/Icon';
import { IconCircleButton } from './ui/IconCircleButton';
import { Calendar, type DateData } from 'react-native-calendars';
import { Colors, Pastel, Fonts, Typography, Spacing, Radius } from '../constants/theme';
import type { CalendarEvent } from '../services/calendarService';
import { CALENDAR_EVENT_COLORS } from '../services/calendarService';

function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

// react-native-calendars'ın kendi ızgarasını sistemimize (serif ay başlığı,
// Plus Jakarta Sans gün etiketleri, flat teal vurgu) uyarlayan tema.
const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: Colors.onSurfaceVariant,
  selectedDayBackgroundColor: Colors.primary,
  selectedDayTextColor: Colors.onPrimary,
  todayBackgroundColor: Pastel.teal.tintStrong,
  todayTextColor: Pastel.teal.text,
  dayTextColor: Colors.onSurface,
  textDisabledColor: Colors.outlineVariant,
  dotColor: Colors.primary,
  selectedDotColor: Colors.onPrimary,
  arrowColor: Pastel.teal.text,
  monthTextColor: Colors.onSurface,
  textMonthFontFamily: Fonts.serifSemibold,
  textDayFontFamily: Fonts.sansMedium,
  textDayHeaderFontFamily: Fonts.sansSemibold,
  textMonthFontSize: 17,
  textDayFontSize: 14,
  textDayHeaderFontSize: 11,
  'stylesheet.calendar.header': {
    week: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  },
} as const;

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
    marks[selectedDate] = { ...(marks[selectedDate] ?? { dots: [] }), selected: true, selectedColor: Colors.primary };
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
          <Icon name="calendarToday" size={22} color={Pastel.teal.text} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{todayLabel}</Text>
          <Text style={styles.cardSubtitle}>
            {loading ? 'Yükleniyor…' : todayEvents.length === 0 ? 'Bugün etkinlik yok' : `Bugün ${todayEvents.length} etkinlik`}
          </Text>
        </View>
        <Icon name="chevronRight" size={20} color={Colors.outline} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Takvim</Text>
            <IconCircleButton icon="closeModal" iconSize={18} onPress={() => setVisible(false)} accessibilityLabel="Kapat" />
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.calendarCard}>
                <Calendar
                  current={selectedDate}
                  markingType="multi-dot"
                  markedDates={markedDates}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  theme={CALENDAR_THEME as any}
                />
              </View>

              {legendTypes.length > 0 && (
                <View style={styles.legendRow}>
                  {legendTypes.map((type) => (
                    <View key={type} style={[styles.legendPill, { backgroundColor: CALENDAR_EVENT_COLORS[type] + '1F' }]}>
                      <View style={[styles.legendDot, { backgroundColor: CALENDAR_EVENT_COLORS[type] }]} />
                      <Text style={[styles.legendText, { color: CALENDAR_EVENT_COLORS[type] }]}>{TYPE_LABELS[type]}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.selectedDateLabel}>{selectedLabel}</Text>

              {selectedEvents.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Icon name="eventBusy" size={26} color={Colors.outline} />
                  <Text style={styles.emptyDayText}>Bu gün için etkinlik yok</Text>
                </View>
              ) : (
                selectedEvents
                  .sort((a, b) => a.startAt.localeCompare(b.startAt))
                  .map((event) => (
                    <View key={event.id} style={[styles.eventRow, { backgroundColor: event.color + '14' }]}>
                      <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                      <View style={styles.eventTextWrap}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                        <Text style={styles.eventTime}>{formatTimeRange(event.startAt, event.endAt)}</Text>
                      </View>
                      <View style={[styles.eventBadge, { backgroundColor: event.color + '1F' }]}>
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
    backgroundColor: Pastel.teal.tint,
    borderRadius: Radius.xxl,
    padding: Spacing.md,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Pastel.teal.tintStrong,
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
  },
  modalTitle: { ...Typography.serifTitle, color: Colors.onSurface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md },
  calendarCard: { backgroundColor: Pastel.teal.tint, borderRadius: Radius.xxl, padding: Spacing.sm, paddingBottom: Spacing.md },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  legendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm + 2, paddingVertical: 6, borderRadius: Radius.full },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { ...Typography.labelSm, fontWeight: '700' },
  selectedDateLabel: { ...Typography.serifTitle, fontSize: 16, color: Colors.onSurface, textTransform: 'capitalize' },
  emptyDay: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs },
  emptyDayText: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    padding: Spacing.sm + 2,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventTextWrap: { flex: 1 },
  eventTitle: { ...Typography.labelMd, color: Colors.onSurface },
  eventTime: { ...Typography.bodySm, color: Colors.onSurfaceVariant, marginTop: 2 },
  eventBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  eventBadgeText: { ...Typography.labelSm, fontWeight: '700' },
});
