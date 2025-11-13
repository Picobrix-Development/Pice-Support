<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Redirect root to support page
    goto('/support');
  });
</script>

<div class="flex h-screen items-center justify-center">
  <div class="text-center">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Pop Up Pirate Dice</h1>
    <p class="text-gray-600">Customer Support</p>
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mt-4 mx-auto"></div>
  </div>
</div>
