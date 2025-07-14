import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export const spacing = 8; // Reducido de 16 a 8
export const borderRadius = 12;
export const cardElevation = 2;
export const inputHeight = 48;

export const useGlobalStyles = () => {
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing,
      backgroundColor: theme.colors.background,
    },
    card: {
      borderRadius,
      elevation: cardElevation,
      backgroundColor: theme.colors.surface,
      marginBottom: spacing,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    cardContent: {
      padding: spacing,
      gap: 8, // Reducido
    },
    cardActions: {
      justifyContent: 'space-between',
      paddingHorizontal: 4, // Reducido
    },
    input: {
      borderRadius,
      height: inputHeight,
      backgroundColor: theme.colors.surface,
      marginBottom: spacing,
    },
    button: {
      borderRadius,
      minHeight: inputHeight,
      justifyContent: 'center',
      marginVertical: 4, // Reducido
    },
    chip: {
      borderRadius: 6,
      height: 32,
      marginRight: 4, // Reducido
      backgroundColor: theme.colors.primaryContainer,
    },
    tag: {
      borderRadius: 6,
      height: 32,
      justifyContent: 'center',
      marginRight: 4, // Reducido
      backgroundColor: theme.colors.primaryContainer,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4, // Reducido
      marginTop: 4, // Reducido
    },
    tagsSection: {
      marginTop: 2, // Reducido
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4, // Reducido
    },
    sectionLabel: {
      opacity: 0.6,
      marginBottom: 3, // Reducido
      letterSpacing: 0.5,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // Reducido
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      elevation: cardElevation,
    },
    headerTitle: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
      fontSize: 20,
    },
    headerBackAction: {
      marginLeft: 2, // Reducido
    },
    headerAddAction: {
      marginRight: 2, // Reducido
    },
    headerRefreshAction: {
      marginRight: 2, // Reducido
    },
    info: {
      flex: 1,
    },
    secondaryText: {
      opacity: 0.8,
      fontSize: 13,
    },
    description: {
      opacity: 0.8,
      lineHeight: 20,
      marginTop: 4, // Reducido
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      padding: 12, // Reducido
      margin: 12, // Reducido
      borderRadius: borderRadius,
      maxHeight: '80%',
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    modalTitle: {
      marginBottom: 8, // Reducido
      textAlign: 'center',
    },
    modalCard: {
      marginVertical: 4, // Reducido
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    modalButton: {
      marginTop: 8, // Reducido
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // Reducido
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontWeight: '600',
      marginBottom: 1, // Reducido
    },
    completedTask: {
      textDecorationLine: 'line-through',
      opacity: 0.6,
    },
    dueDateText: {
      opacity: 0.8,
      fontSize: 13,
    },
    taskDescription: {
      opacity: 0.8,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4, // Reducido
    },
    remindersIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2, // Reducido
    },
    statusBadge: {
      alignSelf: 'flex-end',
    },
    list: {
      paddingBottom: 8, // Reducido
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16, // Reducido
    },
    emptyText: {
      marginBottom: 8, // Reducido
      textAlign: 'center',
    },
    emptyButton: {
      borderRadius: borderRadius,
    },
    addButtonContent: {
      flexDirection: 'row-reverse',
      height: 40, // Reducido
    },
    habitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8, // Reducido
    },
    habitInfo: {
      flex: 1,
    },
    habitTitle: {
      fontWeight: '600',
      marginBottom: 1, // Reducido
    },
    recurrenceText: {
      opacity: 0.8,
      fontSize: 13,
    },
    habitDescription: {
      opacity: 0.8,
      lineHeight: 20,
    },
    streakContainer: {
      flexDirection: 'row',
      gap: 8, // Reducido
    },
    streakItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3, // Reducido
    },
    streakLabel: {
      opacity: 0.6,
    },
    streakBadge: {
      backgroundColor: 'transparent',
    },
    sectionTitle: {
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#333',
    },
    divider: {
      marginVertical: 8,
      backgroundColor: '#E1E8ED',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default {
  spacing,
  borderRadius,
  cardElevation,
  inputHeight,
}; 