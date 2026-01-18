import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface PostInputProps {
  value?: string;
  onChange?: (text: string) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  [key: string]: any;
}

export const PostInput: React.FC<PostInputProps> = ({
  value,
  onChange,
  onChangeText,
  placeholder = 'いまどうしてる？',
  editable = true,
  multiline = true,
  numberOfLines = 5,
  ...rest
}) => {
  const handleChangeText = (text: string) => {
    // React NativeのTextInputコールバック
    if (onChangeText) {
      onChangeText(text);
    }
    // Reactのchangeイベント互換性
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={handleChangeText}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor="#999"
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
});

export default PostInput;
