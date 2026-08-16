import { z } from 'zod'

export const PROFILE_USERNAME_MIN_LENGTH = 3
export const PROFILE_USERNAME_MAX_LENGTH = 50
export const PROFILE_EMAIL_MAX_LENGTH = 255
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(PROFILE_USERNAME_MIN_LENGTH, `Nazwa musi mieć minimum ${PROFILE_USERNAME_MIN_LENGTH} znaki.`)
    .max(PROFILE_USERNAME_MAX_LENGTH, `Nazwa może mieć maksymalnie ${PROFILE_USERNAME_MAX_LENGTH} znaków.`),
  email: z
    .string()
    .trim()
    .min(1, 'Wpisz email.')
    .email('Wpisz poprawny email.')
    .max(PROFILE_EMAIL_MAX_LENGTH, `Email może mieć maksymalnie ${PROFILE_EMAIL_MAX_LENGTH} znaków.`),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Wpisz obecne hasło.'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Nowe hasło musi mieć minimum ${PASSWORD_MIN_LENGTH} znaków.`)
      .max(PASSWORD_MAX_LENGTH, `Nowe hasło może mieć maksymalnie ${PASSWORD_MAX_LENGTH} znaki.`),
    confirmNewPassword: z.string().min(1, 'Powtórz nowe hasło.'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Hasła muszą być takie same.',
    path: ['confirmNewPassword'],
  })

export type PasswordFormValues = z.infer<typeof passwordFormSchema>
