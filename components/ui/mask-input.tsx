'use client';

import { useState, type ComponentPropsWithoutRef } from 'react';
import InputMask from 'react-input-mask';
import { TextInput } from '@mantine/core';

interface InputWithMaskProps extends ComponentPropsWithoutRef<typeof TextInput> {
  mask: string;
}

export default function InputWithMask({
  mask,
  label,
  placeholder,
  value: controlledValue,
  onChange,
  ...props
}: InputWithMaskProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(e.target.value);
    onChange?.(e);
  };

  return (
    <TextInput
      {...props}
      label={label}
      placeholder={placeholder}
      // 👇 substitui o input padrão pelo InputMask
      component={InputMask as any}
      mask={mask}
      maskChar=""
      value={value}
      onChange={handleChange}
    />
  );
}
