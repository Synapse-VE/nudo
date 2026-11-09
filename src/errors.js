/** Error de uso: se muestra el mensaje y el comando sale con codigo 2. */
export class UsageError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
}
