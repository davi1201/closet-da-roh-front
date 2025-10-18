'use client';

import React, { forwardRef } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { TextInput, TextInputProps } from '@mantine/core';

const PHONE_FORMAT = '(##) #####-####';

// 1. Defina um tipo que combina as props do Mantine com as props do NumericFormat
type CustomPhoneInputProps = TextInputProps & NumericFormatProps;

const PhoneInput = (props: CustomPhoneInputProps) => {
  // 2. Separe as props que NÃO DEVEM ir para o DOM/Mantine
  // As props do NumericFormat que causavam o aviso são: format, mask, allowEmptyFormatting
  const { format, mask, allowEmptyFormatting, ...mantineProps } = props;

  return (
    <TextInput
      // 3. Passe APENAS as props válidas do Mantine/HTML
      {...mantineProps}
      // 4. Use um wrapper forwardRef para garantir que o ref do Mantine funcione corretamente com o NumericFormat
      component={
        forwardRef((inputProps, ref) => (
          <NumericFormat
            {...inputProps}
            // 5. Passe as props de formatação SOMENTE para o NumericFormat
            // @ts-ignore
            format={PHONE_FORMAT}
            mask="_"
            allowEmptyFormatting={true} // Se quiser que a máscara apareça mesmo vazio
            getInputRef={ref} // O NumericFormat usa getInputRef para refs
            onValueChange={(values) => {
              // ... (Sua lógica de onChange)
              if (props.onChange) {
                props.onChange({
                  target: { value: values.value },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          />
        )) as any
      }
    />
  );
};

export default PhoneInput;
