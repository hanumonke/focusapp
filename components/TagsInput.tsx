import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, Text, TextInput } from 'react-native-paper';

type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
};

const TagsInput: React.FC<TagsInputProps> = ({ value, onChange, label = "Etiquetas" }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={newTag}
          onChangeText={setNewTag}
          mode='outlined'
          placeholder='ej: colegio'
          style={styles.textInput}
        />
        <IconButton icon="plus" mode='contained' onPress={handleAddTag} style={styles.addButton} />
      </View>
      {value.length > 0 && (
        <View style={styles.chipRow}>
          {value.map((tag, index) => (
            <Chip
              key={index}
              onClose={() => handleRemoveTag(tag)}
              mode="outlined"
              style={styles.chip}
            >
              {tag}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
  },
  addButton: {
    marginLeft: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  chip: {
    marginRight: 0,
    marginBottom: 0,
  },
});

export default TagsInput;