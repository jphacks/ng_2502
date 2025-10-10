// src/components/InputText.jsx

import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

// propsを直接受け取る
export const InputText = (props) => {
  // propsをlabelとそれ以外(rest)に分割します
  const { label, ...rest } = props;

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      {/* placeholderやvalueなどはrest経由でInputに渡されます */}
      <Input {...rest} />
    </FormControl>
  );
};