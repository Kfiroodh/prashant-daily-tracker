// PocketBase client configuration
// Default: run PocketBase locally on http://127.0.0.1:8090
// To run PocketBase locally: download from https://pocketbase.io and run `./pocketbase serve`
const pb = new PocketBase(window.PB_URL || 'http://127.0.0.1:8090');

console.log('🔌 PocketBase client initialized ->', pb.baseUrl);

// Helper to check auth
function isPBAuthenticated() {
  return pb.authStore.isValid;
}

function getPBCurrentUser() {
  return pb.authStore.model || null;
}
