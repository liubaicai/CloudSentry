/**
 * Utility functions for controllers
 */

/**
 * Safely extract a string parameter from Express request params
 * Handles the case where req.params might be string | string[]
 */
export function getParamAsString(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param || '';
}
