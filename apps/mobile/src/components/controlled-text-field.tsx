import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { TextField } from './text-field';

/** Adapts TextField (a plain RN input) to react-hook-form's Controller —
 *  RN's TextInput doesn't support the ref-based register() pattern the web
 *  forms use, so controlled fields are the standard approach here instead. */
export function ControlledTextField<T extends FieldValues>({
  name,
  control,
  label,
  error,
  ...props
}: { name: Path<T>; control: Control<T>; label: string; error?: string } & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextField label={label} error={error} value={value as string} onChangeText={onChange} onBlur={onBlur} {...props} />
      )}
    />
  );
}
