import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, StyleSheet } from 'react-native';

interface StandardPickerProps {
  label: string;
  items: Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}

const StandardPicker = ({ 
  label, 
  items, 
  placeholder, 
  value, 
  onValueChange, 
  error 
}: StandardPickerProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.pickerContainer, !!error && styles.errorContainer]}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        dropdownIconColor="#666"
        mode="dropdown"
      >
        <Picker.Item label={placeholder} value="" />
        {items.map((item) => (
          <Picker.Item 
            key={item.value} 
            label={item.label} 
            value={item.value} 
          />
        ))}
      </Picker>
    </View>
    {!!error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 16
  },
  label: {
    color: '#444',
    fontSize: 14,
    fontWeight: '500'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden'
  },
  errorContainer: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2'
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4
  }
});

export default StandardPicker; // Exportação correta