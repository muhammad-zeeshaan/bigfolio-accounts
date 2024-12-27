import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Custom Hook to manage query parameters
 */
const useQueryParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Clone the URLSearchParams to ensure immutability
  const params = new URLSearchParams(searchParams?.toString());

  /**
   * Set a new query parameter
   * @param {string} key - The query parameter key
   * @param {string | number | boolean | ((currentValue: string | null) => string | number | boolean)} value - The new value or updater function
   */
  const setParams = (
    key: string,
    value: string | number | boolean | ((currentValue: string | null) => string | number | boolean)
  ): void => {
    validateKey(key);
    let newValue: string | number | boolean;

    if (typeof value === "function") {
      newValue = value(params.get(key));
    } else {
      newValue = value;
    }

    params.set(key, String(newValue));
  };

  /**
   * Delete a query parameter
   * @param {string} key - The query parameter key to remove
   */
  const deleteParams = (key: string): void => {
    validateKey(key);
    params.delete(key);
  };

  /**
   * Get the value of a query parameter
   * @param {string} key - The query parameter key to retrieve
   * @returns {string | null} The value of the parameter or null if it doesn't exist
   */
  const getParams = (key: string): string | null => {
    validateKey(key);
    return params.get(key);
  };

  /**
   * Update the URL with the new query parameters
   */
  const updateParams = (): void => {
    router.replace(`${pathname}?${decodeURIComponent(params.toString())}`);
  };

  /**
   * Get all query parameter keys
   * @returns {string[]} Array of all query parameter keys
   */
  const getAllKeys = (): string[] => Array.from(params.keys());

  return {
    get: getParams,
    set: setParams,
    delete: deleteParams,
    update: updateParams,
    keys: getAllKeys,
  };
};

export default useQueryParams;

/**
 * Validates that a key is provided and not empty
 * @param {string} key - The key to validate
 * @throws {Error} If the key is invalid
 */
const validateKey = (key: string): void => {
  if (!key || typeof key !== "string") {
    throw new Error("Key parameter must be a non-empty string.");
  }
};
