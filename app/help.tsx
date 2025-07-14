import helpData from "@/db/help.json"; // Importa el nuevo archivo JSON
import { useGlobalStyles } from '@/utils/globalStyles';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Este componente para renderizar items se puede reutilizar tal cual de tu archivo Tips.tsx
// ya que la estructura del JSON es consistente.
// @ts-ignore
const HelpItem = ({ item, level = 0 }) => {
  const theme = useTheme();
  const indentSize = 20; // Pixels per indentation level

  const itemStyles = StyleSheet.create({
    container: {
      marginBottom: 12,
      paddingLeft: level * indentSize,
    },
    boldPrefix: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    content: {
      color: theme.colors.onSurface,
      lineHeight: 24,
    },
    // Añadimos un estilo para la viñeta de la lista por completitud
    bulletContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    bullet: {
        marginRight: 8,
        marginTop: 9, // Alineación visual
        fontWeight: 'bold',
    },
  });

  if (item.type === 'paragraph') {
    return (
      <View style={itemStyles.container}>
        <Text style={itemStyles.content}>
          {item.boldPrefix ? (
            <>
              <Text style={itemStyles.boldPrefix}>{item.boldPrefix}: </Text>
              {item.content}
            </>
          ) : (
            item.content
          )}
        </Text>
      </View>
    );
  } else if (item.type === 'list') {
    return (
      <View style={itemStyles.container}>
        {/* @ts-ignore */}
        {item.listItems && item.listItems.map((subItem, index) => (
          <HelpItem key={index} item={subItem} level={level + 1} />
        ))}
      </View>
    );
  } else if (item.type === 'numberedItem') {
    return (
      <View style={[itemStyles.container, { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <Text style={itemStyles.content}>{item.content}</Text>
      </View>
    );
  }
  return null;
};


const HelpScreen = () => {
  const theme = useTheme();
  const global = useGlobalStyles();

  return (
    <SafeAreaView edges={['bottom']} style={global.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Text style={[styles.introText, { color: theme.colors.onSurface, fontSize: 24, fontWeight: 'bold' }]}>
          {helpData.title}
        </Text>

        {helpData.sections.map((section, index) => (
          <View key={index} style={styles.sectionWrapper}>
            <Divider style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />
            <Text style={[styles.sectionTitle, { color: '#666666' }]}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                // Usamos el componente HelpItem para renderizar cada elemento
                <HelpItem key={itemIndex} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos reutilizados de ArticlePage
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  introText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  sectionContent: {
    paddingHorizontal: 4,
  },
});

export default HelpScreen;