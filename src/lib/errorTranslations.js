// Helper function to translate common Supabase error messages to Bulgarian
export function translateError(error) {
  if (!error) return 'Неочаквана грешка. Опитайте отново.';
  
  const errorMessage = error.message || error.toString().toLowerCase();
  
  // Common Supabase error translations
  const translations = {
    'invalid login credentials': 'Невалиден имейл или парола.',
    'email not confirmed': 'Имейлът не е потвърден. Проверете пощата си.',
    'user already registered': 'Потребител с този имейл вече съществува.',
    'password should be at least 6 characters': 'Паролата трябва да е поне 6 символа.',
    'invalid email': 'Невалиден имейл адрес.',
    'email rate limit exceeded': 'Твърде много опити. Моля, изчакайте малко.',
    'network request failed': 'Грешка при връзката. Проверете интернет връзката си.',
    'duplicate key value': 'Това вече съществува в системата.',
    'foreign key constraint': 'Грешка при свързване на данни.',
    'permission denied': 'Нямате права за тази операция.',
    'row-level security': 'Нямате права за тази операция.',
    'jwt expired': 'Сесията е изтекла. Моля, влезте отново.',
    'invalid token': 'Невалидна сесия. Моля, влезте отново.',
  };
  
  // Check for exact matches (case insensitive)
  for (const [key, translation] of Object.entries(translations)) {
    if (errorMessage.includes(key)) {
      return translation;
    }
  }
  
  // If no translation found, return the original error message
  // but add a Bulgarian prefix
  return `Грешка: ${error.message || error.toString()}`;
}

