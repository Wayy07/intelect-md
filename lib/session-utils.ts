/**
 * Session utilities to improve NextAuth.js session handling in development
 */

// Function to handle session errors by retrying authentication
export const handleSessionError = async (error: Error) => {
  console.warn("Session error detected:", error.message);

  // If the error is related to no valid session, refresh the page
  if (error.message.includes("No valid session") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("session is null")) {

    // Store a flag in sessionStorage to prevent infinite loops
    const retryCount = parseInt(sessionStorage.getItem('auth_retry_count') || '0');

    if (retryCount < 3) { // Limit retries to avoid infinite loops
      sessionStorage.setItem('auth_retry_count', (retryCount + 1).toString());
      console.log(`Refreshing session (attempt ${retryCount + 1})...`);

      // Wait briefly before refreshing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload the page to get a fresh session
      window.location.reload();
    } else {
      console.error("Maximum session retry attempts reached");
      sessionStorage.removeItem('auth_retry_count');
    }
  }
};

// Reset retry counter when session is successfully established
export const clearSessionRetryCount = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_retry_count');
  }
};
