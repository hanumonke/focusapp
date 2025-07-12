import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import articleData from "@/db/tips.json"
import { SafeAreaView } from 'react-native-safe-area-context';
// The structured JSON data based on the article content


// Component to render individual content items (paragraphs, lists, etc.)
// @ts-ignore
const ArticleItem = ({ item, level = 0 }) => {
  const theme = useTheme();
  const indentSize = 20; // Pixels per indentation level

  const itemStyles = StyleSheet.create({
    container: {
      marginBottom: 12, // More space between list items/paragraphs
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
    bullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.onSurface,
      marginRight: 8,
      marginTop: 8, // Align with text baseline
    },
    numberedItemPrefix: {
      fontWeight: 'bold',
      marginRight: 4,
      color: theme.colors.onSurface,
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
        {item.boldPrefix && (
          <Text style={itemStyles.boldPrefix}>{item.boldPrefix}:</Text>
        )}
        {/* @ts-ignore */}
        {item.listItems && item.listItems.map((subItem, index) => (
          <ArticleItem key={index} item={subItem} level={level + 1} />
        ))}
      </View>
    );
  } else if (item.type === 'numberedItem') {
    // This assumes the content already includes the number (e.g., "1) ...")
    return (
      <View style={[itemStyles.container, { flexDirection: 'row', alignItems: 'flex-start' }]}>
        <Text style={itemStyles.content}>{item.content}</Text>
      </View>
    );
  }
  return null;
};


const ArticlePage = () => {
  const theme = useTheme();

  return (
      <ScrollView style={styles.container}>
        <SafeAreaView edges={["bottom"]}>
      <Text style={[styles.introText, { color: theme.colors.onSurface }]}>
        {articleData.introText}
      </Text>

      {articleData.sections.map((section, index) => (
        <View key={index} style={styles.sectionWrapper}>
          <Divider style={[styles.sectionDivider, { backgroundColor: theme.colors.outline }]} />
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {section.title}
          </Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <ArticleItem key={itemIndex} item={item} />
            ))}
          </View>
        </View>
      ))}
    </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // Light grey background for readability
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

export default ArticlePage;