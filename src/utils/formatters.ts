/** Formato de moneda que muestra la app en los campos: $3,000.00 */
export function toCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formato de moneda sin decimales usado en el resumen: $174,950 */
export function toCurrencyNoDecimals(value: number): string {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
