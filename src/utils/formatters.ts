/**
 * Formata um número para o formato de moeda Real Brasileiro (BRL).
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Retorna o nome do mês e ano em português para uma string YYYY-MM.
 */
export const formatMonthYear = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

/**
 * Retorna o nome do mês atual em português.
 */
export const getCurrentMonthName = (): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[new Date().getMonth()];
};
